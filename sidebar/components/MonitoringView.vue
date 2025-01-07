<template>

  <div class="p-4 bg-white rounded-lg shadow">
    <TabList />
  </div>
</template>

<script lang="ts" setup>
import { watch, ref, onMounted } from "vue";
import { db, getInitiatorFz, getEventFrequency, loadResourcesBatch, getAllChats, getRuntimeEvents } from "../db.ts";
import { useRouter, useRoute } from 'vue-router'
import { loadTabs, currentTabIsBookmarked } from "../browser.ts";
import EventsGraph from './EventsGraph.vue';
import RequestsTable from './RequestsTable.vue';
import TabList from '../components/ActiveTabSelect.vue';
import TimelineComponent from './Timeline.vue';
import ChatsList from './ChatsList.vue';
import NoteList from './NoteList.vue';

import moment from 'moment';

const route = useRoute();
const router = useRouter();
  
const openChat = (chatId) => {
  router.push({ name: 'ChatView', params: { chatId } })
}

const changeTab = (tab) => activeTab.value = tab.id;

// Sub-Tabs under Monitoring
const monitoringTabs = [
  { id: "tabs", label: "Tabs" }
  //, { id: "active", label: "Current Page" }
];
import TimeRangePicker from "./TimeRangePicker.vue";

const onTimeRangeUpdate = (range) => {
  console.log("Selected Time Range:", range);
  // Fetch data based on the updated time range
};

const activeTab = ref(route.params.tab ?? "tabs");
const pageBookmarked = ref(false);
currentTabIsBookmarked().then(isBookmarked => pageBookmarked.value = isBookmarked);
const events = ref([]);
// Example configuration
const period = ref('minute');
const autoUpdate = ref(false);
const updateFrequency = ref(5000); // Update every 5 seconds

// Data for requests, chats, and notes
const sites = ref([]);
const tabs = ref([]);
const chats = ref([]);
const notes = ref([]);
const requestLogs = ref([]);
const tabActivationEvents = ref([]);
// Fetch data on mount
onMounted(async () => {
  events.value = await getEventFrequency(period.value);
  pageBookmarked.value = await currentTabIsBookmarked();
  await db.live("runtime_event", async (action, result) => {
    if (action === "CREATE") {
      if (result.type === "TAB_ACTIVATED") {
          pageBookmarked.value = await currentTabIsBookmarked();

          console.log(pageBookmarked.value);
      }
    }
  });
  tabs.value = await loadTabs();
  chats.value = (await getAllChats()).sort((a, b) => b.created_at - a.created_at);
  const [result] = await getInitiatorFz("minute");
  sites.value = result.sort((a, b) => b.request_count - a.request_count);
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
.open-chat-button {
  margin: 0 auto; /* Centers the button horizontally */
  display: block; /* Ensures it takes up only the necessary space */
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}
</style>
