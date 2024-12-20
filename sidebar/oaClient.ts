import { OpenAI } from 'openai';
import { getApiKey, Resource } from './db';
import { decryptApiKey } from './encryption';
import {
  saveAllTabsToChat,
  saveCurrentTabAsResource,
  openOrFocusResource,
  closeOtherTabs,
  searchBookmarks,
  listBookmarks,
  describeDatabase
} from './tools';

import { runQuery } from './db';

let client: OpenAI | null = null;

// Create OpenAI Client
export async function createOpenAIClient() {
  const record = await getApiKey();
  if (!record) {
    throw new Error('API key not found.');
  }
  const { key } = record;
  let apiKey = await decryptApiKey(key);
  if (!apiKey) {
    throw new Error('API key not found.');
  }

  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

// Get OpenAI Client (singleton)
export async function getClient(): Promise<OpenAI> {
  return client ? Promise.resolve(client) : (client = await createOpenAIClient());
}

type ToolDefinition = {
  name: string;
  description: string;
  parameters?: Record<string, any>;
  execute: (args?: any) => Promise<any>;
  parser?: (data: any) => string;
};

const toolImplementations: ToolDefinition[] = [
  {
    name: 'runQuery',
    description: 'Runs an arbitrary SQL command against the local SurrealDB database.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The SQL query to execute against the SurrealDB database.',
        },
      },
      required: ['query'],
    },
    execute: async ({ query }) => {
      console.log("called run query", query);
      return await runQuery(query);
    },
    parser: (data) => `<pre>${JSON.stringify(data, null, 2)}</pre>`,
  },
  {
    name: 'generateAndRunQuery',
    description: 'Generates a SurrealDB SQL query from a user prompt and executes it.',
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'A natural language description of the query to execute.',
        },
      },
      required: ['prompt'],
    },
    execute: async ({ prompt }) => {
      const openai = await getClient();
      const dbInfo = await describeDatabase();
      // Step 1: Generate SQL query from the prompt
      const sqlCompletion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: `You are an assistant that generates SurrealDB SQL queries based on user input. the database is descibed as ${JSON.stringify(dbInfo, null, 2)}` },
          { role: 'user', content: `Generate a SurrealDB SQL query for: "${prompt}"` },
        ],
      });

      const sqlQuery = sqlCompletion.choices[0]?.message?.content?.trim();
      if (!sqlQuery) throw new Error('Failed to generate SQL query.');

      console.log(`Generated SQL Query: ${sqlQuery}`);

      // Step 2: Execute the generated SQL query
      const result = await runQuery(sqlQuery);
      return { sqlQuery, result };
    },
    parser: (data) =>
      `<pre>**Generated SQL Query:**\n\`\`\`sql\n${data.sqlQuery}\n\`\`\`\n\n**Query Result:**\n${JSON.stringify(data.result, null, 2)}</pre>`,
  },
  {
    name: 'describeDatabase',
    description: 'Describes the schema of the SurrealDB database, listing available tables and fields.',
    execute: async () => {
      console.log("called describe database");
      return await describeDatabase();
    },
    parser: (data) => `Database Schema: ${JSON.stringify(data, null, 2)}`,
  },
  {
    name: 'saveCurrentTabAsResource',
    description: 'Saves the current tab as a bookmark in the database.',
    execute: async () => {
      return await saveCurrentTabAsResource();
    },
  },
  {
    name: 'saveAllTabsToChat',
    description: 'Saves all open tabs as bookmarks in the active chat.',
    execute: async () => {
      return await saveAllTabsToChat();
    },
    parser: (data) => `${data}`,
  },
  {
    name: 'openOrFocusResource',
    description: 'Opens a bookmark by URL or focuses the tab if already open.',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL of the bookmark to open or focus.' },
      },
      required: ['url'],
    },
    execute: async ({ url }) => {
      await openOrFocusResource(url);
    },
  },
  {
    name: 'closeOtherTabs',
    description: 'Closes all tabs except the active one.',
    execute: async () => {
      await closeOtherTabs();
    },
  },
  {
    name: 'searchBookmarks',
    description: 'Searches bookmarks based on a query string.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The search term to filter bookmarks.' },
      },
      required: ['query'],
    },
    execute: async ({ query }) => {
      console.log("called search bookmarks", query);
      return await searchBookmarks(query);
    },
    parser: (bookmarks: Resource[]) => {
      return bookmarks
        .map((bookmark: { title: string; url: string }) => `- [${bookmark.title}](${bookmark.url})`)
        .join('\n');
    },
  },
  {
    name: 'listBookmarks',
    description: 'Lists all saved bookmarks.',
    execute: async () => {
      return await listBookmarks();
    },
    parser: (bookmarks) => {
      return bookmarks
        .map((bookmark: { title: string; url: string }) => `- [${bookmark.title}](${bookmark.url})`)
        .join('\n');
    },
  },
];

