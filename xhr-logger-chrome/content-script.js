// Injects code into the page's main world at document_start so it affects page XHR
(() => {
  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    script.type = 'text/javascript';
    (document.documentElement || document.head || document.body).appendChild(script);
    script.addEventListener('load', () => script.remove());
  } catch (e) {
    console.warn('[XHR Logger] Failed to inject script:', e);
  }
})();
