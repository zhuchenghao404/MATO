import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/admin/Home.vue'
import SkillLearning from '../views/admin/SkillLearning.vue'
import SkillToUp from '../views/admin/SkillToUp.vue'
import PerfectCase from '../views/admin/PerfectCase.vue'
import WorkDetail from '../views/admin/WorkDetail.vue'
import Pen from '../views/admin/Pen.vue'
import Profile from '../views/admin/Profile.vue'
import TitleFramework from '../components/TitleFramework.vue'

// 后台管理
import AdminLayout from '../views/admin/management/AdminLayout.vue'
import Dashboard from '../views/admin/management/Dashboard.vue'
import UserManagement from '../views/admin/management/UserManagement.vue'
import WorkManagement from '../views/admin/management/WorkManagement.vue'
import CommentManagement from '../views/admin/management/CommentManagement.vue'

const routes = [
  { path: '/', redirect: '/Home' },
  { path: '/Home', component: Home },
  { path: '/SkillLearning', component: SkillLearning },
  { path: '/SkillToUp', component: SkillToUp },
  { path: '/PerfectCase', component: PerfectCase },
  { path: '/WorkDetail/:id', component: WorkDetail },
  { path: '/Pen', component: Pen },
  { path: '/Profile', component: Profile },
  { path: '/Challenge/:skill', component: TitleFramework, props: true },

  // 后台管理路由
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
    children: [
      { path: 'dashboard', component: Dashboard, meta: { title: '仪表盘' } },
      { path: 'users', component: UserManagement, meta: { title: '用户管理' } },
      { path: 'works', component: WorkManagement, meta: { title: '作品管理' } },
      { path: 'comments', component: CommentManagement, meta: { title: '评论管理' } },
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
