import { qs, selectors } from "../core/dom.js";
import { getCurrentLanguage, t } from "./i18n.js";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwfJRkcoxqIVXbawOjT6iVvgOGgb3cnvv92q5aDtNAjt6ZdaNjH4mKMngGimqAa53Q8/exec";

function getFormPayload(target) {
  const data = new FormData(target);
  return {
    fullName: String(data.get("fullName") || "").trim(),
    email: String(data.get("email") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    memberType: String(data.get("memberType") || "").trim(),
    language: getCurrentLanguage(),
  };
}

function submitLead(payload) {
  return fetch(GOOGLE_SCRIPT_URL, {
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
      await submitLead(payload);
    } catch (error) {
      console.error("Membership form submission failed", error);
      statusNode.classList.add("is-error");
      statusNode.textContent = t("form.error");
      submitButton.disabled = false;
      submitButton.textContent = t("cta.short");
      return;
    }

    lastPayload = payload;
    submitCount += 1;
    statusNode.textContent = t("form.success");
    submitButton.disabled = false;
    submitButton.textContent = t("cta.short");
    form.reset();
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
