<template>
  <div>
    <button
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      @click="isAdding = true"
    >
      Add Folder
    </button>
    <div v-if="isAdding" class="mt-2">
      <input
        type="text"
        v-model="folderName"
        placeholder="Folder name"
        class="w-full p-2 border rounded"
      />
      <div class="flex space-x-2 mt-2">
        <button
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          @click="addFolder"
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
      folderName: '',
    };
  },
  methods: {
    addFolder() {
      if (this.folderName.trim()) {
        this.$emit('add-folder', this.parentId, this.folderName.trim());
        this.folderName = '';
        this.isAdding = false;
      }
    },
    cancel() {
      this.folderName = '';
      this.isAdding = false;
    },
  },
};
</script>

<style scoped>
/* Add custom styling if needed */
</style>
