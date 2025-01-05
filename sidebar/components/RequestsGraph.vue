<template>
  <canvas ref="canvasRef"></canvas>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, onBeforeUnmount } from 'vue';
import { getRequestsSeries } from '../db';

export default defineComponent({
  name: 'RequestsGraph',
  setup() {
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
      const [data] = await getRequestsSeries('second');
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

          // Parse and sort data by period
          const parsedData = data
            .map(d => ({
              period: new Date(d.period),
              request_count: d.request_count,
            }))
            .sort((a, b) => a.period.getTime() - b.period.getTime());

          // Define scaling functions
          const minX = parsedData[0].period.getTime();
          const maxX = parsedData[parsedData.length - 1].period.getTime();
          const maxY = Math.max(...parsedData.map(d => d.request_count));

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
            const label = `${date.getUTCHours()}:00`;
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

          // Draw the line
          ctx.beginPath();
          parsedData.forEach((d, index) => {
            const x = xScale(d.period.getTime());
            const y = yScale(d.request_count);
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.strokeStyle = '#007bff';
          ctx.stroke();

          // Draw data points
          parsedData.forEach(d => {
            const x = xScale(d.period.getTime());
            const y = yScale(d.request_count);
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = '#007bff';
            ctx.fill();
          });
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
