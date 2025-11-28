
Next steps:
1) Open Firefox and go to: about:debugging#/runtime/this-firefox
2) Click "Load Temporary Add-on…" and select the manifest.json inside the created folder (or unzip the ZIP and select the folder).
3) Visit any site, open DevTools Console, trigger XHR requests; you'll see lines like:
   [XHR] GET https://example.com/api/endpoint

Notes:
- Runs at document_start and in all frames.
- Only logs; it doesn’t block or modify requests.
- To capture fetch(), uncomment the block in injected.js.

Chrome:

In Chrome, open chrome://extensions.

Enable Developer mode (toggle in the top-right).

Click “Load unpacked” and choose the folder.

Visit any site, open DevTools Console, and trigger XHR requests; you’ll see lines like:
[XHR] GET  https://example.com/api/endpoint

