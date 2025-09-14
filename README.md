# Multi‑Link Opener — Chrome Extension (Manifest V3)

Select multiple links on any page, open them all at once in new background tabs, **or export them to Excel (CSV)** with link text + URL.

---

## 🚀 Features

* **Multi‑selection** of links on any webpage.
* **Open all links** at once in background tabs.
* **Export selected links to Excel (CSV)** with columns: *Link Text* and *URL*.
* Simple **popup UI** and an **in‑page floating panel** for quick actions.
* Supports lasso‑selection (Shift+Drag).

---

## 📂 Project Structure

```
multi-link-opener/
├─ manifest.json
├─ background.js
├─ content.js
├─ styles.css
├─ popup/
│  ├─ popup.html
│  └─ popup.js
└─ icons/
   ├─ icon16.png
   ├─ icon48.png
   └─ icon128.png
```

---

## 🛠 Installation (Unpacked)

1. Clone or download this repository.
2. Open **chrome://extensions** in Chrome.
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked** and select the `multi-link-opener/` folder.
5. Pin the extension for quick access.

---

## 📖 Usage

1. Open any webpage containing links.
2. Click the extension icon and press **Start Selecting**.
3. Click individual links (they’ll be outlined) or use **Shift+Drag** to lasso multiple.
4. Use the floating panel to:

   * **Open All** links in new tabs.
   * **Export Excel** → download a CSV file with *Link Text* + *URL*.
   * **Clear** to reset selection.
   * **Exit** to leave selection mode.

---


## 📌 Roadmap

* Option to export as native `.xlsx` instead of CSV.
* Keyboard shortcuts for quick open/export.
* Domain‑based filters (only collect links from same host).

---

## 🤝 Contributing

Pull requests are welcome! 