function getToolsForOpenAI(): OpenAI.Chat.Completions.ChatCompletionTool[] {
  return toolImplementations.map(({ name, description, parameters }) => ({
    type: 'function',
    function: {
      name,
      description,
      ...(parameters && { parameters }),
    },
  }));
}
const systemPrompt = `

You are a Bookmark Manager Agent designed to efficiently manage browser bookmarks and tabs using a local SurrealDB database. Your primary objectives include organizing bookmarks, controlling browser tabs, and executing database queries to enhance user productivity.
You can generate and execute SQL queries based on natural language descriptions provided by the user.

**Available Functions:**

- **Save Current Tab as Bookmark:** Store the active browser tab as a new bookmark entry.
- **Save All Open Tabs as Bookmarks:** Capture all currently open browser tabs and save them as individual bookmark entries.
- **Open or Focus Bookmark:** Open a specified bookmark in a new tab or switch focus to it if already open.
- **Close Other Tabs:** Close all browser tabs except for the currently active one.
- **Search and List Bookmarks:** Retrieve and display bookmarks based on search criteria.
- **Associate/Unassociate Bookmarks with Stacks:** Link or unlink bookmarks to organizational stacks for better categorization.
- **Execute SQL Commands:** Run arbitrary SQL queries against the SurrealDB database to manage and retrieve data.
- **Retrieve Database Schema:** Access and understand the structure of the SurrealDB database to inform your operations.

**Interaction Protocols:**

- **User Commands:** Await and execute user instructions corresponding to the available functions.
- **Error Handling:** Provide clear error messages and suggest corrective actions when encountering issues.
- **Confirmation Prompts:** Seek user confirmation before performing actions that may result in data loss, such as closing tabs.

**Contextual Information:**

- **SurrealDB Structure:** Familiarize yourself with the database schema, including tables and fields related to bookmarks and stacks, to execute informed queries.

**Response Formatting:**

- **Acknowledgments:** Confirm successful completion of actions with concise messages.
- **Data Presentation:** Display retrieved data in a clear and organized format, such as tables or lists, for easy user comprehension.
- **Error Messages:** Clearly state the nature of errors and provide guidance on resolving them.

Adhere to these guidelines to provide efficient and user-friendly bookmark management services.
`;
// Chat Query with Tool Handling
export async function agentQuery(content: string): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> {
  const openai = await getClient();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content },
    ],
    tools: getToolsForOpenAI(),
  });

  const response = completion.choices[0]?.message;

  if (response.tool_calls) {
    for (const toolCall of response.tool_calls) {
      const { name, arguments: args } = toolCall.function;
      const tool = toolImplementations.find((t) => t.name === name);

      if (tool) {
        let data = await tool.execute(args ? JSON.parse(args) : undefined);
        if (data && typeof tool.parser == 'function') {
            response.content = tool.parser(data)
          } else {
            response.content = `[SUCCESS] ${name}: ${args}`
        }
      } else {
        console.warn(`Unknown tool call: ${name}`);
      }
    }
  }

  return response;
}
