<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Header Section -->
    <header class="flex items-center justify-between p-4 bg-white shadow-md">
      <h1 class="text-xl font-bold text-gray-700">Dashboard</h1>
      <nav class="flex space-x-4">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'px-4 py-2 rounded',
            activeTab === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
          ]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </nav>
    </header>

    <!-- Content Section -->
    <main class="flex-grow p-4">
      <component :is="currentView" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Import Components for Each Tab
import TabList from '../components/TabList.vue';
import ExploreView from '../components/MonitoringView.vue';
import FavoriteBookmarks from '../components/FavoriteBookmarks.vue';

const tabs = [
  { id: 'monitoring', label: 'Explore', component: ExploreView },
  { id: 'bookmarks', label: 'Bookmarks', component: FavoriteBookmarks },
];

const activeTab = ref('tabs');

const currentView = computed(() => {
  const tab = tabs.find((t) => t.id === activeTab.value);
  return tab ? tab.component : TabList;
});
</script>

<style scoped>
/* General Styling */
body {
  font-family: 'Inter', sans-serif;
}
</style>

