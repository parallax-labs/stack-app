<template>
  <div class="timeline-view">
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
    <!-- Scrollable List -->
    <div class="p-4 bg-white rounded-lg shadow scrollable-list">
      <HistoryComponent
        :events="sortedEvents"
        v-model:selectedTabs="selectedTabs"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import SearchBar from '../components/SearchBar.vue';
import HistoryComponent from '../components/History.vue';

interface TabActivationEvent {
  id: string;
  timestamp: number;
  title: string;
  url: string;
  favIconUrl: string;
}

// Reactive variables
const history = ref<TabActivationEvent[]>([]);
const searchQuery = ref('');
const selectedTabs = ref<TabActivationEvent[]>([]);
const selectAll = ref(false);

// Handle search input
const handleSearch = (query: string) => {
  searchQuery.value = query ?? '';
};

// Fetch browsing history
const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
const oneWeekAgo = new Date().getTime() - millisecondsPerWeek;

onMounted(() => {
  chrome.history.search(
    {
      text: '',
      startTime: oneWeekAgo,
    },
    (results) => {
      history.value = results.map((e) => ({
        id: e.id,
        timestamp: e.lastVisitTime,
        title: e.title || 'No Title',
        url: e.url || '',
        favIconUrl: '', // Set default or fetch favicon
      }));
    }
  );
});

// Filter events based on the search query
const filteredEvents = computed<TabActivationEvent[]>(() => {
  if (!searchQuery.value.trim()) {
    return history.value;
  }
  const query = searchQuery.value.toLowerCase();
  return history.value.filter((event) => {
    const title = event.title.toLowerCase();
    const url = event.url.toLowerCase();
    return title.includes(query) || url.includes(query);
  });
});

// Sort filtered events by timestamp
const sortedEvents = computed(() => {
  return filteredEvents.value.slice().sort(
    (a, b) => b.timestamp - a.timestamp
  );
});

// Computed property to check if all tabs are selected
const allTabsSelected = computed(() => {
  return (
    filteredEvents.value.length > 0 &&
    selectedTabs.value.length === filteredEvents.value.length
  );
});

// Watch selectedTabs to update selectAll
watch(
  () => selectedTabs.value,
  () => {
    selectAll.value = allTabsSelected.value;
  }
);

// Toggle select all functionality
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedTabs.value = [...filteredEvents.value];
  } else {
    selectedTabs.value = [];
  }
};

// Function to open chat with selected tabs
const openChatWithSelectedTabs = () => {
  // Implement your logic here
  console.log('Opening chat with selected tabs:', selectedTabs.value);
};

// Function to delete selected tabs
const deleteSelectedTabs = () => {
  // Delete each selected tab from the history
  selectedTabs.value.forEach((tab) => {
    chrome.history.deleteUrl({ url: tab.url });
  });

  // Update the history array to remove deleted tabs
  history.value = history.value.filter(
    (tab) => !selectedTabs.value.includes(tab)
  );

  // Clear the selectedTabs array
  selectedTabs.value = [];

  // Reset the selectAll checkbox
  selectAll.value = false;
};
</script>

<style scoped>
/* Existing styles */
.timeline-view {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full viewport height */
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
