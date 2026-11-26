/**
 * Project-Connected Swiss/Space-Age SVG Poster Generator
 *
 * Supports 4 effortless ways to style any project in data/site-data.js:
 *   1. Zero-config auto-poster (omit `preset` & `theme`):
 *      - Automatically detects topic keywords (face, vehicle, pedestrian, map,
 *        video, robot, llm/text, ml, draw, etc.) for a connected motif, OR
 *        generates a deterministic Swiss Bauhaus geometric poster from the title.
 *   2. Built-in presets + themes: pick any `preset` + `theme` from below.
 *   3. Real screenshot / image: pass `image: "./images/my_demo.png"`.
 *   4. Custom raw SVG override: pass `art: "<svg ...>...</svg>"`.
 */

export const TILE_THEMES = {
  crimson: { bg: "#7C1212", fg: "#F9F3E8", accent: "#FF5A2C", soft: "#F6EFE2" },
  paper:   { bg: "#F8F7F4", fg: "#111113", accent: "#E63B2E", soft: "#E7E4DC" },
  cobalt:  { bg: "#1943B8", fg: "#F8FAFC", accent: "#FACC15", soft: "#FFFFFF" },
  obsidian:{ bg: "#121215", fg: "#F5F2EB", accent: "#E5B94C", soft: "#FF4A28" },
  cream:   { bg: "#F6F3EC", fg: "#141414", accent: "#FF5412", soft: "#165B46" },
  orange:  { bg: "#FF5214", fg: "#FFF7F0", accent: "#121214", soft: "#FFF7F0" },
  gold:    { bg: "#F5A800", fg: "#1A1408", accent: "#D92B1E", soft: "#FFF7E0" },
  stone:   { bg: "#EBE8E0", fg: "#161618", accent: "#E63B2E", soft: "#165B46" },
  blush:   { bg: "#F3B6C6", fg: "#1C1418", accent: "#E63B2E", soft: "#FFF8F0" },
  slate:   { bg: "#232634", fg: "#F1F5F9", accent: "#FF5214", soft: "#38BDF8" },
  sand:    { bg: "#DFD7C6", fg: "#181614", accent: "#FF5214", soft: "#165B46" },
  forest:  { bg: "#0F5B42", fg: "#F5F2E8", accent: "#FF5214", soft: "#EFEAE0" },
  indigo:  { bg: "#2B2266", fg: "#F5F3FF", accent: "#FF5A36", soft: "#38BDF8" },
  teal:    { bg: "#0E6B78", fg: "#F0FDFA", accent: "#FACC15", soft: "#99F6E4" },
};

const THEME_NAMES = Object.keys(TILE_THEMES);
const LIGHT_THEMES = new Set(["paper", "cream", "stone", "sand"]);

