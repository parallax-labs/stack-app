<template>
  <div class="chat-list">
    <div
      v-for="chat in chats"
      :key="chat.chat.id"
      :class="['chat-item']"
    >
        <router-link
          :to="`/chat/${chat.chat.id}`"
          class="tab-link"
          active-class="tab-link-active"
        >
          <div class="chat-content">
              <div class="chat-title">{{ chat.chat.name }}</div>
            <div class="chat-time">{{ chat.chat.created_at }}</div>
          </div>
        </router-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Collapsible from './Collapsible.vue';
import { getRelatedChats } from '../db';
const props = defineProps<{
  isCollapsed: bool;
}>();
const chats = ref([]);

onMounted(() => {
  getChatsWithUrls();
  chrome.tabs.onActivated.addListener(getChatsWithUrls);
  chrome.tabs.onUpdated.addListener(getChatsWithUrls);
});

onUnmounted(() => {
  chrome.tabs.onActivated.removeListener(getChatsWithUrls);
  chrome.tabs.onUpdated.removeListener(getChatsWithUrls);
});

const tabCallback = async (tabs) => {
  const [chat_result] = await getRelatedChats(tabs.map(tab => tab.url));
  console.log("got chats", chat_result);

  chats.value = chat_result;
};

const getChatsWithUrls = async () => {
  chrome.tabs.query({ currentWindow: true }, async (tabs) => await tabCallback(tabs));
}


</script>

<style scoped>
.chat-list {
  display: flex;
  flex-direction: column;
  max-height: 30vh;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.3s;
}

.chat-item:last-child {
  border-bottom: none;
}

.chat-item.active {
  background-color: #e6f7ff;
}

.chat-item:hover {
  background-color: #f5f5f5;
}

.favicon {
  width: 16px;
  height: 16px;
  margin-right: 10px;
}

.chat-content {
  display: flex;
  flex-direction: column;
}

.chat-title {
  font-weight: bold;
  font-size: 14px;
  color: #333;
}

.chat-url {
  font-size: 12px;
  color: #999;
}
</style>
