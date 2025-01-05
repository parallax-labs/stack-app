<template>
  <div class="mb-4 flex items-center">
    <!-- Time Range Dropdown -->
    <div>
      <select
        id="timeRange"
        v-model="selectedTimeRange"
        @change="emitTimeRange"
        class="ml-2 p-2 border border-gray-300 rounded"
      >
        <option value="lastHour">Last Hour</option>
        <option value="lastDay">Last 24 Hours</option>
        <option value="lastWeek">Last Week</option>
        <option value="custom">Custom Range</option>
      </select>
    </div>

    <!-- Custom Range Date Inputs -->
    <div v-if="selectedTimeRange === 'custom'" class="flex items-center gap-2">
      <input
        type="date"
        v-model="customStartDate"
        class="p-2 border border-gray-300 rounded"
        @change="emitTimeRange"
      />
      <span>to</span>
      <input
        type="date"
        v-model="customEndDate"
        class="p-2 border border-gray-300 rounded"
        @change="emitTimeRange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// State variables
const selectedTimeRange = ref("lastWeek");
const customStartDate = ref("");
const customEndDate = ref("");

// Emit the selected time range to the parent component
const emitTimeRange = () => {
  if (selectedTimeRange.value === "custom") {
    // Emit custom date range if selected
    emit("update", {
      range: "custom",
      startDate: customStartDate.value,
      endDate: customEndDate.value,
    });
  } else {
    // Emit predefined range
    emit("update", { range: selectedTimeRange.value });
  }
};
</script>

<style scoped>
/* Style adjustments */
select,
input {
  transition: all 0.2s ease-in-out;
}
</style>
