// Cache for storing affiliated stores
let affiliatedStores = new Map(); // Map: displayUrl -> id
let lastFetched = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Function to fetch store list from API
async function fetchStoreList() {
  try {
    const response = await fetch("https://promowaves.net/api/stores-links");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const stores = await response.json();
    console.log("Fetched store list from API:", stores);
    affiliatedStores.clear();

    stores.forEach((store) => {
      if (store.displayUrl && store.id) {
        affiliatedStores.set(store.displayUrl.toLowerCase(), store.id);
      }
    });

    lastFetched = Date.now();
    console.log(`Loaded ${stores.length} affiliated stores from API`);

    // Cache the data
    chrome.storage.local.set({
      affiliatedStores: Array.from(affiliatedStores.entries()),
      lastFetched: lastFetched,
    });
  } catch (error) {
    console.error("Error fetching store list:", error);
    // Fallback to cached data if available
    await loadFromCache();
  }
}

// Load from cache
async function loadFromCache() {
  try {
    const result = await chrome.storage.local.get([
      "affiliatedStores",
      "lastFetched",
    ]);
    if (result.affiliatedStores) {
      affiliatedStores = new Map(result.affiliatedStores);
      lastFetched = result.lastFetched || 0;
      console.log(`Loaded ${affiliatedStores.size} stores from cache`);
    }
  } catch (error) {
    console.error("Error loading from cache:", error);
  }
}

// Initialize store list
async function initializeStores() {
  console.log("Starting initializeStores");
  await loadFromCache();
  console.log(
    "Cache loaded, checking fetch condition:",
    Date.now() - lastFetched,
    CACHE_DURATION
  );
  if (Date.now() - lastFetched > CACHE_DURATION) {
    console.log("Triggering fetchStoreList");
    await fetchStoreList();
  } else {
    console.log("Skipping fetch, cache is fresh");
  }
}

// Function to check if a URL is affiliated
function checkAffiliation(url) {
  try {
    const parsedUrl = new URL(url);
    let domain = parsedUrl.hostname.replace(/^www\./, "").toLowerCase();

    // Check exact match first
    if (affiliatedStores.has(domain)) {
      return {
        isAffiliated: true,
        storeDomain: domain,
        storeId: affiliatedStores.get(domain),
      };
    }

    // Check for subdomain matches
    for (const [storeDomain, storeId] of affiliatedStores) {
      if (domain === storeDomain || domain.endsWith("." + storeDomain)) {
        return {
          isAffiliated: true,
          storeDomain: storeDomain,
          storeId: storeId,
        };
      }
    }

    return { isAffiliated: false, storeDomain: domain, storeId: null };
  } catch (error) {
    console.error("Error parsing URL:", url, error);
    return { isAffiliated: false, storeDomain: "unknown", storeId: null };
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
          sendResponse({
            isAffiliated: false,
            storeDomain: "unknown",
            storeId: null,
          });
        }
      });
    }
    return true; // Asynchronous response
  }

  if (request.action === "refreshStores") {
    fetchStoreList()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(() => {
        sendResponse({ success: false });
      });
    return true;
  }
});

// Initialize when extension starts
chrome.runtime.onStartup.addListener(() => {
  initializeStores();
});

chrome.runtime.onInstalled.addListener(() => {
  initializeStores();
});

// Refresh stores periodically
setInterval(() => {
  if (Date.now() - lastFetched > CACHE_DURATION) {
    fetchStoreList();
  }
}, 5 * 60 * 1000); // Check every 5 minutes

// Initialize immediately
initializeStores();
console.log("Affiliated stores:", Array.from(affiliatedStores.entries()));
