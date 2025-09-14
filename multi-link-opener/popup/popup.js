function sendToActiveTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.id) chrome.tabs.sendMessage(tab.id, message);
  });
}

document.getElementById('toggle').addEventListener('click', () => {
  sendToActiveTab({ type: 'TOGGLE_SELECT' });
});

document.getElementById('open').addEventListener('click', () => {
  sendToActiveTab({ type: 'REQUEST_OPEN' });
});

document.getElementById('export').addEventListener('click', () => {
  sendToActiveTab({ type: 'REQUEST_EXPORT' });
});
