import axios from 'axios'
// 配置请求的根路径
const request = axios.create({
  baseURL: 'http://127.0.0.1:8888/api/private/v1/'
})

export default request
