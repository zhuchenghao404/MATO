<template>
  <div class="social-list-page">
    <div class="page-inner">
      <!-- 页面头部 -->
      <header class="page-header">
        <button class="back-btn" @click="handleGoBack">← 返回</button>
        <h1 class="page-title">
          <span class="title-icon">{{ type === 'following' ? '👥' : '🌟' }}</span>
          {{ type === 'following' ? '我的关注' : '我的粉丝' }}
        </h1>
      </header>

      <!-- 标签切换 -->
      <div class="tab-bar">
        <button 
          class="tab-btn" 
          :class="{ active: type === 'following' }"
          @click="switchType('following')"
        >
          <span class="tab-icon">👥</span>
          <span class="tab-label">关注</span>
          <span class="tab-count">{{ followingCount }}</span>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: type === 'followers' }"
          @click="switchType('followers')"
        >
          <span class="tab-icon">🌟</span>
          <span class="tab-label">粉丝</span>
          <span class="tab-count">{{ followersCount }}</span>
        </button>
      </div>

      <!-- 用户列表 -->
      <div class="user-list">
        <div v-if="loading" class="loading">
          <span class="loading-icon">⏳</span>
          <span class="loading-text">加载中...</span>
        </div>
        <div v-else-if="users.length === 0" class="empty">
          <span class="empty-icon">{{ type === 'following' ? '👻' : '😢' }}</span>
          <span class="empty-text">{{ type === 'following' ? '暂无关注' : '暂无粉丝' }}</span>
        </div>
        <div 
          v-else 
          v-for="user in users" 
          :key="user.id" 
          class="user-card"
          @click="goToProfile(user.id)"
        >
          <div class="user-avatar-wrap">
            <img :src="getAvatar(user.avatar)" :alt="user.username" class="user-avatar" />
            <span class="user-level-badge">Lv.{{ user.level || 0 }}</span>
          </div>
          <div class="user-info">
            <span class="user-name">{{ user.username }}</span>
            <span class="user-relation" v-if="getRelationText(user)">{{ getRelationText(user) }}</span>
          </div>
          <button 
            v-if="user.id !== currentUserId" 
            class="follow-btn"
            :class="getFollowBtnClass(user)"
            @click.stop="toggleFollow(user)"
          >
            {{ getFollowBtnText(user) }}
          </button>
          <span v-else class="self-tag">自己</span>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="page-btn" 
          :disabled="page <= 1"
          @click="changePage(page - 1)"
        >
          ← 上一页
        </button>
        <span class="page-info">第 {{ page }} / {{ totalPages }} 页</span>
        <button 
          class="page-btn" 
          :disabled="page >= totalPages"
          @click="changePage(page + 1)"
        >
          下一页 →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../../stores/auth.js'
import manAvatar from '../../assets/HOMEImage/man.png'
import womanAvatar from '../../assets/HOMEImage/woman.png'

const router = useRouter()
const route = useRoute()
const { currentUser } = useAuth()

const type = ref(route.query.type || 'following')
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const users = ref([])
const total = ref(0)
const followingCount = ref(0)
const followersCount = ref(0)

const currentUserId = ref(null)

function getAvatar(avatar) {
  if (!avatar) {
    return manAvatar
  }
  if (avatar.startsWith('http')) return avatar
  return avatar
}

function handleGoBack() {
  const fromPath = sessionStorage.getItem('mato_from_path')
  if (fromPath) {
    sessionStorage.removeItem('mato_from_path')
    router.push(fromPath)
  } else {
    router.push('/Profile')
  }
}

function switchType(newType) {
  type.value = newType
  page.value = 1
  loadUsers()
}

function changePage(newPage) {
  page.value = newPage
  loadUsers()
  window.scrollTo(0, 0)
}

function goToProfile(userId) {
  sessionStorage.setItem('mato_from_path', `/SocialList?type=${type.value}`)
  router.push(`/Profile/${userId}`)
}

