import { upsertResource } from "./db";

export type Tab = chrome.tabs.Tab;

export type BookmarkEvent = {
  id: string; // Unique identifier for the bookmark event
  properties?: {
      active?: boolean; // Whether the tab is active
      audible?: boolean; // Whether the tab is audible
      autoDiscardable?: boolean; // Whether the tab can be auto-discarded
      discarded?: boolean; // Whether the tab is currently discarded
      favIconUrl?: string; // Optional URL of the favicon
      groupId?: number; // Group ID of the tab (-1 if not grouped)
      height?: number; // Height of the tab in pixels
      highlighted?: boolean; // Whether the tab is highlighted
      id?: number; // Unique ID of the tab
      incognito?: boolean; // Whether the tab is incognito
      index?: number; // Index of the tab within the window
      lastAccessed?: number; // Timestamp of the last time the tab was accessed
      mutedInfo?: {
        muted: boolean; // Whether the tab is muted
      };
      pinned?: boolean; // Whether the tab is pinned
      selected?: boolean; // Whether the tab is selected
      status?: 'loading' | 'complete'; // Status of the tab
      title?: string; // Optional title of the tab
      url?: string; // Optional URL of the tab
      width?: number; // Width of the tab in pixels
      windowId?: number; // ID of the window containing the tab
    };
  timestamp: string; // ISO 8601 timestamp of the event
  type: 'ADD_BOOKMARK' | 'UPDATE_BOOKMARK' | 'DELETE_BOOKMARK'; // Type of the event
  url: string; // URL associated with the event
};


export default async (action: any, result: any) => {
    console.log(action, result);
    if (action === "CREATE") {
      await upsertResource({
        title: result.properties.title,
        url: result.url,
        favIconUrl: result.properties.favIconUrl
      });
    }
};
