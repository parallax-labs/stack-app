<template>
  <div class="bg-white shadow-md rounded-lg p-6 max-w-5xl mx-auto">
    <ul>
      <li
        v-for="chat in chats"
        :key="chat.id"
        class="flex justify-between items-center p-2 border-b hover:bg-gray-50 cursor-pointer"
        @click="openChat(chat.id)"
      >
        <div>
          <p class="font-semibold">{{ chat.name }}</p>
        </div>
        <button @click.stop="deleteChat(chat.id)" class="text-red-500 hover:underline">Delete</button>
      </li>
    </ul>
    <p v-if="chats.length === 0" class="text-gray-500 text-sm">No chats available.</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getAllChats, createChatInDB, deleteChatFromDB } from '../db'
import { useRouter } from 'vue-router'
import NavigationBar from '../components/NavigationBar.vue';

const router = useRouter()
const chats = ref<{ id: string; name: string; stackId: string }[]>([])
const newChatName = ref('')
const selectedStack = ref('')

// Load chats and stacks on mount
onMounted(async () => {
  chats.value = await getAllChats()
})

// Create a new chat
const createChat = async () => {
  let chat = await createChatInDB()
  openChat(chat.id);
}

// Open chat by navigating to ChatView
const openChat = (chatId: string) => {
  router.push({ name: 'ChatView', params: { chatId } })
}

// Delete a chat
const deleteChat = async (chatId: string) => {
  await deleteChatFromDB(chatId)
  chats.value = await getAllChats()
}

</script>

<style scoped>
li {
  transition: background-color 0.2s;
}
</style>
