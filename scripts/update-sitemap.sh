#!/usr/bin/env bash
# Refresh <lastmod> in sitemap.xml from git history, and sanity-check the URL list.
#
#   ./scripts/update-sitemap.sh          rewrite sitemap.xml in place
#   ./scripts/update-sitemap.sh --check  report only, exit 1 if anything is stale (CI)
#
# lastmod comes from each page's last commit date, NOT today's date. Inflating
# lastmod on unchanged pages trains search engines to ignore the signal.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

CHECK_ONLY=0
[[ "${1:-}" == "--check" ]] && CHECK_ONLY=1

CHECK_ONLY="$CHECK_ONLY" python3 - <<'PYEOF'
import os, re, subprocess, sys

CHECK = os.environ["CHECK_ONLY"] == "1"
BASE = "https://edwardstone.design"
SITEMAP = "sitemap.xml"

src = open(SITEMAP, encoding="utf-8").read()
blocks = re.findall(r"[ \t]*<url>.*?</url>\n?", src, re.S)
if not blocks:
    sys.exit("no <url> blocks found in sitemap.xml")

stale, problems, out = [], [], src

def path_for(loc):
    rel = loc[len(BASE):] if loc.startswith(BASE) else loc
    rel = rel.lstrip("/")
    return "index.html" if rel in ("", "/") else rel

for block in blocks:
    m = re.search(r"<loc>([^<]+)</loc>", block)
    if not m:
        continue
    loc = m.group(1).strip()
    path = path_for(loc)

    if not os.path.isfile(path):
        problems.append(f"{loc} -> missing file {path}")
        continue

    head = open(path, encoding="utf-8", errors="replace").read(4000)
    if re.search(r'name=["\']robots["\'][^>]*noindex', head):
        problems.append(f"{loc} is in the sitemap but the page sets noindex")

    date = subprocess.run(["git", "log", "-1", "--format=%cs", "--", path],
                          capture_output=True, text=True).stdout.strip()
    if not date:
        problems.append(f"{loc} -> {path} has no commit history yet")
        continue

    dirty = subprocess.run(["git", "diff", "--quiet", "HEAD", "--", path]).returncode != 0
    if dirty:
        problems.append(f"{loc} -> {path} has uncommitted changes; lastmod will lag until you commit")

    cur = re.search(r"<lastmod>([^<]*)</lastmod>", block)
    if cur and cur.group(1).strip() != date:
        stale.append(f"{loc}: {cur.group(1).strip()} -> {date}")
        out = out.replace(block, block.replace(cur.group(0), f"<lastmod>{date}</lastmod>"), 1)

for p in problems:
    print(f"  warning: {p}")

if not stale:
    print("sitemap lastmod dates are up to date.")
else:
    for s in stale:
        print(f"  {'stale' if CHECK else 'updated'}: {s}")

if CHECK:
    sys.exit(1 if (stale or problems) else 0)

if stale:
    open(SITEMAP, "w", encoding="utf-8").write(out)
    print(f"wrote {SITEMAP} ({len(stale)} updated)")
PYEOF
