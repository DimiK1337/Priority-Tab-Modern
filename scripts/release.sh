#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

EXT_NAME="priority-tab-modern"
MANIFEST="$ROOT_DIR/manifest.base.json"
UPDATES_JSON="$ROOT_DIR/updates.json"
BUILD_DIR="$ROOT_DIR/build"
DIST_DIR="$ROOT_DIR/dist"

GITHUB_REPO="DimiK1337/Priority-Tab-Modern"
ADDON_ID="priority-tab-modern@dimik1337.dev"

select_release_mode() {
  if [[ $# -gt 0 ]]; then
    case "$1" in
      listed|unlisted)
        echo "$1"
        return
        ;;
      *)
        echo "Usage: $0 [listed|unlisted]"
        exit 1
        ;;
    esac
  fi

  local mode=""
  local choice=""

  while [[ "$mode" != "unlisted" && "$mode" != "listed" ]]; do
    echo "Select release mode:" >&2
    echo "  1) unlisted  - sign .xpi, create GitHub release, update updates.json" >&2
    echo "  2) listed    - create .zip for public AMO upload" >&2
    read -rp "Enter 1 or 2: " choice

    case "$choice" in
      1) mode="unlisted" ;;
      2) mode="listed" ;;
      *) echo "Invalid choice. Please enter 1 or 2."; echo >&2 ;;
    esac
  done

  echo "$mode"
}

read_new_version() {
  local current_version
  local new_version

  current_version="$(node -p "require('$MANIFEST').version")"

  echo "Current version: $current_version" >&2
  read -rp "New version: " new_version

  if [[ -z "$new_version" ]]; then
    echo "No version provided." >&2
    exit 1
  fi

  if [[ ! "$new_version" =~ ^[0-9]+(\.[0-9]+){1,2}$ ]]; then
    echo "Invalid version: $new_version" >&2
    echo "Version should look like 0.0.1, 0.2.0, or 1.0.0" >&2
    exit 1
  fi

  echo "$new_version"
}

confirm_release() {
  local mode="$1"
  local version="$2"
  local confirm=""

  read -rp "Release $mode version $version? [y/N] " confirm

  case "$confirm" in
    y|Y|yes|YES) ;;
    *)
      echo "Release cancelled."
      exit 1
      ;;
  esac
}

update_manifest_version() {
  local version="$1"

  echo "Updating manifest.base.json version..."

  node - "$MANIFEST" "$version" <<'NODE'
const fs = require("fs");

const [manifestPath, newVersion] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

manifest.version = newVersion;

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
NODE
}

build_extension() {
  local mode="$1"

  echo "Building clean $mode extension folder..."
  "$SCRIPT_DIR/build.sh" "$mode"
}

reset_dist_dir() {
  rm -rf "$DIST_DIR"
  mkdir -p "$DIST_DIR"
}

verify_listed_build() {
  echo "Verifying listed build does not contain update_url..."

  if grep -R "update_url" "$BUILD_DIR/manifest.json" >/dev/null; then
    echo "ERROR: listed build contains update_url."
    echo "Do not upload this zip to AMO."
    exit 1
  fi

  echo "OK: no update_url found."
}

verify_unlisted_build() {
  echo "Verifying unlisted build contains update_url..."

  if ! grep -R "update_url" "$BUILD_DIR/manifest.json" >/dev/null; then
    echo "ERROR: unlisted build does not contain update_url."
    exit 1
  fi

  echo "OK: update_url found."
}

create_listed_zip() {
  local version="$1"
  local zip_path="$DIST_DIR/$EXT_NAME-listed-$version.zip"

  echo "Creating listed AMO zip..." >&2

  (
    cd "$BUILD_DIR"
    zip -r "$zip_path" .
  ) >&2

  echo "$zip_path"
}

sign_unlisted_extension() {
  echo "Signing unlisted extension with web-ext..."

  web-ext sign \
    --source-dir "$BUILD_DIR" \
    --artifacts-dir "$DIST_DIR" \
    --channel=unlisted \
    --api-key "$AMO_JWT_ISSUER" \
    --api-secret "$AMO_JWT_SECRET"
}

