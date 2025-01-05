<template>
  <div class="tab-list">
    <div
      v-for="tab in tabs"
      :key="tab.id"
      :class="['tab-item', { active: tab.active }]"
      @click="tabClickAction(tab)"
    >
      <img v-if="tab.favIconUrl" :src="tab.favIconUrl" alt="Favicon" class="favicon" />
      <div class="tab-content">
        <div class="tab-title">{{ tab.title || 'Untitled' }}</div>
        <div class="tab-url">{{ tab.url }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Collapsible from './Collapsible.vue';
const props = defineProps<{
  isCollapsed: bool;
  tabs: chrome.tabs.Tab[] | undefined
}>();
const tabs = ref([]);

onMounted(() => {
  loadTabs();
  chrome.tabs.onActivated.addListener(loadTabs);
  chrome.tabs.onUpdated.addListener(loadTabs);
});

onUnmounted(() => {
  chrome.tabs.onActivated.removeListener(loadTabs);
  chrome.tabs.onUpdated.removeListener(loadTabs);
});

const loadTabs = () => {
  if (props.tabs) {
    tabs.value = props.tabs;
    return;
  }
  chrome.tabs.query({ currentWindow: true }, (tabResult) => {
    tabs.value = tabResult;
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
</script>

<style scoped>
.tab-list {
  display: flex;
  flex-direction: column;
  max-height: 30vh;
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

.favicon {
  width: 16px;
  height: 16px;
  margin-right: 10px;
}

.tab-content {
  display: flex;
  flex-direction: column;
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
</style>
