import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/admin/Home.vue'
import SkillLearning from '../views/admin/SkillLearning.vue'
import SkillToUp from '../views/admin/SkillToUp.vue'
import PerfectCase from '../views/admin/PerfectCase.vue'
import Pen from '../views/admin/Pen.vue'
import Profile from '../views/admin/Profile.vue'
import TitleFramework from '../components/TitleFramework.vue'

const routes = [
  { path: '/', redirect: '/Home' },
  { path: '/Home', component: Home },
  { path: '/SkillLearning', component: SkillLearning },
  { path: '/SkillToUp', component: SkillToUp },
  { path: '/PerfectCase', component: PerfectCase },
  { path: '/Pen', component: Pen },
  { path: '/Profile', component: Profile },
  { path: '/Challenge/:skill', component: TitleFramework, props: true },
]

const router = createRouter({
  history: createWebHistory(),  // 使用 history 模式
  routes
})

export default router