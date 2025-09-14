// Opens URLs in background tabs (throttled to avoid explosions)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'OPEN_TABS' && Array.isArray(msg.urls)) {
    const urls = msg.urls
      .filter(u => /^https?:\/\//i.test(u))
      .slice(0, 50); // hard cap for safety

    let delay = 0;
    urls.forEach((url) => {
      setTimeout(() => {
        chrome.tabs.create({ url, active: false });
      }, delay);
      delay += 100; // spread tab creation a bit
    });

    sendResponse({ ok: true, opened: urls.length });
    return true; // async
  }
});
