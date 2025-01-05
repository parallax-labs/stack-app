<template>
  <div class="p-4 bg-white rounded-lg shadow">
    <!-- Sub-Tabs for Monitoring -->
    <div class="flex border-b">
      <button
        v-for="tab in monitoringTabs"
        :key="tab.id"
        :class="[
          'px-4 py-2',
          activeSubTab === tab.id
            ? 'border-b-2 border-blue-500 text-blue-500'
            : 'text-gray-600 hover:text-blue-500'
        ]"
        @click="activeSubTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Sub-Tab Content -->
    <div class="mt-4">
      <div v-if="activeSubTab === 'tabs'">
        <TabList />
      </div>
      <!-- Requests Sub-Tab -->
      <!-- <div v-if="activeSubTab === 'requests'"> -->
      <!-- Time Range Picker -->
      <!--   <TimeRangePicker @update="onTimeRangeUpdate" /> -->
      <!--   <EventsGraph -->
      <!--     :events="events" -->
      <!--     :period="period" -->
      <!--     :autoUpdate="autoUpdate" -->
      <!--     :updateFrequency="updateFrequency" -->
      <!--   /> -->
      <!--   Tabs --> 
      <!--   <div class="flex border-b mt-4"> -->
      <!--     <button -->
      <!--       v-for="tab in tabs" -->
      <!--       :key="tab.id" -->
      <!--       :class="[ -->
      <!--         'px-4 py-2', -->
      <!--         activeTab === tab.id -->
      <!--           ? 'border-b-2 border-blue-500 text-blue-500' -->
      <!--           : 'text-gray-600 hover:text-blue-500' -->
      <!--       ]" -->
      <!--       @click="activeTab = tab.id" -->
      <!--     > -->
      <!--       {{ tab.label }} -->
      <!--     </button> -->
      <!--   </div> -->
      <!--   <RequestsTable :sites="sites" /> -->
      <!-- </div> -->

      <!-- Chats Sub-Tab -->
      <div v-if="activeSubTab === 'chats'">

        <!-- Time Range Picker -->
        <TimeRangePicker @update="onTimeRangeUpdate" />
        <ul class="divide-y divide-gray-300">
          <li
            v-for="(chat, index) in chats"
            :key="chat.created_at"
            class="py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-md"
          >
            <div class="flex justify-between" @click="openChat(chat.id)">
              <span class="text-gray-700 font-medium">{{ chat.name }}</span>
              <span class="text-gray-500 text-sm">{{ moment(chat.created_at).format() }}</span>
            </div>
          </li>
        </ul>
      </div>

      <!-- Notes Sub-Tab -->
      <div v-if="activeSubTab === 'notes'">
        <!-- Time Range Picker -->
        <TimeRangePicker @update="onTimeRangeUpdate" />
        <textarea
          v-model="notes"
          class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          placeholder="Write your notes here..."
          rows="6"
        ></textarea>
        <button
          @click="saveNotes"
          class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Notes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getInitiatorFz, getEventFrequency, loadResourcesBatch, getAllChats } from "../db.ts";
import { useRouter } from 'vue-router'
import { loadTabs } from "../browser.ts";
import EventsGraph from './EventsGraph.vue';
import RequestsTable from './RequestsTable.vue';
import TabList from '../components/ActiveTabSelect.vue';
import moment from 'moment';

const router = useRouter();
  
const openChat = (chatId) => {
  router.push({ name: 'ChatView', params: { chatId } })
}
// Sub-Tabs under Monitoring
const monitoringTabs = [
  { id: "tabs", label: "Pages" },
//  { id: "requests", label: "Requests" },
  { id: "chats", label: "Chats" },
  { id: "notes", label: "Notes" },
];
const activeSubTab = ref("tabs");
import TimeRangePicker from "./TimeRangePicker.vue";

const onTimeRangeUpdate = (range) => {
  console.log("Selected Time Range:", range);
  // Fetch data based on the updated time range
};


const events = ref([]);
// Example configuration
const period = ref('minute');
const autoUpdate = ref(false);
const updateFrequency = ref(5000); // Update every 5 seconds

// Data for requests, chats, and notes
const sites = ref([]);
const tabs = ref([]);
const chats = ref([]);
const notes = ref("");
const requestLogs = ref([]);
// Fetch data on mount
onMounted(async () => {
  // Fetch request counts by site
  events.value = await getEventFrequency(period.value);
  tabs.value = await loadTabs();
  chats.value = (await getAllChats()).sort((a, b) => b.created_at - a.created_at);
  const [result] = await getInitiatorFz("minute");
  sites.value = result.sort((a, b) => b.request_count - a.request_count);
  // Simulate fetching chat data (replace with real API)
  requestLogs.value = [
    { message: "Chat about monitoring", timestamp: "2024-12-22T03:08:55.166Z" },
    { message: "Follow-up question", timestamp: "2024-12-22T03:10:12.543Z" },
    { message: "Another chat log", timestamp: "2024-12-22T03:11:23.112Z" },
  ];

});

// Save notes functionality
const saveNotes = () => {
  alert(`Notes saved: ${notes.value}`);
};
</script>

<style scoped>
/* Styling for tabs and active state */
button {
  transition: color 0.2s, border-color 0.2s;
}
textarea {
  resize: none;
}
</style>
