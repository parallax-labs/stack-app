<template>
  <div>
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';

export default defineComponent({
  name: 'EventsGraph',
  props: {
    events: {
      type: Array,
      required: true,
    },
    period: {
      type: String,
      required: true,
    },
    autoUpdate: {
      type: Boolean,
      default: false,
    },
    updateFrequency: {
      type: Number,
      default: 10000, // Default to 10 seconds
    },
  },
  setup(props) {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    let intervalId: number | undefined;

    const resizeCanvas = () => {
      const canvas = canvasRef.value;
      if (canvas) {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = 300; // Set a fixed height or adjust as needed
          drawGraph();
        }
      }
    };

    const drawGraph = async () => {
      const [data] = props.events;
      const canvas = canvasRef.value;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Clear the canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Define margins and graph dimensions
          const margin = { top: 20, right: 30, bottom: 50, left: 50 };
          const graphWidth = canvas.width - margin.left - margin.right;
          const graphHeight = canvas.height - margin.top - margin.bottom;

          // Parse and group data by event type
          const groupedData = data.reduce((acc, d) => {
            if (!acc[d.event_type]) acc[d.event_type] = [];
            acc[d.event_type].push({
              period: new Date(d.period),
              request_count: d.request_count,
            });
            return acc;
          }, {});

          // Define scaling functions
          const allPeriods = Object.values(groupedData).flat().map(d => d.period.getTime());
          const minX = Math.min(...allPeriods);
          const maxX = Math.max(...allPeriods);

          const allCounts = Object.values(groupedData).flat().map(d => d.request_count);
          const maxY = Math.max(...allCounts);

          const xScale = (time: number) =>
            margin.left + ((time - minX) / (maxX - minX)) * graphWidth;
          const yScale = (count: number) =>
            margin.top + graphHeight - (count / maxY) * graphHeight;

          // Draw axes
          ctx.beginPath();
          ctx.moveTo(margin.left, margin.top);
          ctx.lineTo(margin.left, margin.top + graphHeight);
          ctx.lineTo(margin.left + graphWidth, margin.top + graphHeight);
          ctx.strokeStyle = '#000';
          ctx.stroke();

          // Draw labels
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const xTickCount = 10;
          const xTickInterval = (maxX - minX) / xTickCount;
          for (let i = 0; i <= xTickCount; i++) {
            const time = minX + i * xTickInterval;
            const x = xScale(time);
            const date = new Date(time);
            const label = `${date.getUTCHours()}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
            ctx.fillText(label, x, margin.top + graphHeight + 5);
          }

          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          const yTickCount = 5;
          const yTickInterval = maxY / yTickCount;
          for (let i = 0; i <= yTickCount; i++) {
            const count = i * yTickInterval;
            const y = yScale(count);
            ctx.fillText(count.toFixed(0), margin.left - 5, y);
          }

          // Draw each series
          const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107']; // Define distinct colors for each series
          let colorIndex = 0;
          for (const [eventType, seriesData] of Object.entries(groupedData)) {
            const color = colors[colorIndex % colors.length];
            colorIndex++;

            // Draw the line
            ctx.beginPath();
            seriesData.sort((a, b) => a.period.getTime() - b.period.getTime());
            seriesData.forEach((d, index) => {
              const x = xScale(d.period.getTime());
              const y = yScale(d.request_count);
              if (index === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            });
            ctx.strokeStyle = color;
            ctx.stroke();

            // Draw data points
            seriesData.forEach(d => {
              const x = xScale(d.period.getTime());
              const y = yScale(d.request_count);
              ctx.beginPath();
              ctx.arc(x, y, 3, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();
            });
          }

          // Add legend
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          let legendY = margin.top;
          colorIndex = 0;
          for (const eventType of Object.keys(groupedData)) {
            const color = colors[colorIndex % colors.length];
            colorIndex++;

            ctx.fillStyle = color;
            ctx.fillRect(canvas.width - margin.right - 100, legendY, 10, 10);

            ctx.fillStyle = '#000';
            ctx.fillText(eventType, canvas.width - margin.right - 85, legendY + 5);

            legendY += 15;
          }
        }
      }
    };

    onMounted(() => {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      intervalId = window.setInterval(drawGraph, 10000); // Redraw every 10 seconds
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', resizeCanvas);
      if (intervalId) {
        clearInterval(intervalId);
      }
    });

    return {
      canvasRef,
    };
  },
});
</script>

<style scoped>
canvas {
  display: block;
  width: 100%;
  border: 1px solid #ccc;
}
</style>
