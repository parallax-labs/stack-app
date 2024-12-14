<template>
  <button @click="navigateToHome">Back</button>
  <div>
    <h1>Stack: {{ stackId }}</h1>
    <button @click="navigateToCreateComponent">Add Component</button>
    <ul>
      <li v-for="component in components" :key="component.id">
        {{ component.name }} ({{ component.type }})
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const stackId = route.params.id;

const components = ref([
  { id: 1, name: 'Lambda Function', type: 'AWS' },
  { id: 2, name: 'Datadog Monitor', type: 'Datadog' },
]);

function navigateToCreateComponent() {
  router.push(`/stack/${stackId}/create-component`);
}

function navigateToHome() {
  router.push('/');
}
</script>

<style scoped>
h1 {
  font-size: 20px;
}
button {
  margin-bottom: 20px;
}
li {
  padding: 10px;
  background-color: #f9f9f9;
  margin: 5px 0;
}
</style>
