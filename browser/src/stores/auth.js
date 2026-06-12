import { ref, computed } from 'vue'
import manAvatar from '../assets/HOMEImage/man.png'
import womanAvatar from '../assets/HOMEImage/woman.png'

const API_BASE = '/api'

// 经验值上限，达到后不再增加
const EXP_CAP = 99999

// 全局共享状态
const currentUser = ref(null)
const token = ref(localStorage.getItem('mato_token') || '')
const levelConfigs = ref([])
const showAuthModal = ref(false)

function openAuthModal() {
  showAuthModal.value = true
}

function closeAuthModal() {
  showAuthModal.value = false
}

/** 通用 JSON 请求封装 */
async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token.value) {
    headers['Authorization'] = `Bearer ${token.value}`
  }
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers })
  return res.json()
}

/** 通用 FormData 请求封装（用于文件上传） */
async function requestFormData(url, formData) {
  const headers = {}
  if (token.value) {
    headers['Authorization'] = `Bearer ${token.value}`
  }
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers,
    body: formData,
  })
  return res.json()
}

export function useAuth() {
  const isLoggedIn = computed(() => currentUser.value !== null)
  const userName = computed(() => currentUser.value?.username ?? '未登录')
  const userAvatar = computed(() => {
    if (currentUser.value?.avatar) return currentUser.value.avatar
    const gender = currentUser.value?.gender || 'male'
    return gender === 'female' ? womanAvatar : manAvatar
  })

  const isAdmin = computed(() => currentUser.value?.username === 'admin')

  /** 根据累计经验计算当前等级（使用 levelConfigs 或回退逻辑） */
  const userLevel = computed(() => {
    const exp = currentUser.value?.exp ?? 0
    if (levelConfigs.value.length > 0) {
      // 从高到低找到第一个满足阈值的等级
      const sorted = [...levelConfigs.value].sort((a, b) => b.exp_required - a.exp_required)
      for (const cfg of sorted) {
        if (exp >= cfg.exp_required) return cfg.level
      }
      return 1
    }
    // 回退：默认阈值
    const fallback = [0, 1000, 5000, 10000, 20000]
    for (let i = fallback.length - 1; i >= 0; i--) {
      if (exp >= fallback[i]) return i + 1
    }
    return 1
  })

  /** 当前等级升级所需总经验 */
  const expMax = computed(() => {
    const lv = userLevel.value
    if (levelConfigs.value.length > 0) {
      // 查找下一级所需经验
      const next = levelConfigs.value.find(c => c.level === lv + 1)
      if (next) return next.exp_required
      return 99999
    }
    const fallback = [0, 1000, 5000, 10000, 20000]
    if (lv >= fallback.length) return 99999
    return fallback[lv]
  })

  /** 当前总经验 */
  const userExp = computed(() => currentUser.value?.exp ?? 0)

  const userGender = computed(() => currentUser.value?.gender ?? 'male')
  const userEmail = computed(() => currentUser.value?.email ?? '')
  const userBio = computed(() => currentUser.value?.bio ?? '')

  /** 获取等级配置 */
  async function fetchLevelConfigs() {
    try {
      const res = await request('/level-configs')
      if (res.code === 200 && Array.isArray(res.data)) {
        levelConfigs.value = res.data
      }
    } catch {
      // 使用回退值
    }
  }

  /** 恢复登录状态（页面刷新时从 localStorage 恢复） */
  async function restoreSession() {
    if (!token.value) return
    try {
      const [profileRes] = await Promise.all([
        request('/user/profile'),
        fetchLevelConfigs(),
      ])
      if (profileRes.code === 200) {
        currentUser.value = {
          name: profileRes.data.username,
          username: profileRes.data.username,
          avatar: profileRes.data.avatar,
          gender: profileRes.data.gender,
          email: profileRes.data.email,
          bio: profileRes.data.bio,
          exp: profileRes.data.exp,
          level: profileRes.data.level,
          expInLevel: profileRes.data.expInLevel,
          expMax: profileRes.data.expMax,
        }
      } else {
        logout()
      }
    } catch {
      // 网络错误不登出
    }
  }

  /** 登录 */
  async function login(username, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    if (res.code === 200) {
      token.value = res.data.token
      localStorage.setItem('mato_token', res.data.token)
      localStorage.setItem('mato_username', res.data.username)
      currentUser.value = {
        name: res.data.username,
        username: res.data.username,
        avatar: res.data.avatar,
        gender: res.data.gender,
        email: res.data.email,
        bio: res.data.bio,
        exp: res.data.exp,
        level: res.data.level,
      }
      fetchLevelConfigs()
      return { success: true, isAdmin: res.data.username === 'admin' }
    }
    return { success: false, msg: res.msg }
  }

  /** 注册 */
  async function register(registerUsername, password, gender, email, code) {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: registerUsername, password, gender, email, code }),
    })
    if (res.code === 200) {
      token.value = res.data.token
      localStorage.setItem('mato_token', res.data.token)
      localStorage.setItem('mato_username', res.data.username)
      currentUser.value = {
        name: res.data.username,
        username: res.data.username,
        avatar: res.data.avatar,
        gender: res.data.gender,
        email: res.data.email,
        bio: res.data.bio,
        exp: res.data.exp,
        level: res.data.level,
      }
      fetchLevelConfigs()
      return { success: true, isAdmin: res.data.username === 'admin' }
    }
    return { success: false, msg: res.msg }
  }

  /** 发送邮箱验证码 */
  async function sendEmailCode(email, type = 'register') {
    const res = await request('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email, type }),
    })
    return { success: res.code === 200, msg: res.msg }
  }

  /** 增加经验 */
  async function addExp(amount, type = '答题', remark = '') {
    if (!token.value) return
    if ((currentUser.value?.exp ?? 0) >= EXP_CAP) return
    try {
      const res = await request('/user/exp/add', {
        method: 'POST',
        body: JSON.stringify({ amount, type, remark }),
      })
      if (res.code === 200 && currentUser.value) {
        currentUser.value.exp = res.data.exp
        currentUser.value.level = res.data.level
      }
      return res
    } catch (e) {
      console.error('[addExp] 经验增加失败:', e)
    }
  }

  /** 重置密码 */
  async function resetPassword(email, code, newPassword) {
    const res = await request('/user/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, password: newPassword }),
    })
    return { success: res.code === 200, msg: res.msg }
  }

  /** 更新个人资料 */
  async function updateProfile(data) {
    const res = await request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    if (res.code === 200 && currentUser.value) {
      if (data.username !== undefined) {
        currentUser.value.username = data.username
        currentUser.value.name = data.username
      }
      if (data.gender !== undefined) {
        currentUser.value.gender = data.gender
      }
      if (data.bio !== undefined) {
        currentUser.value.bio = data.bio
      }
      return { success: true }
    }
    return { success: false, msg: res.msg || '更新失败' }
  }

  /** 上传头像 */
  async function uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await requestFormData('/user/avatar', formData)
    if (res.code === 200 && currentUser.value) {
      currentUser.value.avatar = res.data.avatar
      return { success: true, avatar: res.data.avatar }
    }
    return { success: false, msg: res.msg || '上传失败' }
  }

  /** 每日签到 */
  async function signIn() {
    const res = await request('/user/sign-in', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    if (res.code === 200 && currentUser.value) {
      if (res.data.exp !== undefined) {
        currentUser.value.exp = res.data.exp
      }
      if (res.data.level !== undefined) {
        currentUser.value.level = res.data.level
      }
      return { success: true, expReward: res.data.exp_reward, signed: true, msg: res.msg }
    }
    return { success: false, msg: res.msg || '签到失败', alreadySigned: res.code === 400 }
  }

  function logout() {
    currentUser.value = null
    token.value = ''
    levelConfigs.value = []
    localStorage.removeItem('mato_token')
    localStorage.removeItem('mato_username')
  }

  // 初始化时尝试恢复会话
  restoreSession()

  return {
    isLoggedIn,
    isAdmin,
    userName,
    userAvatar,
    userLevel,
    userGender,
    userEmail,
    userBio,
    userExp,
    expMax,
    login,
    register,
    sendEmailCode,
    resetPassword,
    addExp,
    updateProfile,
    uploadAvatar,
    signIn,
    logout,
    token,
    showAuthModal,
    openAuthModal,
    closeAuthModal,
  }
}
