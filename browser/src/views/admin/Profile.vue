<template>
  <div class="profile-page">
    <!-- 背景拟声词 -->
    <div class="page-bg" aria-hidden="true">
      <span class="bg-sfx bg-sfx--1">PROFILE</span>
      <span class="bg-sfx bg-sfx--2">POW!</span>
    </div>

    <div class="page-inner">
      <!-- 页面头部 -->
      <header
        class="page-header"
        :class="{ 'has-custom-bg': headerBg }"
        :style="headerBg ? { backgroundImage: `url(${headerBg})` } : {}"
        @click="!isViewingOthers && triggerHeaderBg()"
        :title="isViewingOthers ? '' : '点击更换页头背景'"
      >
        <button class="back-home-btn" @click.stop="handleGoBack" title="返回上一页">← 返回</button>
        <span class="header-badge">★ 个人中心 ★</span>
        <h1 class="page-title">英雄档案</h1>
        <p class="page-desc">你的冒险数据全在这里！</p>
        <span v-if="!isViewingOthers" class="header-hint">🖼 点击更换背景</span>
      </header>
      <input
        ref="headerBgInputRef"
        type="file"
        accept="image/*"
        style="display:none"
        @change="handleHeaderBgChange"
      />

      <div class="profile-grid">
        <!-- 左侧：头像 + 基础信息 -->
        <section class="profile-card avatar-card">
          <div class="panel-tape panel-tape--left"></div>
          <div class="panel-tape panel-tape--right"></div>

          <!-- 头像区域：可点击上传 -->
          <div v-if="!isViewingOthers" class="comic-frame avatar-frame" @click="triggerUpload" title="点击更换头像">
            <div class="avatar-overlay">
              <span class="avatar-overlay-text">📷</span>
            </div>
            <img :src="getAvatar(userAvatar)" :alt="userName" />
          </div>
          <!-- 查看他人时显示静态头像 -->
          <div v-else class="comic-frame avatar-frame">
            <img :src="getAvatar(otherUser.avatar)" :alt="otherUser.username" />
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            style="display:none"
            @change="handleAvatarChange"
          />
          <span v-if="uploading" class="upload-tip">上传中...</span>

          <div class="name-block">
            <span class="name-text">{{ isViewingOthers ? otherUser.name : userName }}</span>
            <span class="gender-badge" :class="(isViewingOthers ? otherUser.gender : userGender) === 'female' ? 'gender-female' : 'gender-male'">
              {{ (isViewingOthers ? otherUser.gender : userGender) === 'female' ? '♀ 女' : '♂ 男' }}
            </span>
            <!-- 关注/粉丝数量 -->
            <span class="social-item" @click="goToSocialList('following')">
              <span class="social-value">{{ followingCount }}</span>
              <span class="social-label">关注</span>
            </span>
            <span class="social-item" @click="goToSocialList('followers')">
              <span class="social-value">{{ followersCount }}</span>
              <span class="social-label">粉丝</span>
            </span>
          </div>

          <!-- 个人简介 -->
          <div v-if="isViewingOthers ? otherUser.bio : userBio" class="bio-row">
            <p class="bio-text">{{ isViewingOthers ? otherUser.bio : userBio }}</p>
          </div>

          <div class="info-row" v-if="!isViewingOthers">
            <svg class="info-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M2 6l10 7 10-7"/>
            </svg>
            <span class="info-text">{{ userEmail || '未绑定邮箱' }}</span>
          </div>

          <div class="action-row">
            <template v-if="isViewingOthers">
              <FollowButton :userId="targetUserId" />
              <button 
                class="comic-btn small" 
                :disabled="!canSendMessage"
                @click="goToMessages"
                :title="canSendMessage ? '发送私信' : '只有关注的人或粉丝才能私信'"
              >
                💬 私信
              </button>
            </template>
            <template v-else>
              <button class="comic-btn small" @click="openEditModal">✎ 修改信息</button>
              <button class="comic-btn small" @click="goToMessages">💬 私信</button>
            </template>
          </div>
        </section>

        <!-- 右侧：等级 + 经验 + 签到 -->
        <section class="profile-card stats-card">
          <div class="panel-tape panel-tape--left"></div>

          <!-- 等级展示 -->
          <div class="level-hero">
            <span class="level-label">当前等级</span>
            <span class="level-num">LV.{{ isViewingOthers ? otherUser.level : userLevel }}</span>
          </div>

          <!-- 经验条 -->
          <div class="exp-section">
            <div class="exp-header">
              <span class="exp-title">经验值</span>
              <span class="exp-nums">
                <span class="exp-cur">{{ isViewingOthers ? otherUser.exp : userExp }}</span>
                <span class="exp-sep">/</span>
                <span class="exp-max">{{ isViewingOthers ? otherUser.expMax : expMax }}</span>
              </span>
              <span class="exp-pct">{{ isViewingOthers ? Math.round((otherUser.exp / otherUser.expMax) * 100) : expPercent }}%</span>
            </div>
            <div class="exp-bar-wrap">
              <div class="exp-bar-fill" :style="{ width: (isViewingOthers ? Math.round((otherUser.exp / otherUser.expMax) * 100) : expPercent) + '%' }">
                <span v-if="(isViewingOthers ? Math.round((otherUser.exp / otherUser.expMax) * 100) : expPercent) > 15" class="exp-bar-label">EXP</span>
              </div>
            </div>
          </div>

          <!-- 签到区域 -->
          <div class="sign-section" v-if="!isViewingOthers">
            <button
              class="comic-btn sign-btn"
              :class="{ signed: signedToday }"
              :disabled="signedToday || signing"
              @click="handleSignIn"
            >
              {{ signing ? '签到中...' : signedToday ? '今日已签到 ✓' : '📅 每日签到' }}
            </button>
            <span v-if="signMsg" class="sign-msg">{{ signMsg }}</span>
          </div>

          <!-- 统计网格 -->
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-icon">⚡</span>
              <span class="stat-value">{{ userLevel }}</span>
              <span class="stat-label">等级</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⭐</span>
              <span class="stat-value">{{ userExp }}</span>
              <span class="stat-label">总经验</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📧</span>
              <span class="stat-value">{{ userEmail ? '已绑定' : '未绑定' }}</span>
              <span class="stat-label">邮箱</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">{{ userGender === 'female' ? '♀' : '♂' }}</span>
              <span class="stat-value">{{ userGender === 'female' ? '女' : '男' }}</span>
              <span class="stat-label">性别</span>
            </div>
          </div>
        </section>
      </div>

      <!-- 编辑弹窗遮罩 -->
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="comic-modal">
          <div class="modal-header">
            <span class="modal-title">✎ 修改英雄资料</span>
            <button class="modal-close" @click="closeEditModal">✕</button>
          </div>

          <form class="edit-form" @submit.prevent="handleSave">
            <!-- 用户名 -->
            <div class="form-group">
              <label class="form-label">用户名</label>
              <input
                v-model.trim="editForm.username"
                class="form-input"
                type="text"
                placeholder="输入新用户名"
                maxlength="12"
                required
              />
            </div>

            <!-- 性别切换 -->
            <div class="form-group">
              <label class="form-label">性别</label>
              <div class="toggle-group">
                <button
                  type="button"
                  :class="{ active: editForm.gender === 'male' }"
                  @click="editForm.gender = 'male'"
                >♂ 男</button>
                <button
                  type="button"
                  :class="{ active: editForm.gender === 'female' }"
                  @click="editForm.gender = 'female'"
                >♀ 女</button>
              </div>
            </div>

            <!-- 个人简介 -->
            <div class="form-group">
              <label class="form-label">个人简介</label>
              <textarea
                v-model.trim="editForm.bio"
                class="form-input bio-input"
                placeholder="写一句话介绍自己吧..."
                maxlength="100"
                rows="2"
              ></textarea>
            </div>

            <span v-if="editError" class="form-error">{{ editError }}</span>

            <!-- 操作按钮 -->
            <div class="form-actions">
              <button type="button" class="comic-btn white small" @click="closeEditModal">取消</button>
              <button type="submit" class="comic-btn small" :disabled="saving">
                {{ saving ? '保存中...' : '确认修改' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 裁剪头像弹窗 -->
      <AvatarCropper
        v-if="cropFile"
        :file="cropFile"
        @confirm="handleCropConfirm"
        @cancel="handleCropCancel"
      />

      <!-- ====== 作品标签页 ====== -->
      <section class="works-section">
        <div class="works-tabs">
          <button
            v-for="tab in worksTabs"
            :key="tab.key"
            class="works-tab"
            :class="{ active: activeWorksTab === tab.key }"
            @click="switchWorksTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="worksLoading" class="empty-state"><p class="empty-text">加载中...</p></div>
        
        <!-- 作品列表 -->
        <div v-else-if="currentWorks.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p class="empty-text">{{ emptyText }}</p>
        </div>
        <div v-else class="works-grid">
          <article
            v-for="w in currentWorks"
            :key="w.id"
            class="work-mini-card"
            @click="goWorkDetail(w.id)"
          >
            <div class="work-mini-preview">
              <iframe
                v-if="w.html_code"
                :src="`/api/works/render/${w.id}`"
                class="work-mini-iframe"
                sandbox="allow-scripts"
                scrolling="no"
              ></iframe>
              <img v-else :src="w.cover" :alt="w.title" class="work-mini-cover" />
            </div>
            <span v-if="w.status === 0" class="work-status-badge">审核中</span>
            <div class="work-mini-info">
              <h4 class="work-mini-title">{{ w.title }}</h4>
              <div class="work-mini-stats">
                <span>❤ {{ w.like_count }}</span>
                <span>★ {{ w.collect_count }}</span>
                <span>👁 {{ w.view_count }}</span>
              </div>
            </div>
            <button
              v-if="activeWorksTab === 'my'"
              class="work-edit-btn"
              @click.stop="openWorkEdit(w)"
              title="编辑作品"
            >✎</button>
          </article>
        </div>
      </section>

      <!-- 底部按钮 -->
      <div class="profile-actions">
        <button class="comic-btn" @click="handleGoBack">← 返回</button>
        <button class="comic-btn danger" @click="handleLogout">退出登录</button>
      </div>

      <footer class="page-footer">
        <p class="footer-tip">💢 继续冒险，变得更强大！ 💢</p>
      </footer>
    </div>

    <!-- ====== 编辑作品弹窗 ====== -->
    <div v-if="showWorkEdit" class="modal-overlay" @click.self="closeWorkEdit">
      <div class="work-edit-modal">
        <div class="modal-header">
          <span class="modal-title">✎ 编辑作品</span>
          <button class="modal-close" @click="closeWorkEdit">✕</button>
        </div>
        <form class="edit-form" @submit.prevent="handleWorkSave">
          <div class="form-group">
            <label class="form-label">作品名称</label>
            <input v-model.trim="workEditForm.title" class="form-input" maxlength="50" required />
          </div>
          <div class="form-group">
            <label class="form-label">描述</label>
            <input v-model.trim="workEditForm.description" class="form-input" maxlength="200" />
          </div>
          <div class="form-group">
            <label class="form-label">HTML</label>
            <textarea v-model="workEditForm.html_code" class="form-input form-code" rows="4"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">CSS</label>
            <textarea v-model="workEditForm.css_code" class="form-input form-code" rows="4"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">JavaScript</label>
            <textarea v-model="workEditForm.js_code" class="form-input form-code" rows="4"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">外部依赖 <span class="form-hint">(CDN 链接，一行一个)</span></label>
            <textarea v-model="workEditForm.dependencies" class="form-input form-code" rows="3" placeholder="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></textarea>
          </div>
          <span v-if="workEditError" class="form-error">{{ workEditError }}</span>
          <div class="form-actions">
            <button type="button" class="comic-btn white small" @click="closeWorkEdit">取消</button>
            <button type="submit" class="comic-btn small" :disabled="workSaving">
              {{ workSaving ? '保存中...' : '保存修改' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../../stores/auth.js'
import AvatarCropper from '../../components/AvatarCropper.vue'
import FollowButton from '../../components/FollowButton.vue'

const router = useRouter()
const route = useRoute()
const API_BASE = '/api'

// 默认头像
const defaultAvatar = '/assets/man-CFLsZIEw.png'

// 头像处理函数
function getAvatar(avatar) {
  if (!avatar) return defaultAvatar
  if (avatar.startsWith('http')) return avatar
  return avatar
}

// 是否查看他人资料
const isViewingOthers = ref(false)
const targetUserId = ref(null)
const otherUser = reactive({
  id: null,
  name: '',
  avatar: '',
  level: 0,
  gender: 'male',
  bio: '',
  exp: 0,
  expMax: 0,
})

// ── 页头背景 ──
const headerBg = ref(localStorage.getItem('mato_header_bg') || '')
const headerBgInputRef = ref(null)

function triggerHeaderBg() {
  headerBgInputRef.value?.click()
}

function handleHeaderBgChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const result = reader.result
    if (typeof result !== 'string') return

    headerBg.value = result
    try {
      localStorage.setItem('mato_header_bg', result)
    } catch {
      alert('图片太大，无法保存为页头背景，请换一张小一点的图片')
    }
  }
  reader.readAsDataURL(file)

  if (headerBgInputRef.value) headerBgInputRef.value.value = ''
}

function goBackHome() {
  handleGoBack()
}

function handleGoBack() {
  const fromPath = sessionStorage.getItem('mato_from_path')
  if (fromPath) {
    sessionStorage.removeItem('mato_from_path')
    router.push(fromPath)
  } else if (isViewingOthers.value) {
    router.push('/SocialList')
  } else {
    router.push('/Home')
  }
}

function goToUserProfile(userId) {
  sessionStorage.setItem('mato_from_path', `/SocialList`)
  router.push(`/Profile/${userId}`)
}

function goToSocialList(type) {
  sessionStorage.setItem('mato_from_path', route.fullPath)
  router.push(`/SocialList?type=${type}`)
}

function goToMessages() {
  if (isViewingOthers.value && targetUserId.value) {
    sessionStorage.setItem('mato_from_path', route.fullPath)
    router.push(`/Messages?userId=${targetUserId.value}`)
  } else {
    router.push('/Messages')
  }
}

const {
  isLoggedIn, userName, userAvatar, userLevel, userGender,
  userEmail, userBio, userExp, expMax, token,
  logout, updateProfile, uploadAvatar, signIn,
} = useAuth()

const expPercent = computed(() => {
  if (expMax.value <= 0) return 0
  return Math.min(Math.round((userExp.value / expMax.value) * 100), 100)
})

// ===== 头像上传（带裁剪） =====
const fileInputRef = ref(null)
const uploading = ref(false)
const cropFile = ref(null)

function triggerUpload() {
  fileInputRef.value?.click()
}

function handleAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  // 打开裁剪弹窗
  cropFile.value = file
  // 重置 input 以便重复选择同一文件
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function handleCropCancel() {
  cropFile.value = null
}

async function handleCropConfirm(croppedFile) {
  cropFile.value = null
  uploading.value = true
  try {
    const res = await uploadAvatar(croppedFile)
    if (res.success) {
      // 头像上传成功后，刷新页面以更新头像显示
      window.location.reload()
    } else {
      alert(res.msg || '头像上传失败')
    }
  } catch {
    alert('网络错误，上传失败')
  } finally {
    uploading.value = false
  }
}

// ===== 编辑弹窗 =====
const showEditModal = ref(false)
const saving = ref(false)
const editError = ref('')
const editForm = reactive({
  username: '',
  gender: 'male',
  bio: '',
})

function openEditModal() {
  editForm.username = userName.value === '未登录' ? '' : userName.value
  editForm.gender = userGender.value || 'male'
  editForm.bio = userBio.value || ''
  editError.value = ''
  showEditModal.value = true
  document.body.style.overflow = 'hidden'
}

function closeEditModal() {
  showEditModal.value = false
  document.body.style.overflow = ''
}

// 防止弹窗内滚动穿透
function lockBodyScroll() {
  if (showEditModal.value) {
    document.body.style.overflow = 'hidden'
  }
}

async function handleSave() {
  editError.value = ''
  if (!editForm.username) {
    editError.value = '用户名不能为空'
    return
  }
  if (editForm.username.length < 2) {
    editError.value = '用户名至少2个字符'
    return
  }
  saving.value = true
  try {
    const res = await updateProfile({
      username: editForm.username,
      gender: editForm.gender,
      bio: editForm.bio,
    })
    if (res.success) {
      closeEditModal()
    } else {
      editError.value = res.msg || '保存失败，请重试'
    }
  } catch {
    editError.value = '网络错误，请重试'
  } finally {
    saving.value = false
  }
}

// ===== 签到 =====
const signedToday = ref(false)
const signing = ref(false)
const signMsg = ref('')

async function handleSignIn() {
  signing.value = true
  signMsg.value = ''
  try {
    const res = await signIn()
    if (res.success) {
      signedToday.value = true
      signMsg.value = `签到成功！+${res.expReward || 0} EXP`
    } else if (res.alreadySigned) {
      signedToday.value = true
      signMsg.value = '今日已签到'
    } else {
      signMsg.value = res.msg || '签到失败'
    }
  } catch {
    signMsg.value = '网络错误'
  } finally {
    signing.value = false
  }
}

// 判断今天是否已签到（简单用 localStorage 记录）
function checkTodaySign() {
  const today = new Date().toISOString().slice(0, 10)
  const lastSign = localStorage.getItem('mato_sign_date')
  if (lastSign === today) {
    signedToday.value = true
  }
}

// ===== 标签页 =====
const worksTabs = [
  { key: 'my', label: '我的代码' },
  { key: 'likes', label: '我的点赞' },
  { key: 'collections', label: '我的收藏' },
]
const activeWorksTab = ref('my')
const currentWorks = ref([])
const worksLoading = ref(false)

// 关注/粉丝数量
const followingCount = ref(0)
const followersCount = ref(0)
const canSendMessage = ref(false)

const emptyText = computed(() => {
  const map = { 
    my: '你还没有上传作品', 
    likes: '你还没有点赞的作品', 
    collections: '你还没有收藏的作品'
  }
  return map[activeWorksTab.value] || ''
})

async function apiRequest(url, options = {}) {
  const headers = { ...options.headers }
  if (token.value) headers['Authorization'] = `Bearer ${token.value}`
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers })
  return res.json()
}

