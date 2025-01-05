<template>
  <nav class="fixed top-0 left-0 w-full z-50 bg-white">
    <div class="flex space-x-4 border-b justify-center">
      <router-link to="/" class="tab-link" active-class="tab-link-active">
        🏠
      </router-link>
      <router-link to="/bookmarks" class="tab-link" active-class="tab-link-active">
        📚
      </router-link>
      <router-link to="/about" class="tab-link" active-class="tab-link-active">
        ⚙️
      </router-link>
    </div>
  </nav>
  <div class="pt-8">
    <router-view />
  </div>
</template>


<script setup lang="ts">
import { useRouter } from 'vue-router';
import { db, addResourceToChat, createBookmarkEvent, createChatInDB, createChatForBookmarkFolder, upsertResource, saveResource, isChatSaved, hasSubchat, createBookmarkFolderEvent, getLatestTimestamp, createImport, addResourceToChats, getOrCreateChat, importBookmarkTreeInBatches, batchUpsertBookmarks, appEvent } from './db.ts';
import { getBookmarks, findMaxBookmarkDate, buildPathsToLeafNodes, findFoldersWithBookmarks, findPathToUrl } from './browser.ts';

import { onMounted } from 'vue';
const router = useRouter();
const openChat = (chatId: string) => {
  router.push({ name: 'ChatView', params: { chatId } })
}
const createChatHandler = async ({ tabs }: { tabs: Tab[] }) => {
  let chat = await createChatInDB();
  await Promise.all(
    tabs
    .filter(tab => tab.url && tab.title)
    .map(tab => saveResource(chat.id, {title: tab.title!, url: tab.url! }))
  );

  await appEvent('OPEN_CHAT', { chat: chat });
}
const eventMap = {
  ["OPEN_CHAT"]: openChat,
  ["CREATE_CHAT"]: createChatHandler,
  ["INIT_APP"]: initializeApp,
  ["UPSERT_BOOKMARK_BATCH"]: batchUpsertBookmarks
};
const importChromeBookmarks = async (rootNode) => {
    let imported = buildPathsToLeafNodes(rootNode);
    let bookmarks = await Promise.all(imported.flatMap((resource) => upsertResource(resource)));
    console.log(Promise.all(bookmarks.flatMap(async bookmark => {
      const chats = await Promise.all(bookmark.path.map(getOrCreateChat));
      return await addResourceToChats(bookmark.id.id, chats.map(chat => chat.id.toString()));
    })));
}
const importTypeMap = {
  chrome: async (result) => {
    try {
      await importBookmarkTreeInBatches(result.data);
    } catch (error) {
      console.error(error);
      appEvent('IMPORT_FAILED', { error });

    }
    appEvent('IMPORT_COMPLETE', {});
  }
}

onMounted(async () => {
  await db.live("app_event", async (action: any, result: any) => {
    const eventType = result.type;
    const eventHandler = eventMap[eventType];
    const eventProps = result.properties;
    console.log(action, eventType, eventProps);
    if (action === "CREATE" && typeof eventHandler === 'function') {
      await eventHandler(eventProps);
    }
  });
  await db.live("import", async (action: any, result: any) => {
     if (action === "CREATE" && typeof importTypeMap[result.source] === "function") {
      await importTypeMap[result.source](result);
    } else {
      console.log("no such import type", result);
    }
  });
  appEvent('INIT_APP', { bookmarks: await getBookmarks() })
});

// Function to initialize the app by processing bookmarks
async function initializeApp({ bookmarks: [bookmarks] }) {
  //if (true) {
  if (findMaxBookmarkDate(bookmarks) > await getLatestTimestamp('chrome')) {
    try {
      await createImport('chrome', bookmarks);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

</script>

<style scoped>
.tab-link {
  @apply py-2 px-4 text-gray-600 hover:text-blue-500 transition;
}
.tab-link-active {
  @apply border-b-2 border-blue-500 text-blue-500 font-semibold;
}
</style>

