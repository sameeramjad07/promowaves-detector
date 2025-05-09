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

    if (response.isAffiliated) {
      statusCard.classList.add("affiliated");
      messageDiv.textContent = `This store (${response.storeDomain}) is affiliated with Promowaves! \nBuy via the link below to earn discount!`;
      redirectButton.style.display = "flex";
      redirectButton.onclick = () => {
        const promowavesUrl = `https://promowaves.net/search/${response.storeDomain}`;
        chrome.tabs.update({ url: promowavesUrl });
      };
    } else {
      statusCard.classList.add("not-affiliated");
      messageDiv.textContent = "This store is not affiliated with Promowaves.";
      redirectButton.style.display = "none";
    }
  });
});
