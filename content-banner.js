// Check if current page is an affiliated store and show banner
(function () {
  "use strict";

  let bannerShown = false;
  const currentUrl = window.location.href;

  // Function to check affiliation
  function checkAffiliation(url, callback) {
    chrome.runtime.sendMessage(
      { action: "checkAffiliation", url: url },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error checking affiliation:",
            chrome.runtime.lastError
          );
          callback({ isAffiliated: false });
          return;
        }
        callback(response);
      }
    );
  }

  // Function to create the floating banner
  function createPromowavesBanner(storeId, storeDomain) {
    // Prevent duplicate banners
    if (document.getElementById("promowaves-floating-banner")) {
      return;
    }

    // Resolve favicon path correctly within the extension
    const logoPath = chrome.runtime.getURL("/assets/faviconTest.ico");

    const banner = document.createElement("div");
    banner.id = "promowaves-floating-banner";
    banner.className = "promowaves-banner";

    banner.innerHTML = `
      <div class="promowaves-banner-content">
        <div class="promowaves-banner-left">
          <div class="promowaves-banner-logo">
            <img
              src="${logoPath}"
              alt="Promowaves Logo"
              class="logo-image"
              width="48"
              height="38"
            />
          </div>
          <div class="promowaves-banner-text">
            <div class="promowaves-banner-title">
              <strong>This store is on Promowaves!</strong>
            </div>
            <div class="promowaves-banner-subtitle">
              Shop through Promowaves for exclusive discounts & cashback
            </div>
          </div>
        </div>
        <div class="promowaves-banner-right">
          <a href="https://promowaves.net/shop/${storeId}" target="_blank" class="promowaves-banner-button">
            <span>Go to Promowaves</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
          <button class="promowaves-banner-close" title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Add close button functionality
    const closeBtn = banner.querySelector(".promowaves-banner-close");
    closeBtn.addEventListener("click", () => {
      banner.classList.add("promowaves-banner-hidden");
      setTimeout(() => banner.remove(), 300);
      sessionStorage.setItem(
        `promowaves-banner-dismissed-${storeDomain}`,
        "true"
      );
    });

    // Insert banner at top of page
    document.body.insertBefore(banner, document.body.firstChild);
    document.body.style.paddingTop = "48px";

    // Animate banner
    setTimeout(() => banner.classList.add("promowaves-banner-visible"), 100);

    bannerShown = true;
  }

  // Function to show banner if store is affiliated
  function showBannerIfAffiliated() {
    // Check if banner was already dismissed this session
    checkAffiliation(currentUrl, (response) => {
      if (response.isAffiliated && response.storeId) {
        const dismissKey = `promowaves-banner-dismissed-${response.storeDomain}`;
        const wasDismissed = sessionStorage.getItem(dismissKey);

        if (!wasDismissed && !bannerShown) {
          // Wait a bit for page to load before showing banner
          setTimeout(() => {
            createPromowavesBanner(response.storeId, response.storeDomain);
          }, 1000);
        }
      }
    });
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showBannerIfAffiliated);
  } else {
    showBannerIfAffiliated();
  }

  // Also check on URL changes (for single-page apps)
  let lastUrl = window.location.href;
  new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      if (!bannerShown) {
        showBannerIfAffiliated();
      }
    }
  }).observe(document, { subtree: true, childList: true });
})();
