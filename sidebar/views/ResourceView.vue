<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Your Resources</h2>
    <ul class="space-y-4">
      <li
        v-for="resource in resources"
        :key="resource.id"
        @click="navigateToResource(resource.id)"
        class="p-4 border rounded-lg shadow-md flex justify-between items-center"
      >
        <!-- <a :href="resource.url" target="_blank" class="text-blue-500 underline"> -->
          {{ resource.title }}
        <!-- </a> -->
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { loadResources } from '../db';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const resources = ref([]);

function navigateToResource(id) {
  router.push(`/resource/${id}`);
}

onMounted(async () => {
  resources.value = await loadResources();
});
</script>
