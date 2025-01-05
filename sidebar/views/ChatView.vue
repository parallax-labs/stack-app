<template>
    <!-- Header Section -->
    <div class="p-4 bg-blue-500 text-white shadow-md">
      <h1 class="text-2xl font-bold">{{ chatInfo?.name || 'Untitled Chat' }}</h1>
      <p class="text-sm">{{ chatInfo?.created_at ? new Date(chatInfo.created_at).toLocaleString() : 'Unknown Date' }}</p>
    </div>
  <div class="p-4 bg-white rounded-lg shadow">
    <!-- Sub-Tabs for Monitoring -->
    <div class="flex border-b">
      <button
        v-for="tab in uiTabList"
        :key="tab.id"
        :class="[
          'px-4 py-2',
          activeSubTab === tab.id
            ? 'border-b-2 border-blue-500 text-blue-500'
            : 'text-gray-600 hover:text-blue-500'
        ]"
        @click="activeSubTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Sub-Tab Content -->
    <div class="mt-4">
      <div v-if="activeSubTab === 'chat'">
        <!-- Chat Messages Container -->
        <div
          ref="messagesContainer"
          class="flex flex-col min-h-[70vh] bg-white shadow-md rounded-lg max-w-5xl mx-auto overflow-hidden"
        >
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="flex"
            :class="message.sender === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="px-4 py-2 rounded-lg"
              :class="message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
            >
              <p v-html="formatMessage(message)"></p>
            </div>
          </div>
          <!-- Loading Indicator -->
          <div v-if="isLoading" class="text-gray-500 text-sm mt-2">Assistant is typing...</div>
        </div>

        <!-- Input Bar -->
        <div class="flex-none p-4 bg-white shadow-md">
          <div class="flex items-center">
            <textarea
              v-model="inputMessage"
              @keyup.enter="sendMessage"
              placeholder="Type your message..."
              class="flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring focus:border-blue-300 resize-y"
              :disabled="isLoading"
              rows="1"
            ></textarea>
            <label for="file-input" class="bg-gray-200 text-gray-600 px-4 py-2 border-t border-b border-gray-300 cursor-pointer hover:bg-gray-300">
              📎
            </label>
            <input
              id="file-input"
              type="file"
              class="hidden"
              @change="handleFileUpload"
            />
            <button
              @click="sendMessage"
              class="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 disabled:bg-gray-400"
              :disabled="isLoading"
            >
              Send
            </button>
          </div>
        </div>
      </div>
      <!-- Requests Sub-Tab -->
      <div v-if="activeSubTab === 'bookmarks'">
        <!-- Time Range Picker -->
        <TabList :tabs="tabs" />
      </div>

      <!-- Notes Sub-Tab -->
      <div v-if="activeSubTab === 'notes'">
        <!-- Time Range Picker -->
        <TimeRangePicker @update="onTimeRangeUpdate" />
        <textarea
          v-model="notes"
          class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          placeholder="Write your notes here..."
          rows="6"
        ></textarea>
        <button
          @click="saveNotes"
          class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Notes
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick, defineProps } from 'vue';
import { marked } from 'marked';
import { loadChatInfo, saveMessageToDB, loadChatHistory, loadChatBookmarks } from '../db';
import { agentQuery } from '../oaClient.ts';
import { bookmarkAssistant } from '../agents/index';
import TabList from '../components/BookmarkList.vue';
const props = defineProps<{ chatId: string }>();
const chatInfo = ref<{ name: string, created_at: Date, id: Record<string, any>} | null>(null)
const chatId = ref<string>(props.chatId);
const tabs = ref([]);
const messages = ref<{ sender: string; text: string }[]>([]);
const inputMessage = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);
const uiTabList = [
  { id: "chat", label: "Chat" },
  { id: "bookmarks", label: "Bookmarks" },
  { id: "notes", label: "Notes" },
];
const activeSubTab = ref("chat");

let agent: Agent;

onMounted(async () => {
  chatInfo.value = await loadChatInfo(props.chatId);
  const history = await loadChatHistory(props.chatId);
  if (history && Array.isArray(history)) {
    messages.value = history.map((msg) => ({
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp,
    }));
  } else {
    console.warn("No chat history found.");
  }
  tabs.value = await loadChatBookmarks(props.chatId);

  // Add a greeting message
  const tabNames = tabs.value.map((tab) => tab.title || tab.url).join(", ");
  // Add a greeting message with formatted tabs
  const tabList = tabs.value
    .map((tab) => `<li>${tab.title || tab.url}</li>`)
    .join("");
  const greetingMessage = {
    sender: "assistant",
    text: `
      <p><strong>Hello!</strong> Welcome to your chat session. This session includes the following tabs:</p>
      <ul class="list-disc pl-6">${tabList || "<li>No tabs associated yet</li>"}</ul>
      <p>Feel free to ask questions or manage your bookmarks!</p>
    `,
  };
  messages.value.unshift(greetingMessage);

  chrome.tabs.onActivated.addListener(loadTabs);
  chrome.tabs.onUpdated.addListener(loadTabs);
  scrollToBottom();
});

onUnmounted(() => {
  chrome.tabs.onActivated.removeListener(loadTabs);
  chrome.tabs.onUpdated.removeListener(loadTabs);
});
const tabClickAction = (tab) => {
  if (tab.active) {
    // If the tab is already active, focus its window
    chrome.windows.update(tab.windowId, { focused: true });
  } else {
    // Otherwise, activate the tab
    chrome.tabs.update(tab.id, { active: true });
    // Optionally, focus the window containing the tab
    chrome.windows.update(tab.windowId, { focused: true });
  }
}
const loadTabs = async () => {
  let tabs = await loadChatBookmarks(props.chatId);
  tabs.value = tabs;
};
const getTabs = (tabCallback) => {
  chrome.tabs.query({ currentWindow: true }, tabCallback);
}
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return;
  if (!agent) {
    agent = await bookmarkAssistant(chatId.value);
  }
  const userMessage = { sender: 'user', text: inputMessage.value };
  messages.value.push(userMessage);
  await saveMessageToDB(props.chatId, userMessage);

  const userInput = inputMessage.value;
  inputMessage.value = '';
  isLoading.value = true;
  error.value = null;

  try {
    const data = await agent.query(userInput);

    let formattedResponse = data.content ?? 'No response.';

    if (data.function_call && data.function_call.name === 'listBookmarks') {
      const bookmarks = JSON.parse(data.function_call.arguments);
      formattedResponse += '\n' + bookmarks.map(
        (bookmark: { title: string; url: string }) =>
          `- [${bookmark.title}](${bookmark.url})`
      ).join('\n');
    }

    const assistantMessage = { sender: 'assistant', text: formattedResponse };
    messages.value.push(assistantMessage);
    await saveMessageToDB(props.chatId, assistantMessage);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred.';
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const parseMarkdown = (text: string) => {
  return text;
};

const formatMessage = (message: { text: string }) => {
  const formattedLinks = message.text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" class="underline text-blue-600">$1</a>'
  );
  return formattedLinks
  //return parseMarkdown(formattedLinks);
};

const formatTab = (tabJson) => JSON.stringify(tabJson, null, 2)

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    console.log('File selected:', file.name);
  }
};
</script>

<style scoped>
/* Ensure the outer container does not scroll */
.h-screen {
  overflow: hidden;
}

/* Customize scrollbar for chat window */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}
button {
  transition: color 0.2s, border-color 0.2s;
}
textarea {
  resize: none;
}
</style>
