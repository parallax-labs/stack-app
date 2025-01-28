<template>
  <div class="sessions-view">
    <!-- Persistent Header -->
    <div class="flex p-4 border-b bg-white flex-col">
      <SearchBar @search="handleSearch" placeholder="Search sessions" />
      <div class="action-bar pt-2">
        <button
          class="action-button new-session-button w-full"
          @click="createNewSession"
        >
          New Session
        </button>
      </div>
    </div>
    <!-- Scrollable List -->
    <div class="p-4 bg-white rounded-lg shadow scrollable-list">
      <SessionsList
        :sessions="sortedSessions"
        @toggleFavorite="toggleFavorite"
        @openSession="openSession"
        @openSessionUrlsInNewWindow="openSessionUrlsInNewWindow"
        @deleteSession="deleteSession"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SearchBar from '../components/SearchBar.vue';
import SessionsList from '../components/SessionsList.vue';
import {
  getAllChats,
  deleteChatFromDB,
  updateChatInDB,
  createChatInDB,
} from '../db';

const router = useRouter();

const sessions = ref([]);
const searchQuery = ref('');

// Fetch sessions on mount
onMounted(async () => {
  sessions.value = await fetchSessions();
});

// Function to fetch sessions
const fetchSessions = async () => {
  const chatResult = await getAllChats();
  return chatResult.sort((a, b) => b.created_at - a.created_at);
};

// Handle search input
const handleSearch = (query: string) => {
  searchQuery.value = query ?? '';
};

// Filter sessions based on the search query
const filteredSessions = computed(() => {
  if (!searchQuery.value.trim()) {
    return sessions.value;
  }
  const query = searchQuery.value.toLowerCase();
  return sessions.value.filter((session) => {
    const name = session.name.toLowerCase();
    return name.includes(query);
  });
});

// Sort sessions to show favorites on top
const sortedSessions = computed(() => {
  return filteredSessions.value.sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    // If both have the same favorite status, sort by created_at
    return b.created_at - a.created_at;
  });
});

// Function to toggle favorite status
const toggleFavorite = async (session) => {
  session.isFavorite = !session.isFavorite;
  await updateChatInDB(session.id, { isFavorite: session.isFavorite });
  // Update sessions list
  sessions.value = await fetchSessions();
};

// Function to create a new session
const createNewSession = async () => {
  const chat = await createChatInDB();
  openSession(chat.id);
};

// Function to delete a session
const deleteSession = async (sessionId: string) => {
  await deleteChatFromDB(sessionId);
  // Update sessions list
  sessions.value = await fetchSessions();
};

// Function to open a session in the extension sidebar
const openSession = (sessionId: string) => {
  router.push({ name: 'ChatView', params: { chatId: sessionId } });
};

// Function to open session URLs in a new window
const openSessionUrlsInNewWindow = async (session) => {
  // Assume you have a function to get URLs associated with a session
  const urls = await getSessionUrls(session.id);

  // Open a new window with the session URLs
  chrome.windows.create({ url: urls });
};

// Mock function to get session URLs
const getSessionUrls = async (sessionId: string) => {
  // Implement this function to return an array of URLs associated with the session
  // For now, return a placeholder array
  return ['https://example.com', 'https://another-example.com'];
};
</script>

<style scoped>
.sessions-view {
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
  flex-wrap: wrap;
}

.action-bar .action-button {
  margin-right: 10px;
}

.action-bar .search-bar {
  margin-left: auto;
  flex-grow: 1;
}

.action-button {
  padding: 10px;
  background-color: #007bff; /* Blue background */
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.new-session-button {
  background-color: #28a745; /* Green background */
}

.new-session-button:hover {
  background-color: #218838;
}
</style>
