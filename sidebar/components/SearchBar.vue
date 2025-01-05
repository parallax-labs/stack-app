<template>
  <input
    type="text"
    class="w-full p-2 border rounded"
    placeholder="Search bookmarks..."
    @input="$emit('search', $event.target.value)"
  />
</template>
