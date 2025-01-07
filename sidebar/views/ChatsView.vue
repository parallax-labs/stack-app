<template>
  <div class="bg-white shadow-md rounded-lg p-6 max-w-5xl mx-auto">
    <ChatsList :chats="chats" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getAllChats, createChatInDB, deleteChatFromDB } from '../db'
import { useRouter } from 'vue-router'
import NavigationBar from '../components/NavigationBar.vue';
import ChatsList from '../components/ChatsList.vue';
const router = useRouter()
const chats = ref([])
const newChatName = ref('')
const selectedStack = ref('')

// Load chats and stacks on mount
onMounted(async () => {
  const chat_result = await getAllChats();
  console.dir(chat_result)
  chat_result.map(chat => chats.value.push(chat))
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
