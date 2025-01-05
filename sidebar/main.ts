
import { createApp } from 'vue';
import './styles/tailwind.css'; // Import Tailwind CSS
import './types/global.d.ts';
// import Sidebar from './Sidebar.vue';
import App from './App.vue';
import router from './router';

import { initDB, createRuntimeEvent } from './db';
import { generateAndStoreSecretKey } from './encryption';

await generateAndStoreSecretKey();
await initDB(); // Initialize and configure SurrealDB

// await db.live("runtime_event", eventHandler);
chrome.runtime.onMessage.addListener(async (message) => {
  await createRuntimeEvent(message);
  return true; // Keep the message channel open for async response
});

createApp(App).use(router).mount('#app');

