<template>
  <div class="tab-list flex flex-col min-h-[70vh] bg-white shadow-md rounded-lg max-w-5xl mx-auto overflow-hidden">
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
  tabs.value = props.tabs;
});

onUnmounted(() => {

});



const tabClickAction = (tab) => {
  const targetUrl = tab.url;

  if (!targetUrl) return;

  chrome.tabs.query({}, (allTabs) => {
    // Find if the URL is already open
    const existingTab = allTabs.find((t) => t.url === targetUrl);

    if (existingTab) {
      // If the URL is open, activate the tab
      chrome.tabs.update(existingTab.id!, { active: true });
    } else {
      // If the URL is not open, create a new tab and make it active
      chrome.tabs.create({ url: targetUrl });
    }
  });
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