async function fetchWorks() {
  if (!isLoggedIn.value) return
  worksLoading.value = true
  try {
    if (activeWorksTab.value === 'following') {
      const res = await apiRequest('/social/following')
      if (res.code === 200) {
        followingList.value = res.data.list
        followingCount.value = res.data.total || 0
      }
    } else if (activeWorksTab.value === 'followers') {
      const res = await apiRequest('/social/followers')
      if (res.code === 200) {
        followersList.value = res.data.list
        followersCount.value = res.data.total || 0
      }
    } else {
      const map = { my: '/works/my/works', likes: '/works/my/likes', collections: '/works/my/collections' }
      const res = await apiRequest(map[activeWorksTab.value])
      if (res.code === 200) {
        currentWorks.value = res.data
      }
    }
  } catch (e) {
    console.error('[Profile/works]', e)
  } finally {
    worksLoading.value = false
  }
}

async function fetchOtherUserWorks(userId) {
  worksLoading.value = true
  try {
    const res = await fetch(`${API_BASE}/works/user/${userId}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    const data = await res.json()
    if (data.code === 200) {
      currentWorks.value = data.data
    }
  } catch (e) {
    console.error('[Profile/otherWorks]', e)
  } finally {
    worksLoading.value = false
  }
}

async function fetchOtherUserSocialCounts(userId) {
  try {
    const res = await fetch(`${API_BASE}/social/counts/${userId}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    const data = await res.json()
    if (data.code === 200) {
      followingCount.value = data.data.following || 0
      followersCount.value = data.data.followers || 0
      canSendMessage.value = !!data.data.isFollowing || !!data.data.isFollowed
    }
  } catch (e) {
    console.error('[Profile/otherSocialCounts]', e)
  }
}

function switchWorksTab(key) {
  activeWorksTab.value = key
  fetchWorks()
}

function goWorkDetail(id) {
  router.push(`/WorkDetail/${id}`)
}

// ===== 编辑作品 =====
const showWorkEdit = ref(false)
const workSaving = ref(false)
const workEditError = ref('')
const editingWorkId = ref(null)
const workEditForm = reactive({
  title: '',
  description: '',
  html_code: '',
  css_code: '',
  js_code: '',
  dependencies: '',
})

function openWorkEdit(work) {
  editingWorkId.value = work.id
  workEditForm.title = work.title
  workEditForm.description = work.description || ''
  workEditForm.html_code = work.html_code || ''
  workEditForm.css_code = work.css_code || ''
  workEditForm.js_code = work.js_code || ''
  workEditForm.dependencies = work.dependencies || ''
  workEditError.value = ''
  showWorkEdit.value = true
  document.body.style.overflow = 'hidden'
}

function closeWorkEdit() {
  showWorkEdit.value = false
  document.body.style.overflow = ''
}

async function handleWorkSave() {
  if (!workEditForm.title) {
    workEditError.value = '作品名称不能为空'
    return
  }
  workSaving.value = true
  workEditError.value = ''
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (token.value) headers['Authorization'] = `Bearer ${token.value}`
    const res = await fetch(`${API_BASE}/works/${editingWorkId.value}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(workEditForm),
    }).then(r => r.json())

    if (res.code === 200) {
      closeWorkEdit()
      fetchWorks()
    } else {
      workEditError.value = res.msg || '保存失败'
    }
  } catch {
    workEditError.value = '网络错误'
  } finally {
    workSaving.value = false
  }
}

async function fetchSocialCounts() {
  if (!isLoggedIn.value) return
  try {
    const [followingRes, followersRes] = await Promise.all([
      apiRequest('/social/following'),
      apiRequest('/social/followers')
    ])
    if (followingRes.code === 200) {
      followingCount.value = followingRes.data.total || 0
    }
    if (followersRes.code === 200) {
      followersCount.value = followersRes.data.total || 0
    }
  } catch (e) {
    console.error('[Profile/socialCounts]', e)
  }
}

async function fetchOtherUser(userId) {
  try {
    const res = await fetch(`${API_BASE}/user/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    const data = await res.json()
    if (data.code === 200) {
      const u = data.data
      otherUser.id = u.id
      otherUser.name = u.username
      otherUser.avatar = u.avatar || ''
      otherUser.level = u.level || 0
      otherUser.gender = u.gender || 'male'
      otherUser.bio = u.bio || ''
      otherUser.exp = u.exp || 0
      otherUser.expMax = u.expMax || 100
    }
  } catch (err) {
    console.error('fetchOtherUser error:', err)
  }
}

onMounted(() => {
  loadUserData()
  document.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEsc)
  document.body.style.overflow = ''
})

