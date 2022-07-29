import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'element-ui'
// 导入全局样式表
import '@/assets/css/global.css'
import '../plugins/element'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/fonts/iconfont.css'

import axios from 'axios'
import request from '@/utils/request'
Vue.prototype.$axios = request
Vue.prototype.$http = axios
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
