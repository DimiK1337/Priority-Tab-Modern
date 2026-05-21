#!/usr/bin/env bash
set -euo pipefail

select_package_mode() {
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
    echo "Select package mode:" >&2
    echo "  1) unlisted  - creates a zip from an unlisted build with update_url" >&2
    echo "  2) listed    - creates a zip for public AMO upload without update_url" >&2
    read -rp "Enter 1 or 2: " choice

    case "$choice" in
      1) mode="unlisted" ;;
      2) mode="listed" ;;
      *) echo "Invalid choice. Please enter 1 or 2." >&2; echo >&2 ;;
    esac
  done

  echo "$mode"
}

MODE="$(select_package_mode "$@")"

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build"
DIST_DIR="$ROOT_DIR/dist"

EXT_NAME="priority-tab-modern"

"$SCRIPT_DIR/build.sh" "$MODE"

VERSION="$(node -p "require('$BUILD_DIR/manifest.json').version")"
PACKAGE_NAME="${EXT_NAME}-${MODE}-${VERSION}.zip"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

echo "Packaging ${EXT_NAME} ${MODE} v${VERSION}..."

(
  cd "$BUILD_DIR"
  zip -r "$DIST_DIR/$PACKAGE_NAME" .
)

echo "Created: $DIST_DIR/$PACKAGE_NAME"