function loadUserData() {
  const userId = route.params.userId
  if (userId) {
    isViewingOthers.value = true
    targetUserId.value = userId
    fetchOtherUser(userId)
    fetchOtherUserWorks(userId)
    fetchOtherUserSocialCounts(userId)
    headerBg.value = ''
  } else {
    isViewingOthers.value = false
    targetUserId.value = null
    checkTodaySign()
    fetchWorks()
    fetchSocialCounts()
    headerBg.value = localStorage.getItem('mato_header_bg') || ''
  }
}

import { watch } from 'vue'
watch(() => route.params.userId, (newUserId) => {
  loadUserData()
})

function handleEsc(e) {
  if (e.key === 'Escape') {
    if (showWorkEdit.value) closeWorkEdit()
    else if (showEditModal.value) closeEditModal()
  }
}

function handleLogout() {
  logout()
  router.push('/Home')
}

</script>

<style lang="scss" scoped>
.profile-page {
  position: relative;
  min-height: calc(100vh - 140px);
  padding: 1rem 0 3rem;
}

/* 背景拟声词 */
.page-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.bg-sfx {
  position: absolute;
  font-family: 'Bangers', 'Impact', sans-serif;
  font-weight: 900;
  color: #000;
  -webkit-text-stroke: 1px #fff;
  paint-order: stroke fill;
  opacity: 0.05;
  pointer-events: none;
}

