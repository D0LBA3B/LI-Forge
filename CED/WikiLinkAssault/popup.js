document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggle');
  const titlesCheckbox = document.getElementById('titles');
  const contentCheckbox = document.getElementById('content');
  const linksCheckbox = document.getElementById('links');

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const tab = tabs[0];
    chrome.storage.local.get(['enabled', 'options'], function(result) {
      toggleButton.textContent = result.enabled ? 'Disable' : 'Enable';

      if (result.options) {
        titlesCheckbox.checked = result.options.titles;
        contentCheckbox.checked = result.options.content;
        linksCheckbox.checked = result.options.links;
      }
    });

    toggleButton.addEventListener('click', function() {
      chrome.storage.local.get(['enabled', 'options'], function(result) {
        const isEnabled = !result.enabled;
        const options = {
          titles: titlesCheckbox.checked,
          content: contentCheckbox.checked,
          links: linksCheckbox.checked,
        };

        chrome.storage.local.set({ enabled: isEnabled, options: options }, function() {
          toggleButton.textContent = isEnabled ? 'Disable' : 'Enable';

          if (isEnabled) {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['wikilinkassault.js']
            }, () => {
              if (chrome.runtime.lastError) {
                console.error("Error executing script:", chrome.runtime.lastError);
              } else {
                console.log("Script executed successfully.");
              }
            });
          } else {
            console.log("Feature disabled.");
          }
        });
      });
    });
  });
});
