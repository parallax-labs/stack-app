<template>
  <div class="timeline">
    <div
      v-for="event in sortedEvents"
      :key="event.id"
      class="timeline-item flex items-start space-x-4 mb-6"
    >
      <img
        :src="event.favIconUrl"
        alt="Favicon"
        class="favicon w-6 h-6 mt-1"
        @error="onImageError"
      />
      <div class="event-details">
        <div class="time text-gray-500 text-sm">{{ formatTime(event.timestamp) }}</div>
        <div class="title font-medium text-lg">{{ event.title || 'No Title' }}</div>
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
const trackingPixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/ax3OgAAAABJRU5ErkJggg==";
interface TabActivationEvent {
  id: string;
  timestamp: string;
  title: string;
  url: string;
  favIconUrl: string;
}

export default defineComponent({
  name: 'TimelineComponent',
  props: {
    events: {
      type: Array as () => any[],
      required: true,
    },
  },
  setup(props) {
    const parsedEvents = computed<TabActivationEvent[]>(() => {
      return props.events.map((e) => ({
        id: e.id,
        timestamp: e.timestamp,
        title: e.payload.title || 'No Title',
        url: e.payload.url || '',
        favIconUrl: e.payload.favIconUrl || trackingPixel,
      }));
    });

    const sortedEvents = computed(() => {
      return parsedEvents.value.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });

    const formatTime = (timestamp: string): string => {
      return format(new Date(timestamp), 'PPpp'); // Customizable date format
    };

    const onImageError = (event: Event) => {
      (event.target as HTMLImageElement).src =  trackingPixel;
      //console.log(event);
    };

    return {
      sortedEvents,
      formatTime,
      onImageError,
    };
  },
});
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
