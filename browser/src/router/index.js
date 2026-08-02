import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/Home' },
  { path: '/Home', component: () => import('../views/admin/Home.vue') },
  { path: '/SkillLearning', component: () => import('../views/admin/SkillLearning.vue') },
  { path: '/SkillToUp', component: () => import('../views/admin/SkillToUp.vue') },
  { path: '/PerfectCase', component: () => import('../views/admin/PerfectCase.vue') },
  { path: '/WorkDetail/:id', component: () => import('../views/admin/WorkDetail.vue') },
  { path: '/Pen', component: () => import('../views/admin/Pen.vue') },
  { path: '/Profile', component: () => import('../views/admin/Profile.vue') },
  { path: '/Profile/:userId', component: () => import('../views/admin/Profile.vue') },
  { path: '/SocialList', component: () => import('../views/admin/SocialList.vue') },
  { path: '/Messages', component: () => import('../views/admin/Messages.vue') },
  { path: '/Challenge/:skill', component: () => import('../components/TitleFramework.vue'), props: true },

  // 后台管理路由
  {
    path: '/admin',
    component: () => import('../views/admin/management/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    children: [
      { path: 'dashboard', component: () => import('../views/admin/management/Dashboard.vue'), meta: { title: '仪表盘' } },
      { path: 'users', component: () => import('../views/admin/management/UserManagement.vue'), meta: { title: '用户管理' } },
      { path: 'works', component: () => import('../views/admin/management/WorkManagement.vue'), meta: { title: '作品管理' } },
      { path: 'comments', component: () => import('../views/admin/management/CommentManagement.vue'), meta: { title: '评论管理' } },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫：后台页面需要管理员身份
router.beforeEach((to, from, next) => {
  if (to.path.startsWith('/admin')) {
    const token = localStorage.getItem('mato_token')
    const username = localStorage.getItem('mato_username')
    if (!token || username !== 'admin') {
      // 非管理员跳转到首页，通过首页 AuthModal 登录
      next('/Home')
      return
    }
  }
  next()
})

export default router
