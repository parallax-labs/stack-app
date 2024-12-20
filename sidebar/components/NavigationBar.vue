<template>
  <div class="flex items-center justify-between gap-2 p-2 bg-gray-100 rounded-md shadow-md">
    <!-- Navigate Back Button -->
    <button
      @click="navigateBack"
      class="nav-button bg-gray-500 hover:bg-gray-600"
      :disabled="false"
      aria-label="Go Back"
    >
      ⬅️
    </button>

    <!-- Action Buttons Container -->
    <div class="flex gap-2">
      <button
        @click="createChat"
        class="nav-button bg-blue-500 hover:bg-blue-600"
        aria-label="Create Stack"
      >
        ➕
      </button>
      <button
        @click="bookmarkCurrentPage"
        class="nav-button bg-yellow-500 hover:bg-yellow-600"
        aria-label="Bookmark Current Page"
      >
        🔖
      </button>
    </div>

    <!-- Navigate Forward Button -->
    <button
      @click="navigateForward"
      class="nav-button bg-gray-500 hover:bg-gray-600"
      :disabled="false"
      aria-label="Go Forward"
    >
      ➡️
    </button>
  </div>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { createChatInDB } from '../db';

const router = useRouter();
const navigationStack = ref<string[]>([]);
const currentIndex = ref(-1);
const searchQuery = ref('');

const navigateBack = () => {
  router.back();
};

const navigateForward = () => {
  router.forward()
};
// Create a new chat
const createChat = async () => {
  let chat = await createChatInDB();
  openChat(chat.id);
}

// Open chat by navigating to ChatView
const openChat = (chatId: string) => {
  router.push({ name: 'ChatView', params: { chatId } })
}

</script>

<style scoped>
.nav-button {
  @apply flex items-center justify-center w-10 h-10 text-white rounded-md shadow-md disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
