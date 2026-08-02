<template>
  <div class="messages-page">
    <div class="messages-container">
      <!-- 对话列表侧边栏 -->
      <div class="conversations-sidebar">
        <div class="sidebar-header">
          <button class="back-btn" @click="handleGoBack">← 返回</button>
          <h2>私信</h2>
          <span class="unread-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
        </div>
        
        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="搜索联系人..." />
        </div>
        
        <div class="conversations-list">
          <div
            v-for="conv in filteredConversations"
            :key="conv.other_user_id"
            :class="['conversation-item', { active: selectedUserId === conv.other_user_id }]"
            @click="selectConversation(conv.other_user_id)"
          >
            <img :src="getAvatar(conv.avatar)" :alt="conv.username" class="conv-avatar" />
            <div class="conv-info">
              <div class="conv-name">{{ conv.username }}</div>
              <div class="conv-message">{{ conv.last_message }}</div>
            </div>
            <div class="conv-meta">
              <span class="unread-dot" v-if="conv.unread_count > 0"></span>
            </div>
          </div>
          
          <div v-if="conversations.length === 0" class="empty-state">
            暂无私信对话
          </div>
        </div>
      </div>

      <!-- 消息区域 -->
      <div class="messages-area">
        <div v-if="!selectedUserId" class="empty-chat">
          <div class="empty-icon">📭</div>
          <p>选择一个对话开始聊天</p>
        </div>
        
        <div v-else class="chat-panel">
          <!-- 聊天头部 -->
          <div class="chat-header">
            <img :src="getAvatar(selectedUser?.avatar)" :alt="selectedUser?.username" class="chat-avatar" />
            <div class="chat-info">
              <div class="chat-name">{{ selectedUser?.username }}</div>
              <div class="chat-level">LV.{{ selectedUser?.level }}</div>
            </div>
          </div>

          <!-- 消息列表 -->
          <div ref="messagesContainer" class="messages-list">
            <div
              v-for="msg in messages"
              :key="msg.id"
              :class="['message-item', { 'is-mine': Number(msg.from_user_id) === Number(currentUserId) }]"
            >
              <div class="message-content">
                {{ msg.content }}
              </div>
              <div class="message-time">{{ formatTime(msg.created_at) }}</div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="message-input-area">
            <input
              v-model="messageInput"
              type="text"
              placeholder="输入消息..."
              @keyup.enter="sendMessage"
              class="message-input"
            />
            <button @click="sendMessage" class="send-btn">发送</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../../stores/auth.js'
import manAvatar from '../../assets/HOMEImage/man.png'
import womanAvatar from '../../assets/HOMEImage/woman.png'

const router = useRouter()
const route = useRoute()
const { isLoggedIn, openAuthModal, token, currentUser } = useAuth()

const API_BASE = '/api/social'

const conversations = ref([])
const availableContacts = ref([])
const messages = ref([])
const selectedUserId = ref(null)
const selectedUser = ref(null)
const messageInput = ref('')
const searchQuery = ref('')
const unreadCount = ref(0)
const messagesContainer = ref(null)

const currentUserId = computed(() => currentUser.value?.id)

function handleGoBack() {
  const fromPath = sessionStorage.getItem('mato_from_path')
  if (fromPath) {
    sessionStorage.removeItem('mato_from_path')
    router.push(fromPath)
  } else if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/Profile')
  }
}

const displayContacts = computed(() => {
  if (conversations.value.length > 0) {
    return conversations.value
  }
  return availableContacts.value
})

const filteredConversations = computed(() => {
  if (!searchQuery.value) return displayContacts.value
  return displayContacts.value.filter(c =>
    c.username.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

function getAvatar(avatar) {
  if (avatar) return avatar
  return manAvatar
}

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token.value) {
    headers['Authorization'] = `Bearer ${token.value}`
  }
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers })
  return res.json()
}

async function loadConversations() {
  if (!isLoggedIn.value) return
  try {
    const res = await request('/conversations')
    console.log('[Messages] conversations response:', res)
    if (res.code === 200) {
      conversations.value = res.data
    } else {
      console.warn('[Messages] loadConversations failed:', res.msg)
    }
  } catch (err) {
    console.error('[Messages] loadConversations:', err)
  }
}

async function loadAvailableContacts() {
  if (!isLoggedIn.value) return
  try {
    const [followingRes, followersRes] = await Promise.all([
      request('/following'),
      request('/followers')
    ])
    
    const following = followingRes.code === 200 ? followingRes.data.list : []
    const followers = followersRes.code === 200 ? followersRes.data.list : []
    
    const contactMap = new Map()
    
    following.forEach(user => {
      contactMap.set(user.id, {
        other_user_id: user.id,
        username: user.username,
        avatar: user.avatar,
        level: user.level,
        last_message: '点击开始聊天',
        unread_count: 0
      })
    })
    
    followers.forEach(user => {
      if (!contactMap.has(user.id)) {
        contactMap.set(user.id, {
          other_user_id: user.id,
          username: user.username,
          avatar: user.avatar,
          level: user.level,
          last_message: '点击开始聊天',
          unread_count: 0
        })
      }
    })
    
    availableContacts.value = Array.from(contactMap.values())
  } catch (err) {
    console.error('[Messages] loadAvailableContacts:', err)
  }
}

