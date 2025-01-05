<template>
  <div class="flex flex-col min-h-[90vh] bg-white shadow-md rounded-lg max-w-5xl mx-auto overflow-hidden">
    <!-- Header -->
    <div class="flex-none p-4 bg-white shadow-md">
      <p class="text-sm text-gray-500">{{ chatId }}</p>
      <TabList :tabs="tabs" @tab-clicked="tabClickAction" />
    </div>

    <!-- Chat Messages Container -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-2"
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
</template>

<script lang="ts" setup>
export default {
  name: 'ChatComponent',
  props: {
    tabs: {
      type: Array,
      required: true,
    },
  },
  methods: {
    handleTabClick(tab) {
      // Emit an event to the parent component with the clicked tab's information
      this.$emit('tab-clicked', tab);
    },
  },
};
import { ref, onMounted, onUnmounted, nextTick, defineProps } from 'vue';
import { marked } from 'marked';
import { saveMessageToDB, loadChatHistory } from '../db';
import { agentQuery } from '../oaClient.ts';
import { bookmarkAssistant } from '../agents/index';
import TabList from '../components/TabList.vue';
const props = defineProps<{ chatId: string }>();

const chatId = ref<string>(props.chatId);
const tabs = ref([]);
const messages = ref<{ sender: string; text: string }[]>([]);
const inputMessage = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);
let agent: Agent;

onMounted(async () => {
  messages.value = await loadChatHistory(props.chatId);
  loadTabs()
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
const loadTabs = () => getTabs((tabResult) => tabs.value = tabResult);
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
  return parseMarkdown(formattedLinks);
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
</style>
