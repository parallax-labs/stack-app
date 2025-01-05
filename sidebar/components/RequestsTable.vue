<template>
  <div class="mt-4">
    <!-- Tabs -->
    <div class="flex border-b">
      <button
        v-for="tab in requestTabs"
        :key="tab.id"
        :class="[
          'px-4 py-2',
          activeRequestTab === tab.id
            ? 'border-b-2 border-blue-500 text-blue-500'
            : 'text-gray-600 hover:text-blue-500'
        ]"
        @click="activeRequestTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="mt-4">
      <!-- Request Count by Domain -->
      <div v-if="activeRequestTab === 'requestCount'">
        <h3 class="text-md font-semibold text-gray-700 mb-2">Requests by Site</h3>
        <table class="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-100">
              <th class="px-4 py-2 text-left border border-gray-300">Site</th>
              <th class="px-4 py-2 text-right border border-gray-300">Request Count</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(site, index) in sites"
              :key="index"
              class="odd:bg-white even:bg-gray-50"
            >
              <td class="px-4 py-2 border border-gray-300">
                {{ site.site || "Unknown" }}
              </td>
              <td class="px-4 py-2 text-right border border-gray-300">
                {{ site.request_count }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Request Log -->
      <div v-if="activeRequestTab === 'requestLog'">
        <h3 class="text-md font-semibold text-gray-700 mb-2">Request Log by Timestamp</h3>
        <ul class="divide-y divide-gray-300">
          <li
            v-for="(log, index) in requestLogs"
            :key="index"
            class="py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-md"
          >
            <div class="flex justify-between">
              <span class="text-gray-700 font-medium">{{ log.url }}</span>
              <span class="text-gray-500 text-sm">{{ log.timestamp }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, defineProps } from "vue";

// Define props to accept data from parent
const props = defineProps({
  sites: {
    type: Array,
    required: true
  }
});

// Tab states
const requestTabs = [
  { id: "requestCount", label: "Request Count by Domain" },
  { id: "requestLog", label: "Request Log" },
];
const activeRequestTab = ref("requestCount");

// Sample data for logs (still local)
const requestLogs = ref([
  { url: "https://example.com/api", timestamp: "2024-12-22T03:08:55.166Z" },
  { url: "https://chatgpt.com/login", timestamp: "2024-12-22T03:10:12.543Z" },
  { url: "https://mail.google.com", timestamp: "2024-12-22T03:11:23.112Z" },
]);
</script>


<style scoped>
/* Styling for tabs */
button {
  transition: color 0.2s, border-color 0.2s;
}
</style>
