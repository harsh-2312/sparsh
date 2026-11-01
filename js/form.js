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

function openThanks(d, message) {
  const dlg = document.getElementById("thanksModal");
  if (!dlg || typeof dlg.showModal !== "function") {
    alert("Thank you! Your enquiry has been received. Our team will connect with you shortly.");
    return;
  }
  document.getElementById("thanksName").textContent = d.name.split(/\s+/)[0];
  const sum = document.getElementById("thanksSum");
  sum.innerHTML = "";
  [["Product", d.product], ["Quantity", d.quantity], ["Type", d.print]].forEach(([k, v]) => {
    const li = document.createElement("li");
    const sp = document.createElement("span");
    sp.textContent = k + ": ";
    li.append(sp, document.createTextNode(v));
    sum.appendChild(li);
  });
  document.getElementById("thanksWa").href = whatsappLink(message);
  dlg.showModal();
}

export function initForm() {
  const dlg = document.getElementById("thanksModal");
  if (dlg) {
    dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest("[data-close]")) dlg.close(); });
  }
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

  /** Sends the enquiry to send-enquiry.php (mails it to the business inbox). */
  async function sendToServer(data) {
    const url = siteConfig.formEndpoint;
    if (!url) return { ok: false };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...data, website: form.elements.website ? form.elements.website.value : "" }),
      });
      const json = await res.json().catch(() => ({}));
      return { ok: res.ok && json.ok === true, error: json.error };
    } catch { return { ok: false }; }
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

    if (channel === "whatsapp") {
      // Open the app first (synchronously) so browsers do not block the pop-up.
      const opened = window.open(whatsappLink(message), "_blank");
      if (opened) opened.opener = null;
      show(
        "success",
        `<strong>Almost done: WhatsApp should now be open with your enquiry ready.</strong> Your message has <u>not</u> been sent yet. Please press <strong>Send</strong> there to complete your enquiry. Nothing opened? <a href="${whatsappLink(message)}" target="_blank" rel="noopener">Open WhatsApp with your message</a>.`
      );
      return;
    }

    // Email: delivered by the server straight to the business inbox.
    show("success", "<strong>Sending your enquiry…</strong>");
    const r = await sendToServer(data);
    if (r.ok) {
      form.reset();
      status.hidden = true;
      openThanks(data, message);
      return;
    }
    // Server could not send (offline, not uploaded yet…) -> open the email app as a backup.
    window.location.href = mailLink(`Bulk enquiry from ${data.company}`, message);
    show(
      "error",
      `<strong>We could not send your enquiry automatically.</strong> Your email app should have opened with the enquiry ready; please press <strong>Send</strong> there. Or <a href="${whatsappLink(message)}" target="_blank" rel="noopener">send it on WhatsApp</a>.`
    );
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); submit("email"); });
  waBtn.addEventListener("click", () => submit("whatsapp"));
}
