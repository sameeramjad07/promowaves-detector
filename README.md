# 🛍️ Promowaves Detector – Chrome Extension

**Promowaves Detector** is a Chrome Extension that automatically detects stores affiliated with [Promowaves](https://promowaves.net) in Google search results and directly on store websites.  
When a Promowaves-affiliated store is found, it displays a subtle inline label or a floating banner that lets users **shop via Promowaves for exclusive discounts and cashback**.

---

## 🚀 Features

- 🧠 **Smart Store Detection** – Automatically identifies Promowaves-affiliated stores in Google search results.
- 🏷️ **Inline Promowaves Tag** – Adds a "Promowaves" indicator next to Google search result titles for affiliated stores.
- 🎉 **Floating Store Banner** – Displays a sleek, dismissible banner on affiliated store websites.
- 🔗 **Quick Access** – Provides a direct link to the store's Promowaves page (`https://promowaves.net/shop/{storeId}`).
- ⚡ **Lightweight & Fast** – Built using Manifest V3 for modern Chrome compatibility.
- 🖼️ **Custom Branding** – Uses the `faviconTest.ico` logo stored in `/assets/`.

---

## 🧩 Project Structure

```
promowaves-detector/
│
├── assets/
│   └── faviconTest.ico
│
├── background.js
├── content-google.js      # Handles Google Search integration
├── content-banner.js      # Displays floating banner on store sites
├── popup.html             # Popup UI when extension icon is clicked
├── popup.js
├── styles.css             # Google search indicator styles
├── banner-styles.css      # Floating banner styles
└── manifest.json
```

---

## ⚙️ Installation (Developer Mode)

1. **Clone this repository**

   ```bash
   git clone https://github.com/your-username/promowaves-detector.git
   cd promowaves-detector
   ```

2. **Open Chrome Extensions page**

   ```
   chrome://extensions/
   ```

3. **Enable Developer Mode**  
   (Toggle it in the top-right corner)

4. **Load the extension**

   - Click **"Load unpacked"**
   - Select the `promowaves-detector/` folder

5. The **Promowaves Detector** icon will appear in your Chrome toolbar.

---

## 🧠 How It Works

### 🕵️ Google Search Detection

- The extension scans Google search results (`google.com/search`).
- For each result URL, it sends a background message (`checkAffiliation`) to determine if the domain is Promowaves-affiliated.
- If affiliated:
  - Adds a small Promowaves indicator (`faviconTest.ico` + "Promowaves") beside the title.
  - Optionally shows a badge below the result with a **"Shop via Promowaves"** button.

### 🏪 On Store Websites

- When visiting a store's website, the extension again checks if it's affiliated.
- If yes, a floating **Promowaves banner** appears at the top:
  - Displays logo (`faviconTest.ico`)
  - Text: "This store is on Promowaves!"
  - Button: "Go to Promowaves" → Opens the corresponding Promowaves shop page.

---

## 🧰 Permissions Used

| Permission      | Reason                                                            |
| --------------- | ----------------------------------------------------------------- |
| `activeTab`     | To access the current tab URL for detection.                      |
| `tabs`          | Required to send messages between background and content scripts. |
| `storage`       | To store session dismissals (banner closed state).                |
| `scripting`     | To inject content scripts dynamically.                            |
| `webNavigation` | To detect when a user navigates to a new page.                    |
| `<all_urls>`    | So detection works across all websites.                           |

---

## 🧪 Testing Locally

You can simulate affiliation responses by temporarily modifying `background.js` to return mock data for specific URLs.

Example:

```js
if (url.includes("example.com")) {
  sendResponse({
    isAffiliated: true,
    storeId: "example-store",
    storeDomain: "example.com",
  });
}
```

Then, visit `https://www.google.com/search?q=example` or `https://example.com`.

---

## 🧼 Cleanup Notes

- Dismissed banners are remembered using `sessionStorage` to avoid showing again during the same session.
- No user data is collected, stored, or transmitted to external servers.
- All communication happens locally within the Chrome extension context.

---

## 🧑‍💻 Author

**CodeNext Solutions**  
Developed for [Promowaves](https://promowaves.net)  
© 2025 Promowaves. All rights reserved.

---

## 📜 License

This project is proprietary and not open-source.  
For usage or modification rights, contact **CodeNext Solutions** or **Promowaves**.
