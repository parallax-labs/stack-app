
import { runQuery, upsertResource, saveResource, Resource, createChatInDB } from './db'; // Assume runQuery executes SurrealDB queries
export type ToolDefinition = {
  name: string;
  description: string;
  parameters?: Record<string, any>;
  execute: (args?: any) => Promise<any>;
  parser?: (data: any) => string;
};

export async function describeDatabase() {
  try {
    const tablesResult: any = await runQuery('INFO FOR DB;');
    const schemaInfo = tablesResult.length > 0 ? tablesResult[0] : 'No schema information available';
    console.log('Database Schema:', schemaInfo);
    notify('Database schema retrieved successfully.');
    return schemaInfo;
  } catch (error) {
    console.error('Error retrieving database schema:', error);
    notify('Failed to retrieve database schema.');
    throw error;
  }
}

// Save the current tab as a resource
export async function saveCurrentTabAsResource(): Promise<Resource | null> {
  const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!currentTab || !currentTab.url || !currentTab.title) return null;

  const resource = {
    title: currentTab.title,
    url: currentTab.url,
  };

  await upsertResource(resource);

  return resource;
}

// Open a resource by URL or focus the tab if already open
export async function openOrFocusResource(url: string) {
  const tabs = await chrome.tabs.query({});
  const existingTab = tabs.find(tab => tab.url === url);

  if (existingTab) {
    await chrome.tabs.update(existingTab.id!, { active: true });
    await chrome.windows.update(existingTab.windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url });
  }
}

// Close all tabs except the active one
export async function closeOtherTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const activeTab = tabs.find(tab => tab.active);

  if (activeTab) {
    for (const tab of tabs) {
      if (tab.id !== activeTab.id) {
        await chrome.tabs.remove(tab.id!);
      }
    }
  }
}

// Save all open tabs to the current chat/stack
export async function saveAllTabsToChat(): Promise<string> {
  const { id: activeChatId, name } = await createChatInDB();
  if (!activeChatId) {
    return 'No active chat/stack found.';
  }

  const tabs = await chrome.tabs.query({ currentWindow: true });
  const resources = tabs
    .filter(tab => tab.url && tab.title)
    .map(tab => ({
      title: tab.title!,
      url: tab.url!,
    }));

  if (resources.length === 0) {
    return 'No valid tabs found to save.';
  }

  for (const resource of resources) {
    // Insert the resource and create the relationship with the active chat
    await saveResource(activeChatId.toString(), resource);
  }

  return `Saved ${resources.length} tabs to the ${name} chat/stack.`;
}


export function notify(message: string) {
  console.log(message);
  // alert(message); // Replace with a better notification system if available
}
// Search bookmarks by query string
export async function searchBookmarks(query: string) {
  let sql = `SELECT * FROM resource WHERE title CONTAINS "${query}" OR url CONTAINS "${query}"`;
  console.log(sql);
  try {
    const [results]: Resource[][] = await runQuery(sql);

    // if (results.length === 0) {
    //   notify('No bookmarks found matching the search query.');
    // } else {
    //   console.log('Search Results:', results);
    //   notify(`Found ${results.length} bookmark(s) matching your query.`);
    // }
    return results;
  } catch (error) {
    console.error('Error searching bookmarks:', error);
    notify('Failed to search bookmarks.');
  }
}

// List all saved bookmarks
export async function listBookmarks() {
  try {
    const [results]: Resource[][] = await runQuery(`
      SELECT * FROM resource;
    `);

    // if (results.length === 0) {
    //   notify('No bookmarks found.');
    // } else {
    //   console.log('All Bookmarks:', results);
    //   notify(`You have ${results.length} bookmark(s) saved.`);
    // }
    return results
  } catch (error) {
    console.error('Error listing bookmarks:', error);
    notify('Failed to list bookmarks.');
  }
}




