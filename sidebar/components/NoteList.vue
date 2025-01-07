<template>
  <div class="note-list">
    <div class="add-note-section">
      <input v-model="newNoteTitle" placeholder="Enter note title" class="note-input" />
      <button @click="addNote" class="add-note-button">Add Note</button>
    </div>
    <div v-if="notes.length === 0" class="empty-state">
      <p>No notes available.</p>
    </div>
    <div v-else>
      <ul class="notes">
        <li v-for="note in notes" :key="note.id" class="note-item">
          <div class="note-header">
            <h3 class="note-title">{{ note.title }}</h3>
            <button @click="deleteNote(note.id)" class="delete-note-button">&times;</button>
          </div>
          <p class="note-date">{{ formatDate(note.date) }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, watch } from 'vue';

interface Note {
  id: number;
  title: string;
  date: Date;
}
const props = defineProps<{ notes: Note[] }>();
const notes = ref<Note[]>(props.notes ?? []);
const newNoteTitle = ref('');

// Load notes from localStorage on mount
onMounted(() => {
  const storedNotes = localStorage.getItem('notes');
  if (storedNotes) {
    notes.value = JSON.parse(storedNotes).map((note: any) => ({
      ...note,
      date: new Date(note.date), // Convert string back to Date object
    }));
  }
});

// Watch notes and save to localStorage when they change
watch(notes, (newNotes) => {
  localStorage.setItem('notes', JSON.stringify(newNotes));
}, { deep: true });

const addNote = () => {
  if (newNoteTitle.value.trim() !== '') {
    const newNote: Note = {
      id: Date.now(),
      title: newNoteTitle.value,
      date: new Date(),
    };
    notes.value.push(newNote);
    newNoteTitle.value = ''; // Clear the input field
  } else {
    alert('Please enter a note title.');
  }
};

const deleteNote = (id: number) => {
  notes.value = notes.value.filter(note => note.id !== id);
};

const formatDate = (date: Date) => {
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
.note-list {
  padding: 20px;
}

.add-note-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.note-input {
  flex-grow: 1;
  padding: 10px;
  font-size: 16px;
}

.add-note-button {
  margin-left: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 11px 20px;
  cursor: pointer;
  border-radius: 5px;
}

.add-note-button:hover {
  background-color: #0056b3;
}

.empty-state {
  text-align: center;
  padding: 20px;
}

.notes {
  list-style: none;
  padding: 0;
}

.note-item {
  background-color: #f9f9f9;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-title {
  margin: 0;
  font-size: 18px;
}

.delete-note-button {
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: #ccc;
}

.delete-note-button:hover {
  color: #f00;
}

.note-date {
  margin: 5px 0 0 0;
  color: #777;
}
</style>
