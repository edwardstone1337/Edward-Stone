#!/usr/bin/env bash
# Token hygiene checks for the dp- design token system.
#
#   ./scripts/check-token-hygiene.sh
#
# Two checks, both scanning the whole repo:
#
#   1. Undefined tokens (BLOCKING) — a `--dp-name: value;` declaration in a
#      CSS file other than dev-tokens.css, where `--dp-name` has no
#      declaration anywhere in dev-tokens.css AND the value is a raw literal
#      rather than a var(...) reference. Component-scoped tokens that
#      reference a primitive/semantic token via var(...) are always legal
#      (the project's stated preferred pattern — see .dp-counter), as is a
#      file re-pointing an EXISTING dev-tokens.css name to another token.
#      Only a brand-new name carrying a brand-new raw value is a violation.
#
#   2. Dead tokens (WARNING, does not fail the build) — a token declared in
#      dev-tokens.css with zero `var(--name` references anywhere in the repo
#      and no reference in any .js file (covers tokens read via
#      getComputedStyle/getPropertyValue or written via style.setProperty,
#      which never show up as a literal `var(--name` string). Reported as a
#      warning, not a failure: dev-tokens.css is the source of truth and
#      accumulates tokens for in-progress work, theme variants, etc. Cruft
#      here is a cleanup opportunity, not a broken build — the exit code is
#      reserved for check 1.
#
# Known, deliberate exception: --dp-counter-cell-size (dev-styles.css) is a
# raw 2rem value, not a var() reference. rem honours user font-scaling where
# the px-based space scale does not, which matters for the WCAG AAA target.
# CSS files are off-limits to an inline escape-hatch comment here (this
# script must not require editing dev-styles.css), so the exception is
# allowlisted below instead, keyed to file + name + expected value so a
# future change to the value re-triggers the check.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

python3 - <<'PYEOF'
import re, subprocess, sys
from pathlib import Path

ROOT = Path(".")
TOKENS_FILE = Path("assets/css/dev-tokens.css")


def tracked_files(*suffixes):
    # git ls-files, not a glob: keeps node_modules/, .git/, and anything
    # else the repo ignores out of the scan without hardcoding exclude
    # paths here.
    out = subprocess.run(["git", "ls-files"], capture_output=True, text=True, check=True).stdout
    return sorted(
        Path(p) for p in out.splitlines() if p.endswith(suffixes) and Path(p).is_file()
    )

# Value-carrying files. dev-tokens.css is the primary source of truth; a
# per-project theme file (project-*.css) is a legitimate second value layer —
# it re-skins semantic tokens for one page under its own scope, the same idea
# as [data-theme="light"] but scoped to a project. dev-styles.css, the SHARED
# component layer, is deliberately NOT on this list: a raw value there is the
# Kaomoji-class drift this check exists to catch.
VALUE_CARRYING = re.compile(r"^assets/css/project-[a-z0-9-]+\.css$")

# file (relative to repo root) -> {token name: expected raw value}
# Only a declaration matching BOTH the name and the exact expected value is
# allowlisted; anything else about that name still gets checked normally.
ALLOWLIST = {
    "assets/css/dev-styles.css": {
        # rem honours user font-scaling (WCAG AAA target); the px-based
        # space scale in dev-tokens.css deliberately doesn't apply here.
        "--dp-counter-cell-size": "2rem",
    },
}

DECL_RE = re.compile(r"(--dp-[A-Za-z0-9-]+)\s*:\s*(.*?);", re.DOTALL)
COMMENT_RE = re.compile(r"/\*.*?\*/", re.DOTALL)


def strip_comments(text):
    return COMMENT_RE.sub("", text)


def read(path):
    return path.read_text(encoding="utf-8", errors="replace")


css_files = tracked_files(".css")
html_files = tracked_files(".html")
js_files = tracked_files(".js")

# --- Collect every token name declared in dev-tokens.css ---
tokens_src = strip_comments(read(TOKENS_FILE))
defined_names = {m.group(1) for m in DECL_RE.finditer(tokens_src)}

if not defined_names:
    sys.exit(f"no --dp- declarations found in {TOKENS_FILE}; check the regex/path")

# ============================================================
# Check 1 — tokens defined outside the source of truth
# ============================================================
undefined_violations = []

for css_file in css_files:
    if css_file == TOKENS_FILE:
        continue
    rel = str(css_file)
    if VALUE_CARRYING.match(rel):
        continue  # per-project theme layer — may carry values
    src = strip_comments(read(css_file))
    allow = ALLOWLIST.get(rel, {})
    for m in DECL_RE.finditer(src):
        name, value = m.group(1), m.group(2).strip()

        # The ONLY thing that makes a declaration outside dev-tokens.css legal
        # is that its value references another token. Whether the name already
        # exists in dev-tokens.css is irrelevant: re-pointing an existing token
        # to a RAW value (e.g. `.dp-strip--kaomoji { --dp-strip-bg: #141414; }`)
        # is exactly the drift this check exists to catch, and is what
        # CLAUDE.md's token rule prohibits.
        if "var(" in value:
            continue  # references another token — legal, scoped or re-pointed

        if allow.get(name) == value:
            continue  # known, deliberate raw value — see ALLOWLIST comment

        line_no = src[: m.start()].count("\n") + 1
        undefined_violations.append(
            f"{rel}:{line_no}: {name}: {value}; "
            f"(not in dev-tokens.css, raw value, not allowlisted)"
        )

# ============================================================
# Check 2 — dead tokens
# ============================================================
# Build a single haystack per file type so we only read each file once.
css_html_text = "\n".join(strip_comments(read(f)) for f in css_files + html_files)
js_texts = [read(f) for f in js_files]

dead_tokens = []
for name in sorted(defined_names):
    escaped = re.escape(name)
    used = bool(re.search(r"var\(\s*" + escaped + r"\b", css_html_text))
    if not used:
        used = bool(re.search(r"var\(\s*" + escaped + r"\b", "\n".join(js_texts)))
    if not used:
        # JS may consume a token without ever writing `var(--name)` — e.g.
        # getComputedStyle(el).getPropertyValue('--dp-ticker-speed') or
        # el.style.setProperty('--dp-name', ...). Both pass the token name
        # as a quoted string literal, so look for that instead of assuming
        # every consumer goes through CSS var().
        quoted_re = re.compile(r"""['"`]""" + escaped + r"""\b""")
        used = any(quoted_re.search(t) for t in js_texts)
    if not used:
        dead_tokens.append(name)

# ============================================================
# Report
# ============================================================
exit_code = 0

if undefined_violations:
    print("Undefined tokens (declared outside dev-tokens.css with a raw value):")
    for v in undefined_violations:
        print(f"  {v}")
    exit_code = 1
else:
    print("No undefined tokens found.")

print()

if dead_tokens:
    print(f"warning: {len(dead_tokens)} dead token(s) in dev-tokens.css (no var() or JS reference found):")
    for name in dead_tokens:
        print(f"  warning: {name}")
else:
    print("No dead tokens found.")

print()

if exit_code:
    print("Token hygiene check failed.")
else:
    print("Token hygiene check passed.")

sys.exit(exit_code)
PYEOF
