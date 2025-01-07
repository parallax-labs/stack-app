<template>
  <input
    type="text"
    class="w-full p-2 border rounded"
    :placeholder="placeholder"
    @input="emit('search', $event.target.value)"
  />
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'search', value: string): void;
}>();
</script>

