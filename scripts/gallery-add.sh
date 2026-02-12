#!/usr/bin/env bash
set -euo pipefail

# -----------------------------------------------------------
# gallery-add.sh — Add an image to the gallery
#
# Usage:
#   ./scripts/gallery-add.sh <source-file> <kebab-name> <alt-text> [categories]
#
# Example:
#   ./scripts/gallery-add.sh ~/Downloads/screenshot.png playsport-onboarding \
#     "Playsport onboarding flow with three welcome screens" \
#     "ui-design,mobile,playsport"
# -----------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
GALLERY_DIR="$PROJECT_ROOT/assets/images/gallery"
JSON_FILE="$PROJECT_ROOT/assets/data/gallery.json"

# --- Usage ---
usage() {
  cat <<'EOF'
Usage: ./scripts/gallery-add.sh <source-file> <kebab-name> <alt-text> [categories]

  source-file   Path to source image (png, jpg, jpeg, webp, gif, tiff)
  kebab-name    Kebab-case name without extension (e.g. playsport-onboarding)
  alt-text      Descriptive alt text for the image
  categories    Optional comma-separated categories (e.g. "ui-design,mobile")

Example:
  ./scripts/gallery-add.sh ~/Downloads/shot.png my-design "A cool design" "ui-design,branding"
EOF
  exit 1
}

# --- Validate args ---
if [ $# -lt 3 ]; then
  echo "Error: Missing required arguments."
  usage
fi

SOURCE="$1"
NAME="$2"
ALT="$3"
CATEGORIES="${4:-}"

# Validate source file exists
if [ ! -f "$SOURCE" ]; then
  echo "Error: Source file not found: $SOURCE"
  exit 1
fi

# Validate source is an image format
EXT="${SOURCE##*.}"
EXT_LOWER="$(echo "$EXT" | tr '[:upper:]' '[:lower:]')"
case "$EXT_LOWER" in
  png|jpg|jpeg|webp|gif|tiff) ;;
  *)
    echo "Error: Unsupported image format: .$EXT_LOWER"
    echo "Supported: png, jpg, jpeg, webp, gif, tiff"
    exit 1
    ;;
esac

# Validate kebab-case name
if ! echo "$NAME" | grep -qE '^[a-z0-9]+(-[a-z0-9]+)*$'; then
  echo "Error: Name must be kebab-case (lowercase letters, numbers, hyphens only)."
  echo "  Got: $NAME"
  echo "  Example: playsport-onboarding"
  exit 1
fi

# --- Check dependencies ---
if ! command -v cwebp &>/dev/null; then
  echo "Error: cwebp not found. Install with: brew install webp"
  exit 1
fi

if ! command -v jq &>/dev/null; then
  echo "Error: jq not found. Install with: brew install jq"
  exit 1
fi

# --- Check gallery directory exists ---
if [ ! -d "$GALLERY_DIR" ]; then
  echo "Error: Gallery directory not found: $GALLERY_DIR"
  exit 1
fi

if [ ! -f "$JSON_FILE" ]; then
  echo "Error: Gallery JSON not found: $JSON_FILE"
  exit 1
fi

# --- Check for existing file ---
OUTPUT="$GALLERY_DIR/$NAME.webp"
if [ -f "$OUTPUT" ]; then
  printf "File already exists. Overwrite? (y/N) "
  read -r REPLY
  if [ "$REPLY" != "y" ] && [ "$REPLY" != "Y" ]; then
    echo "Aborted."
    exit 0
  fi
fi

# --- Resize and convert ---
cwebp -resize 800 0 -q 80 "$SOURCE" -o "$OUTPUT" >/dev/null 2>&1

# --- Read actual dimensions ---
if command -v identify &>/dev/null; then
  DIMS="$(identify -format '%w %h' "$OUTPUT")"
  WIDTH="$(echo "$DIMS" | awk '{print $1}')"
  HEIGHT="$(echo "$DIMS" | awk '{print $2}')"
else
  WIDTH="$(sips -g pixelWidth "$OUTPUT" 2>/dev/null | tail -1 | awk '{print $2}')"
  HEIGHT="$(sips -g pixelHeight "$OUTPUT" 2>/dev/null | tail -1 | awk '{print $2}')"
fi

# --- Build JSON entry and append ---
SRC_REL="assets/images/gallery/$NAME.webp"

if [ -n "$CATEGORIES" ]; then
  # Convert comma-separated string to JSON array
  CAT_JSON="$(echo "$CATEGORIES" | tr ',' '\n' | jq -R . | jq -s .)"
  jq --arg id "$NAME" \
     --arg src "$SRC_REL" \
     --arg alt "$ALT" \
     --argjson w "$WIDTH" \
     --argjson h "$HEIGHT" \
     --argjson cats "$CAT_JSON" \
     '.images += [{"id": $id, "src": $src, "alt": $alt, "width": $w, "height": $h, "categories": $cats}]' \
     "$JSON_FILE" > "$JSON_FILE.tmp" && mv "$JSON_FILE.tmp" "$JSON_FILE"
else
  jq --arg id "$NAME" \
     --arg src "$SRC_REL" \
     --arg alt "$ALT" \
     --argjson w "$WIDTH" \
     --argjson h "$HEIGHT" \
     '.images += [{"id": $id, "src": $src, "alt": $alt, "width": $w, "height": $h}]' \
     "$JSON_FILE" > "$JSON_FILE.tmp" && mv "$JSON_FILE.tmp" "$JSON_FILE"
fi

# --- Print confirmation ---
FILE_SIZE="$(du -k "$OUTPUT" | awk '{print $1}')"
TOTAL="$(jq '.images | length' "$JSON_FILE")"

echo ""
echo "  Added: $NAME"
echo "  File: $SRC_REL (${FILE_SIZE} KB, ${WIDTH}x${HEIGHT})"
echo "  Alt: \"$ALT\""
if [ -n "$CATEGORIES" ]; then
  echo "  Categories: $(echo "$CATEGORIES" | tr ',' ', ')"
fi
echo "  Total gallery images: $TOTAL"
