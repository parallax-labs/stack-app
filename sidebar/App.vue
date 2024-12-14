<template>
  <div class="min-h-screen bg-white shadow-md rounded-lg p-6 max-w-5xl mx-auto">
      <nav class="flex space-x-4 mb-6 border-b pb-2 justify-center">
        <router-link to="/chat" class="tab-link" active-class="tab-link-active">
         💬
        </router-link>
        <router-link to="/stacks" class="tab-link" active-class="tab-link-active">
          📦
        </router-link>
        <router-link to="/components" class="tab-link" active-class="tab-link-active">
          🧩
        </router-link>
        <router-link to="/resources" class="tab-link" active-class="tab-link-active">
          🔖
        </router-link>
        <router-link to="/" class="tab-link" active-class="tab-link-active">
         ⚙️
        </router-link>
      </nav>
      <router-view />
  </div>
</template>

<style scoped>
.tab-link {
  @apply py-2 px-4 text-gray-600 hover:text-blue-500 transition;
}
.tab-link-active {
  @apply border-b-2 border-blue-500 text-blue-500 font-semibold;
}
</style>

