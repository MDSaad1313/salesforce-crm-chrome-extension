//  helper file for storage logic

function getStoredData(callback) {
  chrome.storage.local.get(["salesforce_data"], callback);
}

function clearData() {
  chrome.storage.local.set({ salesforce_data: [] });
}
