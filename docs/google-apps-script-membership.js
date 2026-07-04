const SHEET_LEADS = "Заявки";
const SHEET_LOGS = "Логи";

const LEAD_HEADERS = [
  "Дата",
  "Імʼя та прізвище",
  "Email",
  "Телефон",
  "Категорія учасника",
  "Свій варіант",
  "Мова"
];

const LOG_HEADERS = ["Дата", "Статус", "Повідомлення", "Payload"];

const MEMBER_TYPE_LABELS = {
  patient: "Пацієнт зі сколіозом",
  doctor: "Лікар",
  therapist: "Фізичний або ерготерапевт",
  orthotist: "Ортезист-протезист",
  psychologist: "Психолог або психотерапевт",
  researcher: "Науковець, викладач або студент",
  healthcare: "Представник закладу охорони здоровʼя",
  supporter: "Прихильник доказового лікування сколіозу",
  other: "Інше"
};

function doPost(e) {
  let payload = {};

  try {
    payload = parsePayload_(e);
    verifySecret_(payload);

    const normalized = normalizePayload_(payload);
    const spreadsheet = SpreadsheetApp.openById(getRequiredProperty_("SPREADSHEET_ID"));

    const leadsSheet = ensureSheet_(spreadsheet, SHEET_LEADS, LEAD_HEADERS);
    leadsSheet.appendRow(buildLeadRow_(normalized));

    sendTelegram_(normalized);
    writeLog_(spreadsheet, "success", "Заявку успішно оброблено", payload);

    return jsonResponse_({
      ok: true,
      message: "Lead saved and delivered"
    });
  } catch (error) {
    try {
      const spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
      if (spreadsheetId) {
        const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        writeLog_(spreadsheet, "error", String(error && error.message ? error.message : error), payload);
      }
    } catch (_) {}

    return jsonResponse_({
      ok: false,
      error: String(error && error.message ? error.message : error)
    });
  }
}

function doGet() {
  return jsonResponse_({
    ok: true,
    message: "Google Apps Script webhook is active"
  });
}

function parsePayload_(e) {
  const raw = e && e.postData && e.postData.contents ? e.postData.contents : "";

  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (_) {
      return e.parameter || {};
    }
  }

  return e && e.parameter ? e.parameter : {};
}

function verifySecret_(payload) {
  const expectedSecret = PropertiesService.getScriptProperties().getProperty("REQUEST_SECRET");

  if (!expectedSecret) {
    return;
  }

  if (!payload.secret || payload.secret !== expectedSecret) {
    throw new Error("Invalid request secret");
  }
}

function normalizePayload_(payload) {
  const memberType = clean_(payload.memberType);
  const memberTypeOther = clean_(payload.memberTypeOther);

  return {
    fullName: clean_(payload.fullName),
    email: clean_(payload.email),
    phone: clean_(payload.phone),
    memberType,
    memberTypeLabel: memberType === "other"
      ? memberTypeOther || "Інше"
      : MEMBER_TYPE_LABELS[memberType] || memberType || "Не вказано",
    memberTypeOther,
    language: clean_(payload.language)
  };
}

function buildLeadRow_(lead) {
  return [
    new Date(),
    lead.fullName,
    lead.email,
    lead.phone,
    lead.memberTypeLabel,
    lead.memberTypeOther,
    lead.language
  ];
}

function sendTelegram_(lead) {
  const botToken = getRequiredProperty_("TELEGRAM_BOT_TOKEN");
  const chatId = getRequiredProperty_("TELEGRAM_CHAT_ID");

  const text = [
    "🟢 <b>Нова заявка на членство</b>",
    "",
    "<b>Імʼя:</b> " + escapeHtml_(lead.fullName || "Не вказано"),
    "<b>Email:</b> " + escapeHtml_(lead.email || "Не вказано"),
    "<b>Телефон:</b> " + escapeHtml_(lead.phone || "Не вказано"),
    "<b>Категорія:</b> " + escapeHtml_(lead.memberTypeLabel || "Не вказано"),
    lead.memberTypeOther ? "<b>Свій варіант:</b> " + escapeHtml_(lead.memberTypeOther) : ""
  ].filter(Boolean).join("\n");

  const response = UrlFetchApp.fetch("https://api.telegram.org/bot" + botToken + "/sendMessage", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true
    }),
    muteHttpExceptions: true
  });

  const statusCode = response.getResponseCode();

  if (statusCode < 200 || statusCode >= 300) {
    throw new Error("Telegram error " + statusCode + ": " + response.getContentText());
  }
}

function ensureSheet_(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function writeLog_(spreadsheet, status, message, payload) {
  const logSheet = ensureSheet_(spreadsheet, SHEET_LOGS, LOG_HEADERS);

  logSheet.appendRow([
    new Date(),
    status,
    message,
    JSON.stringify(payload || {})
  ]);
}

function getRequiredProperty_(key) {
  const value = PropertiesService.getScriptProperties().getProperty(key);

  if (!value) {
    throw new Error("Missing script property: " + key);
  }

  return value;
}

function clean_(value) {
  return String(value || "").trim();
}

function escapeHtml_(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
