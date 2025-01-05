import { RecordId, Surreal } from 'surrealdb';
import { surrealdbWasmEngines } from '@surrealdb/wasm';
import generateName from './names';
import { encryptApiKey } from './encryption';
import { Tab } from './bookmark_event';
import { findPathToUrl } from './browser';
// Singleton instance of SurrealDB
export const db = new Surreal({
  engines: surrealdbWasmEngines(),
});

export const runQuery = async (args: any): Promise<any> => await db.query(args)
// Initialize and configure the database connection
export async function initDB() {
  try {
    await db.connect("indxdb://demo");
    await db.use({ namespace: "test", database: "test" });
    console.log("SurrealDB connected and namespace set");
    const initCommands = `
      DEFINE ANALYZER IF NOT EXISTS simple_analyzer
          TOKENIZERS class
          FILTERS lowercase;
      DEFINE ANALYZER IF NOT EXISTS url_analyzer
          TOKENIZERS class
          FILTERS lowercase, ascii;
      DEFINE TABLE IF NOT EXISTS runtime_event SCHEMALESS;
      DEFINE FIELD IF NOT EXISTS timestamp ON TABLE runtime_event TYPE datetime DEFAULT time::now();
      
      DEFINE TABLE IF NOT EXISTS app_event SCHEMALESS;
      DEFINE FIELD IF NOT EXISTS timestamp ON TABLE app_event TYPE datetime DEFAULT time::now();
      
      DEFINE TABLE IF NOT EXISTS bookmark_event SCHEMALESS;
      DEFINE FIELD IF NOT EXISTS timestamp ON TABLE bookmark_event TYPE datetime DEFAULT time::now();

      DEFINE TABLE IF NOT EXISTS timeline_event SCHEMALESS;
      DEFINE FIELD IF NOT EXISTS timestamp ON TABLE timeline_event TYPE datetime DEFAULT time::now();

      DEFINE TABLE IF NOT EXISTS chat SCHEMALESS;
      DEFINE FIELD IF NOT EXISTS created_at ON TABLE chat TYPE datetime DEFAULT time::now();
      DEFINE INDEX IF NOT EXISTS search_chat_name ON TABLE chat FIELDS name SEARCH ANALYZER simple_analyzer BM25;
      
      DEFINE TABLE IF NOT EXISTS bookmark SCHEMALESS;
      DEFINE FIELD IF NOT EXISTS created_at ON TABLE bookmark TYPE datetime DEFAULT time::now();
      DEFINE INDEX IF NOT EXISTS unique_bookmark_url ON TABLE bookmark FIELDS url UNIQUE;
      DEFINE INDEX IF NOT EXISTS search_bookmark_url ON TABLE bookmark FIELDS url SEARCH ANALYZER url_analyzer BM25;
      
      DEFINE TABLE IF NOT EXISTS import SCHEMALESS;
      DEFINE FIELD IF NOT EXISTS created_at ON TABLE import TYPE datetime DEFAULT time::now();
      
      DEFINE TABLE IF NOT EXISTS has_resource SCHEMALESS;
      DEFINE FIELD IF NOT EXISTS created_at ON TABLE has_resource TYPE datetime DEFAULT time::now();
    `;
    try {
      await db.query(initCommands);
      console.log('Database initialized successfully.');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
   // Expose the debug function on the global window object
    (window as any).SQL = async (query: string) => {
      try {
        const [result] = await db.query(query);
        console.log("Query result:", result);
      } catch (error) {
        console.error("Query error:", error);
      }
    };

    console.log('You can now run SQL queries using the "SQL" function. Example: SQL("SELECT * FROM stack")');
  } catch (error) {
    console.error("Failed to connect to SurrealDB:", error);
  }
}
// Type definitions for stacks and components
export type Component = {
  id?: string;
  name: string;
  type: string;
  platform?: string;
  stackId: string;
  [key: string]: unknown; // Index signature for compatibility
}

export type Resource = {
  id?: string;
  title: string;
  url: string;
  [key: string]: unknown;
}

export interface Chat extends Record<string, unknown> {
  id?: string;
  name: string;
  [key: string]: unknown; // Index signature for compatibility
}

// Function to check if the page is saved in SurrealDB
export async function isPageSaved(url: string): Promise<boolean> {
  console.log(`is page saved? ${url}`);
  const query = 'SELECT * FROM bookmark WHERE url = $url LIMIT 1;';
  const result = await db.query(query, { url });
  console.log(result[0]);
  return Array.isArray(result[0]) && result[0].length > 0;
}

export async function isChatSaved(name: string): Promise<boolean> {
  console.log(`is chat saved? ${name}`);
  const query = 'SELECT * FROM chat WHERE name = $name LIMIT 1;';
  const result = await db.query(query, { name });
  // console.log(result[0]);
  return Array.isArray(result[0]) && result[0].length > 0;
}

export async function getResource(resourceId: RecordId<string> & string): Promise<Resource[] | unknown> {
  let query = `SELECT *, <-has<-stack as stacks from bookmark where id = ${resourceId}`;
  console.log(query);
  let [results] = await db.query<Resource[]>(query);

  return results[0];
}

export async function loadResources(): Promise<Resource[]> {
  return await db.select<Resource>('bookmark') || [];
}

export async function loadResourcesBatch(tabs: Tab[]): Promise<Resource[]> {
  let urls = JSON.stringify(tabs.map(tab => tab.url as string));
  const query = 'SELECT array::group(in.*) AS chats, out.url, out.* FROM has_resource GROUP BY out.url;';
  const result: Resource[][] = await db.query(query, { urls });
  return result[0];
}

export async function upsertBookmark(bookmark: { id: string; title: string; url: string; dateAdded: number }) {
  const query = `
    UPSERT INTO bookmark SET
      id = $id,
      title = $title,
      url = $url,
      dateAdded = $dateAdded,
      created_at = time::now();
  `;
  const params = {
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    dateAdded: bookmark.dateAdded,
  };
  await db.query(query, params);
}

export async function upsertChat(chat: { id: string; name: string; parentId?: string; dateAdded: number }) {
  const query = `
    UPSERT INTO chat SET
      id = $id,
      name = $name,
      parentId = $parentId,
      dateAdded = $dateAdded,
      created_at = time::now();
  `;
  const params = {
    id: chat.id,
    name: chat.name,
    parentId: chat.parentId || null,
    dateAdded: chat.dateAdded,
  };
  await db.query(query, params);
}

export async function batchUpsertChats(
  chats: { id: string; name: string; parentId?: string; dateAdded: number }[]
) {
  // Construct the query
  const queries = chats.map((chat) => `
    UPSERT chat:${chat.id} SET
      name = '${chat.name}',
      parentId = ${chat.parentId ? `'${chat.parentId}'` : 'null'},
      dateAdded = ${chat.dateAdded},
      created_at = time::now();
  `).join(' ');

  // Execute the query
  try {
    await db.query(queries);
  } catch (error) {
    console.log(error);
    console.error("Failed to upsert chats:", error);
  }
}


export async function batchUpsertBookmarks(
  bookmarks: { id: string; title: string; path: string; url: string; dateAdded: number }[]
) {
  // Execute each query individually
    try {
      await db.query(bookmarks.map((bookmark) => `
      UPSERT bookmark:${bookmark.id} SET
        title = '${bookmark.title}',
        path = '${bookmark.path}',
        url = '${bookmark.url}',
        dateAdded = ${bookmark.dateAdded},
        created_at = time::now();
    `).join(' '));
    } catch (error) {
      console.log(error);
    }
}

export async function batchRelateChatsToBookmarks(chatId: string, bookmarkIds: string[]) {
  const query = `
    RELATE chat:$chatId->has_resource->[$bookmarkIds]
    SET created_at = time::now();
  `;
  await db.query(query, { chatId, bookmarkIds });
}
export async function relateChatToBookmark(chatId: string, bookmarkId: string) {
  const query = `
    RELATE $chatId->has_resource->$bookmarkId SET created_at = time::now();
  `;
  const params = {
    chatId: `chat:${chatId}`,
    bookmarkId: `bookmark:${bookmarkId}`,
  };
  await db.query(query, params);
}

export async function relateParentToSubchat(parentChatId: string, subchatId: string) {
  const query = `
    RELATE $parentChatId->has_resource->$subchatId SET created_at = time::now();
  `;
  const params = {
    parentChatId: `chat:${parentChatId}`,
    subchatId: `chat:${subchatId}`,
  };
  await db.query(query, params);
}
interface Relationship {
  parentId: string;
  childId: string;
}

async function batchCreateRelationships(
  relationships: Relationship[],
  batchSize: number = 100
): Promise<void> {
  for (let i = 0; i < relationships.length; i += batchSize) {
    const batch = relationships.slice(i, i + batchSize);
    const queries = batch.map(
      (rel) => `RELATE chat:${rel.parentId}->has_resource->bookmark:${rel.childId} SET created_at = time::now();`
    ).join('\n');

    try {
      await db.query(queries);
      console.log(`Batch ${i / batchSize + 1} of relationships created successfully.`);
    } catch (error) {
      console.error(`Error creating batch ${i / batchSize + 1} of relationships:`, error);
    }
  }
}

export async function importBookmarkTreeInBatches(
  node: chrome.bookmarks.BookmarkTreeNode,
  parentId?: string,
  batchSize = 100
) {
  const bookmarksBatch: { id: string; path: string, title: string; url: string; dateAdded: number }[] = [];
  const chatsBatch: { id: string; name: string; parentId?: string; dateAdded: number }[] = [];
  const relationshipsBatch: { parentId: string; childId: string }[] = [];
  const getUrlPath = (url: string) => findPathToUrl(node, url);

  const processNode = (node: chrome.bookmarks.BookmarkTreeNode, parentId?: string) => {
    if (node.url) {
      // It's a bookmark
      bookmarksBatch.push({
        id: node.id,
        title: node.title,
        url: node.url,
        path: (getUrlPath(node.url) || []).join("/"),
        dateAdded: node.dateAdded || Date.now(),
      });
      if (parentId) {
        relationshipsBatch.push({ parentId, childId: node.id });
      }
    } else {
      // It's a folder
      chatsBatch.push({
        id: node.id,
        name: node.title,
        parentId: parentId || undefined,
        dateAdded: node.dateAdded || Date.now(),
      });
      // todo: subchats
      // if (parentId) {
      //   relationshipsBatch.push({ parentId, childId: node.id });
      // }
      // Recursively process child nodes
      if (node.children) {
        for (const child of node.children) {
          processNode(child, node.id);
        }
      }
    }
  };

  processNode(node, parentId);

  // Insert bookmarks in batches
  for (let i = 0; i < bookmarksBatch.length; i += batchSize) {
    const batch = bookmarksBatch.slice(i, i + batchSize);
    await batchUpsertBookmarks(batch);
    appEvent('UPSERT_BOOKMARK_BATCH', { batch })
  }

  // Insert chats in batches
  for (let i = 0; i < chatsBatch.length; i += batchSize) {
    const batch = chatsBatch.slice(i, i + batchSize);
    await batchUpsertChats(batch);
  }

  // Create relationships in batches
  for (let i = 0; i < relationshipsBatch.length; i += batchSize) {
    const batch = relationshipsBatch.slice(i, i + batchSize);
    await batchCreateRelationships(batch);
  }
}
export const loadChatBookmarks = async (chatId: string): Promise<{ sender: string, text: string, timestamp: Date }[]> => {
  try {
    let query = `
      SELECT in.*, out.* FROM has_resource WHERE in = ${chatId}
    `;
    const [result] = await db.query(query);
    console.log(chatId, query, result)

    // Extract the messages from the 'out' field
    return Array.isArray(result) ? result.map((edge: any) => edge.out) : []

  } catch (err) {
    console.error('Failed to load chat bookmarks:', err)
    return []
  }
}
// Upsert a resource by URL
export async function upsertResource(tab: any): Promise<any> {
  try {
    let url = tab.url;
    // console.log("upserting", url);

    // Check if a resource with the given URL exists
    const [existingResources] = await db.query<Resource[]>(`SELECT * FROM bookmark WHERE url = $url`, { url });
    if (Array.isArray(existingResources) && existingResources.length > 0) {
      // Resource exists, update the title if necessary
        return await db.merge(existingResources[0].id!, tab);
    } else {
      // Resource does not exist, create a new one
      return await db.create('bookmark', tab);
      // console.log(`Created new resource with URL: ${url}`);
    }
  } catch (error) {
    console.error('Error upserting resource:', error);
  }
}
export async function logRequest(request: any): Promise<any> {
  try {
      delete request.id;
      return await db.create('request', request);
  } catch (error) {
    console.error('Error upserting resource:', error);
  }
}

export async function appEvent(eventType: string, properties: Record<string, any>): Promise<void> {
  await stackAppEvent('app_event', {
    type: eventType,
    properties
  })
}
export async function createRuntimeEvent(message: any): Promise<any> {
  try {
      if (message.id) {
        message.originalId = message.id;
        delete message.id;
      }
      
      return await db.create('runtime_event', message);
  } catch (error) {
    console.error('Error runtime_event:', error);
  }
}
export async function stackAppEvent(table: string, message: any): Promise<any> {
  try {
      if (message.id) {
        message.originalId = message.id;
        delete message.id;
      }
      
      return await db.create(table, message);
  } catch (error) {
    console.error('Error app_event:', error);
  }
}

export async function createChatSessionEvent(name: string, properties: Record<string, any>): Promise<void> {
  await stackAppEvent('app_event', {
    name,
    type: 'CREATE_CHAT_SESSION',
    properties
  })
}

export async function createChatEvent(properties: Record<string, any>): Promise<void> {
  await stackAppEvent('app_event', {
    type: 'CREATE_CHAT',
    properties
  })
}

export async function renameChatEvent(name: string, properties: Record<string, any>): Promise<void> {
  await stackAppEvent('app_event', {
    name,
    type: 'RENAME_CHAT_SESSION',
    properties
  })
}

export async function createBookmarkEvent(url: string, properties?: Record<string, any>): Promise<void> {
  await stackAppEvent('app_event', {
    url,
    type: 'ADD_BOOKMARK',
    properties
  })
}

export async function createBookmarkFolderEvent(properties?: Record<string, any>): Promise<void> {
  await stackAppEvent('app_event', {
    type: 'ADD_BOOKMARK_FOLDER',
    properties
  })
}

export async function addResourceToChat(chatId: string, resourceId: string) {
    try {
      let query = `RELATE ${chatId}->has_resource->${resourceId}`;
      await db.query(query);
    } catch (error) {
      console.error('Error upserting resource:', error);
    }
}
export async function addResourceToChats(resourceId: string[], chats: string[]) {
    try {
      let query = `RELATE [${chats.join(",")}]->has_resource->bookmark:${resourceId}`;
      await db.query(query);
    } catch (error) {
      console.error('Error upserting resource:', error);
    }
}
export async function saveResource(chatId: string, { title, url }: { title: string; url: string; }): Promise<Resource | undefined> {
  try {
    // console.log("Upserting resource:", title, url, "for chatId:", chatId);

    // Check if a resource with the given URL exists
    const [existingResources] = await db.query<Resource[]>(`SELECT * FROM bookmark WHERE url = $url`, { url });

    let resource: Resource;

    if (Array.isArray(existingResources) && existingResources.length > 0) {
      // Resource exists, update the title if necessary
      resource = existingResources[0];
      // console.log("resource exists:", resource);
      if (resource.title !== title) {
        await db.merge(resource.id!, { title });
        // console.log(`Updated title for resource with URL: ${url}`);
      } else {
        // console.log(`Resource with URL: ${url} already exists with the same title.`);
      }
    } else {
      // Resource does not exist, create a new one
      const [createdResource] = await db.query<Resource[]>(`CREATE bookmark SET title = $title, url = $url, timestamp = time::now()`, { title, url });
      resource = createdResource;
      // console.log(createdResource);
      // console.log(`Created new resource ${resource.id} with URL: ${url}`);
    }
    if (resource.id) {
      try {
        await db.query(`RELATE ${chatId}->has_resource->${resource.id}`);
      } catch (error) {
        console.error('Error upserting resource:', error);
      }
      // console.log(`Related resource with URL: ${url} to chatId: ${chatId}`);
      return resource;
    } else {
      console.error("resource failed to save");
    }
  } catch (error) {
    console.error('Error upserting resource:', error);
  }
}

// Create a new component and associate it with a stack
export async function createComponent(component: Component): Promise<void> {
  try {
    await db.create("component", component);
    console.log(`Component "${component.name}" created successfully`);
  } catch (error) {
    console.error("Error creating component:", error);
  }
}

// Load components associated with a specific stack
export async function loadComponents(stackId: string): Promise<Component[]> {
  try {
    const result = await db.query<Component[]>(`SELECT * FROM component WHERE stackId = $stackId`, { stackId });
    return result || [];
  } catch (error) {
    console.error(`Error loading components for stack ${stackId}:`, error);
    return [];
  }
}

export async function loadChatInfo(id: string): Promise<any> {
  try {
    const [result] = await db.query<Chat[]>(`SELECT * from chat where id = ${id}`);
    return result[0];
  } catch (error) {
    console.error(`Error loading chat info ${id}:`, error);
    return undefined;
  }
}

// Save a message to the database and associate it with a chat, adding a timestamp to both
export const saveMessageToDB = async (chatId: string, message: { sender: string; text: string }) => {
  try {
    await db.query(`
      LET $timestamp = time::now();
      LET $msg = CREATE message CONTENT { sender: $sender, text: $text, timestamp: $timestamp };
      RELATE ${chatId}->has_message->$msg CONTENT { timestamp: $timestamp };
    `, { sender: message.sender, text: message.text })
  } catch (err) {
    console.error('Failed to save and relate message:', err)
  }
}

// Load chat history by querying the 'has_message' relationship and sorting by message timestamp
export const loadChatHistory = async (chatId: string): Promise<{ sender: string, text: string, timestamp: Date }[]> => {
  try {
    let query = `
      SELECT in.*, out.* FROM has_message WHERE in.id = ${chatId}
    `;
    const [result] = await db.query(query);

    // Extract the messages from the 'out' field
    const messages = Array.isArray(result) ? result.map((edge: any) => edge.out) : []

    // Sort the messages by the message timestamp in ascending order
    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return messages
  } catch (err) {
    console.error('Failed to load chat history:', err)
    return []
  }
}


// Get all chats
export const getAllChats = async () => {
  try {
    let [result] = await db.query(`select * from chat ORDER BY chat.created_at DESC`);
    return result ?? []
  } catch (err) {
    console.error('Failed to fetch chats:', err)
    return []
  }
}

// Create a new chat
export const createChatInDB = async (name = generateName()) => {
  try {
    let result: any[] = await db.create('chat', { name });

    return result[0]
  } catch (err) {
    console.error('Failed to create chat:', err)
  }
}

export const getOrCreateChat = async (name: string) => {
  try {
    const [result] = await db.query<Chat[]>(`SELECT * from chat where name = $name`, { name });
    console.log
    return result[0] ?? await createChatInDB(name);
  } catch (error) {
    console.log(error);
    throw error;
  }  
}


export const createChatForBookmarkFolder = async (folder: chrome.bookmarks.BookmarkTreeNode) => {
  try {
    // Check if a chat with the same name already exists
    let existingChatResult = await db.query(`SELECT * FROM chat WHERE name = $name AND parentId = $parentId FETCH has_subchat;`, { 
      name: folder.title,
      parentId: folder.parentId 
    });

    let chat;
    if (existingChatResult.length > 0) {
      // If the chat exists, return the existing chat
      chat = existingChatResult[0];
    }

    // If not found, create a new chat
    let result: any[] = await db.create('chat', {
      name: folder.title,
      parentId: folder.parentId,
      dateAdded: folder.dateAdded
    });

    chat = result[0];
   return chat; 
  } catch (err) {
    console.error('Failed to create or find chat:', err);
  }
};


export const hasSubchat = async (parentChatId: string, chatId: string) => {
  try {
      const relateQuery = `
        RELATE chat:${parentChatId}->has_subchat->chat:${chatId};
      `;
      await db.query(relateQuery);
  } catch (error) {
    console.error('Failed to create chat for bookmark folder:', error);
    throw error; // Re-throw the error after logging it
  }
}

// Delete a chat
export const deleteChatFromDB = async (chatId: string) => {
  try {
    await db.delete(`chat:${chatId}`)
  } catch (err) {
    console.error('Failed to delete chat:', err)
  }
}

// sidebar/db.ts

export async function deleteStackById(id: string) {
  await db.delete(`${id}`);
}


export async function getApiKey(): Promise<{id: string, key: string} | null> {
  // await db.signin({ user: 'root', pass: 'root' });
  const result = await db.query<{id: string, key: string}[][]>('SELECT key FROM api_keys WHERE id = api_keys:openai');

  return result[0][0] 
}

export async function saveApiKey(apiKey: string) {
  const encryptedKey = await encryptApiKey(apiKey);
  // await db.query("DELETE api_keys:openai");
  await db.query('DELETE api_keys:openai; UPSERT api_keys:openai SET key = $key WHERE key = $key', {
    key: encryptedKey,
  });
}

export const getRelatedChats = async (urls: string[]) => {
  return await db.query(
    `SELECT in.* as chat, out.* as resource FROM has_resource WHERE out.url IN $urls GROUP BY chat`
    , { urls }
  )
}

export const getRequestsSeries = async (period: string) => {
  return await db.query(`
      SELECT
          time::group(time::from::millis(math::round(payload.timeStamp)), '${period}') AS period,
          count() AS request_count
      FROM runtime_event
      WHERE type = 'REQUEST_COMPLETE'
      GROUP BY period
      ORDER BY period;
  `)
}

export const getEventFrequency = async (period: string) => {
  return await db.query(`
    SELECT
      type AS event_type,
      time::group(timestamp, '${period}') AS period,
      count() AS request_count
    FROM runtime_event
    GROUP BY event_type, period
    ORDER BY period, event_type;
  `);
}

export const getInitiatorFz = async () => {
  return await db.query(`
      SELECT
          payload.initiator AS site,
          count() AS request_count
      FROM runtime_event
      WHERE type = 'REQUEST_COMPLETE'
      GROUP BY site
      ORDER BY request_count DESC; -- Sort by the request count
  `);
}

export const getLatestTimestamp = async (source: string) => {
  try {
    const [result]: {source: string, timestamp: Date }[][] = await db.query(`
      SELECT timestamp FROM import
      WHERE source = $source
      ORDER BY timestamp DESC
      LIMIT 1
    `, { source });

    return result ? result[0]?.timestamp || null : null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

// Create a new chat
export const createImport = async (source: string = 'browser_bookmarks', data?: Record<string, any>) => {
  try {
    let result: any[] = await db.create('import', { source, data, timestamp: Date.now() });

    return result[0]
  } catch (err) {
    console.error('Failed to create chat:', err)
  }
}
