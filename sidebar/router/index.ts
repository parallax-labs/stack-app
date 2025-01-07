import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import CurrentTabsView from '../views/CurrentTabsView.vue';
import AboutView from '../views/AboutView.vue';
import ChatView from '../views/ChatView.vue';
import ChatsView from '../views/ChatsView.vue';
import BookmarksTree from '../views/BookmarkTree.vue';
import TimelineView from '../views/TimelineView.vue';

const routes: RouteRecordRaw[] = [
  { path: '/sessions', name: 'ChatsView', component: ChatsView },
  { path: '/timeline', name: 'TimelineView', component: TimelineView },
  { path: '/chat/:chatId', name: 'ChatView', component: ChatView, props: true },
  { path: '/bookmarks', name: 'BookmarkTree', component: BookmarksTree },
  { path: '/', component: CurrentTabsView },
  { path: '/about', component: AboutView  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
