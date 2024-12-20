import { commandListener } from './commands';

const BOX_ICON_PATHS = {
  16: '/icons/icon-box-16.png',
  48: '/icons/icon-box-48.png',
  128: '/icons/icon-box-128.png'
};

const DEFAULT_ICON_PATHS = {
  16: '/icons/icon-default-16.png',
  48: '/icons/icon-default-48.png',
  128: '/icons/icon-default-128.png'
};

// // Function to update the extension icon based on the current tab
async function updateIcon(tabId: number, changeInfo: any, tab: Partial<{ url: string }>) {
  console.log(tabId, changeInfo);
  console.log("update icon", tab.url)

  try {
    const saved = true; //await isPageSaved(url);
    const iconPaths = saved
      ? BOX_ICON_PATHS
      : DEFAULT_ICON_PATHS;

    await chrome.action.setIcon({ path: iconPaths });
    // console.log('Icon updated successfully.');

  } catch (error) {
    console.error('Error updating icon:', error);
  }
}

// Listen for tab updates and changes
chrome.tabs.onActivated.addListener(console.log);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => updateIcon(tabId, changeInfo, tab).then(console.log).catch(console.log));

// Single listener function for all commands
chrome.commands.onCommand.addListener(commandListener);

chrome.runtime.onInstalled.addListener(() => {
  console.log("Deployment Stack Navigator installed.");
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