.bg-sfx--1 {
  font-size: 8rem;
  top: 5%;
  right: -3%;
  transform: rotate(12deg);
}

.bg-sfx--2 {
  font-size: 5rem;
  bottom: 10%;
  left: -2%;
  transform: rotate(-8deg);
}

.page-inner {
  position: relative;
  z-index: 1;
  width: 96%;
  max-width: 1100px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 0;
  position: relative;
  overflow: hidden;
  padding: 2.5rem 1rem;
  cursor: pointer;
}
.page-header::before {
  content: '';
  position: absolute;
  inset: 0;
  bottom: auto;
  aspect-ratio: 32 / 9;
  width: 100%;
  background: linear-gradient(135deg, #000 0%, #333 50%, #ffd700 100%);
  mask-image: linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%);
  z-index: 0;
}
.page-header.has-custom-bg::before { display: none; }
.page-header.has-custom-bg { background-size: cover; background-position: center; background-repeat: no-repeat; }
.page-header > * { position: relative; z-index: 1; }
.header-hint { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); color: #fff; font-family: 'Bangers', sans-serif; font-size: 1.4rem; letter-spacing: 2px; opacity: 0; transition: opacity 0.2s; z-index: 2; pointer-events: none; }
.page-header:hover .header-hint { opacity: 1; }

