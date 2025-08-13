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

// Function to create Promowaves badge with logo
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
  text.textContent = "Promowaves";

  // Create button
  const button = document.createElement("button");
  button.className = "promowaves-button";
  button.innerHTML = `
    <span>Go via Promowaves</span>
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
  console.log("Processing search results");
  // Select all potential result containers, including ads
  const resultContainers = document.querySelectorAll(
    "div.g, div[data-text-ad], div.uEierd"
  ); // uEierd is for some ad containers
  const processedDomains = new Set();

  resultContainers.forEach((container) => {
    // Find the main link, including nested links in ads
    const link =
      container.querySelector('a[href*="://"]') ||
      container.querySelector("a[href]");
    if (!link || processedDomains.has(link.href)) return;

    const url = link.href;
    checkAffiliation(url, (response) => {
      if (
        response.isAffiliated &&
        response.storeId &&
        !container.querySelector(".promowaves-badge")
      ) {
        const badge = createPromowavesBadge(
          response.storeId,
          response.storeDomain
        );
        const titleElement =
          container.querySelector("h3") ||
          container.querySelector("a") ||
          container;
        if (titleElement.parentNode) {
          titleElement.parentNode.insertBefore(
            badge,
            titleElement.nextSibling || titleElement
          );
        } else {
          container.appendChild(badge);
        }
        processedDomains.add(link.href);
      }
    });
  });
}
// Initial processing
processSearchResults();

// Observe DOM changes (Google loads results dynamically via AJAX)
const observer = new MutationObserver((mutations) => {
  let shouldProcess = false;
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (
            node.matches("div.g, div[data-text-ad], div.uEierd") ||
            node.querySelector("div.g, div[data-text-ad], div.uEierd")
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
