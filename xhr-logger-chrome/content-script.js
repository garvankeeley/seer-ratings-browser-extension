// Injects code into the page's main world at document_start so it affects page XHR
(() => {
  try {
    if (!location.href.includes(':5055/')) {
      return; 
     } 

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    script.type = 'text/javascript';
    (document.documentElement || document.head || document.body).appendChild(script);
    
    //script.addEventListener('load', () => setTimeout(main_seer, 3000));
  } catch (e) {
    console.warn('[XHR Logger] Failed to inject script:', e);
  }
})();

