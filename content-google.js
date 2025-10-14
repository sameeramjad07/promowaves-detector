// Function to check if a URL is affiliated
function checkAffiliation(url, callback) {
  let responded = false;
  const timeout = setTimeout(() => {
    if (!responded) {
      console.warn("checkAffiliation timeout for", url);
      callback({ isAffiliated: false });
    }
  }, 2000);

  chrome.runtime.sendMessage(
    { action: "checkAffiliation", url },
    (response) => {
      responded = true;
      clearTimeout(timeout);
      if (chrome.runtime.lastError) {
        console.error("Error checking affiliation:", chrome.runtime.lastError);
        callback({ isAffiliated: false });
        return;
      }
      callback(response);
    }
  );
}

// Function to add Promowaves indicator to the title link
// Function to add Promowaves indicator to the title link
function addPromowavesToTitle(h3Element, storeId, storeDomain) {
  if (h3Element.querySelector(".promowaves-inline-indicator")) return;

  const indicator = document.createElement("span");
  indicator.className = "promowaves-inline-indicator";

  indicator.innerHTML = `
    <span class="promowaves-inline-separator">·</span>
    <img src="${chrome.runtime.getURL("assets/faviconTest.ico")}" 
         alt="Promowaves" 
         class="promowaves-inline-icon"
         width="14" height="14"
         style="vertical-align: text-bottom; margin-right: 4px;" />
    <span class="promowaves-inline-text">Promowaves</span>
  `;

  indicator.title = "Listed on Promowaves";

  h3Element.appendChild(indicator);
}

// Function to create Promowaves badge with button
function createPromowavesBadge(storeId, storeDomain) {
  const badge = document.createElement("div");
  badge.className = "promowaves-badge";

  const logo = document.createElement("img");
  logo.src = chrome.runtime.getURL("assets/faviconTest.ico");
  logo.alt = "Promowaves";
  logo.width = 16;
  logo.height = 16;
  logo.style.marginRight = "6px";

  const text = document.createElement("span");
  text.textContent = "Promowaves";

  badge.appendChild(logo);
  badge.appendChild(text);

  badge.title = `This store is listed on Promowaves (${storeDomain})`;

  return badge;
}

// Function to process search results
function processSearchResults() {
  console.log("Processing search results for Promowaves");

  // Select all search result containers
  const resultContainers = document.querySelectorAll(
    "div.MjjYud, div.g, div[data-text-ad], div.uEierd, div[data-sokoban-container]"
  );
  console.log("Found", resultContainers.length, "result containers");

  const processedUrls = new Set();

  resultContainers.forEach((container) => {
    // Find the main clickable link and h3 title
    const mainLink =
      container.querySelector('a[data-ved][href^="http"]') ||
      container.querySelector('a[href*="://"]');

    const h3Title = container.querySelector("h3");

    if (!mainLink || !h3Title) return;

    const url = mainLink.href;
    console.log("Checking result:", url);

    // Skip if already processed
    if (processedUrls.has(url)) return;

    // Check affiliation
    checkAffiliation(url, (response) => {
      if (response.isAffiliated && response.storeId) {
        console.log("Found affiliated store:", response.storeDomain);

        // Add Promowaves indicator to the title (inside the h3)
        addPromowavesToTitle(h3Title, response.storeId, response.storeDomain);

        // Add badge below the title if not already present
        if (!container.querySelector(".promowaves-badge")) {
          const badge = createPromowavesBadge(
            response.storeId,
            response.storeDomain
          );

          // Find the best place to insert the badge
          // Try to insert after the URL/breadcrumb line
          const cite = container.querySelector("cite");
          const insertTarget = cite
            ? cite.closest("div")
            : h3Title.parentElement;

          if (insertTarget && insertTarget.parentElement) {
            insertTarget.parentElement.insertBefore(
              badge,
              insertTarget.nextSibling
            );
          } else {
            // Fallback: insert after h3
            h3Title.parentElement.insertBefore(badge, h3Title.nextSibling);
          }
        }

        processedUrls.add(url);
      }
    });
  });
}

// Initial processing
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", processSearchResults);
} else {
  processSearchResults();
}

// Observe DOM changes (Google loads results dynamically)
const observer = new MutationObserver((mutations) => {
  let shouldProcess = false;

  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if new search results were added
          if (
            node.matches(
              "div.g, div[data-text-ad], div.uEierd, div[data-sokoban-container]"
            ) ||
            node.querySelector(
              "div.g, div[data-text-ad], div.uEierd, div[data-sokoban-container]"
            )
          ) {
            shouldProcess = true;
          }
        }
      });
    }
  });

  if (shouldProcess) {
    setTimeout(processSearchResults, 100);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
