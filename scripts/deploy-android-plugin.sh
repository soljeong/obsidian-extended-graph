#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

HOST="${HOST:-tab}"
VAULT_PATH="${VAULT_PATH:-/storage/emulated/0/Documents/essmt/doc}"
PLUGIN_ID="${PLUGIN_ID:-extended-graph-mobile}"
PLUGIN_NAME="${PLUGIN_NAME:-Extended Graph Mobile}"
BUILD=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --host)
      HOST="$2"
      shift 2
      ;;
    --vault)
      VAULT_PATH="$2"
      shift 2
      ;;
    --plugin-id)
      PLUGIN_ID="$2"
      shift 2
      ;;
    --plugin-name)
      PLUGIN_NAME="$2"
      shift 2
      ;;
    --no-build)
      BUILD=0
      shift
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

cd "$REPO_ROOT"

if [[ "$BUILD" -eq 1 ]]; then
  npm run build
fi

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

cp main.js styles.css "$TMP_DIR/"

node - "$REPO_ROOT/manifest.json" "$TMP_DIR/manifest.json" "$PLUGIN_ID" "$PLUGIN_NAME" <<'NODE'
const fs = require("fs");

const [sourcePath, targetPath, pluginId, pluginName] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
manifest.id = pluginId;
manifest.name = pluginName;
manifest.isDesktopOnly = false;
fs.writeFileSync(targetPath, JSON.stringify(manifest, null, "\t") + "\n");
NODE

REMOTE_PLUGIN_DIR="$VAULT_PATH/.obsidian/plugins/$PLUGIN_ID"

ssh "$HOST" "mkdir -p '$REMOTE_PLUGIN_DIR'"
scp "$TMP_DIR/main.js" "$TMP_DIR/manifest.json" "$TMP_DIR/styles.css" "$HOST:$REMOTE_PLUGIN_DIR/"

echo "Deployed to $HOST:$REMOTE_PLUGIN_DIR"
