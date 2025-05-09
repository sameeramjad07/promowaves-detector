// List of affiliated store domains
const affiliatedStores = [
  "nl.myprotein.com",
  "best.aliexpress.com",
  "delife.de",
];

// Function to check if a URL is affiliated
function checkAffiliation(url) {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace("www.", ""); // Normalize domain
    const isAffiliated = affiliatedStores.some(
      (store) => domain === store || domain.endsWith("." + store)
    );
    return { isAffiliated, storeDomain: domain };
  } catch (error) {
    console.error("Error parsing URL:", url, error);
    return { isAffiliated: false, storeDomain: "unknown" };
  }
}

// Listen for messages from popup.js or content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkAffiliation") {
    if (request.url) {
      // For content script
      const result = checkAffiliation(request.url);
      sendResponse(result);
    } else {
      // For popup, query active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab && tab.url) {
          const result = checkAffiliation(tab.url);
          sendResponse(result);
        } else {
          sendResponse({ isAffiliated: false, storeDomain: "unknown" });
        }
      });
    }
    return true; // Asynchronous response
  }
});
