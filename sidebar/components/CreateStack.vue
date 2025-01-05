<template>
  <div>
    <h1>Create New Stack</h1>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const name = ref('');
const platform = ref('aws');


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
