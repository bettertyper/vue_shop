import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入字体图标
import './assets/font_1862212_kn30te6lvp/iconfont.css'
//导入全局样式表
import './assets/css/global.css'
//导入tree-table组件
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token');        //需要授权的接口要求请求头中含有Authorization字段，值为token值；不需要授权的接口当然Authorization为多少都无所谓，或者说不需要Authorization。不过这里在请求每个接口时都在请求头中添加了Authorization
  return config;
})
Vue.prototype.$http = axios

Vue.component('tree-table', TreeTable)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
