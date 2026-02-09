/**
 * Flip 7 strip — WCAG AAA contrast check for gradient title on --dp-strip-flip7-bg.
 * LCH → sRGB → relative luminance → contrast ratio.
 * Run: node dev/flip7-contrast.js
 */

function lchToRgb(L, C, H) {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  let y = (L + 16) / 116;
  let x = a / 500 + y;
  let z = y - b / 200;
  const eps = 0.008856;
  const k = 903.3;
  const xn = 0.95047, yn = 1, zn = 1.08883;
  x = xn * (x * x * x > eps ? x * x * x : (116 * x - 16) / k);
  y = yn * (y * y * y > eps ? y * y * y : (116 * y - 16) / k);
  z = zn * (z * z * z > eps ? z * z * z : (116 * z - 16) / k);
  let r = x *  3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y *  1.8758 + z *  0.0415;
  let b_ = x *  0.0557 + y * -0.2040 + z *  1.0570;
  const toSrgb = (c) => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1/2.4) - 0.055;
  r = Math.max(0, Math.min(1, toSrgb(r)));
  g = Math.max(0, Math.min(1, toSrgb(g)));
  b_ = Math.max(0, Math.min(1, toSrgb(b_)));
  return { r, g, b: b_ };
}

function lchToRgb255(L, C, H) {
  const o = lchToRgb(L, C, H);
  return { r: Math.round(o.r * 255), g: Math.round(o.g * 255), b: Math.round(o.b * 255) };
}

function srgbToLinear(c) {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function luminance(r, g, b) {
  const R = srgbToLinear(r), G = srgbToLinear(g), B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrast(L1, L2) {
  const light = Math.max(L1, L2), dark = Math.min(L1, L2);
  return (light + 0.05) / (dark + 0.05);
}

// Alpha composite: src over dst. RGB 0–1, alpha 0–1.
function composite(dstR, dstG, dstB, srcR, srcG, srcB, srcA) {
  const r = srcR * srcA + dstR * (1 - srcA);
  const g = srcG * srcA + dstG * (1 - srcA);
  const b = srcB * srcA + dstB * (1 - srcA);
  return { r, g, b };
}

// Flip 7 tokens — CSS lch() uses chroma 0–150 (fixed from 0–1)
const bgLch = { L: 25, C: 18, H: 275 };
const bg = lchToRgb(bgLch.L, bgLch.C, bgLch.H);
const bg255 = lchToRgb255(bgLch.L, bgLch.C, bgLch.H);

const titleFrom = lchToRgb255(96, 4, 92);
const titleToDark = lchToRgb255(83, 6, 185);
const titleToLight = lchToRgb255(84, 5, 185);

const textColor = lchToRgb(92, 3.5, 92);
const textColorAlpha = 0.9;
const effectiveText = composite(bg.r, bg.g, bg.b, textColor.r, textColor.g, textColor.b, textColorAlpha);
const textColor255 = { r: Math.round(effectiveText.r * 255), g: Math.round(effectiveText.g * 255), b: Math.round(effectiveText.b * 255) };

const badgeBg = lchToRgb(35, 10, 185);
const badgeBgAlpha = 0.55;
const effectiveBadgeBg = composite(bg.r, bg.g, bg.b, badgeBg.r, badgeBg.g, badgeBg.b, badgeBgAlpha);
const badgeBg255 = { r: Math.round(effectiveBadgeBg.r * 255), g: Math.round(effectiveBadgeBg.g * 255), b: Math.round(effectiveBadgeBg.b * 255) };

const badgeText = lchToRgb255(96, 3, 92);

const L_bg = luminance(bg255.r, bg255.g, bg255.b);
const L_from = luminance(titleFrom.r, titleFrom.g, titleFrom.b);
const L_toDark = luminance(titleToDark.r, titleToDark.g, titleToDark.b);
const L_toLight = luminance(titleToLight.r, titleToLight.g, titleToLight.b);
const L_text = luminance(textColor255.r, textColor255.g, textColor255.b);
const L_badgeBg = luminance(badgeBg255.r, badgeBg255.g, badgeBg255.b);
const L_badgeText = luminance(badgeText.r, badgeText.g, badgeText.b);

const crFrom = contrast(L_bg, L_from);
const crToDark = contrast(L_bg, L_toDark);
const crToLight = contrast(L_bg, L_toLight);
const crText = contrast(L_bg, L_text);
const crBadge = contrast(L_badgeBg, L_badgeText);

console.log('Flip 7 strip — WCAG AAA (7:1) vs --dp-strip-flip7-bg lch(25 18 275)');
console.log('  Background L_rel:', L_bg.toFixed(4));
console.log('  1. title-from vs bg:', crFrom.toFixed(2) + ':1', crFrom >= 7 ? '✓ AAA' : '✗');
console.log('  2. title-to (dark) vs bg:', crToDark.toFixed(2) + ':1', crToDark >= 7 ? '✓ AAA' : '✗');
console.log('  3. title-to (light) vs bg:', crToLight.toFixed(2) + ':1', crToLight >= 7 ? '✓ AAA' : '✗');
console.log('  4. text-color (composited 0.9) vs bg:', crText.toFixed(2) + ':1', crText >= 7 ? '✓ AAA' : '✗');
console.log('  5. badge-text vs effective badge-bg on bg:', crBadge.toFixed(2) + ':1', crBadge >= 7 ? '✓ AAA' : '✗');
