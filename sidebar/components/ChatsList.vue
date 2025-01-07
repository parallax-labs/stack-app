
<template>
  <div class="p-4 border-b bg-white flex-col">
    <SearchBar @search="handleSearch" />
    <SortOptions @sort="handleSort" />
  </div>
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
</template>

<script lang="ts" setup>
import { ref, defineProps, onMounted } from "vue";
import { getAllChats, } from "../db.ts";
import { useRouter } from 'vue-router'
import moment from 'moment';
import SearchBar from '../components/SearchBar.vue';
import SortOptions from '../components/SortOptions.vue';
const router = useRouter();
  
const openChat = (chatId) => {
  router.push({ name: 'ChatView', params: { chatId } })
}
import TimeRangePicker from "./TimeRangePicker.vue";

const onTimeRangeUpdate = (range) => {
  console.log("Selected Time Range:", range);
  // Fetch data based on the updated time range
};
const props = defineProps<{
  chats: { id: string, name: string, created_at: Date }[];
}>();
const chats = ref(props.chats ?? []);
// Fetch data on mount
onMounted(async () => {
  chats.value = props.chats.sort((a, b) => b.created_at - a.created_at);
});


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