function hashSeed(str = "") {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function deriveLabel(t) {
  if (t.label) return t.label;
  const words = String(t.title || "PROJECT")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.slice(0, 2).join(" ").toUpperCase().slice(0, 10) || "PROJECT";
}

function deriveBadge(t) {
  if (t.badge !== undefined) return t.badge;
  if (t.stack) return String(t.stack).split(/[·,/]/)[0].trim().toUpperCase().slice(0, 6);
  return String(t.kind || "").toUpperCase().slice(0, 6);
}

function footerLabels(label, badge, fg) {
  const safeLabel = esc(label);
  const safeBadge = esc(badge);
  const combined = safeLabel.length + (safeBadge ? safeBadge.length * 0.6 : 0);
  const size = combined > 10 ? 11 : combined > 8 ? 13 : 15.5;
  return `
    <text x="12" y="106" fill="${fg}" font-size="${size}" font-weight="900" font-family="system-ui,sans-serif" letter-spacing="-0.35">${safeLabel}</text>
    ${safeBadge ? `<text x="108" y="106" text-anchor="end" fill="${fg}" opacity="0.68" font-size="7.2" font-family="monospace">${safeBadge}</text>` : ""}
  `;
}

function cvBrackets(x, y, w, h, color, len = 10, sw = 2.6, op = 0.85) {
  const x2 = x + w;
  const y2 = y + h;
  return `
    <g fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}">
      <path d="M${x} ${y + len} L${x} ${y} L${x + len} ${y}"/>
      <path d="M${x2 - len} ${y} L${x2} ${y} L${x2} ${y + len}"/>
      <path d="M${x} ${y2 - len} L${x} ${y2} L${x + len} ${y2}"/>
      <path d="M${x2 - len} ${y2} L${x2} ${y2} L${x2} ${y2 - len}"/>
    </g>
  `;
}

const PRESETS = {
  /* 01 · Generative Drawing Canvas (Rust-Burn Drawing Generator) */
  curve: (t, c) => `
    <rect x="18" y="16" width="84" height="62" rx="12" fill="${c.soft}"/>
    <line x1="32" y1="58" x2="48" y2="28" stroke="${c.bg}" stroke-opacity="0.22" stroke-width="1.5" stroke-dasharray="3 3"/>
    <line x1="86" y1="30" x2="70" y2="62" stroke="${c.bg}" stroke-opacity="0.22" stroke-width="1.5" stroke-dasharray="3 3"/>
    <path d="M30 58 C44 24, 64 68, 86 30" fill="none" stroke="${c.accent}" stroke-width="5.2" stroke-linecap="round"/>
    <circle cx="30" cy="58" r="4.2" fill="${c.bg}"/>
    <circle cx="86" cy="30" r="6" fill="${c.bg}"/>
    <circle cx="86" cy="30" r="2.4" fill="${c.accent}"/>
    ${footerLabels(deriveLabel(t), deriveBadge(t), c.fg)}
  `,

  /* 02 · Sketch Canvas + Softmax Classification Bars (Drawing Classifier) */
  matrix: (t, c) => `
    <rect x="14" y="18" width="46" height="58" rx="10" fill="${c.fg}" opacity="0.07" stroke="${c.fg}" stroke-opacity="0.16" stroke-width="1.5"/>
    <path d="M25 56 C27 32, 46 30, 44 45 C42 56, 30 56, 48 63" fill="none" stroke="${c.fg}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="48" cy="63" r="3" fill="${c.accent}"/>
    <g>
      <rect x="68" y="23" width="38" height="10" rx="5" fill="${c.accent}"/>
      <rect x="68" y="42" width="24" height="10" rx="5" fill="${c.soft}"/>
      <rect x="68" y="61" width="14" height="10" rx="5" fill="${c.fg}" opacity="0.32"/>
      <circle cx="101" cy="28" r="2.4" fill="${c.bg}"/>
    </g>
    ${footerLabels(deriveLabel(t), deriveBadge(t), c.fg)}
  `,

  /* 03 · 3D ToF Hand Gesture Video Player */
  camera: (t, c) => `
    <rect x="16" y="20" width="66" height="54" rx="12" fill="${c.soft}"/>
    <polygon points="43,35 43,59 63,47" fill="${c.bg}"/>
    <rect x="24" y="64" width="50" height="4" rx="2" fill="${c.bg}" opacity="0.22"/>
    <rect x="24" y="64" width="28" height="4" rx="2" fill="${c.accent}"/>
    <path d="M89 33 A20 20 0 0 1 89 61" fill="none" stroke="${c.soft}" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M97 26 A30 30 0 0 1 97 68" fill="none" stroke="${c.accent}" stroke-width="3.2" stroke-linecap="round"/>
    ${footerLabels(deriveLabel(t), deriveBadge(t), c.fg)}
  `,

  /* 04 · 3D ToF Gesture Map Searching (Map Pin + Depth Radar Contours) */
  map: (t, c) => `
    <ellipse cx="60" cy="68" rx="34" ry="12" fill="none" stroke="${c.fg}" stroke-opacity="0.32" stroke-width="2" stroke-dasharray="4 4"/>
    <ellipse cx="60" cy="68" rx="18" ry="6.5" fill="none" stroke="${c.fg}" stroke-opacity="0.65" stroke-width="2.2"/>
    <path d="M60 66 C60 66, 39 49, 39 36 A21 21 0 1 1 81 36 C81 49, 60 66, 60 66 Z" fill="${c.soft}"/>
    <circle cx="60" cy="36" r="8" fill="${c.bg}"/>
    <circle cx="60" cy="36" r="3.5" fill="${c.accent}"/>
    ${footerLabels(deriveLabel(t), deriveBadge(t), c.fg)}
  `,

  /* 05 · PPE Safety Helmet inside CV Detection Brackets */
  helmet: (t, c) => `
    ${cvBrackets(15, 16, 90, 66, c.soft, 11, 2.4, 0.55)}
    <path d="M30 62 A30 30 0 0 1 90 62 Z" fill="${c.accent}"/>
    <rect x="23" y="62" width="74" height="9" rx="4.5" fill="${c.soft}"/>
    <rect x="56" y="29" width="8" height="22" rx="3.5" fill="${c.bg}"/>
    ${footerLabels(deriveLabel(t), deriveBadge(t), c.fg)}
  `,

  /* 06 · 3D AI Facial Recognition Terminal (Face Scan Reticle + Depth Mesh) */
  face: (t, c) => `
    ${cvBrackets(18, 16, 84, 66, c.accent, 11, 2.5, 0.9)}
    <ellipse cx="60" cy="48" rx="22" ry="26" fill="none" stroke="${c.accent}" stroke-width="2.6"/>
    <line x1="39" y1="39" x2="81" y2="39" stroke="${c.fg}" stroke-opacity="0.22" stroke-width="1.2"/>
    <line x1="34" y1="50" x2="86" y2="50" stroke="${c.soft}" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="42" y1="61" x2="78" y2="61" stroke="${c.fg}" stroke-opacity="0.22" stroke-width="1.2"/>
    <circle cx="51" cy="43" r="3" fill="${c.fg}"/>
    <circle cx="69" cy="43" r="3" fill="${c.fg}"/>
    <circle cx="60" cy="50" r="2.6" fill="${c.soft}"/>
    <path d="M53 60 Q60 65 67 60" fill="none" stroke="${c.accent}" stroke-width="2.2" stroke-linecap="round"/>
    ${footerLabels(deriveLabel(t), deriveBadge(t), c.fg)}
  `,

  /* 07 · Pedestrian Detection (RGB+ToF Surveillance Bounding Box) */
  pedestrian: (t, c) => `
    ${cvBrackets(22, 15, 76, 68, c.accent, 12, 3, 0.95)}
    <circle cx="60" cy="27" r="6.5" fill="${c.fg}"/>
    <path d="M60 36 L58 55 M48 45 L60 39 L72 47 M58 55 L48 73 M58 55 L69 73" fill="none" stroke="${c.fg}" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="88" cy="23" r="3.5" fill="${c.accent}"/>
    ${footerLabels(deriveLabel(t), deriveBadge(t), c.fg)}
  `,

  /* 08 · Stolen Vehicle Detection (Front Car Silhouette + DL Bounding Box) */
  vehicle: (t, c) => `
    <g stroke="${c.fg}" stroke-width="5" opacity="0.1">
      <line x1="-8" y1="24" x2="26" y2="-8"/><line x1="94" y1="24" x2="128" y2="-8"/>
      <line x1="-8" y1="88" x2="26" y2="56"/><line x1="94" y1="88" x2="128" y2="56"/>
    </g>
    ${cvBrackets(16, 17, 88, 63, c.accent, 12, 3, 0.95)}
    <path d="M35 45 L42 29 L78 29 L85 45 Z" fill="${c.fg}" opacity="0.16" stroke="${c.fg}" stroke-width="2.6" stroke-linejoin="round"/>
    <rect x="26" y="45" width="68" height="20" rx="6" fill="${c.fg}"/>
    <circle cx="38" cy="55" r="4" fill="${c.accent}"/>
    <circle cx="82" cy="55" r="4" fill="${c.accent}"/>
    <rect x="49" y="52" width="22" height="6" rx="2" fill="${c.bg}" opacity="0.9"/>
    <rect x="31" y="64" width="11" height="8" rx="3" fill="${c.fg}"/>
    <rect x="78" y="64" width="11" height="8" rx="3" fill="${c.fg}"/>
    ${footerLabels(deriveLabel(t), deriveBadge(t), c.fg)}
  `,

  /* 09 · Industrial Robot Arm + Copper Clad Laminate Target */
  robot: (t, c) => `
    <rect x="54" y="66" width="44" height="11" rx="3.5" fill="${c.accent}" opacity="0.88"/>
    <line x1="76" y1="54" x2="76" y2="66" stroke="${c.fg}" stroke-width="2" stroke-dasharray="2.5 2.5"/>
    <path d="M22 76 L42 36 L76 46" fill="none" stroke="${c.fg}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="22" cy="76" r="7" fill="${c.accent}"/>
    <circle cx="42" cy="36" r="6.5" fill="${c.soft}" stroke="${c.fg}" stroke-width="3"/>
    <path d="M70 50 L76 46 L82 50" fill="none" stroke="${c.fg}" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="76" cy="46" r="4" fill="${c.soft}" stroke="${c.fg}" stroke-width="2.5"/>
    ${footerLabels(deriveLabel(t), deriveBadge(t), c.fg)}
  `,

  /* 10 · Line Thinning / Medial-Axis Skeletonization */
  graph: (t, c) => `
    <g fill="none" stroke="${c.soft}" stroke-opacity="0.24" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 72 L48 44 L76 44 L102 22"/>
      <path d="M48 44 L78 72 L102 72"/>
    </g>
    <g fill="none" stroke="${c.accent}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 72 L48 44 L76 44 L102 22"/>
      <path d="M48 44 L78 72 L102 72"/>
    </g>
    <circle cx="48" cy="44" r="4.5" fill="${c.bg}" stroke="${c.fg}" stroke-width="2.4"/>
    <circle cx="76" cy="44" r="4" fill="${c.bg}" stroke="${c.accent}" stroke-width="2.4"/>
    <circle cx="78" cy="72" r="4" fill="${c.bg}" stroke="${c.soft}" stroke-width="2.4"/>
    ${footerLabels(deriveLabel(t), deriveBadge(t), c.fg)}
  `,

  /* 11 · Neural Network / ML From Scratch (3 -> 2 -> 1 Graph) */
  nodes: (t, c) => `
    <g stroke="${c.fg}" stroke-opacity="0.28" stroke-width="2">
      <line x1="24" y1="24" x2="60" y2="36"/><line x1="24" y1="50" x2="60" y2="36"/><line x1="24" y1="76" x2="60" y2="36"/>
      <line x1="24" y1="24" x2="60" y2="64"/><line x1="24" y1="50" x2="60" y2="64"/><line x1="24" y1="76" x2="60" y2="64"/>
      <line x1="60" y1="36" x2="94" y2="50"/><line x1="60" y1="64" x2="94" y2="50"/>
    </g>
    <circle cx="24" cy="24" r="6" fill="${c.soft}"/><circle cx="24" cy="50" r="6" fill="${c.soft}"/><circle cx="24" cy="76" r="6" fill="${c.soft}"/>
    <circle cx="60" cy="36" r="6.5" fill="${c.fg}"/><circle cx="60" cy="64" r="6.5" fill="${c.fg}"/>
    <circle cx="94" cy="50" r="9.5" fill="${c.accent}"/>
    ${footerLabels(deriveLabel(t), deriveBadge(t), c.fg)}
  `,

  /* 12 · Recommender System (User-Item Ranked Match Cards) */
  blocks: (t, c) => `
    <circle cx="30" cy="36" r="10" fill="${c.soft}"/>
    <path d="M18 66 A14 14 0 0 1 42 66" fill="${c.soft}" opacity="0.85"/>
    <path d="M44 40 L56 30 M44 48 L56 48 M44 56 L56 66" stroke="${c.fg}" stroke-opacity="0.35" stroke-width="2" stroke-linecap="round"/>
    <rect x="58" y="21" width="44" height="15" rx="5" fill="${c.accent}"/>
    <circle cx="94" cy="28.5" r="3" fill="${c.fg}"/>
    <rect x="58" y="41" width="38" height="14" rx="5" fill="${c.fg}" opacity="0.88"/>
    <rect x="58" y="60" width="30" height="13" rx="5" fill="${c.fg}" opacity="0.32"/>
    ${footerLabels(deriveLabel(t), deriveBadge(t), c.fg)}
  `,

  /* 13 · Julia & Flux Computer Vision (Julia 3-Dot + Classifier Frame) */
  trio: (t, c) => `
    ${cvBrackets(18, 15, 84, 66, c.fg, 10, 2.2, 0.35)}
    <circle cx="60" cy="34" r="12.5" fill="#389826"/>
    <circle cx="43" cy="61" r="12.5" fill="#CB3C33"/>
    <circle cx="77" cy="61" r="12.5" fill="#9558B2"/>
    <circle cx="60" cy="51" r="3.2" fill="${c.bg}"/>
    ${footerLabels(deriveLabel(t), deriveBadge(t), c.fg)}
  `,

  /* 14 · Wordcloud Scraping (Weighted Typographic Cloud) */
  bars: (t, c) => `
    <rect x="26" y="19" width="42" height="9" rx="4.5" fill="${c.soft}" opacity="0.85"/>
    <rect x="74" y="19" width="20" height="9" rx="4.5" fill="${c.fg}" opacity="0.5"/>
    <rect x="16" y="34" width="58" height="13" rx="6.5" fill="${c.accent}"/>
    <rect x="80" y="34" width="24" height="13" rx="6.5" fill="${c.fg}"/>
    <rect x="22" y="53" width="34" height="11" rx="5.5" fill="${c.fg}" opacity="0.9"/>
    <rect x="62" y="53" width="40" height="11" rx="5.5" fill="${c.soft}"/>
    <rect x="34" y="69" width="52" height="8" rx="4" fill="${c.fg}" opacity="0.38"/>
    ${footerLabels(deriveLabel(t), deriveBadge(t), c.fg)}
  `,

  /* Explicit minimal typographic poster */
  type: (t, c) => `
    <circle cx="96" cy="24" r="8" fill="${c.accent}"/>
    <line x1="14" y1="42" x2="106" y2="42" stroke="${c.fg}" opacity="0.2" stroke-width="1.5"/>
    <text x="14" y="72" fill="${c.fg}" font-size="22" font-weight="900" font-family="system-ui,sans-serif" letter-spacing="-0.8">${esc(deriveLabel(t))}</text>
    <text x="14" y="104" fill="${c.fg}" opacity="0.7" font-size="9" font-family="monospace">${esc(deriveBadge(t))}</text>
  `,
};

/**
 * Deterministic Swiss Bauhaus procedural fallback for any arbitrary future project
 * that omits `preset` and doesn't match a domain keyword.
 */
function renderAutoBauhaus(t, c, seed) {
  const variant = seed % 6;
  const label = deriveLabel(t);
  const badge = deriveBadge(t);
  let body = "";

  if (variant === 0) {
    // 2x2 Bauhaus Quarter-Arc Tiles
    const r0 = ((seed >>> 3) % 4) * 90;
    const r1 = ((seed >>> 5) % 4) * 90;
    const r2 = ((seed >>> 7) % 4) * 90;
    const r3 = ((seed >>> 9) % 4) * 90;
    body = `
      <g transform="translate(26,18)">
        <g transform="rotate(${r0} 17 17)"><path d="M0 34 A34 34 0 0 1 34 0 L34 34 Z" fill="${c.accent}"/></g>
        <g transform="translate(34,0) rotate(${r1} 17 17)"><path d="M0 34 A34 34 0 0 1 34 0 L34 34 Z" fill="${c.soft}"/></g>
        <g transform="translate(0,34) rotate(${r2} 17 17)"><path d="M0 34 A34 34 0 0 1 34 0 L34 34 Z" fill="${c.fg}" opacity="0.82"/></g>
        <g transform="translate(34,34) rotate(${r3} 17 17)"><path d="M0 34 A34 34 0 0 1 34 0 L34 34 Z" fill="${c.accent}" opacity="0.55"/></g>
      </g>`;
  } else if (variant === 1) {
    // Orbital Concentric Radar
    const cx = 56 + ((seed >>> 3) % 9);
    const ang = ((seed >>> 6) % 360) * (Math.PI / 180);
    const ox = (cx + Math.cos(ang) * 26).toFixed(1);
    const oy = (49 + Math.sin(ang) * 26).toFixed(1);
    body = `
      <circle cx="${cx}" cy="49" r="30" fill="none" stroke="${c.fg}" stroke-opacity="0.22" stroke-width="2"/>
      <circle cx="${cx}" cy="49" r="20" fill="none" stroke="${c.soft}" stroke-width="2.5" stroke-dasharray="5 4"/>
      <circle cx="${cx}" cy="49" r="9" fill="${c.accent}"/>
      <circle cx="${ox}" cy="${oy}" r="5.5" fill="${c.fg}"/>`;
  } else if (variant === 2) {
    // 3x3 Swiss Modular Dot/Tile Matrix
    let cells = "";
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const idx = row * 3 + col;
        const bit = (seed >>> (idx + 3)) & 3;
        const x = 24 + col * 24;
        const y = 18 + row * 22;
        const fill = bit === 0 ? c.accent : bit === 1 ? c.soft : c.fg;
        const op = bit === 3 ? "0.24" : "0.95";
        if ((row + col + seed) % 2 === 0) {
          cells += `<circle cx="${x + 9}" cy="${y + 9}" r="8" fill="${fill}" opacity="${op}"/>`;
        } else {
          cells += `<rect x="${x + 1}" y="${y + 1}" width="16" height="16" rx="4.5" fill="${fill}" opacity="${op}"/>`;
        }
      }
    }
    body = cells;
  } else if (variant === 3) {
    // Stacked Signal Waves
    const shift = (seed >>> 3) % 10;
    body = `
      <path d="M18 32 Q40 ${16 + shift} 60 32 T102 32" fill="none" stroke="${c.soft}" stroke-width="4" stroke-linecap="round"/>
      <path d="M18 50 Q40 ${34 + shift} 60 50 T102 50" fill="none" stroke="${c.accent}" stroke-width="5" stroke-linecap="round"/>
      <path d="M18 68 Q40 ${52 + shift} 60 68 T102 68" fill="none" stroke="${c.fg}" stroke-opacity="0.65" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="102" cy="50" r="4.5" fill="${c.fg}"/>`;
  } else if (variant === 4) {
    // Asymmetric Split Bauhaus Composition
    const flip = (seed >>> 3) & 1;
    body = flip
      ? `<rect x="18" y="18" width="44" height="62" rx="10" fill="${c.soft}"/>
         <circle cx="80" cy="49" r="22" fill="${c.accent}"/>
         <circle cx="40" cy="49" r="10" fill="${c.bg}"/>`
      : `<circle cx="44" cy="49" r="24" fill="${c.accent}"/>
         <rect x="60" y="20" width="40" height="26" rx="8" fill="${c.soft}"/>
         <rect x="60" y="52" width="40" height="26" rx="8" fill="${c.fg}" opacity="0.28"/>`;
  } else {
    // Minimal Geometric Constellation
    body = `
      <path d="M24 66 L48 26 L82 36 L96 66 Z" fill="${c.accent}" fill-opacity="0.16" stroke="${c.fg}" stroke-opacity="0.45" stroke-width="2.2" stroke-linejoin="round"/>
      <line x1="48" y1="26" x2="96" y2="66" stroke="${c.soft}" stroke-width="2" stroke-dasharray="3 3"/>
      <circle cx="24" cy="66" r="5.5" fill="${c.soft}"/>
      <circle cx="48" cy="26" r="7" fill="${c.accent}"/>
      <circle cx="82" cy="36" r="5.5" fill="${c.fg}"/>
      <circle cx="96" cy="66" r="5.5" fill="${c.soft}"/>`;
  }

  return `${body}${footerLabels(label, badge, c.fg)}`;
}

