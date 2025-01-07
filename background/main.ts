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

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.url || changeInfo.title) {
//     chrome.runtime.sendMessage({
//       type: "TAB_UPDATED",
//       payload: {
//         tabId,
//         url: tab.url,
//         title: tab.title,
//         favicon: tab.favIconUrl,
//         updatedAt: new Date().toISOString(),
//       },
//     });
//   }
// });
//
chrome.webRequest.onCompleted.addListener(
  (details) => {
    // Additional logic can be implemented here
    chrome.runtime.sendMessage({
       type: "REQUEST_COMPLETE",
       payload: details,
     });
  },
  { urls: ["<all_urls>"] }
);
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.error(`Error retrieving tab: ${chrome.runtime.lastError.message}`);
      return;
    }
    // Access tab properties
    chrome.runtime.sendMessage({
       type: "TAB_ACTIVATED",
       payload: tab,
     });
    // Additional tab properties can be accessed as needed
  });

});

// Log when a bookmark is created
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
  console.log('Bookmark Created:', id, bookmark);
});

// Log when a bookmark is removed
chrome.bookmarks.onRemoved.addListener((id, removeInfo) => {
  console.log('Bookmark Removed:', {
    id: id,
    parentId: removeInfo.parentId,
  });
});
//
// // Log when a bookmark is changed (title, URL, etc.)
// chrome.bookmarks.onChanged.addListener((id, changeInfo) => {
//   console.log('Bookmark Changed:', {
//     id: id,
//     title: changeInfo.title || 'No change in title',
//     url: changeInfo.url || 'No change in URL'
//   });
// });
//
// chrome.tabs.onRemoved.addListener((tabId) => {
//   chrome.runtime.sendMessage({
//     type: "TAB_CLOSED",
//     payload: {
//       tabId,
//       closedAt: new Date().toISOString(),
//     },
//   });
// });

// chrome.bookmarks.onCreated.addListener((id, bookmark) => {
//   chrome.runtime.sendMessage({
//     type: "PAGE_BOOKMARKED",
//     payload: {
//       url: bookmark.url,
//       title: bookmark.title,
//       bookmarkedAt: new Date().toISOString(),
//     },
//   });
// });
//
// chrome.downloads.onCreated.addListener((downloadItem) => {
//   chrome.runtime.sendMessage({
//     type: "FILE_DOWNLOADED",
//     payload: {
//       filename: downloadItem.filename,
//       url: downloadItem.url,
//       downloadedAt: new Date().toISOString(),
//     },
//   });
// });
//
// Listen for tab updates and changes
chrome.tabs.onActivated.addListener(console.log);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => updateIcon(tabId, changeInfo, tab).then(console.log).catch(console.log));

// Single listener function for all commands
chrome.commands.onCommand.addListener(commandListener);

chrome.runtime.onInstalled.addListener(() => {
  console.log("Deployment Stack Navigator installed.");
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