function getRelationText(user) {
  if (user.id === currentUserId.value) return ''
  
  if (type.value === 'following') {
    if (user.isFollowed) return '互相关注'
    return ''
  } else {
    if (user.isFollowing) return '互相关注'
    return ''
  }
}

function getFollowBtnClass(user) {
  const classes = []
  
  if (type.value === 'following') {
    classes.push('following')
    if (user.isFollowed) {
      classes.push('mutual')
    }
  } else {
    if (user.isFollowing) {
      classes.push('following mutual')
    }
  }
  
  return classes
}

function getFollowBtnText(user) {
  if (type.value === 'following') {
    if (user.isFollowed) return '互相关注'
    return '已关注'
  } else {
    if (user.isFollowing) return '互相关注'
    return '关注'
  }
}

async function toggleFollow(user) {
  try {
    const currentIsFollowing = type.value === 'following' || (type.value === 'followers' && user.isFollowing)
    
    if (currentIsFollowing) {
      await fetch('/api/social/unfollow', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('mato_token')}`
        },
        body: JSON.stringify({ followeeId: user.id })
      })
      
      if (type.value === 'following') {
        user.isFollowed = false
        followingCount.value--
        users.value = users.value.filter(u => u.id !== user.id)
      } else {
        user.isFollowing = false
      }
    } else {
      await fetch('/api/social/follow', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('mato_token')}`
        },
        body: JSON.stringify({ followeeId: user.id })
      })
      
      user.isFollowing = true
      if (type.value === 'followers') {
        followersCount.value++
      }
    }
  } catch (e) {
    console.error('操作失败', e)
  }
}

async function loadUsers() {
  loading.value = true
  try {
    const endpoint = type.value === 'following' ? '/api/social/following' : '/api/social/followers'
    const params = new URLSearchParams({ page: page.value, pageSize })
    
    const res = await fetch(`${endpoint}?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('mato_token')}` }
    })
    const data = await res.json()
    
    if (data.code === 200) {
      users.value = data.data.list || []
      total.value = data.data.total || 0
      
      const countsRes = await fetch('/api/social/counts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('mato_token')}` }
      })
      const countsData = await countsRes.json()
      if (countsData.code === 200) {
        followingCount.value = countsData.data.following || 0
        followersCount.value = countsData.data.followers || 0
      }
    }
  } catch (e) {
    console.error('加载失败', e)
  } finally {
    loading.value = false
  }
}

const totalPages = computed(() => Math.ceil(total.value / pageSize))

onMounted(() => {
  if (currentUser.value) {
    currentUserId.value = currentUser.value.id
  }
  loadUsers()
})

watch(() => route.query.type, (newType) => {
  if (newType) {
    type.value = newType
    page.value = 1
    loadUsers()
  }
})
</script>

<style lang="scss" scoped>
.social-list-page {
  min-height: 100vh;
  background: #fff;
}

.page-inner {
  width: 96%;
  max-width: 700px;
  margin: 0 auto;
  padding: 1.5rem 0 3rem;
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.2rem;
  background: #000;
  border: 4px solid #000;
  box-shadow: 6px 6px 0 #ffd700;
  margin-bottom: 1.5rem;
}

.back-btn {
  padding: 0.4rem 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid #fff;
  color: #fff;
  font-family: 'Bangers', sans-serif;
  font-size: 0.9rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: #ffd700;
    color: #000;
    border-color: #ffd700;
  }
}

.page-title {
  flex: 1;
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1.5rem;
  color: #fff;
  letter-spacing: 2px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 1.3rem;
}

/* 标签切换 */
.tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.7rem 0.8rem;
  background: #fff;
  border: 3px solid #000;
  box-shadow: 3px 3px 0 #ddd;
  font-family: 'Bangers', sans-serif;
  font-size: 0.95rem;
  letter-spacing: 1px;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 5px 5px 0 #bbb;
  }
  &.active {
    background: #ffd700;
    color: #000;
    box-shadow: 3px 3px 0 #000;
  }
}

