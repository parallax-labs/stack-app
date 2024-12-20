<template>
  <button @click="navigateToHome">Back</button>
  <div>
    <h1>Resource: {{ resourceId }}</h1>
    <pre>{{resource}}</pre>
    <span>{{ resource.url}}</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getResource } from '../db.ts';

const route = useRoute();
const router = useRouter();
const resourceId = route.params.id;
const resource = ref({ url: "" }); 
const components = ref([]);

function navigateToCreateComponent() {
  router.push(`/stack/${stackId}/create-component`);
}

function navigateToHome() {
  router.push('/');
}

// Load Stacks on Component Mount
onMounted(async () => {
  resource.value = await getResource(resourceId);
});
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
