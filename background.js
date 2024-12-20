// Mapping of command names to their respective handler functions
const commandHandlers = {
  "bookmark_resource": bookmarkResourceHandler,
  "open_sidebar": openSidebarHandler
};


chrome.runtime.onInstalled.addListener(() => {
  console.log("Deployment Stack Navigator installed.");
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Single listener function for all commands
chrome.commands.onCommand.addListener((command) => {
  console.log(`Command "${command}" triggered`);

  const handler = commandHandlers[command];

  if (handler) {
    handler().catch((error) => {
      console.error(`Error executing command "${command}":`, error);
    });
  } else {
    console.warn(`No handler found for command "${command}"`);
  }
});
// Handler function for bookmarking a resource
async function openSidebarHandler() {
  console.log("open sidebar")
  chrome.sidePanel.open({}, console.log)
}
// Handler function for bookmarking a resource
async function bookmarkResourceHandler() {
  try {
    const tab = await getActiveTab();
    await bookmarkTab(tab);
  } catch (error) {
    console.error("Failed to bookmark resource:", error);
  }
}

// Function to bookmark a tab (can be expanded as needed)
async function bookmarkTab(tab) {
  console.log("Bookmarking tab:", tab);
}

// Function to get the currently active tab
function getActiveTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (!tabs.length) {
        reject(new Error("No active tab found"));
      } else {
        resolve({
          title: tabs[0].title || '',
          url: tabs[0].url || '',
        });
      }
    });
  });
}