async function loadMessages(userId) {
  if (!userId || !isLoggedIn.value) return
  try {
    const res = await request(`/messages/${userId}`)
    if (res.code === 200) {
      messages.value = res.data.messages
      selectedUser.value = res.data.otherUser
      await nextTick(() => {
        scrollToBottom()
      })
    }
  } catch (err) {
    console.error('[Messages] loadMessages:', err)
  }
}

async function selectConversation(userId) {
  selectedUserId.value = userId
  await loadMessages(userId)
}

async function sendMessage() {
  if (!messageInput.value.trim() || !selectedUserId.value || !isLoggedIn.value) return
  
  try {
    const res = await request('/message', {
      method: 'POST',
      body: JSON.stringify({
        toUserId: selectedUserId.value,
        content: messageInput.value.trim()
      })
    })
    
    if (res.code === 200) {
      messageInput.value = ''
      await loadMessages(selectedUserId.value)
      await loadConversations()
    }
  } catch (err) {
    console.error('[Messages] sendMessage:', err)
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function formatTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  if (!isLoggedIn.value) {
    openAuthModal()
    return
  }
  loadConversations()
  loadAvailableContacts()
  
  // 检查是否有指定用户ID需要自动选中（从他人页面跳转过来）
  if (route.query.userId) {
    const userId = parseInt(route.query.userId)
    // 等待对话列表加载完成后选中
    setTimeout(() => {
      selectConversation(userId)
    }, 500)
  }
})
</script>

<style scoped>
.messages-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.messages-container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  height: calc(100vh - 60px);
  border: 3px solid #000;
  box-shadow: 8px 8px 0 #000;
  margin-top: 20px;
}

.conversations-sidebar {
  width: 320px;
  background: #fff;
  border-right: 3px solid #000;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #000;
  color: #fff;
  font-family: 'Bangers', cursive;
  font-size: 1.5rem;
  letter-spacing: 1px;
}

.sidebar-header .back-btn {
  background: #fff;
  border: 2px solid #000;
  color: #000;
  padding: 0.3rem 0.8rem;
  font-family: 'Bangers', cursive;
  font-size: 0.95rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 2px 2px 0 #000;
}

.sidebar-header .back-btn:hover {
  transform: translateY(-1px);
  box-shadow: 3px 3px 0 #000;
}

.sidebar-header h2 {
  flex: 1;
  margin: 0;
}

.unread-badge {
  background: #ff4444;
  color: #fff;
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-family: Arial, sans-serif;
}

.search-box {
  padding: 0.5rem;
  border-bottom: 2px solid #000;
}

.search-box input {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #000;
  font-size: 0.9rem;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 0.8rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background 0.15s;
}

.conversation-item:hover {
  background: #f5f5f5;
}

.conversation-item.active {
  background: #e0e0e0;
}

.conv-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #000;
  margin-right: 0.8rem;
}

.conv-info {
  flex: 1;
  overflow: hidden;
}

.conv-name {
  font-weight: 800;
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
}

.conv-message {
  font-size: 0.8rem;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conv-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.unread-dot {
  width: 10px;
  height: 10px;
  background: #ff4444;
  border-radius: 50%;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #999;
}

.messages-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  min-height: 400px;
}

.empty-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #000;
  color: #fff;
  border-bottom: 3px solid #000;
}

.chat-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #fff;
  margin-right: 0.8rem;
}

.chat-info {
  display: flex;
  flex-direction: column;
}

.chat-name {
  font-weight: 800;
  font-size: 1.1rem;
}

.chat-level {
  font-size: 0.8rem;
  opacity: 0.8;
}

.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #fafafa;
  display: flex;
  flex-direction: column;
}

.message-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  max-width: 70%;
}

.message-item.is-mine {
  align-self: flex-end;
  align-items: flex-end;
}

.message-item:not(.is-mine) {
  align-self: flex-start;
  align-items: flex-start;
}

.message-content {
  padding: 0.6rem 1rem;
  border: 2px solid #000;
  box-shadow: 2px 2px 0 #000;
  font-size: 0.95rem;
  line-height: 1.4;
  word-break: break-word;
}

.message-item:not(.is-mine) .message-content {
  background: #fff;
  border-radius: 0 8px 8px 8px;
}

.message-item.is-mine .message-content {
  background: #000;
  color: #fff;
  border-radius: 8px 0 8px 8px;
}

.message-time {
  font-size: 0.7rem;
  color: #999;
  margin-top: 0.3rem;
}

.message-input-area {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 3px solid #000;
  background: #fff;
}

.message-input {
  flex: 1;
  padding: 0.6rem;
  border: 2px solid #000;
  font-size: 0.95rem;
}

.send-btn {
  padding: 0.6rem 1.5rem;
  background: #000;
  color: #fff;
  border: 2px solid #000;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 2px 2px 0 #666;
}

.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 #666;
}

@media (max-width: 768px) {
  .messages-container {
    flex-direction: column;
    height: 100vh;
    margin-top: 0;
    border: none;
    box-shadow: none;
  }
  
  .conversations-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 3px solid #000;
    max-height: 200px;
  }
  
  .message-item {
    max-width: 85%;
  }
}
</style>