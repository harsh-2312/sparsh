/**
 * ============================================================
 *  SPARSH Carry Bags — SITE CONFIGURATION (edit only this file
 *  for contact details, logo paths and social links)
 * ============================================================
 *
 *  - WhatsApp number : change `whatsappNumber` (10-digit Indian number is fine,
 *                      the country code is added automatically).
 *  - Business email  : fill `email`. While it is "" the email buttons are
 *                      hidden/disabled and nothing is shown in the footer.
 *  - Social links    : fill any URL in `social`. Empty ones are not shown.
 *  - Logo            : replace the files in assets/logo/ (same names), or
 *                      change the paths below.
 *  - Form backend    : put an API / CRM URL in `formEndpoint` later. See
 *                      README.md -> "Connecting a real backend".
 */
export const siteConfig = {
  brandName: "SPARSH Carry Bags",
  tagline: "Carry Your Brand With a Touch",
  website: "https://sparshcarrybags.in",

  // Contact ------------------------------------------------
  whatsappNumber: "9054837242", // local number, no +91 needed
  countryCode: "91",            // used only to build wa.me links
  email: "sparshcarrybags@gmail.com", // enquiries are delivered here (see send-enquiry.php)
  address: "",                  // leave blank until confirmed

  // Social links (leave "" to hide) ------------------------
  social: {
    instagram: "",
    facebook: "",
    linkedin: "",
    youtube: "",
  },

  // Logo files ---------------------------------------------
  logo: "assets/logo/logo.png",          // round logo (header, footer)
  logoMark: "assets/logo/logo-mark.png", // transparent logo printed on bag mockups

  // Backend-ready hook -------------------------------------
  // If set, the enquiry form also POSTs JSON here (see js/form.js).
  formEndpoint: "send-enquiry.php", // PHP script that emails the enquiry to the business inbox
};

/** Digits only, with country code, e.g. 919054837242 */
export function whatsappDigits() {
  const digits = String(siteConfig.whatsappNumber).replace(/\D/g, "");
  return digits.length === 10 ? siteConfig.countryCode + digits : digits;
}

/** Pretty number for display, e.g. +91 90548 37242 */
export function whatsappDisplay() {
  const d = whatsappDigits();
  if (d.length === 12) return `+${d.slice(0, 2)} ${d.slice(2, 7)} ${d.slice(7)}`;
  return `+${d}`;
}

/** Build a properly URL-encoded WhatsApp link. */
export function whatsappLink(message = "") {
  const base = `https://wa.me/${whatsappDigits()}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Build a mailto link (returns "" when no email configured). */
export function mailLink(subject = "", body = "") {
  if (!siteConfig.email) return "";
  const q = [];
  if (subject) q.push(`subject=${encodeURIComponent(subject)}`);
  if (body) q.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${siteConfig.email}${q.length ? "?" + q.join("&") : ""}`;
}
