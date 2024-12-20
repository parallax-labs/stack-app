import { OpenAI } from 'openai';

import systemPrompt from './systemPrompt';
import { getClient } from '../openai';
import getTools, { toChatCompletionTools } from './tools';
import { ToolDefinition } from '../../tools';
import { loadChatHistory } from '../../db';
// Chat Query with Tool Handling
export type AgentProps = {
  chatId: string,
  model?: string,
  tools?: ToolDefinition[],
  systemPrompt?: string
}

export class Agent {
  chatId: string;
  tools: ToolDefinition[] = [];
  systemPrompt: string = "you're a helpful agent";
  model: string = 'gpt-4';
  client: OpenAI;
  constructor(client: OpenAI, { chatId, tools, systemPrompt, model }: AgentProps) {
    this.chatId = chatId;
    if (tools) {
      this.tools = tools;
    }
    if (systemPrompt) {
      this.systemPrompt = systemPrompt;
    }
    if (model) {
      this.model = model;
    }
    this.client = client; 
  }
  async getMessages(): Promise<OpenAI.Chat.ChatCompletionMessageParam[]> {
    console.log(this.chatId.toString())
    let history = await loadChatHistory(this.chatId.toString());
    let messages = history.map(
          (message) => ({
            role: message.sender,
            content: message.text
          } as OpenAI.Chat.ChatCompletionMessageParam)
    ).reverse().slice(0, 5);
    return [
        { role: 'system', content: this.systemPrompt },
        ...messages
    ];
  } 
  async query(content: string): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> {
    let messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      ...(await this.getMessages()),
      { role: 'user', content },
    ];
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages, 
      tools: toChatCompletionTools(this.tools)
    });

    const response = completion.choices[0]?.message;

    if (response.tool_calls) {
      for (const toolCall of response.tool_calls) {
        const { name, arguments: args } = toolCall.function;
        const tool = this.tools.find((t) => t.name === name);

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

}

export const bookmarkAssistant = async (chatId: string) => new Agent(await getClient(), { systemPrompt, tools: getTools(), chatId })
