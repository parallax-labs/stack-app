<template>
  <ul class="space-y-2">
    <li
      v-for="node in bookmarks"
      :key="node.id"
      class="block pl-4 border-l-2 border-gray-200"
    >
      <!-- Icon for folder or bookmark -->
      <div class="flex items-center space-x-2">
        <span v-if="node.children" class="text-blue-500">📂</span>
        <span v-else class="text-gray-500">🔗</span>
        <!-- Node name -->
        <span class="flex-1 truncate">{{ node.title }}</span>
        <!-- Action buttons -->
        <button
          class="text-sm text-blue-500 hover:underline"
          @click="$emit('chat', node.id)"
        >
          Chat
        </button>
        <button
          class="text-sm text-red-500 hover:underline"
          @click="$emit('delete', node.id)"
        >
          Delete
        </button>
      </div>
      <!-- Recursive children -->
      <BookmarkTree
        v-if="node.children"
        :bookmarks="node.children"
        @add-folder="$emit('add-folder', ...arguments)"
        @add-bookmark="$emit('add-bookmark', ...arguments)"
        @chat="$emit('chat', $event)"
        @delete="$emit('delete', ...arguments)"
      />
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    bookmarks: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped>
/* Add additional styles if necessary */
</style>

