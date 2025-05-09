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

// Function to process search results
function processSearchResults() {
  // Select Google search result containers (e.g., div.g)
  const resultContainers = document.querySelectorAll("div.g");
  const processedDomains = new Set();

  resultContainers.forEach((container) => {
    // Find the main link in the result
    const link = container.querySelector('a[href*="://"]');
    if (!link || processedDomains.has(link.href)) return;

    const url = link.href;
    checkAffiliation(url, (response) => {
      if (
        response.isAffiliated &&
        !container.querySelector(".promowaves-badge")
      ) {
        // Create badge
        const badge = document.createElement("span");
        badge.className = "promowaves-badge";
        badge.textContent = "Affiliated with Promowaves";
        badge.title = `Shop via Promowaves for discounts! (${response.storeDomain})`;

        // Append badge to container, not link directly
        container.style.position = "relative";
        container.appendChild(badge);
        processedDomains.add(link.href);
      }
    });
  });
}

// Initial processing
processSearchResults();

// Observe DOM changes (Google loads results dynamically via AJAX)
const observer = new MutationObserver((mutations) => {
  mutations.forEach(() => {
    processSearchResults();
  });
});
observer.observe(document.body, {
  childList: true,
  subtree: true,
});
