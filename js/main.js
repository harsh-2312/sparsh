import { siteConfig, whatsappDisplay, whatsappLink, mailLink } from "./config.js?v=3dB";
import { products, industries, valueProps, customSteps, orderSteps, faqs } from "./content.js?v=3dB";
import { SHOWCASE, SHOWCASE_ORDER } from "./showcase.js?v=3dB";
import { bagSVG } from "./bags.js?v=3dB";
import { initForm } from "./form.js?v=3dB";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const icon = (id) => `<svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#${id}"/></svg>`;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch { return false; }
}

/* ---------- config-driven text and links ---------- */
function applyConfig() {
  const host = siteConfig.website.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const values = {
    brandName: siteConfig.brandName, tagline: siteConfig.tagline, email: siteConfig.email,
    address: siteConfig.address, whatsappDisplay: whatsappDisplay(), websiteHost: host,
  };
  $$("[data-config]").forEach((el) => (el.textContent = values[el.dataset.config] ?? ""));
  $$("[data-if]").forEach((el) => { if (!values[el.dataset.if]) el.remove(); });
  $$("[data-wa-link]").forEach((a) => { a.href = whatsappLink(a.dataset.waMsg || ""); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-mail-link]").forEach((a) => (a.href = mailLink("Enquiry from website")));
  $$("[data-site-link]").forEach((a) => { a.href = siteConfig.website; a.rel = "noopener"; });
  if (siteConfig.logo !== "assets/logo/logo.png") $$("[data-config-src='logo']").forEach((i) => (i.src = siteConfig.logo));

  const names = { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", youtube: "YouTube" };
  const social = $("[data-social]");
  const items = Object.entries(siteConfig.social).filter(([, url]) => url);
  if (social) social.innerHTML = items.map(([k, url]) => `<li><a href="${url}" target="_blank" rel="noopener">${names[k] || k}</a></li>`).join("");
  $("#year").textContent = new Date().getFullYear();
}

/* ---------- rendered sections ---------- */
const productMessage = (name) => `Hello ${siteConfig.brandName}, I would like to enquire about: ${name}. Please share the available options and quotation details.`;

function renderProducts() {
  $("[data-render='products']").innerHTML = products.map((p, i) => `
    <article class="product-card reveal" id="product-${p.id}" style="--i:${i % 3}">
      <div class="product-media">
        ${p.image
          ? `<img src="${p.image}" alt="${p.alt || p.name}" width="760" height="700" loading="lazy">`
          : `<div class="snap" data-snap="p-${p.id}" data-alt="${p.name} mockup" data-fallback-bag="${p.bag}"></div>`}
      </div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <p class="opt-title">Customisation options <span>(subject to confirmation)</span></p>
        <ul class="chips">${p.options.map((o) => `<li>${o}</li>`).join("")}</ul>
        <a class="btn btn-gold btn-block" href="${whatsappLink(productMessage(p.name))}" target="_blank" rel="noopener" data-product="${p.name}">
          Enquire About This Bag ${icon("i-arrow-right")}
        </a>
      </div>
    </article>`).join("");

  const links = products.map((p) => `<li><a href="#product-${p.id}">${p.name}</a></li>`).join("");
  $("[data-product-menu]").innerHTML = links;
  $("[data-footer-products]").innerHTML = links;
}

function renderStatic() {
  $("[data-render='valueProps']").innerHTML = valueProps.map((v, i) => `
    <li class="value-item reveal" style="--i:${i}"><span class="v-icon">${icon(v.icon)}</span><h3>${v.title}</h3><p>${v.text}</p></li>`).join("");

  $("[data-render='customSteps']").innerHTML = customSteps.map((s) => `<li>${s}</li>`).join("");

  $("[data-render='industries']").innerHTML = industries.map((v, i) => `
    <li class="industry-card reveal" style="--i:${i % 3}">
      <div class="ind-media"><div class="snap" data-snap="${v.snap}" data-alt="${v.title} paper bag mockup" data-fallback-bag="handle"></div></div>
      <div class="ind-body"><span class="i-icon">${icon(v.icon)}</span><div><h3>${v.title}</h3><p>${v.text}</p></div></div>
    </li>`).join("");

  $("[data-render='orderSteps']").innerHTML = orderSteps.map((s, i) => `
    <li class="t-step reveal" style="--i:${i}"><span class="t-num">${s.n}</span><h3>${s.title}</h3><p>${s.text}</p></li>`).join("");

  $("[data-render='faqs']").innerHTML = faqs.map((f, i) => `
    <div class="acc-item">
      <h3><button type="button" class="acc-btn" id="acc-b${i}" aria-expanded="false" aria-controls="acc-p${i}"><span>${f.q}</span>${icon("i-chevron-down")}</button></h3>
      <div class="acc-panel" id="acc-p${i}" role="region" aria-labelledby="acc-b${i}"><div><p>${f.a}</p></div></div>
    </div>`).join("");
}

/* ---------- header, menus ---------- */
function initHeader() {
  const header = $("#siteHeader");
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 24);
    $("#toTop").hidden = window.scrollY < 700;
    const doc = document.documentElement;
    $("#progress").style.transform = `scaleX(${Math.min(1, window.scrollY / Math.max(1, doc.scrollHeight - innerHeight))})`;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const btn = $("#menuBtn"), nav = $("#primaryNav");
  const setMenu = (open) => {
    btn.setAttribute("aria-expanded", open);
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.style.top = open ? `${Math.max(0, header.getBoundingClientRect().bottom)}px` : "";
    nav.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
  };
  btn.addEventListener("click", () => setMenu(btn.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });

  const sub = $(".sub-toggle");
  const setSub = (open) => sub.setAttribute("aria-expanded", open);
  sub.addEventListener("click", () => setSub(sub.getAttribute("aria-expanded") !== "true"));
  $("#productMenu").addEventListener("click", () => setSub(false));
  document.addEventListener("click", (e) => { if (!e.target.closest(".has-sub")) setSub(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (sub.getAttribute("aria-expanded") === "true") { setSub(false); sub.focus(); }
    if (btn.getAttribute("aria-expanded") === "true") { setMenu(false); btn.focus(); }
  });
  window.matchMedia("(min-width: 960px)").addEventListener("change", () => setMenu(false));

  const enq = $("#enquiry");
  if (enq && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => document.body.classList.toggle("at-enquiry", e.isIntersecting), { threshold: 0.05 }).observe(enq);
  }
  $("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
}

/* ---------- FAQ accordion ---------- */
function initAccordion() {
  const btns = $$(".acc-btn");
  btns.forEach((b, i) => {
    b.addEventListener("click", () => {
      const open = b.getAttribute("aria-expanded") === "true";
      b.setAttribute("aria-expanded", String(!open));
      b.closest(".acc-item").classList.toggle("open", !open);
    });
    b.addEventListener("keydown", (e) => {
      const map = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: btns.length - 1 };
      if (e.key in map) { e.preventDefault(); btns[(map[e.key] + btns.length) % btns.length].focus(); }
    });
  });
}

/* ---------- reveal on scroll ---------- */
function initReveal() {
  const els = $$(".reveal, .reveal-img");
  if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  els.forEach((el) => io.observe(el));
}

/* ---------- 3D bags ---------- */
function svgFallback() {
  $$("[data-bag]").forEach((el) => {
    el.innerHTML = bagSVG(el.dataset.bag, { logo: siteConfig.logoMark, label: el.dataset.label });
  });
  $$("[data-fallback-bag]").forEach((el) => {
    el.innerHTML = bagSVG(el.dataset.fallbackBag, { logo: siteConfig.logoMark, label: el.dataset.alt });
    el.classList.add("ready", "is-svg");
  });
  $("#heroCanvas")?.remove();
  $("#studioCanvas") && ($("#studioFallback").hidden = false);
}

async function init3D() {
  if (!hasWebGL()) return svgFallback();
  let m;
  try { m = await import("./bag3d.js?v=3dB"); } catch (e) { console.warn("3D engine unavailable", e); return svgFallback(); }
  const logo = await m.loadLogo(siteConfig.logoMark).catch(() => null);
  $(".stage-art")?.remove();

  // Hero: live, auto-rotating bag (fades in once the first frame is drawn)
  const heroCanvas = $("#heroCanvas");
  const hero = new m.BagStage(heroCanvas, { interactive: true, autoRotate: true });
  hero.setSpec({ type: "handle", paper: "kraft", logo });
  hero.start();
  requestAnimationFrame(() => requestAnimationFrame(() => heroCanvas.parentElement.classList.add("live")));

  // Bag Studio: starts when the section is near the viewport
  const studioWrap = $("#studioCanvas");
  if (studioWrap) {
    const state = { type: "handle", paper: "kraft", logoScale: 0.58, logoY: 0.5, logoLabel: false, logoCustom: false };
    let stage, userLogo = null, userLogoName = "";
    const spec = () => ({ ...state, logo: userLogo || logo });
    const boot = () => {
      stage = new m.BagStage(studioWrap, { interactive: true, autoRotate: true });
      stage.setSpec(spec()); stage.start();
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { boot(); io.disconnect(); } }, { rootMargin: "500px" });
      io.observe(studioWrap);
    } else boot();

    const label = { handle: "Paper Handle Bag", shopping: "Large Shopping Bag", shoe: "Shoe Bag", jewellery: "Jewellery Bag", sos: "SOS Paper Bag", boutique: "Boutique Paper Bag" };
    const paper = { kraft: "Natural Kraft", white: "Ivory White", forest: "Forest Green" };
    const cta = $("#studioCta");
    const refresh = () => {
      stage?.setSpec(spec());
      cta.href = whatsappLink(`Hello ${siteConfig.brandName}, I would like to discuss a custom printed bag.\n\nBag type: ${label[state.type]}\nPaper look: ${paper[state.paper]}\n${userLogo ? "I previewed my own logo in the Bag Studio and will attach the logo file here." : "I will share my logo here."}`);
    };
    $$("input[name='studioType']").forEach((r) => r.addEventListener("change", () => { state.type = r.value; refresh(); }));
    $$("input[name='studioPaper']").forEach((r) => r.addEventListener("change", () => { state.paper = r.value; refresh(); }));
    // ---- customer logo: read locally, never uploaded
    const fileIn = $("#logoFile"), msg = $("#logoMsg"), tools = $("#logoTools"), reset = $("#logoReset"), btnText = $("#logoBtnText");
    const defaultMsg = msg.textContent;
    const say = (t, kind = "") => { msg.textContent = t; msg.className = "logo-msg " + kind; };
    let raf = 0;
    const later = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(refresh); };
    fileIn.addEventListener("change", async () => {
      const f = fileIn.files && fileIn.files[0];
      if (!f) return;
      if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) { say("Please choose a PNG, JPG or WebP image.", "err"); fileIn.value = ""; return; }
      if (f.size > 8 * 1024 * 1024) { say("This file is too large. Please use an image under 8 MB.", "err"); fileIn.value = ""; return; }
      say("Placing your logo on the bag…");
      try {
        userLogo = await m.loadLogo(f);
        userLogoName = f.name;
        state.logoCustom = true;
        state.logoLabel = false; $("#logoLabel").checked = false;
        tools.hidden = false; reset.hidden = false; btnText.textContent = "Change logo";
        say("Showing your logo on the bag. Turn it, resize it, or try another paper. This is a preview only; final printing is confirmed with you.", "ok");
        refresh();
        studioWrap.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } catch (e) { say("We could not read this image. Please try another file.", "err"); }
      fileIn.value = "";
    });
    reset.addEventListener("click", () => {
      userLogo = null; state.logoCustom = false; state.logoLabel = false; state.logoScale = 0.58; state.logoY = 0.5;
      $("#logoSize").value = 58; $("#logoY").value = 50; $("#logoLabel").checked = false;
      tools.hidden = true; reset.hidden = true; btnText.textContent = "Upload your logo";
      say(defaultMsg); refresh();
    });
    $("#logoSize").addEventListener("input", (e) => { state.logoScale = e.target.value / 100; later(); });
    $("#logoY").addEventListener("input", (e) => { state.logoY = e.target.value / 100; later(); });
    $("#logoLabel").addEventListener("change", (e) => { state.logoLabel = e.target.checked; refresh(); });

    $("#rotL").addEventListener("click", () => { if (stage) { stage.targetYaw -= 0.7; stage.lastInteract = performance.now(); stage.syncLoop(); } });
    $("#rotR").addEventListener("click", () => { if (stage) { stage.targetYaw += 0.7; stage.lastInteract = performance.now(); stage.syncLoop(); } });
    refresh();
  }

  // Product / industry / story images: rendered one at a time, only when near the screen,
  // and only after the hero is smooth, so the first seconds never stutter.
  const idle = window.requestIdleCallback ? (fn) => requestIdleCallback(fn, { timeout: 1500 }) : (fn) => setTimeout(fn, 80);
  const queue = [], seen = new Set();
  let working = false;
  const enqueue = (key) => {
    if (seen.has(key) || !SHOWCASE[key]) return;
    seen.add(key); queue.push(key);
    queue.sort((x, y) => SHOWCASE_ORDER.indexOf(x) - SHOWCASE_ORDER.indexOf(y));
    if (!working) { working = true; idle(next); }
  };
  const next = async () => {
    const key = queue.shift();
    if (!key) { working = false; return; }
    const c = SHOWCASE[key];
    try {
      const urls = await m.renderSnapshots([{ key, spec: { ...c, logo: c.logo ? logo : null }, yaw: c.yaw, pitch: c.pitch }], 760, 700);
      $$(`[data-snap="${key}"]`).forEach((el) => {
        el.innerHTML = `<img src="${urls[key]}" alt="${el.dataset.alt || ""}" width="760" height="700" decoding="async">`;
        requestAnimationFrame(() => el.classList.add("ready"));
      });
    } catch (e) { console.warn("snapshot failed", key, e); }
    setTimeout(() => idle(next), 120);
  };
  setTimeout(() => {
    if (!("IntersectionObserver" in window)) { SHOWCASE_ORDER.forEach(enqueue); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { enqueue(e.target.dataset.snap); io.unobserve(e.target); }
    }), { rootMargin: "700px 0px" });
    $$("[data-snap]").forEach((el) => io.observe(el));
  }, 1800);
}

/* ---------- boot ---------- */
renderProducts();
renderStatic();
applyConfig();
initHeader();
initAccordion();
initForm();
initReveal();
init3D();
