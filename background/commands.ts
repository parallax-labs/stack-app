export const commandHandlers: Record<string, () => Promise<void>> = {
  "bookmark_resource": bookmarkResourceHandler
  ,"open_sidebar": openSidebarHandler
};

export const commandListener = async (command: string) => {
  console.log(`Command "${command}" triggered`);
  const handler = commandHandlers[command];
  if (handler) {
    try {
      await handler();
    } catch (error) {
      console.error(`Error executing command "${command}":`, error);
    }
  } else {
    console.warn(`No handler found for command "${command}"`);
  }
};

async function openSidebarHandler() {
  try {
    console.log("Opening sidebar...");

    // Get the current window ID dynamically
    chrome.commands.onCommand.addListener(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.sidePanel.open({ tabId: tab.id } as any);
      });
    });
  } catch (error) {
    console.error("Error opening sidebar:", error);
  }
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
async function bookmarkTab(tab: { title: string; url: string }) {
  console.log("Bookmarking tab:", tab);
}

// Function to get the currently active tab
async function getActiveTab(): Promise<{ title: string; url: string }> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (tabs.length === 0) {
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
