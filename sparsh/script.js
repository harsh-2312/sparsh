/* ==========================================================
   SPARSH - SCRIPT
   EDIT GUIDE (search for these names in this file):
   - WhatsApp number & message  -> search "wa.me"  and  "msg"
   - Bag colours (Make It Yours) -> const V
   - Process steps               -> const S
   - Industries cards            -> const I
   - Collection cards            -> const C
   - Why SPARSH points           -> const W
   - Scroll animation stages     -> const ST
   Images: images/logo.jpg and images/bags.jpg (replace with your own, same names)
   ========================================================== */

const LOGO = 'images/logo.jpg',
  BAGS = 'images/bags.jpg';

const $ = s => document.querySelector(s),
  msg = encodeURIComponent("Hello SPARSH, I am interested in customized paper bags for my brand. Please share details.");
const wa = `https://wa.me/919054837242?text=${msg}`;
document.querySelectorAll('a.wa').forEach(a => {
  a.href = wa;
  a.target = '_blank';
  a.rel = 'noopener'
});
document.querySelectorAll('[data-w]').forEach(a => {
  a.href = `https://wa.me/${a.dataset.w}?text=${msg}`;
  a.target = '_blank';
  a.rel = 'noopener'
});
/* bag svg: body colour, logo colour, logo opacity, gold-details opacity */
let u = 0;
const ARM = '<rect x="-70" y="60" width="150" height="20" rx="10" fill="#F5F0E6" stroke="#C9A24A"/><rect x="-70" y="60" width="38" height="20" fill="#0B3B2A"/><circle cx="84" cy="70" r="11" fill="#E8D5B8" stroke="#C9A24A"/>';
const M = (s, g) => `<text x="50" y="86" text-anchor="middle" font-family="Cormorant Garamond,serif" font-weight="700" font-size="112" fill="${s}">S</text><path d="M44 46q0-10 8-10t8 10" fill="none" stroke="${g}" stroke-width="1.8"/><path d="M40 46h24l-2 30H42z" fill="#F5F0E6" stroke="${g}" stroke-width="1.4"/><path d="M60 92q14-14 36-10-10 16-36 10z" fill="${g}"/>`;
const Mk = (s, g) => `<svg viewBox="0 0 100 100" aria-hidden="true">${M(s,g)}</svg>`;

function bag(c, l = '#C9A24A', lo = 1, go = 0, arm = 0) {
  const id = 'g' + u++;
  return `<svg viewBox="${arm?-70:0} 0 ${arm?270:200} 275" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block"><defs><linearGradient id="${id}"><stop offset="0" stop-color="#fff" stop-opacity=".06"/><stop offset=".5" stop-opacity="0"/><stop offset="1" stop-opacity=".1"/></linearGradient></defs><ellipse cx="100" cy="263" rx="76" ry="6" fill="#10231B" opacity=".16"/>${arm?ARM:''}<path d="M72 78V58q28-48 56 0v20" fill="none" stroke="#a88a52" stroke-width="4.5" stroke-linecap="round"/><path d="M72 78V58q28-48 56 0v20" fill="none" stroke="#e2cd9b" stroke-width="1.2" stroke-dasharray="2 3" stroke-linecap="round"/><rect x="30" y="74" width="140" height="182" fill="${c}"/><rect x="30" y="74" width="140" height="182" fill="url(#${id})"/><path d="M30 74h140v10H30z" fill="#000" opacity=".1"/><rect x="42" y="94" width="116" height="150" fill="none" stroke="#C9A24A" opacity="${go}"/><g opacity="${lo}" fill="${l}" text-anchor="middle"><text x="101.5" y="152" font-family="Cormorant Garamond,serif" font-size="19" font-weight="700" letter-spacing="3.5">SPARSH</text><path d="M66 164h26M108 164h26" stroke="#C9A24A" stroke-width=".7"/><path d="M100 160l3 4-3 4-3-4z" fill="#C9A24A"/><text x="100.3" y="182" font-family="Jost,sans-serif" font-size="5.6" letter-spacing=".6">Carry Your Brand With a Touch</text></g></svg>`
}
const hb = $('#hb');
hb.innerHTML = `<img src="${BAGS}" alt="" width="646" height="489" decoding="async">`;
const lf = (r, x, y, k) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${k})"><path d="M0 0q24-36 0-86-24 50 0 86z" fill="#1f5c43"/><path d="M0 0V-80" stroke="#C9A24A" stroke-width="1"/></g>`;
$('.hero').insertAdjacentHTML('beforeend', `<svg class="lf" viewBox="0 0 200 200" aria-hidden="true">${lf(150,60,40,1)}${lf(200,110,20,1.1)}${lf(110,30,70,.8)}${lf(175,85,35,.9)}</svg>`);
document.querySelectorAll('.logo').forEach(l => l.innerHTML = `<img src="${LOGO}" alt="SPARSH – Carry Your Brand With a Touch" width="460" height="282">`);
const V = [
  ['Forest Green', 'Premium matte finish', '#0B3B2A', '#C9A24A', '#E6EDE4'],
  ['Ivory', 'Minimal luxury', '#F5F0E6', '#0B3B2A', '#FAF7EF'],
  ['Kraft', 'Natural & earthy', '#B89268', '#10231B', '#EFE3D0'],
  ['White', 'Clean & modern', '#FFFFFF', '#0B3B2A', '#F1F4EF'],
  ['Luxury', 'Premium boutique finish', '#10231B', '#C9A24A', '#EDE5CF']
];
const sw = $('#sw');
V.forEach((v, i) => {
  const b = document.createElement('button');
  b.style.background = v[2];
  b.setAttribute('aria-label', v[0]);
  b.onclick = () => pick(i);
  sw.append(b)
});

