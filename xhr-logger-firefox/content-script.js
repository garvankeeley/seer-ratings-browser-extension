// Injects code into the page's main world at document_start so it affects page XHR
(() => {
  try {
    const getURL =
      (typeof browser !== 'undefined' && browser.runtime && browser.runtime.getURL)
        ? browser.runtime.getURL
        : (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
          ? chrome.runtime.getURL
          : null;

    const script = document.createElement('script');
    script.src = getURL ? getURL('injected.js') : 'injected.js';
    script.type = 'text/javascript';
    (document.documentElement || document.head || document.body).appendChild(script);
    // script.addEventListener('load', () => script.remove());
  } catch (e) {
    console.warn('[XHR Logger] Failed to inject script:', e);
  }
})();
