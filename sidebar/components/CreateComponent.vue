<template>
  <div>
    <h1>Add Component to Stack {{ stackId }}</h1>
    <form @submit.prevent="createComponent">
      <label for="name">Component Name:</label>
      <input v-model="name" id="name" required />

      <label for="type">Component Type:</label>
      <select v-model="type" id="type" required>
        <option value="aws">AWS Lambda</option>
        <option value="gcp">GCP Function</option>
        <option value="datadog">Datadog Monitor</option>
        <option value="self-hosted">Self-Hosted Service</option>
      </select>

      <button type="submit">Add Component</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const stackId = route.params.id;

const name = ref('');
const type = ref('aws');

function createComponent() {
  console.log(`Adding component: ${name.value} of type: ${type.value} to stack ${stackId}`);
  router.push(`/stack/${stackId}`);
}
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
}
label {
  margin: 10px 0 5px;
}
input, select, button {
  margin-bottom: 15px;
}
</style>
