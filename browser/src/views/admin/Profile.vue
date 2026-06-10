<template>
  <div class="profile-page">
    <!-- 背景拟声词 -->
    <div class="page-bg" aria-hidden="true">
      <span class="bg-sfx bg-sfx--1">PROFILE</span>
      <span class="bg-sfx bg-sfx--2">POW!</span>
    </div>

    <div class="page-inner">
      <!-- 页面头部 -->
      <header class="page-header">
        <span class="header-badge">★ 个人中心 ★</span>
        <h1 class="page-title">英雄档案</h1>
        <p class="page-desc">你的冒险数据全在这里！</p>
      </header>

      <div class="profile-grid">
        <!-- 左侧：头像 + 基础信息 -->
        <section class="profile-card avatar-card">
          <div class="panel-tape panel-tape--left"></div>
          <div class="panel-tape panel-tape--right"></div>

          <!-- 头像区域：可点击上传 -->
          <div class="comic-frame avatar-frame" @click="triggerUpload" title="点击更换头像">
            <div class="avatar-overlay">
              <span class="avatar-overlay-text">📷</span>
            </div>
            <img :src="userAvatar" alt="用户头像" />
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
            <span class="name-text">{{ userName }}</span>
            <span class="gender-badge" :class="userGender === 'female' ? 'gender-female' : 'gender-male'">
              {{ userGender === 'female' ? '♀ 女' : '♂ 男' }}
            </span>
          </div>

          <!-- 个人简介 -->
          <div v-if="userBio" class="bio-row">
            <p class="bio-text">{{ userBio }}</p>
          </div>

          <div class="info-row">
            <svg class="info-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M2 6l10 7 10-7"/>
            </svg>
            <span class="info-text">{{ userEmail || '未绑定邮箱' }}</span>
          </div>

          <button class="comic-btn small" @click="openEditModal">✎ 修改信息</button>
        </section>

        <!-- 右侧：等级 + 经验 + 签到 -->
        <section class="profile-card stats-card">
          <div class="panel-tape panel-tape--left"></div>

          <!-- 等级展示 -->
          <div class="level-hero">
            <span class="level-label">当前等级</span>
            <span class="level-num">LV.{{ userLevel }}</span>
          </div>

          <!-- 经验条 -->
          <div class="exp-section">
            <div class="exp-header">
              <span class="exp-title">经验值</span>
              <span class="exp-nums">
                <span class="exp-cur">{{ userExp }}</span>
                <span class="exp-sep">/</span>
                <span class="exp-max">{{ expMax }}</span>
              </span>
              <span class="exp-pct">{{ expPercent }}%</span>
            </div>
            <div class="exp-bar-wrap">
              <div class="exp-bar-fill" :style="{ width: expPercent + '%' }">
                <span v-if="expPercent > 15" class="exp-bar-label">EXP</span>
              </div>
            </div>
          </div>

          <!-- 签到区域 -->
          <div class="sign-section">
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

      <!-- 底部按钮 -->
      <div class="profile-actions">
        <button class="comic-btn" @click="goBack">← 返回首页</button>
        <button class="comic-btn danger" @click="handleLogout">退出登录</button>
      </div>

      <footer class="page-footer">
        <p class="footer-tip">💢 继续冒险，变得更强大！ 💢</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth.js'

const router = useRouter()
const {
  isLoggedIn, userName, userAvatar, userLevel, userGender,
  userEmail, userBio, userExp, expMax,
  logout, updateProfile, uploadAvatar, signIn,
} = useAuth()

const expPercent = computed(() => {
  if (expMax.value <= 0) return 0
  return Math.min(Math.round((userExp.value / expMax.value) * 100), 100)
})

// ===== 头像上传 =====
const fileInputRef = ref(null)
const uploading = ref(false)

function triggerUpload() {
  fileInputRef.value?.click()
}

async function handleAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const res = await uploadAvatar(file)
    if (!res.success) {
      alert(res.msg || '头像上传失败')
    }
  } catch {
    alert('网络错误，上传失败')
  } finally {
    uploading.value = false
    // 重置 input 以便重复选择同一文件
    if (fileInputRef.value) fileInputRef.value.value = ''
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

onMounted(() => {
  checkTodaySign()
  document.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEsc)
  document.body.style.overflow = ''
})

function handleEsc(e) {
  if (e.key === 'Escape' && showEditModal.value) {
    closeEditModal()
  }
}

function handleLogout() {
  logout()
  router.push('/Home')
}

function goBack() {
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
  margin-bottom: 2.5rem;
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

.profile-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, transparent 40%, rgba(0,0,0,0.06) 41%);
  pointer-events: none;
  opacity: 0.5;
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
