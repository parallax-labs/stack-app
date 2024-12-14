chrome.runtime.onInstalled.addListener(() => {
  console.log("Deployment Stack Navigator installed.");
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
