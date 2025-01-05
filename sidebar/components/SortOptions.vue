<template>
  <select class="p-2 border rounded" @change="$emit('sort', $event.target.value)">
    <option value="name">Name</option>
    <option value="date">Date</option>
  </select>
</template>
