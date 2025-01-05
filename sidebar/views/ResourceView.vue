<template>
    <div class="flex-1 overflow-y-auto bg-white rounded shadow p-4">
      <ul>
        <li
          v-for="resource in resources"
          :key="resource.id"
          class="flex justify-between items-center p-2 border-b hover:bg-gray-50 cursor-pointer"
        >
          <div>
            <p class="font-semibold">{{ resource.title }}</p>
          </div>
          <button @click.stop="deleteResource(resource.id)" class="text-red-500 hover:underline">Delete</button>
        </li>
      </ul>
      <p v-if="resources.length === 0" class="text-gray-500 text-sm">No resources available.</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { loadResources } from '../db';
import { useRoute, useRouter } from 'vue-router';
import NavigationBar from '../components/NavigationBar.vue';

const route = useRoute();
const router = useRouter();
const resources = ref([]);

function navigateToResource(id) {
  router.push(`/resource/${id}`);
}

async function deleteResource(resourceId) {
  console.log(resourceId)
}

onMounted(async () => {
  resources.value = await loadResources();
});
</script>

<style scoped>
li {
  transition: background-color 0.2s;
}
</style>
