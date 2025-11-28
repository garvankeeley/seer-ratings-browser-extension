(() => {
  // Avoid double-installation if the page is re-injected (e.g., via iframes or SPA navigations)
  if (window.__xhrLoggerInstalled) return;
  window.__xhrLoggerInstalled = true;

  const OriginalOpen = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
    try {
      const resolvedUrl = (() => {
        try { return new URL(url, document.baseURI).href; } catch { return url; }
      })();
      console.log('[XHR]', (method || '').toUpperCase(), resolvedUrl);
    } catch (_) {
      // Never block the XHR if logging fails
    }
    return OriginalOpen.apply(this, arguments);
  };
})();
