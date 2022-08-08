import axios from 'axios'
// 配置请求的根路径

const request = axios.create({
  baseURL: 'http://127.0.0.1:8888/api/private/v1/'
})
// 通过 axios 请求拦截器添加 token,保证拥有获取数据的权限
request.interceptors.request.use(config => {
  console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 必须加renturn
  return config
})

export default request
