<template>
  <div class="flex flex-col h-screen p-4 bg-gray-100">
    <!-- Header -->
    <div class="mb-4">
      <h1 class="text-xl font-semibold text-gray-700">Chat with Stack Assistant</h1>
      <p class="text-sm text-gray-500">Ask questions about your stacks and resources.</p>
    </div>

    <!-- Chat Messages Container -->
    <div class="flex-1 overflow-y-auto mb-4 bg-white rounded shadow p-4 space-y-2">
      <div v-for="(message, index) in messages" :key="index" class="flex items-start" :class="message.sender === 'user' ? 'justify-end' : ''">
        <div class="max-w-xs px-4 py-2 rounded-lg" :class="message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'">
          <p v-html="formatMessage(message)"></p>
        </div>
      </div>
      <!-- Loading Indicator -->
      <div v-if="isLoading" class="text-gray-500 text-sm mt-2">Assistant is typing...</div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="text-red-500 mb-2">{{ error }}</div>

    <!-- Input Bar -->
    <div class="flex items-center">
      <input
        v-model="inputMessage"
        @keyup.enter="sendMessage"
        placeholder="Type your message..."
        class="flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring focus:border-blue-300"
      />
      <button @click="sendMessage" class="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600">
        Send
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { querySurrealDB, saveMessageToDB, loadChatHistory } from '../db'

// State for messages and input
const messages = ref<{ sender: string; text: string }[]>([])
const inputMessage = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

// Load chat history on mount
onMounted(async () => {
  messages.value = await loadChatHistory()
})

// Function to send a message
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return

  const userMessage = { sender: 'user', text: inputMessage.value }
  messages.value.push(userMessage)
  await saveMessageToDB(userMessage)

  const userInput = inputMessage.value
  inputMessage.value = ''
  isLoading.value = true
  error.value = null

  try {
    const response = await fetch('https://your-llm-api-endpoint.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userInput })
    })

    if (!response.ok) throw new Error('Failed to fetch response from the assistant.')

    const data = await response.json()
    const assistantMessage = { sender: 'assistant', text: data.reply }
    messages.value.push(assistantMessage)
    await saveMessageToDB(assistantMessage)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred.'
  } finally {
    isLoading.value = false
  }
}

// Format message to support rich text (e.g., links)
const formatMessage = (message: { text: string }) => {
  return message.text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="underline text-blue-600">$1</a>')
}
</script>

<style scoped>
/* Customize scrollbar for chat window */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}
</style>
