function isSeerPage() {
  return ['overseerr', 'jellyseerr'].some((e) => { return document.title.toLowerCase().includes(e); });
}

(() => {

    // Avoid double-installation if the page is re-injected (e.g., via iframes or SPA navigations)
  if (window.__xhrLoggerInstalled) { return; }
  window.__xhrLoggerInstalled = true;

  const titleDate = (json) => {
    const title = json.title || json.name || json.originalTitle || 'Unknown Title';
    const year = (json.year || json.firstAirDate || json.releaseDate || '0000').substring(0, 4);
    ////console.log(`[XHR Logger] Detected ${title} (${year}) `);
    ////console.log(`[XHR Logger] votes: ${ json.voteAverage }`);
    let votes = Math.floor(json.voteAverage * 10.0) / 10.0;
    window.__movieRatingsCache[`${title}-${year}`] = votes;
  }
  
  window.__movieRatingsCache = {};

  const OriginalOpen = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
    try {
      const resolvedUrl = (() => {
        try { return new URL(url, document.baseURI).href; } catch { return url; }
      })();

      if (!isSeerPage()) {
        return OriginalOpen.apply(this, arguments);
      }

      const hasMatch = ['api/v1/tv/', 'api/v1/movie/', 'discover/trending', 'discover/movies', 'discover/tv']
        .some(pattern => resolvedUrl.includes(pattern));
      if (hasMatch) {
        ////console.log(`XHR Open called with URL: ${resolvedUrl}`);
        this.addEventListener('load', function() {
          try {
            const responseData = JSON.parse(this.responseText);

            if (responseData.results && Array.isArray(responseData.results)) {
              responseData.results.forEach(item => titleDate(item));
            } else {
              titleDate(responseData);
            }
          } catch (e) {
            console.warn('[XHR Logger] Failed to parse XHR response:', e);
          }
        });
      }
    } catch (_) {
      // Never block the XHR if logging fails
    }
    return OriginalOpen.apply(this, arguments);
  };

})();

function overlayFromRatingsCache(title, year, cards) {
  const cached = window.__movieRatingsCache[`${title}-${year}`]
  let score = `${cached || '?'}`;
  if (score != '?' && score.indexOf('.') < 0) {
    score = score + '.0';
  }
  ////console.log(`${title} (${year}): ${cached}`);
  
  cards.forEach(card => {
    let img = card.querySelector('img');
    if (img) {
    createOverlay(img.parentElement, score);
    } else {
      createOverlay(card, score);
      createOverlay(card.firstElementChild, score);
    }
  });
}

function extractTitleAndYear(card, allMovieTitles) {
  const title = card.querySelector('h1.whitespace-normal.text-xl');
  const year = title?.previousElementSibling;
  ////console.log(`Title: ${title?.innerText}, Year: ${year?.innerText}`);

  if (title?.innerText && year?.innerText) {
    const titleText = title.innerText;
    allMovieTitles[titleText] ??= { year: year.innerText, card: [] };
    allMovieTitles[titleText].card.push(card);

    return {title: titleText, year: year.innerText, card: card};
  }
  return null;
}

function createOverlay(targetElement, text) {
    const overlay = document.createElement('div');
    overlay.textContent = text;
    
    Object.assign(overlay.style, {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        borderRadius: '8px',
        color: 'white',
        display: 'flex',
        fontSize: '12px',
        fontWeight: 'bold',
        justifyContent: 'center',
        left: '50%',
        padding: '2px',
        position: 'fixed',
        top: '6.0%',
        transform: 'translate(-50%, -50%)',
        zIndex: '9999'
    });

    targetElement?.appendChild(overlay);
}

async function main_seer() {
  if (!isSeerPage()) {
    return;
  }

  ////console.log('Starting movie score extraction...');

  const allMovieTitles = {};
  var movieCardList = document.querySelectorAll('ul.cards-vertical > li');
  var movieSections = document.getElementsByClassName('hide-scrollbar');
  if (movieCardList.length === 0 && movieSections.length > 0) {
    for (let i = 0; i < movieSections.length; i++) {
      const section = movieSections[i];
      ////console.log(`Processing section ${i + 1} of ${movieSections.length}...`);
      const cards = section.getElementsByClassName('overflow-hidden');
      movieCardList = [...movieCardList, ...cards];
    }
  }

  // Loop through each movie card
  for (let i = 0; i < movieCardList.length; i++) {
    const card = movieCardList[i];
    ////console.log(`card ${i + 1} of ${movieCardList.length}...`);
    try {
      card.querySelector('img').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    } catch (e) {
      // console.error(`Error processing card ${i + 1}:`, card);
    }
  }
  // wait 2 seconds to allow any dynamic content to load
  await new Promise(resolve => setTimeout(resolve, 600));

  // // Extract titles and years from cards
  movieCardList.forEach((card) => {
    extractTitleAndYear(card, allMovieTitles)
  });

  // Fetch scores and create overlays
  for (const [title, { year, card: cards }] of Object.entries(allMovieTitles)) {
    overlayFromRatingsCache(title, year, cards);
  }

  // Add mutation observer to handle overlay showing
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            try {
              node.querySelector('img').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

              setTimeout(() => {
                let result = extractTitleAndYear(element, allMovieTitles);
                if (result) {
                  ////console.log('Adding overlay for dynamically added element:', result.title, result.year);
                  overlayFromRatingsCache(result.title, result.year, [node.querySelector('img').parentElement]);
                }
              }, 400);
            } catch (e) { }
          }
        });
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(main_seer, 3000));
} else {
  // Document is already loaded
  setTimeout(main_seer, 1500);
}


let currentPage = location.href;
setInterval(function () {
  if (currentPage !== location.href) {
    currentPage = location.href;
    console.log(`URL changed to: ${currentPage}`);
    setTimeout(main_seer, 1500);
  }
}, 500); 