/**
 * Kraft paper bag mockups drawn as inline SVG.
 * The printed artwork is the transparent logo from siteConfig.logoMark,
 * so replacing assets/logo/logo-mark.png updates every mockup.
 *
 * bagSVG(type, { logo, placeholder, className, label })
 *   type: sos | vbottom | handle | custom | plain | boutique | hero | trio
 */

let uid = 0;

const KRAFT = { light: "#D6AD7C", mid: "#C69A68", dark: "#B58450", side: "#A87848", inner: "#8A5F36" };

function defs(p) {
  return `
  <defs>
    <linearGradient id="${p}f" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${KRAFT.light}"/><stop offset=".55" stop-color="${KRAFT.mid}"/><stop offset="1" stop-color="#BC8F5C"/>
    </linearGradient>
    <linearGradient id="${p}s" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#B7874F"/><stop offset="1" stop-color="${KRAFT.side}"/>
    </linearGradient>
    <linearGradient id="${p}in" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7E552F"/><stop offset="1" stop-color="${KRAFT.inner}"/>
    </linearGradient>
    <linearGradient id="${p}sun" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="${p}gr" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#3a2410" stop-opacity=".30"/><stop offset="1" stop-color="#3a2410" stop-opacity="0"/>
    </radialGradient>
    <filter id="${p}n" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/>
      <feColorMatrix values="0 0 0 0 .32  0 0 0 0 .2  0 0 0 0 .08  .55 0 0 0 -.12"/>
    </filter>
  </defs>`;
}

/** Logo (or "your logo" placeholder) printed on a front panel */
function print(p, o, x, y, w, h) {
  if (o.placeholder) {
    return `<g opacity=".8">
      <rect x="${x + w * 0.14}" y="${y + h * 0.1}" width="${w * 0.72}" height="${h * 0.8}" rx="6" fill="none" stroke="#102B20" stroke-width="1.6" stroke-dasharray="5 5"/>
      <text x="${x + w / 2}" y="${y + h / 2 - 2}" text-anchor="middle" font-family="Manrope,sans-serif" font-size="13" font-weight="700" letter-spacing="2.4" fill="#102B20">YOUR</text>
      <text x="${x + w / 2}" y="${y + h / 2 + 16}" text-anchor="middle" font-family="Manrope,sans-serif" font-size="13" font-weight="700" letter-spacing="2.4" fill="#102B20">LOGO HERE</text></g>`;
  }
  if (!o.logo) return "";
  const lw = w, lh = w * 0.957;
  return `<image href="${o.logo}" x="${x}" y="${y + (h - lh) / 2}" width="${lw}" height="${lh}" opacity=".93" style="mix-blend-mode:multiply" preserveAspectRatio="xMidYMid meet"/>`;
}

/* ---------- individual bag bodies (all drawn in a 400x460 box) ---------- */

function handleBag(p, o, scale = 1) {
  const fx = 70, fy = 140, fw = 220, fh = 262;
  return `
  <g>
    <ellipse cx="200" cy="420" rx="150" ry="16" fill="url(#${p}gr)"/>
    <path d="M168,128 C168,40 262,40 262,128" fill="none" stroke="#9C6C3F" stroke-width="5" stroke-linecap="round"/>
    <rect x="105" y="118" width="220" height="26" fill="url(#${p}in)"/>
    <path d="M70,${fy} L105,118 L105,144 Z" fill="#7A532D"/>
    <polygon points="${fx + fw},${fy} 325,118 325,384 ${fx + fw},${fy + fh}" fill="url(#${p}s)"/>
    <path d="M307,122 L307,380" stroke="#8D6238" stroke-opacity=".55" stroke-width="1.2"/>
    <path d="M308.5,122 L308.5,380" stroke="#fff" stroke-opacity=".18" stroke-width="1"/>
    <clipPath id="${p}c"><rect x="${fx}" y="${fy}" width="${fw}" height="${fh}"/></clipPath>
    <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="url(#${p}f)"/>
    <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" filter="url(#${p}n)" clip-path="url(#${p}c)" opacity=".7"/>
    <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="url(#${p}sun)"/>
    <path d="M${fx},${fy + 232} H${fx + fw}" stroke="#7A532D" stroke-opacity=".16" stroke-width="1.2"/>
    <path d="M${fx},${fy + 233.5} H${fx + fw}" stroke="#fff" stroke-opacity=".22" stroke-width="1"/>
    <path d="M${fx},${fy} H${fx + fw}" stroke="#fff" stroke-opacity=".3" stroke-width="1.4"/>
    <path d="M140,150 C140,62 220,62 220,150" fill="none" stroke="#B88650" stroke-width="5.5" stroke-linecap="round"/>
    <path d="M140,150 C140,62 220,62 220,150" fill="none" stroke="#EBD0A6" stroke-width="2" stroke-dasharray="2.5 4.5" stroke-linecap="round"/>
    <circle cx="140" cy="150" r="5" fill="#A97A47"/><circle cx="220" cy="150" r="5" fill="#A97A47"/>
    ${print(p, o, fx + 36, fy + 44, fw - 72, fh - 96)}
  </g>`;
}