.back-home-btn {
  position: absolute;
  top: 0.8rem;
  left: 1rem;
  z-index: 3;
  padding: 0.3rem 0.7rem;
  border: 2px solid #444;
  background: rgba(0,0,0,0.7);
  color: #ccc;
  font-family: 'Bangers', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 1px;
  cursor: pointer;
  border-radius: 4px;
  &:hover { background: #ffd700; color: #000; border-color: #ffd700; }
}

.header-badge {
  display: inline-block;
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 0.95rem;
  letter-spacing: 3px;
  color: #fff;
  background: #000;
  padding: 0.3rem 1.5rem;
  border: 2px solid #fff;
  box-shadow: 3px 3px 0 #555;
  transform: rotate(-1deg);
  margin-bottom: 1rem;
}

.page-title {
  font-family: 'Bangers', 'Impact', 'Arial Black', sans-serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  color: #fff;
  -webkit-text-stroke: 3px #000;
  text-stroke: 3px #000;
  paint-order: stroke fill;
  text-shadow: 4px 4px 0 #000, 6px 6px 0 rgba(0,0,0,0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0.5rem 0;
}

.page-desc {
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  font-size: 1.1rem;
  color: #555;
  margin-top: 0.3rem;
}

/* 双列网格 */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* 卡片 */
.profile-card {
  position: relative;
  background: #fff;
  border: 4px solid #000;
  box-shadow: 8px 8px 0 rgba(0,0,0,0.2);
  padding: 2rem;
  overflow: hidden;
}

/* 胶带 */
.panel-tape {
  position: absolute;
  z-index: 2;
  width: 70px;
  height: 18px;
  background: #f0f0f0;
  border: 2px solid #000;
  box-shadow: -2px 2px rgba(0,0,0,0.3);
}

.panel-tape--left {
  top: -6px;
  left: 28px;
  transform: skew(-12deg);
}

.panel-tape--right {
  top: -6px;
  right: 28px;
  transform: skew(12deg);
}

/* 头像卡片 */
.avatar-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  transform: rotate(-0.5deg);
}

