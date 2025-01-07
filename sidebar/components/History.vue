<template>
  <div class="timeline">
    <div
      v-for="event in events"
      :key="event.id"
      class="timeline-item flex items-start space-x-4 mb-6"
    >
      <input
        type="checkbox"
        :value="event"
        v-model="selectedTabs"
      />
      <!-- <img -->
      <!--   :src="event.favIconUrl || defaultIcon" -->
      <!--   alt="Favicon" -->
      <!--   class="favicon w-6 h-6 mt-1" -->
      <!--   @error="onImageError" -->
      <!-- /> -->
      <div class="event-details">
        <div class="time text-gray-500 text-sm">
          {{ formatTime(event.timestamp) }}
        </div>
        <div class="title font-medium text-lg">
          {{ event.title || 'No Title' }}
        </div>
        <div v-if="event.url" class="url">
          <a
            :href="event.url"
            target="_blank"
            class="text-blue-500 hover:underline break-all"
            >{{ event.url }}</a
          >
        </div>
        <div v-else class="text-gray-400">No URL available</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { format } from 'date-fns';

export default defineComponent({
  name: 'HistoryComponent',
  props: {
    events: {
      type: Array as () => TabActivationEvent[],
      required: true,
    },
    selectedTabs: {
      type: Array as () => TabActivationEvent[],
      default: () => [],
    },
  },
  emits: ['update:selectedTabs'],
  setup(props, { emit }) {
    const selectedTabs = computed({
      get: () => props.selectedTabs,
      set: (value) => emit('update:selectedTabs', value),
    });

    const formatTime = (timestamp: number): string => {
      return format(new Date(timestamp), 'PPpp');
    };

    const defaultIcon =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/ax3OgAAAABJRU5ErkJggg==';

    const onImageError = (event: Event) => {
      (event.target as HTMLImageElement).src = defaultIcon;
    };

    return {
      selectedTabs,
      formatTime,
      onImageError,
    };
  },
});
</script>

<style scoped>
/* Your styles here */
</style>