function sosBag(p, o, flush = false) {
  const fx = 90, fw = 200, fy = flush ? 78 : 104, fh = 410 - fy;
  return `
  <g>
    <ellipse cx="205" cy="424" rx="140" ry="15" fill="url(#${p}gr)"/>
    <rect x="112" y="${flush ? 62 : 56}" width="214" height="${flush ? 34 : 56}" fill="url(#${p}in)"/>
    <polygon points="${fx + fw},${fy} 326,${flush ? 62 : 80} 326,392 ${fx + fw},410" fill="url(#${p}s)"/>
    <path d="M308,${flush ? 70 : 88} L308,396" stroke="#8D6238" stroke-opacity=".55" stroke-width="1.2"/>
    <path d="M309.5,${flush ? 70 : 88} L309.5,396" stroke="#fff" stroke-opacity=".18" stroke-width="1"/>
    <path d="M${fx},${fy} L112,${flush ? 62 : 80} L112,${fy + 8} Z" fill="#7A532D"/>
    <clipPath id="${p}c"><rect x="${fx}" y="${fy}" width="${fw}" height="${fh}"/></clipPath>
    <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="url(#${p}f)"/>
    <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" filter="url(#${p}n)" clip-path="url(#${p}c)" opacity=".7"/>
    <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="url(#${p}sun)"/>
    <path d="M${fx},${fy} H${fx + fw}" stroke="#fff" stroke-opacity=".3" stroke-width="1.4"/>
    ${flush
      ? `<path d="M${fx},372 L${fx + fw / 2},392 L${fx + fw},372" fill="none" stroke="#7A532D" stroke-opacity=".2" stroke-width="1.3"/>
         <path d="M${fx},374 L${fx + fw / 2},394 L${fx + fw},374" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1"/>`
      : `<path d="M${fx},382 H${fx + fw}" stroke="#7A532D" stroke-opacity=".16" stroke-width="1.2"/>
         <path d="M${fx},383.5 H${fx + fw}" stroke="#fff" stroke-opacity=".22" stroke-width="1"/>`}
    ${print(p, o, fx + 26, fy + 70, fw - 52, 190)}
  </g>`;
}

function boutiqueBag(p, o) {
  const fx = 46, fy = 176, fw = 262, fh = 226;
  return `
  <g>
    <ellipse cx="200" cy="420" rx="160" ry="15" fill="url(#${p}gr)"/>
    <path d="M60,${fy + 4} q22,-40 48,-10 q24,-34 54,-8 q26,-34 58,-6 q22,-26 52,8 L${fx + fw - 6},${fy + 8} Z" fill="#FFFCF6"/>
    <path d="M100,${fy - 22} q20,-14 40,-4" stroke="#E4D7C5" fill="none"/>
    <rect x="80" y="152" width="250" height="30" fill="url(#${p}in)"/>
    <polygon points="${fx + fw},${fy} 330,152 330,380 ${fx + fw},${fy + fh}" fill="url(#${p}s)"/>
    <path d="M${fx},${fy} L80,152 L80,${fy + 6} Z" fill="#7A532D"/>
    <clipPath id="${p}c"><rect x="${fx}" y="${fy}" width="${fw}" height="${fh}"/></clipPath>
    <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="url(#${p}f)"/>
    <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" filter="url(#${p}n)" clip-path="url(#${p}c)" opacity=".7"/>
    <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="url(#${p}sun)"/>
    <path d="M${fx},${fy + 196} H${fx + fw}" stroke="#7A532D" stroke-opacity=".16" stroke-width="1.2"/>
    <rect x="${fx + 14}" y="${fy + 22}" width="${fw - 28}" height="${fh - 70}" rx="2" fill="none" stroke="#AD742C" stroke-width="1.2" stroke-opacity=".85"/>
    <path d="M120,${fy + 8} C120,96 218,96 218,${fy + 8}" fill="none" stroke="#102B20" stroke-width="7" stroke-linecap="round"/>
    <path d="M120,${fy + 8} C120,96 218,96 218,${fy + 8}" fill="none" stroke="#D7AE70" stroke-width="1.2" stroke-opacity=".7" stroke-linecap="round"/>
    ${print(p, o, fx + 52, fy + 34, fw - 104, fh - 94)}
  </g>`;
}

/* ---------- public builders ---------- */

export function bagSVG(type = "handle", o = {}) {
  const p = `b${++uid}`;
  const label = o.label || "Kraft paper bag mockup";
  const cls = o.className ? ` class="${o.className}"` : "";
  let vb = "0 0 400 460";
  let body = "";
  switch (type) {
    case "sos": body = sosBag(p, o); break;
    case "vbottom": body = sosBag(p, o, true); break;
    case "plain": body = sosBag(p, { ...o, logo: "" }); break;
    case "boutique": body = boutiqueBag(p, o); break;
    case "custom": {
      vb = "-30 0 470 460";
      body = `<g transform="translate(20,0)">${handleBag(p, { ...o, logo: o.logo })}</g>
              <g transform="translate(-34,176) scale(.5)">${sosBag(p + "x", o)}</g>`;
      return wrap(vb, cls, label, defs(p) + defsAlt(p + "x") + body);
    }
    case "trio": {
      vb = "0 0 640 470";
      return wrap(vb, cls, label,
        defs(p) + defsAlt(p + "a") + defsAlt(p + "b") +
        `<g transform="translate(-24,150) scale(.68)">${sosBag(p + "a", o)}</g>
         <g transform="translate(150,10) scale(1.02)">${handleBag(p, o)}</g>
         <g transform="translate(384,214) scale(.58)">${boutiqueBag(p + "b", o)}</g>`);
    }
    case "handle":
    default: body = handleBag(p, o); break;
  }
  return wrap(vb, cls, label, defs(p) + body);
}

/** extra gradient/filter set under another prefix for composed scenes */
function defsAlt(p) { return defs(p); }

function wrap(vb, cls, label, inner) {
  return `<svg${cls} viewBox="${vb}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg" focusable="false">${inner}</svg>`;
}
