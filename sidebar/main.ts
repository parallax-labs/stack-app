
import { createApp } from 'vue';
import './styles/tailwind.css'; // Import Tailwind CSS
import './types/global.d.ts';
// import Sidebar from './Sidebar.vue';
import App from './App.vue';
import router from './router';

import { initDB } from './db';
import { generateAndStoreSecretKey } from './encryption';

await generateAndStoreSecretKey();
await initDB(); // Initialize and configure SurrealDB
createApp(App).use(router).mount('#app');

