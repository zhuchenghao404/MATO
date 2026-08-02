<template>
  <button
    :class="['follow-btn', { 'following': isFollowing }]"
    @click="handleClick"
    :disabled="isLoading"
  >
    <span v-if="isLoading">加载中...</span>
    <span v-else-if="isFollowing">已关注</span>
    <span v-else>+ 关注</span>
  </button>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuth } from '../stores/auth.js'

const props = defineProps({
  userId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['follow', 'unfollow'])

const { isLoggedIn, openAuthModal, token } = useAuth()
const isFollowing = ref(false)
const isLoading = ref(false)

const API_BASE = '/api/social'

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token.value) {
    headers['Authorization'] = `Bearer ${token.value}`
  }
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers })
  return res.json()
}

async function checkFollowing() {
  if (!isLoggedIn.value || !token.value) return
  try {
    const res = await request(`/is-following/${props.userId}`)
    if (res.code === 200) {
      isFollowing.value = res.data.isFollowing
    }
  } catch (err) {
    console.error('[FollowButton] checkFollowing:', err)
  }
}

async function handleClick() {
  if (!isLoggedIn.value) {
    openAuthModal()
    return
  }

  isLoading.value = true
  
  try {
    if (isFollowing.value) {
      const res = await request('/unfollow', {
        method: 'POST',
        body: JSON.stringify({ followeeId: props.userId })
      })
      if (res.code === 200) {
        isFollowing.value = false
        emit('unfollow')
      }
    } else {
      const res = await request('/follow', {
        method: 'POST',
        body: JSON.stringify({ followeeId: props.userId })
      })
      if (res.code === 200) {
        isFollowing.value = true
        emit('follow')
      }
    }
  } catch (err) {
    console.error('[FollowButton] handleClick:', err)
  } finally {
    isLoading.value = false
  }
}

watch(() => props.userId, () => {
  isFollowing.value = false
  checkFollowing()
})

onMounted(() => {
  checkFollowing()
})
</script>

<style scoped>
.follow-btn {
  padding: 0.4rem 1rem;
  border: 2px solid #000;
  border-radius: 0;
  font-family: 'Comic Neue', cursive;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s ease;
  background: #fff;
  color: #000;
  box-shadow: 2px 2px 0 #000;
}

.follow-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 #000;
}

.follow-btn.following {
  background: #000;
  color: #fff;
}

.follow-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>