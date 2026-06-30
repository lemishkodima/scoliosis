import { qs, selectors } from "../core/dom.js";
import { getCurrentLanguage, t } from "./i18n.js";

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
    experience: String(data.get("experience") || "").trim(),
    message: String(data.get("message") || "").trim(),
    consent: data.get("consent") === "on",
    language: getCurrentLanguage(),
    submittedAt: new Date().toISOString(),
    source: "scoliosis.ua prototype",
  };
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

    await new Promise((resolve) => setTimeout(resolve, 680));
    console.info("Prototype membership payload for /api/membership/apply", payload);

    lastPayload = payload;
    submitCount += 1;
    statusNode.textContent = t("form.success");
    submitButton.disabled = false;
    submitButton.textContent = t("cta.long");
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
