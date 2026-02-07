/**
 * Deep contrast audit — compositing and WCAG contrast.
 * Run with: node dev/contrast-audit-calc.js
 * Uses sRGB alpha compositing (source-over) and WCAG 2.1 relative luminance.
 */

function srgbToLinear(c) {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function luminance(r, g, b) {
  const R = srgbToLinear(r), G = srgbToLinear(g), B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0762 * B;
}

function contrast(L1, L2) {
  const light = Math.max(L1, L2), dark = Math.min(L1, L2);
  return (light + 0.05) / (dark + 0.05);
}

// Alpha composite: src over dst. All 0-255 RGB, alpha 0-1.
function composite(dstR, dstG, dstB, srcR, srcG, srcB, srcA) {
  const r = Math.round(srcR * srcA + dstR * (1 - srcA));
  const g = Math.round(srcG * srcA + dstG * (1 - srcA));
  const b = Math.round(srcB * srcA + dstB * (1 - srcA));
  return { r: Math.max(0, Math.min(255, r)), g: Math.max(0, Math.min(255, g)), b: Math.max(0, Math.min(255, b)) };
}

function compositeCorrect(dstR, dstG, dstB, srcR, srcG, srcB, srcA) {
  const r = srcR * srcA + dstR * (1 - srcA);
  const g = srcG * srcA + dstG * (1 - srcA);
  const b = srcB * srcA + dstB * (1 - srcA);
  return { r: Math.max(0, Math.min(255, r)), g: Math.max(0, Math.min(255, g)), b: Math.max(0, Math.min(255, b)) };
}

function toHex(r, g, b) {
  return '#' + [r, g, b].map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

// --- Resolved token values (from dev-tokens.css) ---
const dark = {
  bgBase: { r: 8, g: 9, b: 10 },
  borderDefault: { r: 255, g: 255, b: 255, a: 0.06 },
  bgCard: { r: 255, g: 255, b: 255, a: 0.03 },
  bgCardHover: { r: 255, g: 255, b: 255, a: 0.06 },
  accentGlow: { r: 94, g: 106, b: 210, a: 0.20 },
  textPrimary: { r: 247, g: 248, b: 248 },
  textSecondary: { r: 149, g: 162, b: 179 },
  textTertiaryOld: { r: 255, g: 255, b: 255, a: 0.53 },
  textTertiaryNew: { r: 255, g: 255, b: 255, a: 0.64 },
};
const light = {
  bgBase: { r: 255, g: 255, b: 255 },
  borderDefault: { r: 0, g: 0, b: 0, a: 0.08 },
  bgCard: { r: 0, g: 0, b: 0, a: 0.02 },
  bgCardHover: { r: 0, g: 0, b: 0, a: 0.04 },
  accentGlow: { r: 94, g: 106, b: 210, a: 0.10 },
  textPrimary: { r: 24, g: 24, b: 27 },
  textSecondary: { r: 75, g: 80, b: 96 },
};

function comp(dst, src) {
  const a = src.a ?? 1;
  return compositeCorrect(dst.r, dst.g, dst.b, src.r, src.g, src.b, a);
}

// Dark at rest: body → .dp-card → .dp-card-inner (no ::before, ::after over content)
let c = dark.bgBase;
c = comp(c, dark.borderDefault);
c = comp(c, dark.bgCard);
const darkRest = { r: c.r, g: c.g, b: c.b };

// Light at rest
c = light.bgBase;
c = comp(c, light.borderDefault);
c = comp(c, light.bgCard);
const lightRest = { r: c.r, g: c.g, b: c.b };

// Dark hover: body → card → glow → card-inner (hover bg)
c = dark.bgBase;
c = comp(c, dark.borderDefault);
c = comp(c, dark.accentGlow);
c = comp(c, dark.bgCardHover);
const darkHover = { r: c.r, g: c.g, b: c.b };

// Light hover
c = light.bgBase;
c = comp(c, light.borderDefault);
c = comp(c, light.accentGlow);
c = comp(c, light.bgCardHover);
const lightHover = { r: c.r, g: c.g, b: c.b };

console.log('Composited backgrounds (pre-noise):');
console.log('  Dark at rest:', toHex(darkRest.r, darkRest.g, darkRest.b));
console.log('  Light at rest:', toHex(lightRest.r, lightRest.g, lightRest.b));
console.log('  Dark on hover:', toHex(darkHover.r, darkHover.g, darkHover.b));
console.log('  Light on hover:', toHex(lightHover.r, lightHover.g, lightHover.b));

// Contrast: title (20px 600) = large text 4.5:1, description (14px 400) = normal 7:1
const L = (obj) => luminance(obj.r, obj.g, obj.b);

const bg = { darkRest, lightRest, darkHover, lightHover };
const textPrimary = { dark: dark.textPrimary, light: light.textPrimary };
const textSecondary = { dark: dark.textSecondary, light: light.textSecondary };

console.log('\nContrast ratios:');
['darkRest', 'lightRest', 'darkHover', 'lightHover'].forEach(state => {
  const [theme, hover] = state.replace('Rest', '').replace('Hover', 'Hover').split(/(?=Rest|Hover)/);
  const themeKey = state.startsWith('dark') ? 'dark' : 'light';
  const bgL = L(bg[state]);
  const titleL = L(textPrimary[themeKey]);
  const descL = L(textSecondary[themeKey]);
  const crTitle = contrast(bgL, titleL);
  const crDesc = contrast(bgL, descL);
  console.log(`  ${state}: title ${crTitle.toFixed(2)}:1, description ${crDesc.toFixed(2)}:1`);
});

// .dp-empty on body: dark theme --dp-text-tertiary
const emptyBgL = L(dark.bgBase);
const tertiaryOldL = (255 * 0.53) / 255; // simplified: same as luminance(135,135,135) approx
const tertiaryNewL = (255 * 0.64) / 255;
const tertOldR = 255 * 0.53, tertOldG = 255 * 0.53, tertOldB = 255 * 0.53;
const tertNewR = 255 * 0.64, tertNewG = 255 * 0.64, tertNewB = 255 * 0.64;
const crEmptyOld = contrast(emptyBgL, luminance(tertOldR, tertOldG, tertOldB));
const crEmptyNew = contrast(emptyBgL, luminance(tertNewR, tertNewG, tertNewB));
console.log('\n.dp-empty (dark) on body:');
console.log('  Tertiary 0.53:', crEmptyOld.toFixed(2) + ':1');
console.log('  Tertiary 0.64:', crEmptyNew.toFixed(2) + ':1');
