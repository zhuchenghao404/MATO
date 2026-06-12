<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="admin-aside">
      <div class="logo-box" @click="$router.push('/admin/dashboard')">
        <span v-if="!isCollapse" class="logo-text">MATO 后台</span>
        <span v-else class="logo-text--mini">M</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        background-color="#1d1e2b"
        text-color="#a0a0b8"
        active-text-color="#ff6b35"
        router
      >
        <el-menu-item
          v-for="item in adminMenu"
          :key="item.path"
          :index="item.path"
        >
          <el-icon><component :is="item.meta.icon" /></el-icon>
          <template #title>{{ item.meta.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧主体 -->
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="admin-header">
        <div class="header-left">
          <el-button
            :icon="isCollapse ? 'Expand' : 'Fold'"
            text
            @click="isCollapse = !isCollapse"
          />
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click">
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span class="username">{{ username }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goHome">返回前台</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminMenu } from '@/config/menu.js'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const username = ref(localStorage.getItem('mato_username') || '管理员')

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => {
  const item = adminMenu.find((m) => m.path === route.path)
  return item?.meta?.title || ''
})

function goHome() {
  router.push('/Home')
}

function logout() {
  localStorage.removeItem('mato_token')
  localStorage.removeItem('mato_user')
  localStorage.removeItem('mato_username')
  router.push('/Home')
}
</script>

<style lang="scss" scoped>
.admin-layout {
  height: 100vh;
}

.admin-aside {
  background-color: #1d1e2b;
  overflow: hidden;
  transition: width 0.3s;

  .logo-box {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: #ff6b35;
      letter-spacing: 2px;
    }
    .logo-text--mini {
      font-size: 22px;
      font-weight: 700;
      color: #ff6b35;
    }
  }

  :deep(.el-menu) {
    border-right: none;
  }
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  padding: 0 20px;
  height: 60px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      .username {
        font-size: 14px;
        color: #333;
      }
    }
  }
}

.admin-main {
  background: #f5f6f8;
  min-height: calc(100vh - 60px);
  padding: 20px;
}
</style>