.tab-icon {
  font-size: 1.1rem;
}

.tab-label {
  font-weight: 700;
}

.tab-count {
  background: rgba(0,0,0,0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 8px;
  font-size: 0.8rem;
}

.tab-btn.active .tab-count {
  background: rgba(0,0,0,0.2);
}

/* 用户列表 */
.user-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem;
  background: #fff;
  border: 3px solid #000;
  box-shadow: 3px 3px 0 #eee;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    transform: translateY(-1px) translateX(3px);
    box-shadow: 5px 5px 0 #ccc;
  }
}

.user-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.user-avatar {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  border: 3px solid #000;
  object-fit: cover;
  background: #f5f5f5;
}

.user-level-badge {
  position: absolute;
  bottom: -3px;
  right: -3px;
  background: #ffd700;
  color: #000;
  font-family: 'Bangers', sans-serif;
  font-size: 0.65rem;
  padding: 0.1rem 0.35rem;
  border: 2px solid #000;
  box-shadow: 1px 1px 0 #000;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.user-name {
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1.1rem;
  color: #000;
  letter-spacing: 1px;
}

.user-relation {
  font-family: 'Comic Neue', cursive;
  font-size: 0.75rem;
  color: #4ecdc4;
  font-weight: 700;
}

/* 关注按钮 */
.follow-btn {
  padding: 0.4rem 1rem;
  border: 2px solid #000;
  font-family: 'Bangers', sans-serif;
  font-size: 0.85rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 2px 2px 0 #ccc;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 3px 3px 0 #999;
  }
  &.following {
    background: #f0f0f0;
    color: #666;
    border-color: #bbb;
    &:hover {
      background: #e5e5e5;
    }
    &.mutual {
      background: #4ecdc4;
      color: #fff;
      border-color: #3d9a8a;
      box-shadow: 2px 2px 0 #3d9a8a;
    }
  }
  &:not(.following) {
    background: #000;
    color: #fff;
    &:hover {
      background: #333;
    }
  }
}

.self-tag {
  padding: 0.4rem 1rem;
  background: #f5f5f5;
  color: #999;
  font-family: 'Comic Neue', cursive;
  font-size: 0.8rem;
  border: 2px solid #ddd;
}

/* 加载和空状态 */
.loading,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
}

.loading-icon,
.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.8rem;
}

.loading-text,
.empty-text {
  font-family: 'Bangers', 'Impact', sans-serif;
  font-size: 1rem;
  color: #999;
  letter-spacing: 1px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  margin-top: 1.5rem;
  padding: 1rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  background: #fff;
  border: 2px solid #000;
  box-shadow: 2px 2px 0 #ddd;
  font-family: 'Bangers', sans-serif;
  font-size: 0.85rem;
  letter-spacing: 1px;
  color: #333;
  cursor: pointer;
  transition: all 0.15s;
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 4px 4px 0 #000;
    background: #ffd700;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.page-info {
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  font-size: 0.9rem;
  color: #666;
}

/* 响应式 */
@media (max-width: 767px) {
  .page-inner {
    padding: 1rem 0 2rem;
  }
  
  .page-header {
    padding: 0.8rem;
  }
  
  .page-title {
    font-size: 1.2rem;
  }
  
  .tab-btn {
    padding: 0.5rem 0.4rem;
    font-size: 0.8rem;
    gap: 0.2rem;
  }
  
  .user-card {
    padding: 0.7rem;
    gap: 0.8rem;
  }
  
  .user-avatar {
    width: 48px;
    height: 48px;
  }
  
  .user-name {
    font-size: 1rem;
  }
  
  .follow-btn {
    padding: 0.3rem 0.7rem;
    font-size: 0.75rem;
  }
  
  .pagination {
    gap: 0.8rem;
  }
  
  .page-btn {
    padding: 0.3rem 0.7rem;
    font-size: 0.75rem;
  }
}
</style>