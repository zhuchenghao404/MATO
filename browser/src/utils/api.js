import axios from 'axios'

const http = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// 请求拦截器：自动附带 token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('mato_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
http.interceptors.response.use(
  (res) => {
    const data = res.data
    if (data.code === 401) {
      localStorage.removeItem('mato_token')
      localStorage.removeItem('mato_user')
    }
    return data
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mato_token')
      localStorage.removeItem('mato_user')
    }
    return Promise.reject(err)
  }
)

// ========== 用户管理 API ==========
export const userApi = {
  getList(params) {
    return http.get('/admin/user/list', { params })
  },
  getDetail(id) {
    return http.get(`/admin/user/${id}`)
  },
  create(data) {
    return http.post('/admin/user', data)
  },
  update(id, data) {
    return http.put(`/admin/user/${id}`, data)
  },
  delete(id) {
    return http.delete(`/admin/user/${id}`)
  },
  toggleStatus(id, status) {
    return http.put(`/admin/user/${id}/status`, { status })
  },
  getRoles() {
    return http.get('/admin/user/roles')
  },
}

// ========== 作品管理 API ==========
export const workApi = {
  getList(params) {
    return http.get('/admin/works/list', { params })
  },
  getDetail(id) {
    return http.get(`/works/${id}`)
  },
  create(data) {
    return http.post('/works', data)
  },
  update(id, data) {
    return http.put(`/admin/works/${id}`, data)
  },
  delete(id) {
    return http.delete(`/admin/works/${id}`)
  },
  toggleStatus(id, status) {
    return http.put(`/admin/works/${id}/status`, { status })
  },
  /** 获取待审核作品 */
  getPending() {
    return http.get('/admin/works/pending')
  },
}

// ========== 评论管理 API ==========
export const commentApi = {
  getList(params) {
    return http.get('/admin/comment/list', { params })
  },
  getDetail(id) {
    return http.get(`/admin/comment/${id}`)
  },
  delete(id) {
    return http.delete(`/admin/comment/${id}`)
  },
}

// ========== 仪表盘 API ==========
export const dashboardApi = {
  getStats() {
    return http.get('/admin/stats')
  },
}

// ========== 认证 API ==========
export const authApi = {
  login(data) {
    return http.post('/auth/login', data)
  },
}

export default http