.avatar-frame {
  margin: 0;
  width: 180px;
  height: 180px;
  padding: 0.8rem;
  cursor: pointer;
  position: relative;
}

.avatar-frame:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay {
  position: absolute;
  inset: 0.8rem;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.45);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.avatar-overlay-text {
  font-size: 2rem;
  filter: grayscale(0);
}

.avatar-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
}

.upload-tip {
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  font-size: 0.85rem;
  color: #888;
}

.name-block {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}

.name-text {
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1.8rem;
  font-weight: 900;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.gender-badge {
  display: inline-block;
  font-family: 'Comic Neue', cursive;
  font-weight: 800;
  font-size: 0.9rem;
  padding: 0.2rem 0.8rem;
  border: 2px solid #000;
  box-shadow: 2px 2px 0 #aaa;
  transform: rotate(-1deg);
}

.gender-male {
  background: #dbeafe;
  color: #1e40af;
}

.gender-female {
  background: #fce7f3;
  color: #be185d;
}

/* 个人简介 */
.bio-row {
  width: 100%;
  text-align: center;
  background: #fdf6e3;
  border: 2px solid #000;
  padding: 0.6rem 1rem;
  box-shadow: 2px 2px 0 #ddd;
  transform: rotate(0.5deg);
}

.bio-text {
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  font-size: 0.9rem;
  color: #444;
  line-height: 1.4;
  margin: 0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  font-size: 0.95rem;
  color: #444;
  background: #f8f8f8;
  border: 2px solid #000;
  padding: 0.5rem 1rem;
  box-shadow: 2px 2px 0 #ccc;
  width: 100%;
}

.info-icon {
  flex-shrink: 0;
  color: #555;
}

.info-text {
  word-break: break-all;
}

/* 操作按钮行 */
.action-row {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  margin-top: 0.8rem;
}

/* 关注/粉丝数量 - 与用户名同行 */
.social-item {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
  cursor: pointer;
  transition: opacity 0.2s;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  
  &:hover {
    opacity: 0.7;
    background: rgba(0,0,0,0.05);
  }
}

.social-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #000;
}

