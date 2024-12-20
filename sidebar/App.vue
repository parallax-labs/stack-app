<template>
  <nav class="fixed top-0 left-0 w-full z-50 bg-white">
    <div class="flex space-x-4 border-b justify-center">
      <router-link to="/chats" class="tab-link" active-class="tab-link-active">
        📦
      </router-link>
      <router-link to="/resources" class="tab-link" active-class="tab-link-active">
        🔖
      </router-link>
      <router-link to="/" class="tab-link" active-class="tab-link-active">
        ⚙️
      </router-link>
    </div>
    <NavigationBar />
  </nav>
  <div class="pt-24">
    <router-view />
  </div>
</template>


<script setup lang="ts">
import NavigationBar from './components/NavigationBar.vue';
</script>

<style scoped>
.tab-link {
  @apply py-2 px-4 text-gray-600 hover:text-blue-500 transition;
}
.tab-link-active {
  @apply border-b-2 border-blue-500 text-blue-500 font-semibold;
}
</style>

