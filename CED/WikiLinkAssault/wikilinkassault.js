(function() {
  const tabUrl = new URL(window.location.href);
  if (tabUrl.protocol === 'chrome:' || tabUrl.protocol === 'chrome-extension:' ||
      (tabUrl.hostname === 'www.google.com' && tabUrl.pathname === '/search')) {
    return;
  }

  chrome.storage.local.get(['enabled', 'options'], function(result) {
    if (!result.enabled) {
      return;
    }

    if (result.options) {
      function replaceTextWithLinks(element) {
        let walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        let node;

        while (node = walker.nextNode()) {
          let text = node.nodeValue.trim();
          if (text.length > 0) {
            let words = text.split(/\s+/);
            let fragment = document.createDocumentFragment();
            //TODO - algorithm for finding the real wikipedia page & language management
            words.forEach((word, index) => {
              if (word.length > 2) {
                let link = document.createElement('a');
                link.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(word)}`;
                link.target = '_blank';
                link.textContent = word;
                fragment.appendChild(link);
              } else {
                fragment.appendChild(document.createTextNode(word));
              }

              if (index < words.length - 1) {
                fragment.appendChild(document.createTextNode(" "));
              }
            });

            node.parentNode.replaceChild(fragment, node);
          }
        }
      }

      for (const [key, value] of Object.entries(result.options)) {
        if (value) {
          switch (key) {
            case 'titles':
              document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(replaceTextWithLinks);
              break;
            case 'content':
              document.querySelectorAll('p, article, main, div').forEach(replaceTextWithLinks);
              break;
            case 'links':
              document.querySelectorAll('a').forEach(replaceTextWithLinks);
              break;
            default:
              console.log(`Unknown option: ${key}`);
          }
        }
      }
    } else {
      console.log('No options found, skipping text replacement.');
    }
  });
})();
