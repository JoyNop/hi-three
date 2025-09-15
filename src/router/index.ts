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
      path: '/hr-demo',
      name: 'hr',
      component: () => import('../views/hr/ThreeView.vue')
    },
    {
      path: '/three-demo',
      name: 'three-demo',
      component: () => import('../views/ThreeView.vue')
    },
    {
      path: '/three-cloud',
      name: 'three-cloud',
      component: () => import('../views/ThreeCloud.vue')
    },
    {
      path: '/mesh-hole',
      name: 'mesh-hole',
      component: () => import('../views/MeshHole.vue')
    },
    {
      path: '/file',
      name: 'file',
      component: () => import('../views/FileView.vue')
    }
  ]
})

export default router
