# XHR Logger Browser Extensions

Browser extensions for Chrome and Firefox that log all XMLHttpRequest calls to the console.

## Project Structure

```
.
├── shared/
│   └── injected.js          # Single source of truth for injection logic
├── xhr-logger-chrome/       # Chrome extension
│   ├── manifest.json
│   ├── content-script.js
│   └── injected.js          # Copy from shared/
├── xhr-logger-firefox/      # Firefox extension
│   ├── manifest.json
│   ├── content-script.js
│   └── injected.js          # Copy from shared/
└── sync-shared.sh           # Sync script to copy shared file to both extensions
```

## Development Workflow

**Important:** The `injected.js` logic is shared between both extensions.

### Option 1: Watch Mode (Recommended)

1. **Start the watcher:** Run `./sync-shared.sh` (it will watch for changes every 1s)
2. **Edit the shared file:** Make changes to `shared/injected.js`
3. **Auto-sync:** Changes are automatically copied to both extensions
4. **Reload extensions:** Reload the extensions in your browser to see changes
5. **Stop watcher:** Press `Ctrl+C` when done

### Option 2: Manual Sync

If you only need to sync once, kill any running watcher and run:
```bash
pkill -f sync-shared.sh  # Stop watcher if running
cp shared/injected.js xhr-logger-chrome/injected.js xhr-logger-firefox/injected.js
```

## Installation

### Firefox

1. Open Firefox and go to: `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on…"
3. Select the `manifest.json` inside `xhr-logger-firefox/`
4. Visit any site, open DevTools Console, trigger XHR requests

### Chrome

1. Open Chrome and go to: `chrome://extensions`
2. Enable "Developer mode" (toggle in the top-right)
3. Click "Load unpacked"
4. Select the `xhr-logger-chrome/` folder
5. Visit any site, open DevTools Console, trigger XHR requests

## Output

You'll see lines in the console like:
```
[XHR] GET https://example.com/api/endpoint
```

## Notes

- Runs at `document_start` and in all frames
- Only logs; it doesn't block or modify requests
- To capture `fetch()` calls, add that functionality to `shared/injected.js`