.social-label {
  font-size: 0.8rem;
  color: #666;
}

/* 统计卡片 */
.stats-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transform: rotate(0.5deg);
}

.level-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.level-label {
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  font-size: 0.95rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.level-num {
  font-family: 'Bangers', 'Impact', 'Arial Black', sans-serif;
  font-size: 3.5rem;
  font-weight: 900;
  color: #000;
  background: #ffd700;
  padding: 0.2rem 1.5rem;
  border: 3px solid #000;
  box-shadow: 4px 4px 0 #000;
  transform: rotate(-1deg);
}

/* 经验条 */
.exp-section {
  background: #f8f8f8;
  border: 3px solid #000;
  padding: 1rem 1.2rem;
  box-shadow: 3px 3px 0 #ccc;
}

.exp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.exp-title {
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1rem;
  letter-spacing: 1px;
  color: #333;
}

.exp-nums {
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.exp-cur {
  font-weight: 900;
  color: #000;
}

.exp-sep {
  opacity: 0.4;
  margin: 0 1px;
}

.exp-max {
  opacity: 0.6;
}

.exp-pct {
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 0.85rem;
  color: #fff;
  background: #000;
  padding: 0.1rem 0.5rem;
}

.exp-bar-wrap {
  width: 100%;
  height: 28px;
  background: #e5e5e5;
  border: 2px solid #000;
  position: relative;
  overflow: hidden;
}

.exp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700 0%, #ffaa00 100%);
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  position: relative;
}

.exp-bar-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 4px,
    rgba(255,255,255,0.25) 4px,
    rgba(255,255,255,0.25) 8px
  );
}

.exp-bar-label {
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 0.75rem;
  color: #000;
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
}

/* 签到区域 */
.sign-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.sign-btn {
  width: 100%;
}

.sign-btn.signed {
  background: #888;
  border-color: #666;
  box-shadow: 2px 2px 0 #fff, 4px 4px 0 #666;
  cursor: default;
  color: #ddd;
}

.sign-btn.signed:hover {
  transform: none;
  background: #888;
}

.sign-msg {
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  font-size: 0.85rem;
  color: #4ecdc4;
  text-align: center;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  background: #fff;
  border: 2px solid #000;
  padding: 0.7rem 0.4rem;
  box-shadow: 2px 2px 0 #ddd;
  transform: rotate(-0.5deg);
  &.clickable {
    cursor: pointer;
    &:hover {
      background: #f0f0f0;
      transform: rotate(-0.5deg) scale(1.05);
      box-shadow: 3px 3px 0 #000;
    }
  }
}

.stat-item:nth-child(even) {
  transform: rotate(0.5deg);
}

.stat-icon {
  font-size: 1.3rem;
}

.stat-value {
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1.2rem;
  font-weight: 900;
  color: #000;
}

.stat-label {
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
}

/* 底部按钮 */
.profile-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* 页脚 */
.page-footer {
  text-align: center;
}

.footer-tip {
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  font-size: 1rem;
  color: #666;
  transform: rotate(-0.5deg);
}

/* ==================== 弹窗样式 ==================== */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 20000;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(135deg, rgba(10,10,10,0.85), rgba(245,245,245,0.5)),
    radial-gradient(circle at 30% 40%, rgba(255,255,255,0.14) 1.5px, transparent 1.5px);
  background-size: auto, 18px 18px;
  backdrop-filter: blur(6px);
}

