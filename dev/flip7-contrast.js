// DEV TOOL ONLY — not loaded in production. Uses console.log for output.
/**
 * Flip 7 strip — WCAG contrast check for every colour pair the strip ships.
 * Run: node dev/flip7-contrast.js
 *
 * This replaces an earlier LCh->sRGB version. The strip's tokens were authored
 * in lch() when it was a dark navy panel with a gradient title; it now carries
 * flip7scorecard.com's palette verbatim in hex, so the maths is plain sRGB.
 *
 * The strip has ONE documented AAA exception — the heading, cream on brand
 * teal. That is deliberate (see docs/strip-branding-spec.md section 5), so this
 * script exits 0 when only the known exceptions fail, and non-zero if anything
 * ELSE regresses. Keep EXPECTED_FAILURES in sync with the spec.
 */

const PALETTE = {
  teal: '#1d9995',  // --dp-strip-flip7-band  / app --color-teal
  cream: '#fff4d2', // --dp-strip-flip7-bg    / app --color-cream
  navy: '#2b3276',  // type + every border    / app --color-navy
  red: '#e53e3e',   // Bust card              / app --color-red
  orange: '#fbb03a' // win accent, never text / app --color-orange
};

function luminance(hex) {
  const n = hex.replace('#', '');
  const channels = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

// [label, fg, bg, bar, isText]
// bar: the threshold this pair must clear. 7 = AAA body, 4.5 = AAA large,
// 3 = WCAG 1.4.11 non-text UI component.
const PAIRS = [
  ['heading — cream on teal band', PALETTE.cream, PALETTE.teal, 7],
  ['CTA label — navy on cream fill', PALETTE.navy, PALETTE.cream, 7],
  ['phone UI — navy on cream', PALETTE.navy, PALETTE.cream, 7],
  ['drawn card — cream on navy', PALETTE.cream, PALETTE.navy, 7],
  ['Bank card — cream check on teal', PALETTE.cream, PALETTE.teal, 4.5],
  ['Bust card — cream cross on red', PALETTE.cream, PALETTE.red, 4.5],
  ['focus ring — teal on cream', PALETTE.teal, PALETTE.cream, 3],
  ['phone edge — cream on teal band', PALETTE.cream, PALETTE.teal, 3]
];

// Known, documented, deliberate. Brand fidelity was chosen over the bar here.
const EXPECTED_FAILURES = new Set([
  'heading — cream on teal band',
  'Bank card — cream check on teal',
  'Bust card — cream cross on red'
]);

let unexpected = 0;

console.log('Flip 7 strip — contrast audit\n');
for (const [label, fg, bg, bar] of PAIRS) {
  const r = ratio(fg, bg);
  const passed = r >= bar;
  const expected = EXPECTED_FAILURES.has(label);
  let verdict;
  if (passed) {
    verdict = 'PASS';
  } else if (expected) {
    verdict = 'FAIL (documented exception)';
  } else {
    verdict = 'FAIL — REGRESSION';
    unexpected++;
  }
  console.log(
    `${label.padEnd(36)} ${r.toFixed(2).padStart(6)}:1  vs ${String(bar).padEnd(4)} ${verdict}`
  );
}

// The drop-in value if the AAA bar is ever reinstated for the heading.
console.log(
  `\nFor reference — cream on deep teal #115c59: ${ratio(PALETTE.cream, '#115c59').toFixed(2)}:1 ` +
    '(AAA). Swap --dp-strip-flip7-band to reinstate the bar.'
);
console.log(
  `Orange is never used as text: on cream it is only ${ratio(PALETTE.orange, PALETTE.cream).toFixed(2)}:1.`
);

if (unexpected > 0) {
  console.error(`\n${unexpected} undocumented contrast failure(s).`);
  process.exit(1);
}
console.log('\nNo undocumented contrast failures.');
