const DEFAULT_GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwfJRkcoxqIVXbawOjT6iVvgOGgb3cnvv92q5aDtNAjt6ZdaNjH4mKMngGimqAa53Q8/exec";

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
}

async function forwardToGoogleAppsScript(payload) {
  const googleAppsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || DEFAULT_GOOGLE_APPS_SCRIPT_URL;
  const googleAppsScriptSecret = process.env.GOOGLE_APPS_SCRIPT_SECRET || "";
  const forwardedPayload = {
    ...payload,
    ...(googleAppsScriptSecret ? { secret: googleAppsScriptSecret } : {}),
  };

  const googleResponse = await fetch(googleAppsScriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(forwardedPayload),
  });

  if (!googleResponse.ok) {
    const responseText = await googleResponse.text();
    throw new Error(`Google Apps Script request failed: ${googleResponse.status} ${responseText}`);
  }
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const payload = await readJsonBody(request);

    sendJson(response, 200, {
      ok: true,
      accepted: true,
    });

    try {
      await forwardToGoogleAppsScript(payload);
    } catch (error) {
      console.error("Failed to forward membership form to Google Apps Script", error);
    }
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown server error",
    });
  }
};
