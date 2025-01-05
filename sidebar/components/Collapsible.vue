<template>
  <div class="collapsible">
    <button @click="toggleCollapse" class="toggle-button">
      {{ isCollapsed ? collapsedLabel : expandedLabel }}
    </button>
    <transition name="slide-fade">
      <div v-show="!isCollapsed" class="collapsible-content">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps<{
  isCollapsed: bool;
  collapsedLabel: string;
  expandedLabel: string;
}>();

const isCollapsed = ref(props.isCollapsed ?? false);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.collapsible {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.toggle-button {
  width: 100%;
  padding: 10px;
  background-color: #f5f5f5;
  border: none;
  cursor: pointer;
  text-align: left;
  font-weight: bold;
}

.collapsible-content {
  padding: 10px;
  border-top: 1px solid #eee;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  max-height: 1000px; /* Arbitrary large value */
  opacity: 1;
}
</style>
