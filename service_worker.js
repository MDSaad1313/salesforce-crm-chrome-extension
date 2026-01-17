// Background service worker
// Sends extraction command to content script safely

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "START_EXTRACTION") {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) return;

      const tab = tabs[0];

      if (
        !tab.url ||
        (!tab.url.includes("salesforce.com") &&
         !tab.url.includes("force.com"))
      ) {
        console.log("Not a Salesforce page");
        return;
      }

      chrome.tabs.sendMessage(
        tab.id,
        { action: "EXTRACT_DATA" },
        () => {
          if (chrome.runtime.lastError) {
            console.log("Content script not ready");
          }
        }
      );
    });
  }
});
