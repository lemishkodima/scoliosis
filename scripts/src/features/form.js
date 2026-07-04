import { qs, selectors } from "../core/dom.js";
import { getCurrentLanguage, t } from "./i18n.js";

const MEMBERSHIP_ENDPOINT = "/api/membership/apply";

function getFormPayload(target) {
  const data = new FormData(target);
  return {
    fullName: String(data.get("fullName") || "").trim(),
    email: String(data.get("email") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    memberType: String(data.get("memberType") || "").trim(),
    memberTypeOther: String(data.get("memberTypeOther") || "").trim(),
    language: getCurrentLanguage(),
  };
}

function submitLead(payload) {
  return fetch(MEMBERSHIP_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.ok === false) {
      throw new Error(data.error || "Membership form submission failed");
    }

    return data;
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
  const memberTypeOtherInput = form.querySelector("[data-member-type-other-input]");

  function syncMemberTypeOther() {
    const isOther = memberTypeSelect?.value === "other";

    memberTypeOther?.classList.toggle("is-visible", isOther);
    memberTypeOther?.setAttribute("aria-hidden", String(!isOther));

    if (memberTypeOtherInput) {
      memberTypeOtherInput.required = isOther;
      if (!isOther) {
        memberTypeOtherInput.value = "";
        memberTypeOtherInput.classList.remove("is-invalid");
      }
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
    syncMemberTypeOther();
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