const KEYWORD_PRESETS = [
  [/face|facial|biometric|identity/, "face"],
  [/vehicle|car|traffic|driving|stolen|auto/, "vehicle"],
  [/pedestrian|person|people|surveillance|human/, "pedestrian"],
  [/helmet|ppe|safety|protective/, "helmet"],
  [/map|geo|gps|location|navigation/, "map"],
  [/video|gesture|camera|tof|depth|stream/, "camera"],
  [/robot|arm|laminate|industrial|hardware/, "robot"],
  [/thin|skeleton|line.?follow|contour/, "graph"],
  [/draw|sketch|paint|canvas|generat|diffusion/, "curve"],
  [/classif|digit|mnist|ocr|detect/, "matrix"],
  [/rec|rank|recommend|feed/, "blocks"],
  [/word|cloud|scrap|crawl|nlp|llm|text|chat/, "bars"],
  [/julia|flux/, "trio"],
  [/ml|machine.?learning|neural|deep|torch|tensor|ai|c\+\+/, "nodes"],
];

function inferPreset(tile) {
  const hay = `${tile.title || ""} ${tile.label || ""} ${tile.stack || ""}`.toLowerCase();
  for (const [re, name] of KEYWORD_PRESETS) {
    if (re.test(hay)) return name;
  }
  return null;
}

