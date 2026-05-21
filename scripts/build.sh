#!/usr/bin/env bash
set -euo pipefail

select_build_mode() {
  if [[ $# -gt 0 ]]; then
    case "$1" in
      listed|unlisted)
        echo "$1"
        return
        ;;
      *)
        echo "Usage: $0 [listed|unlisted]" >&2
        exit 1
        ;;
    esac
  fi

  local mode=""
  local choice=""

  while [[ "$mode" != "unlisted" && "$mode" != "listed" ]]; do
    echo "Select build mode:" >&2
    echo "  1) unlisted  - includes update_url for self-distributed builds" >&2
    echo "  2) listed    - removes update_url for public AMO listing" >&2
    read -rp "Enter 1 or 2: " choice

    case "$choice" in
      1) mode="unlisted" ;;
      2) mode="listed" ;;
      *) echo "Invalid choice. Please enter 1 or 2." >&2; echo >&2 ;;
    esac
  done

  echo "$mode"
}

MODE="$(select_build_mode "$@")"

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build"

FILES=(
  "prioritab.html"
  "prioritab.css"
  "README.md"
)

REQUIRED_RENAMED_FILES=(
  "LICENSE_PRIORITY_TAB_MODERN.md:LICENSE.md"
  "PRIVACY_PRIORITY_TAB_MODERN.md:PRIVACY.md"
)

DIRS=(
  "src"
  "lib"
  "assets"
)

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

for file in "${FILES[@]}"; do
  cp "$ROOT_DIR/$file" "$BUILD_DIR/"
done

for file_mapping in "${REQUIRED_RENAMED_FILES[@]}"; do
  source_path="${file_mapping%%:*}"
  target_name="${file_mapping##*:}"

  cp "$ROOT_DIR/$source_path" "$BUILD_DIR/$target_name"
done

for dir in "${DIRS[@]}"; do
  cp -r "$ROOT_DIR/$dir" "$BUILD_DIR/"
done

find "$BUILD_DIR" -type f \( \
  -name "*.bak" -o \
  -name "*.old" -o \
  -name "*.zip" -o \
  -name "*.log" -o \
  -name ".DS_Store" \
\) -delete

node - "$ROOT_DIR/manifest.base.json" "$BUILD_DIR/manifest.json" "$MODE" <<'NODE'
const fs = require("fs");

const [basePath, outPath, mode] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(basePath, "utf8"));

manifest.browser_specific_settings ??= {};
manifest.browser_specific_settings.gecko ??= {};

if (mode === "listed") {
  delete manifest.browser_specific_settings.gecko.update_url;
}

if (mode === "unlisted") {
  manifest.browser_specific_settings.gecko.update_url =
    "https://raw.githubusercontent.com/DimiK1337/Priority-Tab-Modern/master/updates.json?raw=1";
}

fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n");
NODE

echo "Built $MODE extension in: $BUILD_DIR"
