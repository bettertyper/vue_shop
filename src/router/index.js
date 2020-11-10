import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import Users from '../components/user/Users'


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
    component: Home,
    redirect: '/welcome',               //这样是直接对/home进行了重定向(重定向为其子路由)，而不是对/home的子路由的根路径/home/进行重定向。虽然/home被重定向为/welcome，但/home仍然显示，因为/welcome是它的子路由，可以理解为/home还在，所以Home组件还能替换App组件中的router-view，而/welcome去替换Home组件中的router-view。如果重定向的是/home的同级路由则Home组件直接被其同级路由的组件替换
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      }
    ]
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
