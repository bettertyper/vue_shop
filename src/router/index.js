import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  /* if(to.path === '/login')
    next();
  else if(!window.sessionStorage.getItem('token')){
    next('/login');
  }else{
    next();
  } */
  if(to.path === '/login') return next();
  const tokenStr = window.sessionStorage.getItem('token');      //根据键名获取sessionStorage中对应的值
  if(!tokenStr) return next('/login');
  next();
});

export default router
