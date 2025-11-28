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

  // Optional: also log fetch() calls — to enable, uncomment this block
  /*
  const _fetch = window.fetch;
  window.fetch = function(input, init) {
    try {
      const url = typeof input === 'string' ? input : input && input.url;
      const method = (init && init.method)
        || (typeof input !== 'string' && input && input.method)
        || 'GET';
      const resolvedUrl = (() => {
        try { return new URL(url, document.baseURI).href; } catch { return url; }
      })();
      console.log('[FETCH]', method.toUpperCase(), resolvedUrl);
    } catch (_) {}
    return _fetch.apply(this, arguments);
  };
  */
})();
