import { siteConfig, whatsappLink, mailLink } from "./config.js";
import { formProductTypes } from "./content.js";

const LOCK_MS = 4000; // blocks accidental double clicks

const rules = {
  name: (v) => (v.trim().length >= 2 ? "" : "Please enter your full name."),
  company: (v) => (v.trim().length >= 2 ? "" : "Please enter your company or business name."),
  phone: (v) => {
    const p = v.replace(/[\s\-().]/g, "");
    if (!p) return "Please enter your phone number.";
    const indian = /^(\+?91|0)?[6-9]\d{9}$/.test(p);
    const intl = /^\+\d{8,15}$/.test(p);
    return indian || intl ? "" : "Enter a valid number, e.g. 98765 43210 or +971 50 123 4567.";
  },
  email: (v) => (!v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email address or leave this blank."),
  product: (v) => (v ? "" : "Please choose a product type."),
  quantity: (v) => {
    if (!String(v).trim()) return "Please enter an estimated quantity.";
    return Number.isInteger(Number(v)) && Number(v) >= 1 ? "" : "Enter a whole number, 1 or more.";
  },
};

export function initForm() {
  const form = document.getElementById("enquiryForm");
  if (!form) return;
  const select = form.elements.product;
  const status = document.getElementById("formStatus");
  const waBtn = document.getElementById("sendWa");
  const mailBtn = document.getElementById("sendMail");
  let locked = false;

  select.innerHTML =
    `<option value="">Select a product type</option>` +
    formProductTypes.map((n) => `<option value="${n}">${n}</option>`).join("");

  // Email option only exists when a business email is configured.
  if (!siteConfig.email) mailBtn.hidden = true;

  // Pre-select product when a card button is used (?product=…) — optional hook.
  document.addEventListener("sparsh:select-product", (e) => {
    if (formProductTypes.includes(e.detail)) select.value = e.detail;
  });

  const errEl = (id) => document.getElementById(`e-${id}`);
  const fieldId = { quantity: "qty" };

  function validateField(name) {
    const el = form.elements[name];
    if (!rules[name]) return true;
    const msg = rules[name](el.value);
    const err = errEl(fieldId[name] || name);
    err.textContent = msg;
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  function validatePrint() {
    const ok = !!form.querySelector('input[name="print"]:checked');
    errEl("print").textContent = ok ? "" : "Please choose plain, printed or not sure.";
    return ok;
  }

  function validateAll() {
    const bad = [];
    for (const name of Object.keys(rules)) if (!validateField(name)) bad.push(form.elements[name]);
    if (!validatePrint()) bad.push(form.querySelector('input[name="print"]'));
    if (bad.length) bad[0].focus();
    return bad.length === 0;
  }

  // Live validation once a field has been visited
  Object.keys(rules).forEach((name) => {
    const el = form.elements[name];
    el.addEventListener("blur", () => validateField(name));
    el.addEventListener("input", () => { if (el.getAttribute("aria-invalid") === "true") validateField(name); });
  });
  form.querySelectorAll('input[name="print"]').forEach((r) => r.addEventListener("change", validatePrint));

  function collect() {
    const d = Object.fromEntries(new FormData(form).entries());
    return {
      name: d.name.trim(), company: d.company.trim(), phone: d.phone.trim(), email: (d.email || "").trim(),
      product: d.product, print: d.print, quantity: d.quantity, size: (d.size || "").trim(), notes: (d.notes || "").trim(),
    };
  }

  function buildMessage(d) {
    return [
      `Hello ${siteConfig.brandName}, I would like to make a bulk enquiry.`,
      "",
      `Name: ${d.name}`,
      `Business: ${d.company}`,
      `Phone: ${d.phone}`,
      d.email ? `Email: ${d.email}` : false,
      `Product: ${d.product}`,
      `Plain or printed: ${d.print}`,
      `Estimated quantity: ${d.quantity}`,
      d.size ? `Bag size: ${d.size}` : false,
      d.notes ? `Requirements: ${d.notes}` : false,
    ].filter((l) => l !== false).join("\n");
  }

  function lock() {
    locked = true;
    [waBtn, mailBtn].forEach((b) => (b.disabled = true));
    setTimeout(() => { locked = false; [waBtn, mailBtn].forEach((b) => (b.disabled = false)); }, LOCK_MS);
  }

  function show(kind, html) {
    status.hidden = false;
    status.className = `form-status ${kind}`;
    status.innerHTML = html;
    status.focus({ preventScroll: false });
  }

  /** Optional backend/CRM hook. No endpoint configured = nothing is sent. */
  async function postToEndpoint(data) {
    if (!siteConfig.formEndpoint) return null;
    try {
      const res = await fetch(siteConfig.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "website", submittedAt: new Date().toISOString() }),
      });
      return res.ok;
    } catch { return false; }
  }

  async function submit(channel) {
    if (locked) return;
    if (!validateAll()) {
      show("error", "<strong>Please check the highlighted fields.</strong> Your enquiry has not been sent.");
      return;
    }
    const data = collect();
    const message = buildMessage(data);
    lock();

    // Open the app first (synchronously) so browsers do not block the pop-up.
    let opened = null;
    if (channel === "whatsapp") {
      opened = window.open(whatsappLink(message), "_blank");
      if (opened) opened.opener = null;
    } else {
      window.location.href = mailLink(`Bulk enquiry from ${data.company}`, message);
    }

    const posted = await postToEndpoint(data);
    const via = channel === "whatsapp" ? "WhatsApp" : "your email app";
    const fallback = channel === "whatsapp"
      ? ` Nothing opened? <a href="${whatsappLink(message)}" target="_blank" rel="noopener">Open WhatsApp with your message</a>.`
      : "";
    const stored = posted === true ? " A copy of your enquiry was also saved on our system." : posted === false ? " (We could not save a copy on our system, so please make sure you send the message.)" : "";
    show(
      "success",
      `<strong>Almost done: ${via} should now be open with your enquiry ready.</strong> Your message has <u>not</u> been sent yet. Please press <strong>Send</strong> there to complete your enquiry.${fallback}${stored}`
    );
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); submit("whatsapp"); });
  mailBtn.addEventListener("click", () => submit("email"));
}
