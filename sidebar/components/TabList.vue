<template>
  <!-- Tab List -->
  <div class="tab-list">
    <div
      v-for="tab in tabs"
      :key="tab.id"
      :class="['tab-item', { active: tab.active }]"
    >
      <input
        type="checkbox"
        :value="tab"
        v-model="localSelectedTabs"
        class="tab-checkbox"
      />
      <img
        v-if="tab.favIconUrl"
        :src="tab.favIconUrl"
        alt="Favicon"
        class="favicon"
        @error="onImageError"
      />
      <div class="tab-content" @click="tabClickAction(tab)">
        <div class="tab-title">{{ tab.title || 'Untitled' }}</div>
        <div class="tab-url">{{ tab.url }}</div>
      </div>
      <div class="tab-actions">
        <span class="close-tab" @click.stop="closeTab(tab)">&times;</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'TabList',
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    selectedTabs: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:selectedTabs'],
  setup(props, { emit }) {
    // Computed property for two-way binding
    const localSelectedTabs = computed({
      get: () => props.selectedTabs,
      set: (value) => emit('update:selectedTabs', value),
    });

    const tabClickAction = (tab) => {
      chrome.tabs.update(tab.id, { active: true });
      chrome.windows.update(tab.windowId, { focused: true });
    };

    const closeTab = (tab) => {
      chrome.tabs.remove(tab.id, () => {
        // Tab removal will be handled by the parent component
      });
    };

    // Handle image errors
    const defaultIcon =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQImWNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';

    const onImageError = (event) => {
      event.target.src = defaultIcon;
    };

    return {
      localSelectedTabs,
      tabClickAction,
      closeTab,
      onImageError,
    };
  },
});
</script>

<style scoped>
/* Same styles as before */
.tab-list {
  display: flex;
  flex-direction: column;
}

.tab-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.3s;
}

.tab-item:last-child {
  border-bottom: none;
}

.tab-item.active {
  background-color: #e6f7ff;
}

.tab-item:hover {
  background-color: #f5f5f5;
}

.tab-checkbox {
  margin-right: 10px;
}

.favicon {
  width: 16px;
  height: 16px;
  margin-right: 10px;
}

.tab-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.tab-title {
  font-weight: bold;
  font-size: 14px;
  color: #333;
}

.tab-url {
  font-size: 12px;
  color: #999;
}

.tab-actions {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.close-tab {
  font-size: 14px;
  color: #ccc;
  cursor: pointer;
  padding: 5px;
  transition: color 0.3s;
}

.close-tab:hover {
  color: #f00;
}
</style>
