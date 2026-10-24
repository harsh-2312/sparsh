/**
 * Website content (products, industries, steps, FAQ).
 * Edit text here. No prices, sizes, GSM or MOQ are listed on purpose —
 * add them only after they are confirmed.
 *
 * PRODUCT PHOTOS: every product has `image: ""`. While empty, a drawn kraft-bag
 * mockup (js/bags.js) is shown. To use a real photo, put the file in
 * assets/images/ and set e.g. image: "assets/images/sos-bag.jpg" plus `alt`.
 */

export const products = [
  {
    id: "sos",
    name: "SOS Paper Bags",
    bag: "sos",
    description:
      "Handle-free, flat-bottom paper bags — a practical choice for bakeries, cafes, food counters and everyday retail.",
    options: ["Plain or printed", "Size on request", "Paper type on request"],
    image: "",
    alt: "",
  },
  {
    id: "v-bottom",
    name: "V-Bottom Paper Bags",
    bag: "vbottom",
    description:
      "Classic V-bottom paper bags for light everyday packing, available plain or carrying your branding.",
    options: ["Plain or printed", "Size on request", "Logo placement"],
    image: "",
    alt: "",
  },
  {
    id: "handle",
    name: "Paper Handle Bags",
    bag: "handle",
    description:
      "Shopping-style paper bags with handles for retail counters, gifting and takeaway orders.",
    options: ["Handle style on request", "Plain or printed", "Size on request"],
    image: "",
    alt: "",
  },
  {
    id: "custom-printed",
    name: "Custom Printed Paper Bags",
    bag: "custom",
    description:
      "Bags that carry your logo and brand message. Share your artwork and we will confirm what is possible.",
    options: ["Your logo / artwork", "Colours on request", "Printing method confirmed per order"],
    image: "",
    alt: "",
  },
  {
    id: "plain-kraft",
    name: "Plain Kraft Paper Bags",
    bag: "plain",
    description:
      "Unprinted kraft paper bags for businesses that prefer simple, natural-looking packaging.",
    options: ["Unprinted", "Size on request", "Bag type on request"],
    image: "",
    alt: "",
  },
  {
    id: "boutique",
    name: "Retail & Boutique Packaging",
    bag: "boutique",
    description:
      "Presentation-focused paper bags for boutiques, gifting and premium retail counters.",
    options: ["Handle & finish on request", "Branded printing", "Custom size on request"],
    image: "",
    alt: "",
  },
];

export const industries = [
  { snap: "i-bakery", icon: "i-store", title: "Bakeries & Cafes", text: "Everyday bags for cakes, pastries and takeaway counters." },
  { snap: "i-fashion", icon: "i-shopping-bag", title: "Fashion & Apparel", text: "Clean branded bags for garments and accessories." },
  { snap: "i-jewellery", icon: "i-sparkles", title: "Jewellery & Gift Shops", text: "Presentation packaging that suits gifting moments." },
  { snap: "i-cosmetics", icon: "i-layers", title: "Cosmetics & Lifestyle", text: "Packaging that reflects a considered brand identity." },
  { snap: "i-retail", icon: "i-package-check", title: "Retail Stores", text: "Practical carry bags for busy billing counters." },
  { snap: "i-wholesale", icon: "i-boxes", title: "Distributors & Wholesalers", text: "Bulk enquiries for resale and repeat supply." },
];

export const valueProps = [
  { icon: "i-pen-tool", title: "Custom Logo & Branding", text: "Put your logo and brand message on the bag. Printing options are confirmed against your artwork." },
  { icon: "i-ruler", title: "Paper & Size Options", text: "Tell us the paper look, size and handle you have in mind. We confirm what is available." },
  { icon: "i-layers", title: "Plain & Printed Bags", text: "Simple unprinted kraft bags or fully branded ones — choose what fits your business." },
  { icon: "i-package-check", title: "Bulk Order Enquiries", text: "Built for retailers, wholesalers and brands ordering in quantity." },
];

export const customSteps = [
  "Select your bag type.",
  "Share size and quantity requirements.",
  "Submit your logo or artwork.",
  "Confirm specifications and quotation.",
];

export const orderSteps = [
  { n: "01", title: "Share Your Requirement", text: "Tell us the bag type, quantity and whether you want it plain or printed." },
  { n: "02", title: "Confirm Bag Specifications", text: "We discuss size, paper, handle and printing so everything is clear." },
  { n: "03", title: "Review Quotation & Artwork", text: "You receive the quotation and review your artwork before going ahead." },
  { n: "04", title: "Confirm the Order", text: "Once you approve, the order is confirmed individually." },
];

export const faqs = [
  {
    q: "Can I print my own brand logo on the bags?",
    a: "Yes, custom logo and brand printing is what SPARSH is about. Share your logo or artwork and we will confirm the printing options available for your requirement.",
  },
  {
    q: "Do you offer plain paper bags?",
    a: "Yes, you can enquire about plain kraft paper bags without printing. Availability and specifications are confirmed when you enquire.",
  },
  {
    q: "Which bag types can I enquire about?",
    a: "SOS paper bags, V-bottom paper bags, paper handle bags, custom printed bags, plain kraft bags and retail / boutique packaging. If you need something else, just ask.",
  },
  {
    q: "Can I request a custom size?",
    a: "You can request a custom size. Whether it can be made is confirmed after we understand your requirement.",
  },
  {
    q: "How can I obtain bulk pricing?",
    a: "Pricing depends on the bag type, size, quantity and printing, so we do not list fixed prices. Send an enquiry through the form or WhatsApp and we will respond with a quotation.",
  },
  {
    q: "How do I share my artwork?",
    a: "Start your enquiry on WhatsApp and send your logo or artwork there. A clear, high-resolution file helps. The final artwork is reviewed with you before the order is confirmed.",
  },
  {
    q: "Do you accept export enquiries?",
    a: "You are welcome to send an export enquiry. Order acceptance, terms, pricing and delivery are confirmed individually for each requirement.",
  },
];

/** Product types shown in the enquiry form drop-down. */
export const formProductTypes = [...products.map((p) => p.name), "Not sure yet"];
