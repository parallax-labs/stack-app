<template>
    <!-- Persistent Header -->
    <div class="flex p-4 border-b bg-white flex-col">
      <SearchBar @search="handleSearch" placeholder="Search browsing history" />
      <div class="select-all-row pt-2">
        <div class="action-bar">
          <input
            type="checkbox"
            v-model="selectAll"
            @change="toggleSelectAll"
            class="tab-checkbox"
          />
          <label>Select All</label>
          <button
            class="action-button"
            @click="openChatWithSelectedTabs"
            :disabled="selectedTabs.length === 0"
          >
            Open Session
          </button>
          <button
            class="action-button delete-button"
            @click="deleteSelectedTabs"
            :disabled="selectedTabs.length === 0"
          >
            Delete All Selected
          </button>
        </div>
      </div>
    </div>
  <div class="tab-list">
    <div 
      v-for="tab in filteredTabs" 
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import Tab from '../bookmark_event.ts';
import { loadResourcesBatch, appEvent } from '../db';
import SearchBar from '../components/SearchBar.vue';
import SortOptions from '../components/SortOptions.vue';

const tabs = ref<Tab[]>([]);
const selectedTabs = ref<Tab[]>([]);
const selectAll = ref(true);
const searchQuery = ref('');



// Watch selectedTabs to update selectAll
watch(
  () => selectedTabs.value,
  () => {
    selectAll.value = allTabsSelected.value;
  }
);

onMounted(async () => {
  await loadTabs();
  chrome.tabs.onActivated.addListener(loadTabs);
  chrome.tabs.onUpdated.addListener(loadTabs);
});

onUnmounted(() => {
  chrome.tabs.onActivated.removeListener(loadTabs);
  chrome.tabs.onUpdated.removeListener(loadTabs);
});

const handleSearch = (query: string) => {
  searchQuery.value = query;
};

const filteredTabs = computed(() => {
  if (!searchQuery.value.trim()) {
    return tabs.value;
  }
  const query = searchQuery.value.toLowerCase();
  return tabs.value.filter((tab) => {
    const title = tab.title?.toLowerCase() || '';
    const url = tab.url?.toLowerCase() || '';
    return title.includes(query) || url.includes(query);
  });
});

// Computed property to check if all tabs are selected
const allTabsSelected = computed(() => {
  return (
    filteredTabs.value.length > 0 &&
    selectedTabs.value.length === filteredTabs.value.length
  );
});

const loadTabs = async () => {
  chrome.tabs.query({ currentWindow: true }, async (tabResult) => {
    tabs.value = tabResult;
    if (selectAll.value) {
      selectedTabs.value = [...filteredTabs.value];
    }
  });
};

const tabClickAction = (tab: Tab) => {
  if (tab.active) {
    chrome.windows.update(tab.windowId, { focused: true });
  } else {
    chrome.tabs.update(tab.id!, { active: true });
    chrome.windows.update(tab.windowId, { focused: true });
  }
};

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedTabs.value = [...filteredTabs.value];
  } else {
    selectedTabs.value = [];
  }
};

const closeTab = (tab: Tab) => {
  chrome.tabs.remove(tab.id!, () => {
    tabs.value = tabs.value.filter((t) => t.id !== tab.id);
    selectedTabs.value = selectedTabs.value.filter((t) => t.id !== tab.id);
  });
};

const openChatWithSelectedTabs = async () => {
  await appEvent('CREATE_CHAT', selectedTabs.value);
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
.scrollable-list {
  overflow-y: auto;
  flex-grow: 1;
}

/* Action bar styles */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* Centers the items horizontally */
  margin-top: 10px;
}

.action-bar input[type='checkbox'] {
  margin-right: 5px;
}

.action-bar label {
  margin-right: 20px; /* Adjust for spacing */
}

.action-button {
  padding: 10px;
  margin: 0 5px;
  background-color: #007bff; /* Blue background */
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.action-button:hover:not(:disabled) {
  background-color: #0056b3; /* Darker blue on hover */
}

/* Delete button specific styles */
.delete-button {
  background-color: #dc3545; /* Red background */
}

.delete-button:hover:not(:disabled) {
  background-color: #c82333; /* Darker red on hover */
}
</style>