get_latest_xpi_path() {
  ls "$DIST_DIR"/*.xpi | tail -n 1
}

ensure_updates_json_exists() {
  if [[ -f "$UPDATES_JSON" ]]; then
    return
  fi

  echo "Creating initial updates.json..."

  node - "$UPDATES_JSON" "$ADDON_ID" <<'NODE'
const fs = require("fs");

const [path, addonId] = process.argv.slice(2);

const data = {
  addons: {
    [addonId]: {
      updates: []
    }
  }
};

fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
NODE
}

commit_manifest_release() {
  local version="$1"

  echo "Creating git commit for release..."
  git add "$MANIFEST"
  git commit -m "Release $version"
  git push
}

create_git_tag_and_push() {
  local version="$1"
  local tag="v$version"

  echo "Creating git commit + tag..."
  git add "$MANIFEST"
  git commit -m "Release $version"
  git tag "$tag"
  git push
  git push origin "$tag"
}

create_github_release() {
  local version="$1"
  local xpi_path="$2"
  local tag="v$version"

  echo "Creating GitHub release..."

  gh release create "$tag" "$xpi_path" \
    --repo "$GITHUB_REPO" \
    --title "$tag" \
    --notes "Release $version"
}

update_updates_json() {
  local version="$1"
  local xpi_path="$2"
  local tag="v$version"
  local update_link

  ensure_updates_json_exists

  update_link="https://github.com/$GITHUB_REPO/releases/download/$tag/$(basename "$xpi_path")?raw=1"

  echo "Updating updates.json..."

  node - "$UPDATES_JSON" "$version" "$update_link" "$ADDON_ID" <<'NODE'
const fs = require("fs");

const [path, version, link, addonId] = process.argv.slice(2);

let data = { addons: {} };

if (fs.existsSync(path)) {
  data = JSON.parse(fs.readFileSync(path, "utf8"));
}

data.addons ??= {};
data.addons[addonId] ??= { updates: [] };

const updates = data.addons[addonId].updates;
const existingUpdate = updates.find((update) => update.version === version);

if (existingUpdate) {
  existingUpdate.update_link = link;
} else {
  updates.push({ version, update_link: link });
}

updates.sort((a, b) =>
  a.version.localeCompare(b.version, undefined, { numeric: true })
);

fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
NODE

  git add "$UPDATES_JSON"
  git commit -m "Update update manifest for $version"
  git push
}

print_listed_next_steps() {
  local zip_path="$1"

  echo ""
  echo "Done 🚀"
  echo ""
  echo "Listed AMO package created:"
  echo "$zip_path"
  echo ""
  echo "Next steps:"
  echo "1. Go to AMO Developer Hub"
  echo "2. Upload a new listed version"
  echo "3. Upload this file:"
  echo "   $zip_path"
  echo ""
}

print_unlisted_done() {
  local version="$1"
  local tag="v$version"

  echo ""
  echo "Done 🚀"
  echo "Release: https://github.com/$GITHUB_REPO/releases/tag/$tag"
  echo ""
  echo "updates.json:"
  echo "https://raw.githubusercontent.com/$GITHUB_REPO/master/updates.json?raw=1"
}

release_listed() {
  local version="$1"
  local zip_path

  update_manifest_version "$version"
  build_extension "listed"
  reset_dist_dir
  verify_listed_build

  zip_path="$(create_listed_zip "$version")"

  commit_manifest_release "$version"
  print_listed_next_steps "$zip_path"
}

release_unlisted() {
  local version="$1"
  local xpi_path

  update_manifest_version "$version"
  build_extension "unlisted"
  reset_dist_dir
  verify_unlisted_build

  sign_unlisted_extension
  xpi_path="$(get_latest_xpi_path)"

  create_git_tag_and_push "$version"
  create_github_release "$version" "$xpi_path"
  update_updates_json "$version" "$xpi_path"
  print_unlisted_done "$version"
}

main() {
  local mode
  local version

  mode="$(select_release_mode "$@")"

  echo "Release mode: $mode"

  version="$(read_new_version)"
  confirm_release "$mode" "$version"

  case "$mode" in
    listed)
      release_listed "$version"
      ;;
    unlisted)
      release_unlisted "$version"
      ;;
  esac
}

main "$@"
