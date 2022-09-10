import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'element-ui'
// 导入全局样式表
import '@/assets/css/global.css'
import '../plugins/element'
import 'element-ui/lib/theme-chalk/index.css'
// 导入字体图标
import '@/assets/fonts/iconfont.css'

import TreeTable from 'vue-table-with-tree-grid'
import axios from 'axios'
import request from '@/utils/request'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.prototype.$axios = request
Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.component('tree-table', TreeTable)
// Vue.use(TreeTable)
// 将文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
