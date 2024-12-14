import { RecordId, Surreal } from 'surrealdb';
import { surrealdbWasmEngines } from '@surrealdb/wasm';

// Singleton instance of SurrealDB
export const db = new Surreal({
  engines: surrealdbWasmEngines(),
});

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
export interface Stack {
  id?: string;
  name: string;
  components?: Component[];
  [key: string]: unknown; // Index signature for compatibility
}

export interface Component {
  id?: string;
  name: string;
  type: string;
  platform?: string;
  stackId: string;
  [key: string]: unknown; // Index signature for compatibility
}

export interface Resource {
  id?: string;
  title: string;
  url: string;
  [key: string]: unknown;
}

export async function getResource(resourceId: RecordId<string> & string): Promise<Resource[] | unknown> {
  console.log(resourceId);
  let query = `SELECT *, <-has<-stack as stacks from resource where id = ${resourceId}`;
  console.log(query);
  let [results] = await db.query<Resource[]>(query);
  console.log(results);

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

// Save a message to the database
export const saveMessageToDB = async (message: { sender: string; text: string }) => {
  await db.create('message', message)
}

// Load chat history from the database
export const loadChatHistory = async () => {
  try {
    const history = await db.select('message')
    return history || []
  } catch (err) {
    console.error('Failed to load chat history:', err)
    return []
  }
}
