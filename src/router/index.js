import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import LogoutView from '../views/LogoutView.vue'

const routes = [
  {
    path: '/home',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/logout',
    name: 'logout',
    component: LogoutView
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/logout'];
  const protectedPages = ['/home'];
  const authRequired = !publicPages.includes(to.path);
  const pathDoesntExist = !protectedPages.includes(to.path) && !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('client_token');

  if (authRequired && !loggedIn) {
    next('/login');
  } else if (pathDoesntExist) {
    next('/home');
  } else {
    next();
  }
});

export default router