export function resolveThemeName(tile) {
  if (tile.theme && TILE_THEMES[tile.theme]) return tile.theme;
  const seed = hashSeed(`${tile.title || ""}|${tile.label || ""}|${tile.stack || ""}`);
  return THEME_NAMES[seed % THEME_NAMES.length];
}

export function isLightTheme(tile) {
  return LIGHT_THEMES.has(resolveThemeName(tile));
}

export function resolveTileStyle(tile) {
  const palette = TILE_THEMES[resolveThemeName(tile)] || TILE_THEMES.obsidian;
  return {
    bg: tile.bg || palette.bg,
    fg: tile.fg || palette.fg,
    accent: tile.accent || palette.accent,
    soft: tile.soft || palette.soft,
  };
}

export function renderTileArt(tile) {
  const colors = resolveTileStyle(tile);

  // Option A: Real project image / screenshot
  if (tile.image) {
    return `
      <div style="width:100%;height:100%;position:relative;display:flex;flex-direction:column;justify-content:flex-end;padding:12px;">
        <img src="${esc(tile.image)}" alt="${esc(tile.title)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(12,12,16,0.82) 100%);"></div>
        <div style="position:relative;z-index:1;display:flex;justify-content:space-between;align-items:baseline;color:#FFF;">
          <span style="font-size:15px;font-weight:900;letter-spacing:-0.02em;">${esc(deriveLabel(tile))}</span>
          <span style="font-size:8px;font-family:monospace;opacity:0.8;">${esc(deriveBadge(tile))}</span>
        </div>
      </div>`;
  }

  // Option B: Custom raw SVG override
  if (tile.art) return tile.art;

  // Option C: Explicit preset -> smart topic match -> deterministic Swiss Bauhaus poster
  const presetKey = tile.preset && PRESETS[tile.preset] ? tile.preset : inferPreset(tile);
  const seed = hashSeed(`${tile.title || ""}|${tile.label || ""}|${tile.stack || ""}`);
  const inner = presetKey ? PRESETS[presetKey](tile, colors) : renderAutoBauhaus(tile, colors, seed);

  return `<svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">${inner}</svg>`;
}