function pick(i) {
  const v = V[i];
  $('#showBag').innerHTML = bag(v[2], v[3], 1, i == 4 ? 1 : 0);
  $('#vn').textContent = v[0];
  $('#vd').textContent = v[1];
  $('.show').style.background = v[4];
  [...sw.children].forEach((b, j) => b.setAttribute('aria-pressed', j == i))
}
pick(0);
const S = [
  ['Choose Your Bag', 'Pick the style, size and handle that suits your brand.'],
  ['Add Your Branding', 'Share your logo, name and brand colours.'],
  ['Select Finish', 'Choose paper, finish and printing style.'],
  ['Approve Design', 'Review the design before anything is produced.'],
  ['Production', 'Your bags are made with careful attention to detail.'],
  ['Delivery', 'Finished bags are delivered to your business.']
];
$('#steps').innerHTML = S.map((s, i) => `<li class="rev" style="transition-delay:${(i%2)*.1}s"><b>0${i+1}</b><div><h3>${s[0]}</h3><p>${s[1]}</p></div></li>`).join('');
const I = [
  ['Fashion', 'Bags that match the way your collection feels.'],
  ['Jewellery', 'Small, refined packaging for precious things.'],
  ['Cosmetics', 'Elegant finishes for beauty brands.'],
  ['Restaurants', 'Takeaway that carries your name.'],
  ['Bakeries', 'Warm, earthy bags for fresh goods.'],
  ['Retail Stores', 'Everyday bags with a branded look.'],
  ['Gifting', 'Make the unboxing begin at the bag.'],
  ['Events', 'Welcome bags for guests and delegates.'],
  ['Corporate', 'Professional bags for clients and teams.'],
  ['Boutiques', 'Boutique-grade presentation, your design.']
];
$('#ind').innerHTML = I.map((s, i) => `<article class="card"><span>${String(i+1).padStart(2,'0')}</span><h3>${s[0]}</h3><p>${s[1]}</p></article>`).join('');
const C = [
  ['Luxury Paper Bags', 'Rich finishes with gold detailing.', '#0B3B2A'],
  ['Boutique Bags', 'Refined bags for premium stores.', '#F5F0E6'],
  ['Kraft Paper Bags', 'Natural texture, honest feel.', '#B89268'],
  ['Retail Bags', 'Practical and branded for daily use.', '#FFFFFF'],
  ['Gift Bags', 'Made for moments worth wrapping.', '#10231B'],
  ['Custom Printed Bags', 'Your logo, your colours, your design.', '#0B3B2A']
];
$('#coll').innerHTML = C.map((s, i) => `<article class="card">${bag(s[2],['#F5F0E6','#B89268','#FFFFFF'].includes(s[2])?'#0B3B2A':'#C9A24A',1,0)}<span class="badge">Customizable</span><h3>${s[0]}</h3><p>${s[1]}</p><p style="margin-top:12px"><a href="${wa}" target="_blank" rel="noopener" style="color:var(--forest);border-bottom:1px solid var(--gold);text-decoration:none">Explore →</a></p></article>`).join('');
const W = [
  ['Premium Materials', 'Paper chosen for feel, strength and finish.'],
  ['Precision Printing', 'Clean logos, true colours, sharp detail.'],
  ['Brand-Focused Design', 'Every bag shaped around your identity.'],
  ['Reliable Production', 'Careful process from approval to delivery.']
];
$('#why').innerHTML = W.map(s => `<div class="it rev"><h3>${s[0]}</h3><p>${s[1]}</p></div>`).join('');
/* signature scroll bag */
const sg = $('#sig'),
  sb = $('#sigBag'),
  pr = $('#pr'),
  stg = $('#stg'),
  rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
