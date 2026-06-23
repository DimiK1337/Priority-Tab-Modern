#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

SCREENSHOT_DIR="$ROOT_DIR/demo/screenshots"
OUTPUT_DIR="$SCREENSHOT_DIR/chrome-store"

SCREENSHOTS=(
  "01-default-dashboard-fluid.png"
  "02-task-management-editing.png"
  "03-customization-panel-colors.png"
  "04-custom-background-fluid-showcase.png"
)

mkdir -p "$OUTPUT_DIR"

if command -v magick >/dev/null 2>&1; then
  IMAGEMAGICK_CMD="magick"
elif command -v convert >/dev/null 2>&1; then
  IMAGEMAGICK_CMD="convert"
else
  echo "ERROR: ImageMagick not found. Install it with:" >&2
  echo "  sudo apt install imagemagick" >&2
  exit 1
fi

for screenshot in "${SCREENSHOTS[@]}"; do
  input_path="$SCREENSHOT_DIR/$screenshot"
  output_path="$OUTPUT_DIR/$screenshot"

  if [[ ! -f "$input_path" ]]; then
    echo "ERROR: Missing screenshot: $input_path" >&2
    exit 1
  fi

  gravity="center"

  # Screenshot 3 has the customization panel on the left,
  # so center-cropping cuts off important UI.
  if [[ "$screenshot" == "03-customization-panel-colors.png" ]]; then
    gravity="west"
  fi

  echo "Formatting $screenshot with gravity=$gravity"

  "$IMAGEMAGICK_CMD" "$input_path" \
    -background black \
    -alpha remove \
    -alpha off \
    -resize 1280x800^ \
    -gravity "$gravity" \
    -extent 1280x800 \
    "$output_path"
done

echo ""
echo "Chrome Store screenshots created in:"
echo "  $OUTPUT_DIR"

if command -v identify >/dev/null 2>&1; then
  echo ""
  echo "Generated image dimensions:"
  identify "$OUTPUT_DIR"/*.png
fi
