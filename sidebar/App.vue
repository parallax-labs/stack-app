<template>
  <nav class="fixed top-0 left-0 w-full z-50 bg-white">
    <div class="flex space-x-4 border-b justify-center">
      <router-link to="/" class="tab-link" active-class="tab-link-active">
        🏠
      </router-link>
      <router-link to="/timeline" class="tab-link" active-class="tab-link-active">
        🗓️
      </router-link>
      <router-link to="/sessions" class="tab-link" active-class="tab-link-active">
        💬
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
const openChat = ({ chat }) => {
  router.push({ name: 'ChatView', params: { chatId: chat.id.toString() } })
}
const createChatNodeHandler = async ({ title, url, children }: { title: string, url?: string | null, children?: chrome.bookmarks.BookmarkTreeNode[] }) => {
  let chat = await getOrCreateChat(title);
  let bookmarks = (await getBookmarks())[0];
  const saveResourceCB = async (node) => {
    const paths = findPathToUrl(bookmarks, node.url);
    const title = (paths || [node.title]).join("/");
    if (node.url) {
      let resource = {
        title
        , url: node.url
      };
      await saveResource(chat.id, resource);
    }
    if (node.children) {
      await Promise.all(
        node.children
          .filter(child => !!child.url)
          .map(saveResourceCB)
      )
    }

  }
  
  await saveResourceCB({ title, url, children })
  await appEvent('OPEN_CHAT', { chat: chat });
}


const eventMap = {
  ["OPEN_CHAT"]: openChat,
  ["CREATE_CHAT"]: createChatNodeHandler,
  ["INIT_APP"]: initializeApp,
  ["UPSERT_BOOKMARK_BATCH"]: batchUpsertBookmarks,
};

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

  appEvent('INIT_APP', { bookmarks: await getBookmarks() })
});

// Function to initialize the app by processing bookmarks
async function initializeApp(initProps) {
    appEvent('IMPORT_COMPLETE', initProps);
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