.comic-modal {
  background: #fff;
  border: 5px solid #000;
  box-shadow: 12px 12px 0 rgba(0,0,0,0.3);
  width: 92%;
  max-width: 440px;
  padding: 0;
  transform: rotate(-0.3deg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #000;
  color: #fff;
  padding: 0.7rem 1.2rem;
}

.modal-title {
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1.2rem;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.modal-close {
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1.3rem;
  color: #fff;
  background: none;
  border: 2px solid #fff;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s, color 0.12s;
}

.modal-close:hover {
  background: #fff;
  color: #000;
}

.edit-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1rem;
  letter-spacing: 1px;
  color: #333;
  text-transform: uppercase;
}

.form-hint {
  font-family: 'Comic Neue', cursive;
  font-size: 0.7rem;
  font-weight: 400;
  color: #aaa;
  text-transform: none;
  letter-spacing: 0;
}

.form-input {
  width: 100%;
  min-height: 48px;
  padding: 0.7rem 1rem;
  border: 3px solid #000;
  background: #fff;
  color: #111;
  font-family: 'Comic Neue', cursive;
  font-weight: 800;
  font-size: 1rem;
  outline: none;
  box-shadow: 3px 3px 0 #c9c9c9;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  resize: vertical;
  &::selection { color: #000; }
}

.form-input:focus {
  background: #f7f7f7;
  box-shadow: 5px 5px 0 #000;
  transform: translateY(-2px);
}

.bio-input {
  min-height: 64px;
}

.form-error {
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  font-size: 0.85rem;
  color: #c00;
}

.toggle-group {
  display: inline-grid;
  grid-template-columns: repeat(2, 1fr);
  border: 3px solid #000;
  box-shadow: 4px 4px 0 #000;
  background: #fff;
  overflow: hidden;
  width: 100%;
}

.toggle-group button {
  padding: 0.6rem 0.8rem;
  border: 0;
  background: #fff;
  color: #000;
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}

.toggle-group button + button {
  border-left: 3px solid #000;
}

.toggle-group button.active {
  background: #000;
  color: #fff;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 0.3rem;
}

.form-actions .comic-btn.small {
  min-width: auto;
  padding: 0.65rem 1.4rem;
  font-size: 0.95rem;
}

/* ==================== 作品标签页 ==================== */

.works-section {
  margin-bottom: 2rem;
}

.works-tabs {
  display: flex;
  gap: 0;
  border-bottom: 4px solid #000;
  margin-bottom: 1.2rem;
}

.works-tab {
  padding: 0.7rem 1.5rem;
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1rem;
  letter-spacing: 1px;
  border: 4px solid #000;
  border-bottom: none;
  background: #e5e5e5;
  color: #666;
  cursor: pointer;
  transition: all 0.12s;
  margin-right: 4px;
  &:hover { background: #ddd; color: #333; }
  &.active {
    background: #ffd700;
    color: #000;
    box-shadow: 3px -3px 0 rgba(0,0,0,0.15);
  }
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }

.empty-text {
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1.1rem;
  color: #aaa;
  letter-spacing: 1px;
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.work-mini-card {
  position: relative;
  background: #fff;
  border: 3px solid #000;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.15);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.12s, box-shadow 0.12s;
  &:hover { transform: translateY(-2px); box-shadow: 6px 6px 0 rgba(0,0,0,0.2); }
}

.work-mini-preview {
  width: 100%;
  aspect-ratio: 16/10;
  overflow: hidden;
  border-bottom: 2px solid #000;
  background: #fff;
}

.work-mini-iframe {
  width: 200%;
  height: 200%;
  border: none;
  pointer-events: none;
  transform: scale(0.5);
  transform-origin: top left;
}

.work-mini-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.work-status-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: #ffd700;
  color: #000;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 3px;
  font-family: 'Bangers', sans-serif;
  letter-spacing: 1px;
  z-index: 1;
}

.work-mini-info {
  padding: 0.6rem 0.8rem;
}

.work-mini-title {
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  color: #000;
  margin: 0 0 0.3rem;
}

.work-mini-stats {
  display: flex;
  gap: 0.8rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: #888;
}

.work-edit-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  border: 2px solid #000;
  background: #ffd700;
  font-family: 'Bangers', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  &:hover { background: #000; color: #ffd700; }
}

/* 关注/粉丝列表样式 */
.social-list {
  margin-top: 1rem;
}

.social-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: #fff;
  border: 3px solid #000;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.15);
  padding: 0.8rem;
  transition: transform 0.12s, box-shadow 0.12s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 6px 6px 0 rgba(0,0,0,0.2);
  }
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid #000;
  object-fit: cover;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1rem;
  letter-spacing: 0.5px;
  color: #000;
  margin-bottom: 0.1rem;
}

.user-level {
  font-family: 'Comic Neue', cursive;
  font-size: 0.75rem;
  color: #888;
}

/* ==================== 编辑作品弹窗 ==================== */

.work-edit-modal {
  background: #fff;
  border: 5px solid #000;
  box-shadow: 12px 12px 0 rgba(0,0,0,0.3);
  width: 92%;
  max-width: 640px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 0;
}

.form-code {
  font-family: 'Courier New', 'Consolas', monospace;
  font-size: 0.8rem;
  background: #1e1e2e;
  color: #e0e0e0;
  border-color: #333;
  min-height: 60px;
  &::selection { color: #000; }
}

/* ==================== 响应式 ==================== */

/* 手机端 */
@media (max-width: 767px) {
  .profile-grid {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }

  .profile-card {
    padding: 1.2rem;
    border-width: 3px;
  }

  .avatar-frame {
    width: 130px;
    height: 130px;
    padding: 0.6rem;
  }

  .name-text {
    font-size: 1.3rem;
  }

  .level-num {
    font-size: 2.5rem;
    padding: 0.15rem 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .works-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .social-grid {
    grid-template-columns: 1fr;
  }

  .profile-actions {
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
  }

  .profile-actions .comic-btn {
    min-width: 200px;
  }

  .panel-tape {
    width: 50px;
    height: 12px;
  }

  .panel-tape--left {
    left: 15px;
  }

  .panel-tape--right {
    right: 15px;
  }

  .bg-sfx--1 {
    font-size: 4rem;
    top: 8%;
  }

  .bg-sfx--2 {
    font-size: 2.5rem;
    bottom: 15%;
  }

  .sign-section {
    gap: 0.3rem;
  }
}

/* 平板端 */
@media (min-width: 768px) and (max-width: 1023px) {
  .profile-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .profile-card {
    padding: 1.5rem;
  }

  .avatar-frame {
    width: 150px;
    height: 150px;
  }

  .level-num {
    font-size: 3rem;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
