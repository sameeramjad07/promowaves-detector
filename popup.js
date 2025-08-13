document.addEventListener("DOMContentLoaded", () => {
  const messageDiv = document.getElementById("message");
  const redirectButton = document.getElementById("redirectButton");
  const statusCard = document.querySelector(".status-card");

  // Add loading state
  statusCard.classList.add("loading");

  // Request affiliation status from background.js
  chrome.runtime.sendMessage({ action: "checkAffiliation" }, (response) => {
    // Remove loading state
    statusCard.classList.remove("loading");

    if (chrome.runtime.lastError) {
      messageDiv.textContent = "Error checking store.";
      statusCard.classList.add("not-affiliated");
      return;
    }

    if (response.isAffiliated && response.storeId) {
      statusCard.classList.add("affiliated");
      messageDiv.textContent = `This store (${response.storeDomain}) is affiliated with Promowaves!\nShop via the link below to earn discounts!`;
      redirectButton.style.display = "flex";

      // Update the redirect button click handler
      redirectButton.onclick = () => {
        const promowavesUrl = `https://promowaves.net/shop/${response.storeId}`;
        chrome.tabs.update({ url: promowavesUrl });
        window.close(); // Close popup after redirect
      };
    } else {
      statusCard.classList.add("not-affiliated");
      messageDiv.textContent = "This store is not affiliated with Promowaves.";
      redirectButton.style.display = "none";
    }
  });

  // Add refresh functionality (optional - for development/debugging)
  if (document.getElementById("refreshButton")) {
    document.getElementById("refreshButton").onclick = () => {
      statusCard.classList.add("loading");
      chrome.runtime.sendMessage({ action: "refreshStores" }, (response) => {
        statusCard.classList.remove("loading");
        if (response.success) {
          // Re-check current page
          location.reload();
        }
      });
    };
  }
});
