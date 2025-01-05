<template>
    <div class="select-all-row pl-2">
      <input 
        type="checkbox" 
        v-model="selectAll" 
        @change="toggleSelectAll" 
        class="tab-checkbox"
      />
    <button 
      class="open-chat-button" 
      @click="openChatWithSelectedTabs" 
      :disabled="selectedTabs.length === 0">
      Open Chat with Selected Pages
    </button>
    </div>
  <div class="tab-list">
    <div 
      v-for="tab in tabs" 
      :key="tab.id" 
      :class="['tab-item', { active: tab.active }]" 
      @click="tabClickAction(tab)"
    >
      <input 
        type="checkbox" 
        :value="tab" 
        v-model="selectedTabs" 
        class="tab-checkbox"
        @click.stop
      />
      <img v-if="tab.favIconUrl" :src="tab.favIconUrl" alt="Favicon" class="favicon" />
      <div class="tab-content">
        <div class="tab-title">{{ tab.title || 'Untitled' }}</div>
        <div class="tab-url">{{ tab.url }}</div>
        <div class="tab-chats" v-if="tab.chats && tab.chats.length">
          Mentioned in: 
          <span 
            v-for="(chat, index) in tab.chats" 
            :key="chat.id" 
            class="chat-link"
          >
            <a :href="chat.url" target="_blank">Chat {{ index + 1 }}</a>
            <span v-if="index < tab.chats.length - 1">, </span>
          </span>
</div>
      </div>
      <div class="tab-actions">
        <span class="close-tab" @click.stop="closeTab(tab)">&times;</span>
      </div>
    </div>


  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Tab from '../bookmark_event.ts';
import { loadResourcesBatch, createChatEvent } from '../db';

const tabs = ref([]);
const selectedTabs = ref([]);
const selectAll = ref(true);

onMounted(async () => {
  await loadTabs();
  chrome.tabs.onActivated.addListener(loadTabs);
  chrome.tabs.onUpdated.addListener(loadTabs);
});

onUnmounted(() => {
  chrome.tabs.onActivated.removeListener(loadTabs);
  chrome.tabs.onUpdated.removeListener(loadTabs);
});

const loadResourcesByTab = async (tabs: Tab[]) => {
  let resources = await loadResourcesBatch(tabs);

  return resources;
}

const loadTabs = async () => {
  chrome.tabs.query({ currentWindow: true }, async (tabResult) => {
    tabs.value = tabResult;
    if (selectAll.value) {
      selectedTabs.value = [...tabs.value];
    }
  });
};

const tabClickAction = (tab) => {
  if (tab.active) {
    chrome.windows.update(tab.windowId, { focused: true });
  } else {
    chrome.tabs.update(tab.id, { active: true });
    chrome.windows.update(tab.windowId, { focused: true });
  }
};

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedTabs.value = [...tabs.value];
  } else {
    selectedTabs.value = [];
  }
};

const closeTab = (tab) => {
  chrome.tabs.remove(tab.id, () => {
    tabs.value = tabs.value.filter((t) => t.id !== tab.id);
    selectedTabs.value = selectedTabs.value.filter((t) => t.id !== tab.id);
  });
};

const openChatWithSelectedTabs = async () => {
  await createChatEvent({ tabs: selectedTabs.value }) 
};
</script>

<style scoped>
.tab-list {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.tab-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.3s;
}

.tab-item:last-child {
  border-bottom: none;
}

.tab-item.active {
  background-color: #e6f7ff;
}

.tab-item:hover {
  background-color: #f5f5f5;
}

.tab-checkbox {
  margin-right: 10px;
}

.favicon {
  width: 16px;
  height: 16px;
  margin-right: 10px;
}

.tab-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.tab-title {
  font-weight: bold;
  font-size: 14px;
  color: #333;
}

.tab-url {
  font-size: 12px;
  color: #999;
}

.tab-chats {
  margin-top: 5px;
  font-size: 12px;
  color: #555;
}

.chat-link a {
  color: #007bff;
  text-decoration: none;
}

.chat-link a:hover {
  text-decoration: underline;
}

.tab-actions {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.close-tab {
  font-size: 14px;
  color: #ccc;
  cursor: pointer;
  padding: 5px;
  transition: color 0.3s;
}

.close-tab:hover {
  color: #f00;
}

.select-all-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.open-chat-button {
  margin: 0 auto; /* Centers the button horizontally */
  display: block; /* Ensures it takes up only the necessary space */
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.open-chat-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.open-chat-button:hover:not(:disabled) {
  background-color: #0056b3;
}
</style>
