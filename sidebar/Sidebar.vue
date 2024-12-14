<template>
  <div id="sidebar">
    <h1>Deployment Stack Navigator</h1>
    <button @click="createStack">Create New Stack</button>
    <ul>
      <li v-for="stack in stacks" :key="stack.id">{{ stack.name }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const stacks = ref([]);

// Fetch existing stacks from the database on component load
onMounted(async () => {
  await loadStacks();
});

// Create a new stack and save it to SurrealDB
async function createStack() {
  const name = prompt("Enter stack name:");
  if (!name) return;

  await window.db.create("stack", { name });
  await loadStacks();
}

// Load all stacks from SurrealDB
async function loadStacks() {
  try {
    const result = await window.db.select("stack");
    stacks.value = result || [];
  } catch (error) {
    console.error("Error loading stacks:", error);
  }
}
</script>

<style scoped>
#sidebar {
  font-family: Arial, sans-serif;
  padding: 20px;
  width: 300px;
}

h1 {
  font-size: 18px;
  margin-bottom: 10px;
}

button {
  padding: 10px;
  margin-bottom: 20px;
}
</style>