const MICRO_GLYPHS = {
  curve: (c) => `<path d="M5 17 C9 7, 14 17, 19 7" fill="none" stroke="${c.fg}" stroke-width="2.3" stroke-linecap="round"/><circle cx="19" cy="7" r="2.2" fill="${c.accent}"/>`,
  matrix: (c) => `<path d="M5 15 C6 8, 11 8, 10 13 C9 16, 12 16, 12 16" fill="none" stroke="${c.fg}" stroke-width="2" stroke-linecap="round"/><rect x="14" y="6" width="6" height="3" rx="1.5" fill="${c.accent}"/><rect x="14" y="11" width="4.5" height="3" rx="1.5" fill="${c.fg}" opacity="0.7"/><rect x="14" y="16" width="3" height="2.6" rx="1.3" fill="${c.fg}" opacity="0.35"/>`,
  camera: (c) => `<polygon points="8,7 8,17 16,12" fill="${c.fg}"/><path d="M18 8 A5 5 0 0 1 18 16" fill="none" stroke="${c.accent}" stroke-width="2" stroke-linecap="round"/>`,
  map: (c) => `<path d="M12 19 C12 19, 6.5 13.8, 6.5 10 A5.5 5.5 0 1 1 17.5 10 C17.5 13.8, 12 19, 12 19 Z" fill="${c.fg}"/><circle cx="12" cy="10" r="2.1" fill="${c.accent}"/>`,
  helmet: (c) => `<path d="M6 15 A6 6 0 0 1 18 15 Z" fill="${c.accent}"/><rect x="4.5" y="15" width="15" height="2.6" rx="1.3" fill="${c.fg}"/>`,
  face: (c) => `<ellipse cx="12" cy="12" rx="5.5" ry="6.5" fill="none" stroke="${c.accent}" stroke-width="1.8"/><line x1="5" y1="12" x2="19" y2="12" stroke="${c.fg}" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="10" r="1.1" fill="${c.fg}"/><circle cx="14" cy="10" r="1.1" fill="${c.fg}"/>`,
  pedestrian: (c) => `<circle cx="12" cy="6.2" r="2.1" fill="${c.fg}"/><path d="M12 9 L11.5 14 M8 11 L12 10 L16 11.5 M11.5 14 L8.5 19 M11.5 14 L15 19" fill="none" stroke="${c.fg}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>`,
  vehicle: (c) => `<path d="M6 12 L8 8 L16 8 L18 12 Z" fill="none" stroke="${c.fg}" stroke-width="1.7" stroke-linejoin="round"/><rect x="4.5" y="12" width="15" height="5" rx="2" fill="${c.fg}"/><circle cx="7.5" cy="14.5" r="1.2" fill="${c.accent}"/><circle cx="16.5" cy="14.5" r="1.2" fill="${c.accent}"/>`,
  robot: (c) => `<path d="M5 18 L10 8 L17 11" fill="none" stroke="${c.fg}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="5" cy="18" r="2.2" fill="${c.accent}"/><circle cx="17" cy="11" r="2" fill="${c.fg}"/>`,
  graph: (c) => `<path d="M5 17 L11 11 L19 6 M11 11 L18 17" fill="none" stroke="${c.accent}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11" cy="11" r="2.2" fill="${c.fg}"/>`,
  nodes: (c) => `<path d="M6 7 L12 12 L18 12 M6 17 L12 12" stroke="${c.fg}" stroke-opacity="0.55" stroke-width="1.6"/><circle cx="6" cy="7" r="2" fill="${c.fg}"/><circle cx="6" cy="17" r="2" fill="${c.fg}"/><circle cx="18" cy="12" r="2.8" fill="${c.accent}"/>`,
  blocks: (c) => `<rect x="6" y="6" width="12" height="3.4" rx="1.7" fill="${c.accent}"/><rect x="6" y="10.8" width="9.5" height="3.4" rx="1.7" fill="${c.fg}"/><rect x="6" y="15.6" width="7" height="3" rx="1.5" fill="${c.fg}" opacity="0.45"/>`,
  trio: () => `<circle cx="12" cy="8" r="3.2" fill="#389826"/><circle cx="8" cy="15.2" r="3.2" fill="#CB3C33"/><circle cx="16" cy="15.2" r="3.2" fill="#9558B2"/>`,
  bars: (c) => `<rect x="5" y="7" width="9" height="2.6" rx="1.3" fill="${c.fg}" opacity="0.8"/><rect x="5" y="11" width="14" height="3" rx="1.5" fill="${c.accent}"/><rect x="5" y="15.4" width="11" height="2.6" rx="1.3" fill="${c.fg}" opacity="0.6"/>`,
};

/**
 * Compact 24x24 vector glyph for DNA spine micro-tokens & Journey card icon chips.
 */
export function renderMicroGlyph(tile, size = 15) {
  const colors = resolveTileStyle(tile);
  const presetKey = tile.preset && MICRO_GLYPHS[tile.preset] ? tile.preset : inferPreset(tile);
  const inner = presetKey && MICRO_GLYPHS[presetKey]
    ? MICRO_GLYPHS[presetKey](colors)
    : `<circle cx="12" cy="12" r="5" fill="${colors.accent}"/><circle cx="12" cy="12" r="2" fill="${colors.fg}"/>`;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${inner}</svg>`;
}