const ST = [
  [0, 'Plain bag', '#B89268', '#10231B', 0, 0, 0],
  [.2, 'Your logo', '#B89268', '#10231B', 1, 0, 0],
  [.4, 'Your colour', '#0B3B2A', '#C9A24A', 1, 0, 0],
  [.6, 'Gold finish', '#0B3B2A', '#C9A24A', 1, 1, 0],
  [.8, 'Carried by your customer', '#0B3B2A', '#C9A24A', 1, 1, 1]
];
let cur = -1;

function draw() {
  const r = sg.getBoundingClientRect(),
    p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
  pr.style.width = p * 100 + '%';
  if (!rm) {
    sb.style.transform = `rotate(${(p-.5)*8}deg) scale(${.94+p*.1})`;
    if (scrollY < innerHeight * 1.2) hb.style.transform = `translateY(${scrollY*.1}px)`
  }
  let k = 0;
  ST.forEach((s, i) => {
    if (p >= s[0]) k = i
  });
  if (k !== cur) {
    const first = cur < 0;
    cur = k;
    const s = ST[k];
    sb.innerHTML = bag(s[2], s[3], s[4], s[5], s[6]);
    stg.textContent = '0' + (k + 1) + ' / 05 — ' + s[1];
    if (!first && !rm) sb.animate([{
      opacity: .3
    }, {
      opacity: 1
    }], {
      duration: 500
    })
  }
}
/* nav, sticky, menu, reveal */
const nav = $('#nav'),
  stk = $('#stk');
let tk = 0;
addEventListener('scroll', () => {
  if (tk) return;
  tk = requestAnimationFrame(() => {
    tk = 0;
    nav.classList.toggle('s', scrollY > 40);
    stk.classList.toggle('v', scrollY > innerHeight * .7 && document.querySelector('#contact').getBoundingClientRect().top > innerHeight * .8);
    draw()
  })
}, {
  passive: true
});
draw();
const bg = $('#bg'),
  pn = $('#pn');

function tg(o) {
  bg.classList.toggle('o', o);
  pn.classList.toggle('o', o);
  bg.setAttribute('aria-expanded', o);
  pn.setAttribute('aria-hidden', !o);
  document.body.style.overflow = o ? 'hidden' : ''
}
bg.onclick = () => tg(!pn.classList.contains('o'));
pn.querySelectorAll('a').forEach(a => a.addEventListener('click', () => tg(false)));
addEventListener('keydown', e => e.key === 'Escape' && tg(false));
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    e.target.classList.add('in');
    io.unobserve(e.target)
  }
}), {
  threshold: .15
});
document.querySelectorAll('.rev,.cta').forEach(e => io.observe(e));
const secs = [...document.querySelectorAll('header[id],section[id]')],
  ls = [...document.querySelectorAll('.links a:not(.btn)')];
new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) ls.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id))
}), {
  rootMargin: '-45% 0px -50% 0px'
}).observe && secs.forEach(s => new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) ls.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id))
}), {
  rootMargin: '-45% 0px -50% 0px'
}).observe(s));