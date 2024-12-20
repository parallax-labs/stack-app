import { RecordId, Surreal } from 'surrealdb';
import { surrealdbWasmEngines } from '@surrealdb/wasm';
import generateName from './names';
import { encryptApiKey } from './encryption';

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
export type Stack = {
  id?: string;
  name: string;
  components?: Component[];
  [key: string]: unknown; // Index signature for compatibility
}

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

// Function to check if the page is saved in SurrealDB
export async function isPageSaved(url: string): Promise<boolean> {
  console.log(`is page saved? ${url}`);
  const query = 'SELECT * FROM resource WHERE url = $url LIMIT 1;';
  const result = await db.query(query, { url });
  console.log(result[0]);
  return Array.isArray(result[0]) && result[0].length > 0;
}

export async function getResource(resourceId: RecordId<string> & string): Promise<Resource[] | unknown> {
  let query = `SELECT *, <-has<-stack as stacks from resource where id = ${resourceId}`;
  console.log(query);
  let [results] = await db.query<Resource[]>(query);

  return results[0];
}

export async function loadResources(): Promise<Resource[]> {
  return await db.select<Resource>('resource') || [];
}
// Upsert a resource by URL
export async function upsertResource({ title, url }: { title: string, url: string }): Promise<void> {
  try {
    console.log("upserting", title, url);
    // Check if a resource with the given URL exists
    const [existingResources] = await db.query<Resource[]>(`SELECT * FROM resource WHERE url = $url`, { url });
    if (Array.isArray(existingResources) && existingResources.length > 0) {
      // Resource exists, update the title if necessary
      const resource = existingResources[0];
      if (resource.title !== title) {
        await db.merge(resource.id!, { title });
        console.log(`Updated title for resource with URL: ${url}`);
      } else {
        console.log(`Resource with URL: ${url} already exists with the same title.`);
      }
    } else {
      // Resource does not exist, create a new one
      await db.create('resource', { title, url });
      console.log(`Created new resource with URL: ${url}`);
    }
  } catch (error) {
    console.error('Error upserting resource:', error);
  }
}


export async function saveResource(chatId: string, { title, url }: { title: string; url: string; }): Promise<void> {
  try {
    console.log("Upserting resource:", title, url, "for chatId:", chatId);

    // Check if a resource with the given URL exists
    const [existingResources] = await db.query<Resource[]>(`SELECT * FROM resource WHERE url = $url`, { url });

    let resourceId: string;

    if (Array.isArray(existingResources) && existingResources.length > 0) {
      // Resource exists, update the title if necessary
      const resource = existingResources[0];
      resourceId = resource.id!.toString();
      console.log("resource exists:", resource, resourceId);
      if (resource.title !== title) {
        await db.merge(resource.id!, { title });
        console.log(`Updated title for resource with URL: ${url}`);
      } else {
        console.log(`Resource with URL: ${url} already exists with the same title.`);
      }
    } else {
      // Resource does not exist, create a new one
      const [createdResource] = await db.query<Resource[]>(`CREATE resource SET title = $title, url = $url, timestamp = time::now()`, { title, url });
      resourceId = createdResource.id!;
      console.log(`Created new resource ${resourceId} with URL: ${url}`);
    }
    try {
      await db.query(`
        RELATE ${chatId}->has_resource->${resourceId}
      `);
    } catch (error) {
      console.error('Error upserting resource:', error);
    }
    console.log(`Related resource with URL: ${url} to chatId: ${chatId}`);
  } catch (error) {
    console.error('Error upserting resource:', error);
  }
}

// Create a new stack and save it to SurrealDB
export async function createStack(stack: Stack): Promise<void> {
  try {
    await db.create("stack", stack); // Pass the stack object directly
    console.log(`Stack "${stack.name}" created successfully`);
  } catch (error) {
    console.error("Error creating stack:", error);
  }
}

// Load all stacks from SurrealDB
export async function loadStacks(): Promise<Stack[]> {
  try {
    const result = await db.select<Stack>("stack");
    return result || [];
  } catch (error) {
    console.error("Error loading stacks:", error);
    return [];
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
    console.log(chatId)
    const [result] = await db.query(`
      SELECT out.* FROM has_message WHERE in = ${chatId}
    `)

    console.log(result)

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
    return await db.select('chat') || []
  } catch (err) {
    console.error('Failed to fetch chats:', err)
    return []
  }
}

// Create a new chat
export const createChatInDB = async () => {
  try {
    let name = generateName();
    let result: any[] = await db.create('chat', { name, active: true });

    return result[0]
  } catch (err) {
    console.error('Failed to create chat:', err)
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

// Get all stacks
export const getAllStacks = async () => {
  try {
    return await db.select('stack') || []
  } catch (err) {
    console.error('Failed to fetch stacks:', err)
    return []
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
