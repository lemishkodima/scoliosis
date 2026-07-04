import { qs, selectors } from "../core/dom.js";
import { getCurrentLanguage, t } from "./i18n.js";

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwfJRkcoxqIVXbawOjT6iVvgOGgb3cnvv92q5aDtNAjt6ZdaNjH4mKMngGimqAa53Q8/exec";

function getFormPayload(target) {
  const data = new FormData(target);
  return {
    fullName: String(data.get("fullName") || "").trim(),
    email: String(data.get("email") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    city: String(data.get("city") || "").trim(),
    specialization: String(data.get("specialization") || "").trim(),
    workplace: String(data.get("workplace") || "").trim(),
    memberType: String(data.get("memberType") || "").trim(),
    memberTypeOther: String(data.get("memberTypeOther") || "").trim(),
    experience: String(data.get("experience") || "").trim(),
    message: String(data.get("message") || "").trim(),
    consent: data.get("consent") === "on",
    language: getCurrentLanguage(),
    submittedAt: new Date().toISOString(),
    source: "scoliosis.ua",
  };
}

async function sendLead(payload) {
  await fetch(GOOGLE_APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });
}

function validateForm(target) {
  const requiredFields = target.querySelectorAll("[required]");
  let isValid = true;

  requiredFields.forEach((field) => {
    const valid = field.type === "checkbox" ? field.checked : field.checkValidity();
    field.classList.toggle("is-invalid", !valid);
    if (!valid) isValid = false;
  });

  return isValid;
}

export function initMembershipForm() {
  const form = qs(selectors.form);
  const statusNode = qs(selectors.status);
  if (!form || !statusNode) {
    return {
      getState: () => ({ mounted: false, hasForm: Boolean(form), hasStatus: Boolean(statusNode) }),
    };
  }

  let lastPayload = null;
  let submitCount = 0;
  const memberTypeSelect = form.querySelector("[data-member-type-select]");
  const memberTypeOther = form.querySelector("[data-member-type-other]");
  const memberTypeOtherInput = memberTypeOther?.querySelector("input");

  function syncMemberTypeOther() {
    const isOther = memberTypeSelect?.value === "other";
    memberTypeOther?.classList.toggle("is-open", isOther);
    memberTypeOther?.setAttribute("aria-hidden", String(!isOther));

    if (!memberTypeOtherInput) return;
    memberTypeOtherInput.disabled = !isOther;
    memberTypeOtherInput.required = isOther;
    memberTypeOtherInput.tabIndex = isOther ? 0 : -1;

    if (!isOther) {
      memberTypeOtherInput.value = "";
      memberTypeOtherInput.classList.remove("is-invalid");
    }
  }

  memberTypeSelect?.addEventListener("change", syncMemberTypeOther);
  syncMemberTypeOther();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusNode.classList.remove("is-error");
    statusNode.textContent = "";

    if (form.website?.value) return;

    if (!validateForm(form)) {
      statusNode.classList.add("is-error");
      statusNode.textContent = t("form.error");
      return;
    }

    const payload = getFormPayload(form);
    const submitButton = form.querySelector("[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = t("cta.loading");

    try {
      await sendLead(payload);
      lastPayload = payload;
      submitCount += 1;
      statusNode.textContent = t("form.success");
      form.reset();
      syncMemberTypeOther();
    } catch (error) {
      console.error("Membership form submit failed", error);
      statusNode.classList.add("is-error");
      statusNode.textContent = t("form.submitError");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = t("cta.short");
    }
  });

  return {
    getState() {
      return {
        mounted: true,
        submitCount,
        lastPayload,
      };
    },
  };
}
