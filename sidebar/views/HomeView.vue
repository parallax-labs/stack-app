
<template>
  <!-- Button Bar -->
  <div class="flex flex-wrap justify-center gap-4 mb-6">
    <button @click="navigateToCreateStack" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
      ➕
    </button>
    <button @click="importStackFromYaml" class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
      📥
    </button>
    <button @click="bookmarkCurrentPage" class="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600">
      🔖
    </button>
  </div>

  <!-- Stacks Section -->
  <div class="w-full max-w-5xl bg-white shadow-lg rounded-lg p-8">
    <section class="h-96 overflow-y-auto">
      <div v-if="stacks.length > 0" class="space-y-4">
        <div
          v-for="stack in stacks"
          :key="stack.id"
          class="flex items-center justify-between p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
        >
          <div @click="navigateToStack(stack.id)" class="flex-1">
            <h3 class="font-semibold">{{ stack.name }}</h3>
            <div class="flex items-center space-x-6 text-gray-600">
              <span class="text-sm">📅 {{ formatDate(stack.created_at) || 'N/A' }}</span>
              <span class="text-sm">🧩 {{ stack.components?.length || 0 }} Components</span>
            </div>
          </div>
          <button
            @click.stop="deleteStack(stack.id)"
            class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <div v-else class="text-center text-gray-500">
        No stacks available. Create a new stack to get started!
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import generateStackName from '../names.ts';
import { loadStacks, upsertResource, createStack, deleteStackById } from '../db';

const router = useRouter();
const stacks = ref([]);

// Navigation Functions
async function navigateToCreateStack() {
  await createStack({
    name: generateStackName()
  });
  stacks.value = await loadStacks();
}

function navigateToStack(id) {
  router.push(`/stack/${id}`);
}

// Function to Delete a Stack
async function deleteStack(id) {
  if (confirm('Are you sure you want to delete this stack?')) {
    // Call your database function to delete the stack by ID
    await deleteStackById(id);
    stacks.value = await loadStacks();
  }
}

async function getActiveTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve({ title: tabs[0]?.title || '', url: tabs[0]?.url || '' });
      }
    });
  });
}

async function bookmarkCurrentPage() {
  const tab = await getActiveTab();
  const title = tab.title;
  const url = tab.url;
  console.log(`Bookmarking page: ${title} - ${url}`);
  await upsertResource(tab);
}

function importStackFromYaml() {
  console.log('Importing stack from YAML...');
}

// Helper Function to Format Date
function formatDate(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleDateString() : '';
}

// Load Stacks on Component Mount
onMounted(async () => {
  stacks.value = await loadStacks();
});
</script>


<style scoped>
/* Ensure the container takes full width */
section {
  width: 100%;
}

</style>
