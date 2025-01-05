<template>
  <div>
    <button
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      @click="isAdding = true"
    >
      Add Bookmark
    </button>
    <div v-if="isAdding" class="mt-2">
      <input
        type="text"
        v-model="bookmarkName"
        placeholder="Bookmark name"
        class="w-full p-2 border rounded"
      />
      <input
        type="url"
        v-model="bookmarkUrl"
        placeholder="Bookmark URL"
        class="w-full p-2 border rounded mt-2"
      />
      <div class="flex space-x-2 mt-2">
        <button
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          @click="addBookmark"
        >
          Save
        </button>
        <button
          class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          @click="cancel"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    parentId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isAdding: false,
      bookmarkName: '',
      bookmarkUrl: '',
    };
  },
  methods: {
    addBookmark() {
      if (this.bookmarkName.trim() && this.bookmarkUrl.trim()) {
        this.$emit(
          'add-bookmark',
          this.parentId,
          this.bookmarkName.trim(),
          this.bookmarkUrl.trim()
        );
        this.bookmarkName = '';
        this.bookmarkUrl = '';
        this.isAdding = false;
      }
    },
    cancel() {
      this.bookmarkName = '';
      this.bookmarkUrl = '';
      this.isAdding = false;
    },
  },
};
</script>

<style scoped>
/* Add custom styling if needed */
</style>
