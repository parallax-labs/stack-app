<template>
  <!-- Sessions List -->
  <div class="sessions-list">
    <div
      v-for="session in sessions"
      :key="session.id"
      class="session-item"
    >
      <div
        class="favorite-icon"
        @click.stop="toggleFavorite(session)"
        :class="{ favorited: session.isFavorite }"
        title="Mark as Favorite"
      >
        ★
      </div>
      <div class="session-details">
        <div class="session-name" @click="openSession(session.id)">
          {{ session.name || 'Untitled Session' }}
        </div>
        <div class="session-date">{{ formatDate(session.created_at) }}</div>
      </div>
      <div class="session-actions">
        <button
          class="open-button"
          @click="openSessionUrlsInNewWindow(session)"
        >
          Open
        </button>
        <span
          class="delete-session"
          @click="deleteSession(session.id)"
          title="Delete Session"
        >
          &times;
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SessionsList',
  props: {
    sessions: {
      type: Array,
      required: true,
    },
  },
  emits: [
    'toggleFavorite',
    'openSession',
    'openSessionUrlsInNewWindow',
    'deleteSession',
  ],
  setup(props, { emit }) {
    // Format date function
    const formatDate = (date) => {
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return new Date(date).toLocaleString(undefined, options);
    };

    // Function to toggle favorite status
    const toggleFavorite = (session) => {
      emit('toggleFavorite', session);
    };

    // Function to open a session in the extension sidebar
    const openSession = (sessionId) => {
      emit('openSession', sessionId);
    };

    // Function to open session URLs in a new window
    const openSessionUrlsInNewWindow = (session) => {
      emit('openSessionUrlsInNewWindow', session);
    };

    // Function to delete a session
    const deleteSession = (sessionId) => {
      emit('deleteSession', sessionId);
    };

    return {
      formatDate,
      toggleFavorite,
      openSession,
      openSessionUrlsInNewWindow,
      deleteSession,
    };
  },
});
</script>

<style scoped>
.sessions-list {
  display: flex;
  flex-direction: column;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.3s;
}

.session-item:hover {
  background-color: #f5f5f5;
}

.favorite-icon {
  font-size: 20px;
  color: #ccc;
  margin-right: 10px;
  cursor: pointer;
  transition: color 0.3s;
}

.favorite-icon.favorited {
  color: #FFD700; /* Gold color */
}

.favorite-icon:hover {
  color: #ffa500;
}

.session-details {
  flex-grow: 1;
}

.session-name {
  font-weight: bold;
  font-size: 16px;
  color: #333;
  cursor: pointer;
}

.session-date {
  font-size: 14px;
  color: #777;
}

.session-actions {
  display: flex;
  align-items: center;
}

.session-actions .open-button {
  margin-left: 5px;
  padding: 5px 10px;
  background-color: #007bff; /* Blue background */
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.session-actions .open-button:hover {
  background-color: #0056b3;
}

.delete-session {
  font-size: 18px;
  color: #dc3545; /* Red color */
  cursor: pointer;
  margin-left: 10px;
  transition: color 0.3s;
}

.delete-session:hover {
  color: #c82333;
}
</style>
