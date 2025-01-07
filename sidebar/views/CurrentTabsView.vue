<template>
  <div class="timeline-view">
    <!-- Persistent Header -->
    <div class="flex p-4 border-b bg-white flex-col">
      <SearchBar @search="handleSearch" placeholder="Search open tabs" />
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
            @click="openSessionWithSelectedTabs"
            :disabled="selectedTabs.length === 0"
          >
            Open Session
          </button>
          <button
            class="action-button delete-button"
            @click="closeSelectedTabs"
            :disabled="selectedTabs.length === 0"
          >
            Close All Selected
          </button>
        </div>
      </div>
    </div>
    <!-- Scrollable List -->
    <div class="p-4 bg-white rounded-lg shadow scrollable-list">
      <TabList
        :tabs="filteredTabs"
        v-model:selectedTabs="selectedTabs"
      />
    </div>
  </div>
</template>

<!-- ... rest of your script and styles remain the same ... -->


<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import SearchBar from '../components/SearchBar.vue';
import TabList from '../components/TabList.vue'; // Rename ActiveTabSelect.vue to TabList.vue for consistency

// Reactive variables
const tabs = ref([]);
const selectedTabs = ref([]);
const selectAll = ref(true); // Initialize to true
const searchQuery = ref('');

// Handle search input
const handleSearch = (query: string) => {
  searchQuery.value = query;
};

// Computed property for filtered tabs
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

// Watch selectedTabs and filteredTabs to update selectAll
watch(
  [() => selectedTabs.value, () => filteredTabs.value],
  () => {
    selectAll.value = allTabsSelected.value;
  },
  { deep: true }
);

// Toggle select all functionality
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedTabs.value = [...filteredTabs.value];
  } else {
    selectedTabs.value = [];
  }
};

// Fetch open tabs
const loadTabs = async () => {
  chrome.tabs.query({ currentWindow: true }, async (tabResult) => {
    tabs.value = tabResult;

    // Wait for next tick to ensure computed properties (filteredTabs) are updated
    await nextTick();

    if (selectAll.value) {
      selectedTabs.value = [...filteredTabs.value];
    } else {
      // Remove any tabs that are no longer open
      selectedTabs.value = selectedTabs.value.filter((tab) =>
        tabs.value.some((t) => t.id === tab.id)
      );
    }
  });
};

// Fetch data on mount
onMounted(() => {
  loadTabs();
  chrome.tabs.onActivated.addListener(loadTabs);
  chrome.tabs.onUpdated.addListener(loadTabs);
  chrome.tabs.onCreated.addListener(loadTabs);
  chrome.tabs.onRemoved.addListener(loadTabs);
});

// Clean up listeners on unmount
onUnmounted(() => {
  chrome.tabs.onActivated.removeListener(loadTabs);
  chrome.tabs.onUpdated.removeListener(loadTabs);
  chrome.tabs.onCreated.removeListener(loadTabs);
  chrome.tabs.onRemoved.removeListener(loadTabs);
});

// Function to open session with selected tabs
const openSessionWithSelectedTabs = () => {
  // Implement your logic here
  console.log('Opening session with selected tabs:', selectedTabs.value);
};

// Function to close selected tabs
const closeSelectedTabs = () => {
  const tabIds = selectedTabs.value
    .map((tab) => tab.id)
    .filter((id): id is number => id !== undefined);
  chrome.tabs.remove(tabIds, () => {
    // Update the tabs list and selectedTabs
    loadTabs();
  });
};
</script>

<style scoped>
/* Use the same styles as TimelineView.vue */
.timeline-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.scrollable-list {
  overflow-y: auto;
  flex-grow: 1;
}

/* Action bar styles */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 10px;
}

.action-bar input[type='checkbox'] {
  margin-right: 5px;
}

.action-bar label {
  margin-right: 20px;
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
  background-color: #0056b3;
}

/* Delete button specific styles */
.delete-button {
  background-color: #dc3545; /* Red background */
}

.delete-button:hover:not(:disabled) {
  background-color: #c82333;
}
</style>
