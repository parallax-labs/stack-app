import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import StackView from '../views/StackView.vue';
import CreateStack from '../components/CreateStack.vue';
import CreateComponent from '../components/CreateComponent.vue';
import ComponentView from '../views/ComponentView.vue';
import ResourceView from '../views/ResourceView.vue';
import ResourceSingle from '../views/ResourceSingle.vue';
import AboutView from '../views/AboutView.vue';
import ChatView from '../views/ChatView.vue';

const routes: RouteRecordRaw[] = [
  { path: '/chat', component: ChatView },
  { path: '/stacks', component: HomeView },
  { path: '/create-stack', component: CreateStack },
  { path: '/stack/:id', component: StackView, props: true },
  { path: '/resource/:id', component: ResourceSingle, props: true },
  { path: '/stack/:id/create-component', component: CreateComponent, props: true },
  { path: '/components', component: ComponentView },
  { path: '/resources', component: ResourceView },
  { path: '/', component: AboutView  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
