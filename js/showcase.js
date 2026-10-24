/**
 * Which 3D bag is shown where.
 * key -> { spec, yaw, pitch }.  `logo: true` prints the SPARSH logo, false = plain bag.
 * Cards in the page ask for these keys through  data-snap="key".
 * Change paper ("kraft" | "white" | "forest") or type ("handle" | "sos" | "vbottom" | "boutique") freely.
 */
export const SHOWCASE = {
  // Product cards
  "p-sos":            { type: "sos",      paper: "kraft",  logo: true,  yaw: -0.55 },
  "p-v-bottom":       { type: "vbottom",  paper: "kraft",  logo: true,  yaw: 0.55 },
  "p-handle":         { type: "handle",   paper: "kraft",  logo: true,  yaw: -0.5 },
  "p-custom-printed": { type: "handle",   paper: "white",  logo: true,  yaw: 0.5 },
  "p-plain-kraft":    { type: "sos",      paper: "kraft",  logo: false, yaw: 0.45 },
  "p-boutique":       { type: "boutique", paper: "forest", logo: true,  yaw: -0.5 },
  // Industries
  "i-bakery":         { type: "sos",      paper: "kraft",  logo: true,  yaw: -0.4 },
  "i-fashion":        { type: "handle",   paper: "white",  logo: true,  yaw: 0.42 },
  "i-jewellery":      { type: "boutique", paper: "forest", logo: true,  yaw: 0.5 },
  "i-cosmetics":      { type: "boutique", paper: "white",  logo: true,  yaw: -0.45 },
  "i-retail":         { type: "handle",   paper: "kraft",  logo: true,  yaw: 0.38 },
  "i-wholesale":      { type: "vbottom",  paper: "kraft",  logo: true,  yaw: -0.5 },
  // Story section
  "story":            { type: "handle",   paper: "kraft",  logo: true,  yaw: -0.85, pitch: 0.2 },
};

/** Render order: what the visitor sees first goes first. */
export const SHOWCASE_ORDER = [
  "p-sos", "p-v-bottom", "p-handle", "p-custom-printed", "p-plain-kraft", "p-boutique",
  "story", "i-bakery", "i-fashion", "i-jewellery", "i-cosmetics", "i-retail", "i-wholesale",
];
