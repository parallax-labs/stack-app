
import { OpenAI } from 'openai';
import { getClient } from '..';
import {
  saveAllTabsToChat,
  saveCurrentTabAsResource,
  openOrFocusResource,
  closeOtherTabs,
  searchBookmarks,
  listBookmarks,
  describeDatabase,
  ToolDefinition
} from '../../tools';

import { Resource, runQuery } from '../../db';

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
export default (): ToolDefinition[] => toolImplementations;

export function toChatCompletionTools(tools: ToolDefinition[]): OpenAI.Chat.Completions.ChatCompletionTool[] {
  return tools.map(({ name, description, parameters }) => ({
    type: 'function',
    function: {
      name,
      description,
      ...(parameters && { parameters }),
    },
  }));
}
