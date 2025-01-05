import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ExploreView from '../components/MonitoringView.vue';
import StackView from '../views/StackView.vue';
import CreateStack from '../components/CreateStack.vue';
import CreateComponent from '../components/CreateComponent.vue';
import ComponentView from '../views/ComponentView.vue';
import ResourceView from '../views/ResourceView.vue';
import ResourceSingle from '../views/ResourceSingle.vue';
import AboutView from '../views/AboutView.vue';
import ChatView from '../views/ChatView.vue';
import ChatsView from '../views/ChatsView.vue';
import BookmarksTree from '../views/BookmarkTree.vue';

const routes: RouteRecordRaw[] = [
  { path: '/chats', name: 'ChatsView', component: ChatsView },
  { path: '/chat/:chatId', name: 'ChatView', component: ChatView, props: true },
  { path: '/bookmarks', name: 'BookmarkTree', component: BookmarksTree },
  { path: '/', component: ExploreView },
  { path: '/create-stack', component: CreateStack },
  { path: '/stack/:id', component: StackView, props: true },
  { path: '/resource/:id', component: ResourceSingle, props: true },
  { path: '/stack/:id/create-component', component: CreateComponent, props: true },
  { path: '/components', component: ComponentView },
  { path: '/resources', component: ResourceView },
  { path: '/about', component: AboutView  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
