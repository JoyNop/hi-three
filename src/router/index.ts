import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/hi',
      name: 'hi',
      component: () => import('../views/ThreeView.vue')
    },
    {
      path: '/three-demo',
      name: 'three-demo',
      component: () => import('../views/ThreeView.vue')
    },
    {
      path: '/file',
      name: 'file',
      component: () => import('../views/FileView.vue')
    },
    {
      path: '/cj1',
      name: 'choujiang1',
      component: () => import('../views/choujiang/CjView1.vue')
    }
  ]
})

export default router
