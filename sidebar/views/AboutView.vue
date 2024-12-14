<template>
  <div class="min-h-screen bg-white shadow-md rounded-lg p-6 max-w-5xl mx-auto">
      <header class="text-center mb-6">
        <h1 class="text-4xl font-bold mb-2">
          📦 Stack
        </h1>
        <p class="text-gray-600">
          Organize and manage links to repositories, documentation, logs, and monitors by application.
          Compatible with Backstage YAML for easy integration.
        </p>
      </header>
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

