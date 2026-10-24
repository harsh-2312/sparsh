import { siteConfig, whatsappDisplay, whatsappLink } from "./config.js";
const values = { brandName: siteConfig.brandName, whatsappDisplay: whatsappDisplay(), email: siteConfig.email };
document.querySelectorAll("[data-config]").forEach((el) => (el.textContent = values[el.dataset.config] ?? ""));
document.querySelectorAll("[data-if]").forEach((el) => { if (!values[el.dataset.if]) el.remove(); });
document.querySelectorAll("[data-wa-link]").forEach((a) => { a.href = whatsappLink(""); a.target = "_blank"; a.rel = "noopener"; });
document.getElementById("year").textContent = new Date().getFullYear();
