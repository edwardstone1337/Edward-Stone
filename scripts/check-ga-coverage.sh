#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

missing=0

if command -v rg >/dev/null 2>&1; then
  while IFS= read -r file; do
    if ! rg -q "third-party.js" "$file"; then
      echo "Missing third-party.js script: $file"
      missing=1
    fi
  done < <(rg --files -g "*.html" | rg -v "^(dev/|assets/previews/)")
else
  while IFS= read -r file; do
    if ! grep -q "third-party.js" "$file"; then
      echo "Missing third-party.js script: $file"
      missing=1
    fi
  done < <(find . -name "*.html" | sed 's#^\./##' | grep -Ev "^(dev/|assets/previews/)")
fi

if [[ "$missing" -eq 1 ]]; then
  echo
  echo "third-party.js coverage check failed."
  exit 1
fi

echo "third-party.js coverage check passed."
