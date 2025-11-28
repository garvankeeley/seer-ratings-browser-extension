#!/usr/bin/env bash
# Watches shared/injected.js and syncs changes to both browser extensions
set -euo pipefail

SOURCE="shared/injected.js"
TARGETS=("xhr-logger-chrome/injected.js" "xhr-logger-firefox/injected.js")

# Get initial hash
get_hash() {
  if [[ -f "$SOURCE" ]]; then
    md5 -q "$SOURCE" 2>/dev/null || md5sum "$SOURCE" | awk '{print $1}'
  else
    echo ""
  fi
}

sync_files() {
  echo "[$(date '+%H:%M:%S')] Syncing $SOURCE to extensions..."
  for target in "${TARGETS[@]}"; do
    cp "$SOURCE" "$target"
    echo "  ✓ $target"
  done
  echo "  Done!"
}

echo "👀 Watching $SOURCE for changes (checking every 1s)..."
echo "   Press Ctrl+C to stop"
echo ""

# Initial sync
sync_files
LAST_HASH=$(get_hash)
echo ""

# Watch loop
while true; do
  sleep 1
  CURRENT_HASH=$(get_hash)
  
  if [[ "$CURRENT_HASH" != "$LAST_HASH" ]]; then
    sync_files
    LAST_HASH="$CURRENT_HASH"
    echo ""
  fi
done

