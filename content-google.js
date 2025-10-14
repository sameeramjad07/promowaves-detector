// Function to check if a URL is affiliated
function checkAffiliation(url, callback) {
  chrome.runtime.sendMessage(
    { action: "checkAffiliation", url: url },
    (response) => {
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
function addPromowavesToTitle(h3Element, storeId, storeDomain) {
  // Check if already added
  if (h3Element.querySelector(".promowaves-inline-indicator")) {
    return;
  }

  // Create the Promowaves indicator
  const indicator = document.createElement("span");
  indicator.className = "promowaves-inline-indicator";

  indicator.innerHTML = `
      <span class="promowaves-inline-separator">·</span>
      <svg class="promowaves-inline-logo" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" stroke="#e41e26" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" stroke="#e41e26" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" stroke="#e41e26" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="promowaves-inline-text">Promowaves</span>
    `;

  indicator.title = "Available on Promowaves - Shop for exclusive discounts!";

  // Append to the h3 title
  h3Element.appendChild(indicator);
}

// Function to create Promowaves badge with button
function createPromowavesBadge(storeId, storeDomain) {
  const badge = document.createElement("div");
  badge.className = "promowaves-badge";

  // Create logo element
  const logo = document.createElement("div");
  logo.className = "promowaves-logo";
  logo.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

  // Create text element
  const text = document.createElement("span");
  text.textContent = "Available on Promowaves";

  // Create button
  const button = document.createElement("button");
  button.className = "promowaves-button";
  button.innerHTML = `
      <span>Shop via Promowaves</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    `;

  // Add click handler for the button
  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const promowavesUrl = `https://promowaves.net/shop/${storeId}`;
    window.open(promowavesUrl, "_blank");
  });

  badge.appendChild(logo);
  badge.appendChild(text);
  badge.appendChild(button);

  badge.title = `Shop via Promowaves for discounts! (${storeDomain})`;

  return badge;
}

// Function to process search results
function processSearchResults() {
  console.log("Processing search results for Promowaves");

  // Select all search result containers
  const resultContainers = document.querySelectorAll(
    "div.g, div[data-text-ad], div.uEierd, div[data-sokoban-container]"
  );

  const processedUrls = new Set();

  resultContainers.forEach((container) => {
    // Find the main clickable link and h3 title
    const mainLink = container.querySelector('a[href*="://"]');
    const h3Title = container.querySelector("h3");

    if (!mainLink || !h3Title) return;

    const url = mainLink.href;

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
