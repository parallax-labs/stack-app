<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Your Components</h2>
    <ul class="space-y-4">
      <li
        v-for="component in components"
        :key="component.id"
        class="p-4 border rounded-lg shadow-md flex justify-between items-center"
      >
        <span class="font-semibold">{{ component.name }}</span>
        <span>{{ component.type }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { loadComponents } from '../db';

const components = ref([]);

onMounted(async () => {
  components.value = await loadComponents();
});
</script>
