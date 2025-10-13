import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import AccuracyView from '@/views/AccuracyView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/accuracy',
      name: 'accuracy',
      component: AccuracyView,
    },
  ],
});

export default router;
