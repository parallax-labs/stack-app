<template>
  <div class="min-h-screen bg-white shadow-md rounded-lg p-6 max-w-5xl mx-auto">
    <header class="text-center mb-6">
        <p class="text-gray-600">
          <strong>📦 Stack</strong> is your intelligent, agile companion for managing browser tabs, history, bookmarks, and sessions—all while ensuring your data stays secure and private.
        </p>
    </header>

    <div class="max-w-md mx-auto">
      <h1>OpenAI</h1>
      <!-- API Key Form -->
      <form @submit.prevent="handleSaveApiKey" class="mb-6">
        <div class="mb-4">
          <label for="apiKey" class="block text-gray-700 font-semibold mb-2">API Key</label>
          <input
            type="password"
            id="apiKey"
            v-model="apiKey"
            placeholder="Enter your API key"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          class="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Save API Key
        </button>
      </form>

      <!-- Retrieve API Key Button -->
      <button
        @click="handleRetrieveApiKey"
        class="w-full bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 transition"
      >
        Retrieve API Key
      </button>

      <!-- Display Retrieved API Key -->
      <div v-if="retrievedApiKey" class="mt-4 p-4 bg-gray-100 rounded-lg">
        <p class="font-semibold text-gray-700">Retrieved API Key:</p>
        <p class="text-gray-600 break-all">{{ retrievedApiKey }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavigationBar from '../components/NavigationBar.vue';
import { ref } from 'vue';
import { saveApiKey, getApiKey } from '../db';
import { decryptApiKey } from '../encryption';

const apiKey = ref('');
const retrievedApiKey = ref<string | null>(null);

async function handleSaveApiKey() {
  try {
    await saveApiKey(apiKey.value);
    apiKey.value = '';
  } catch (error) {
    console.error('Error saving API key:', error);
  }
}

async function handleRetrieveApiKey() {
  try {
    let key = await getApiKey();
    console.log(key);
    if (!key.key) {
      console.log("key missing");
    }
    retrievedApiKey.value = await decryptApiKey(key.key);
  } catch (error) {
    console.error('Error retrieving API key:', error);
  }
}
</script>

<style scoped>
.tab-link {
  @apply py-2 px-4 text-gray-600 hover:text-blue-500 transition;
}
.tab-link-active {
  @apply border-b-2 border-blue-500 text-blue-500 font-semibold;
}
</style>
