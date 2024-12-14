<template>
  <div>
    <h1>Create New Stack</h1>
    <form @submit.prevent="createStackAction">
      <label for="name">Stack Name:</label>
      <input v-model="name" id="name" required />

      <!-- <label for="platform">Platform:</label> -->
      <!-- <select v-model="platform" id="platform" required> -->
      <!--   <option value="aws">AWS</option> -->
      <!--   <option value="gcp">GCP</option> -->
      <!--   <option value="datadog">Datadog</option> -->
      <!--   <option value="self-hosted">Self-Hosted</option> -->
      <!-- </select> -->

      <button type="submit">Create Stack</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createStack, Stack } from '../db.ts';
const router = useRouter();
const name = ref('');
const platform = ref('aws');

async function createStackAction() {
  console.log(`Creating stack: ${name.value} on platform: ${platform.value}`);
  await createStack({ name: name.value, platform: platform.value });
  router.push('/');
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
