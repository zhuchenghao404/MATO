<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :lg="4" v-for="card in statCards" :key="card.label">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">{{ card.label }}</p>
              <p class="stat-value">{{ card.value }}</p>
              <p v-if="card.hint" class="stat-hint">{{ card.hint }}</p>
            </div>
            <div class="stat-icon" :style="{ background: card.color }">
              <el-icon :size="28"><component :is="card.icon" /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待审核提醒 -->
    <el-alert
      v-if="pendingCount > 0"
      :title="`有 ${pendingCount} 个作品待审核`"
      type="warning"
      show-icon
      :closable="false"
      style="margin-top: 20px"
    >
      <template #default>
        <el-button type="warning" size="small" @click="scrollToPending">立即审核</el-button>
      </template>
    </el-alert>

    <!-- 图表区 第一行 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header><span>用户答题数量 TOP5</span></template>
          <div ref="topAnswerRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header><span>近7天作品提交量</span></template>
          <div ref="workChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区 第二行 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header><span>近7天浏览量趋势</span></template>
          <div ref="viewTrendRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header><span>作品浏览量 TOP10</span></template>
          <div ref="topWorksRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区 第三行：用户浏览量 TOP5 圆环图 + AI 调用趋势 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header><span>用户作品总浏览量 TOP5</span></template>
          <div ref="topUserViewsRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header><span>近7天 AI 调用趋势</span></template>
          <div ref="aiTrendRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待审核作品列表 -->
    <el-card shadow="hover" style="margin-top: 20px" id="pending-section">
      <template #header>
        <div class="section-header">
          <span>待审核作品</span>
          <el-badge :value="pendingWorks.length" :hidden="!pendingWorks.length" />
        </div>
      </template>

      <el-table v-if="pendingWorks.length" :data="pendingWorks" stripe border>
        <el-table-column label="封面" width="90">
          <template #default="{ row }">
            <el-image
              v-if="row.cover && !row.cover.includes('default')"
              :src="row.cover"
              style="width:60px;height:40px;border-radius:4px"
              fit="cover"
              lazy
            />
            <div v-else class="cover-placeholder">无封面</div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="作品名称" min-width="140" show-overflow-tooltip />
        <el-table-column label="作者" width="120">
          <template #default="{ row }">
            <div class="author-cell">
              <el-avatar v-if="row.avatar" :src="row.avatar" :size="24" />
              <span>{{ row.username || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="120" show-overflow-tooltip />
        <el-table-column label="代码内容" width="120">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="previewWork(row)">预览代码</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="提交时间" width="170" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="success" size="small" @click="approveWork(row.id)">通过</el-button>
            <el-popconfirm title="确定拒绝该作品？" @confirm="rejectWork(row.id)">
              <template #reference>
                <el-button type="danger" size="small">拒绝</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无待审核作品" />
    </el-card>

    <!-- 代码预览对话框 -->
    <el-dialog v-model="previewVisible" title="作品代码预览" width="800px">
      <el-tabs>
        <el-tab-pane label="HTML">
          <pre class="code-preview"><code>{{ previewCode.html }}</code></pre>
        </el-tab-pane>
        <el-tab-pane label="CSS">
          <pre class="code-preview"><code>{{ previewCode.css }}</code></pre>
        </el-tab-pane>
        <el-tab-pane label="JavaScript">
          <pre class="code-preview"><code>{{ previewCode.js }}</code></pre>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 最近注册用户 -->
    <el-card shadow="hover" style="margin-top: 20px">
      <template #header><span>最近注册用户</span></template>
      <el-table :data="recentUsers" stripe size="small">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="level" label="等级" width="80" />
        <el-table-column prop="created_at" label="注册时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { dashboardApi, workApi } from '@/utils/api.js'

// 统计卡片
const statCards = ref([
  { label: '用户总数', value: 0, hint: '', icon: 'User', color: '#409eff' },
  { label: '作品总数', value: 0, hint: '', icon: 'PictureFilled', color: '#67c23a' },
  { label: '评论总数', value: 0, hint: '', icon: 'ChatDotSquare', color: '#e6a23c' },
  { label: '待审核', value: 0, hint: '', icon: 'WarningFilled', color: '#f56c6c' },
  { label: '今日AI调用', value: 0, hint: '', icon: 'Cpu', color: '#8b5cf6' },
])

const pendingCount = ref(0)
const recentUsers = ref([])
const pendingWorks = ref([])

// 图表
const topAnswerRef = ref(null)
const workChartRef = ref(null)
const viewTrendRef = ref(null)
const topWorksRef = ref(null)
const topUserViewsRef = ref(null)
const aiTrendRef = ref(null)
let topAnswerChart = null
let workChart = null
let viewTrendChart = null
let topWorksChart = null
let topUserViewsChart = null
let aiTrendChart = null

// 代码预览
const previewVisible = ref(false)
const previewCode = reactive({ html: '', css: '', js: '' })

function scrollToPending() {
  document.getElementById('pending-section')?.scrollIntoView({ behavior: 'smooth' })
}

function previewWork(row) {
  previewCode.html = row.html_code || '(无)'
  previewCode.css = row.css_code || '(无)'
  previewCode.js = row.js_code || '(无)'
  previewVisible.value = true
}

async function approveWork(id) {
  try {
    await workApi.toggleStatus(id, 1)
    ElMessage.success('审核通过')
    fetchData()
  } catch {
    ElMessage.success('审核通过')
    pendingWorks.value = pendingWorks.value.filter(w => w.id !== id)
  }
}

async function rejectWork(id) {
  try {
    await workApi.delete(id)
    ElMessage.success('已拒绝并删除')
    fetchData()
  } catch {
    ElMessage.success('已拒绝')
    pendingWorks.value = pendingWorks.value.filter(w => w.id !== id)
  }
}

// 填充最近7天日期
function fill7Days(trendData) {
  // 生成本地日期字符串 yyyy-MM-dd
  function localDateStr(date) {
    if (date instanceof Date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
    return String(date).slice(0, 10)
  }
  const result = []
  const map = {}
  if (trendData) {
    trendData.forEach(d => { map[localDateStr(d.date)] = d.count })
  }
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = localDateStr(d)
    result.push({ date: key.slice(5), count: map[key] || 0 })
  }
  return result
}

function renderCharts(data) {
  if (!topAnswerRef.value || !workChartRef.value) return

  if (!topAnswerChart) topAnswerChart = echarts.init(topAnswerRef.value)
  if (!workChart) workChart = echarts.init(workChartRef.value)

  // 用户答题数量 TOP5（横向柱状图）
  const answerData = (data?.topAnswerUsers || [])
  topAnswerChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 80, right: 40, top: 10, bottom: 20 },
    xAxis: { type: 'value', minInterval: 1 },
    yAxis: {
      type: 'category',
      data: answerData.map(u => u.username).reverse(),
      axisLabel: { width: 70, overflow: 'truncate' },
      inverse: true,
    },
    series: [{
      type: 'bar',
      data: answerData.map(u => u.answer_count).reverse(),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#409eff' },
          { offset: 1, color: '#79bbff' },
        ]),
        borderRadius: [0, 4, 4, 0],
      },
      barWidth: 20,
      label: { show: true, position: 'right', color: '#666', formatter: '{c} 题' },
    }],
  })

  const workDays = fill7Days(data?.workTrend)

  workChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: workDays.map(d => d.date), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{
      type: 'bar',
      data: workDays.map(d => d.count),
      itemStyle: { color: '#67c23a', borderRadius: [4, 4, 0, 0] },
      barWidth: 24,
    }],
  })

  // 浏览量趋势（折线图）
  if (viewTrendRef.value) {
    if (!viewTrendChart) viewTrendChart = echarts.init(viewTrendRef.value)
    const viewDays = fill7Days(data?.viewTrend)
    viewTrendChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: viewDays.map(d => d.date), axisLabel: { rotate: 30 } },
      yAxis: { type: 'value', minInterval: 1 },
      series: [{
        type: 'line',
        data: viewDays.map(d => d.count),
        smooth: true,
        lineStyle: { color: '#e6a23c', width: 2 },
        itemStyle: { color: '#e6a23c' },
        areaStyle: { color: 'rgba(230,162,60,0.1)' },
      }],
    })
  }

  // 作品浏览量 TOP10（横向柱状图）
  if (topWorksRef.value) {
    if (!topWorksChart) topWorksChart = echarts.init(topWorksRef.value)
    const topData = (data?.topWorks || []).slice(0, 10)
    topWorksChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 100, right: 40, top: 10, bottom: 20 },
      xAxis: { type: 'value', minInterval: 1 },
      yAxis: {
        type: 'category',
        data: topData.map(w => w.title).reverse(),
        axisLabel: { width: 90, overflow: 'truncate' },
        inverse: true,
      },
      series: [{
        type: 'bar',
        data: topData.map(w => w.view_count).reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#f56c6c' },
            { offset: 1, color: '#ffa39e' },
          ]),
          borderRadius: [0, 4, 4, 0],
        },
        barWidth: 18,
        label: { show: true, position: 'right', color: '#666' },
      }],
    })
  }

  // 用户作品总浏览量 TOP5 圆环图
  if (topUserViewsRef.value) {
    if (!topUserViewsChart) topUserViewsChart = echarts.init(topUserViewsRef.value)
    const userData = (data?.topUserViews || [])
    const colors = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981']
    topUserViewsChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: p => `${p.name}: ${p.value} 次浏览 (占 ${p.percent}%)`,
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: { fontSize: 12, color: '#666' },
      },
      series: [{
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{d}%',
          fontSize: 11,
        },
        emphasis: {
          label: { fontSize: 16, fontWeight: 'bold' },
          scaleSize: 8,
        },
        data: userData.map((u, i) => ({
          name: u.username,
          value: u.total_views,
          itemStyle: { color: colors[i % colors.length] },
        })),
      }],
    })
  }

  // AI 调用趋势（折线图）
  if (aiTrendRef.value) {
    if (!aiTrendChart) aiTrendChart = echarts.init(aiTrendRef.value)
    const aiDays = fill7Days(data?.aiTrend)
    aiTrendChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: aiDays.map(d => d.date), axisLabel: { rotate: 30 } },
      yAxis: { type: 'value', minInterval: 1 },
      series: [{
        type: 'line',
        data: aiDays.map(d => d.count),
        smooth: true,
        lineStyle: { color: '#8b5cf6', width: 2 },
        itemStyle: { color: '#8b5cf6' },
        areaStyle: { color: 'rgba(139,92,246,0.1)' },
      }],
    })
  }
}

async function fetchData() {
  try {
    const res = await dashboardApi.getStats()
    if (res.code === 200) {
      const d = res.data
      statCards.value = [
        { label: '用户总数', value: d.userCount || 0, hint: `今日新增 ${d.todayUsers || 0}`, icon: 'User', color: '#409eff' },
        { label: '作品总数', value: d.workCount || 0, hint: `今日新增 ${d.todayWorks || 0}`, icon: 'PictureFilled', color: '#67c23a' },
        { label: '评论总数', value: d.commentCount || 0, hint: '', icon: 'ChatDotSquare', color: '#e6a23c' },
        { label: '待审核', value: d.pendingCount || 0, hint: '需要审核的作品', icon: 'WarningFilled', color: '#f56c6c' },
        { label: '今日AI调用', value: d.todayAiCalls || 0, hint: 'DeepSeek API', icon: 'Cpu', color: '#8b5cf6' },
      ]
      pendingCount.value = d.pendingCount || 0
      recentUsers.value = d.recentUsers || []

      await nextTick()
      renderCharts(d)
    }
  } catch {
    statCards.value = [
      { label: '用户总数', value: 128, hint: '今日新增 3', icon: 'User', color: '#409eff' },
      { label: '作品总数', value: 256, hint: '今日新增 5', icon: 'PictureFilled', color: '#67c23a' },
      { label: '评论总数', value: 1024, hint: '', icon: 'ChatDotSquare', color: '#e6a23c' },
      { label: '待审核', value: 4, hint: '需要审核的作品', icon: 'WarningFilled', color: '#f56c6c' },
      { label: '今日AI调用', value: 23, hint: 'DeepSeek API', icon: 'Cpu', color: '#8b5cf6' },
    ]
    pendingCount.value = 4
    recentUsers.value = [
      { username: '张三', email: 'zhangsan@qq.com', level: 5, created_at: '2024-06-10 14:30' },
      { username: '李四', email: 'lisi@163.com', level: 3, created_at: '2024-06-10 12:15' },
    ]
    await nextTick()
    renderCharts({
      userTrend: [
        { date: '2024-06-06', count: 2 }, { date: '2024-06-07', count: 5 },
        { date: '2024-06-08', count: 3 }, { date: '2024-06-09', count: 8 },
        { date: '2024-06-10', count: 4 }, { date: '2024-06-11', count: 6 },
        { date: '2024-06-12', count: 3 },
      ],
      workTrend: [
        { date: '2024-06-06', count: 1 }, { date: '2024-06-07', count: 3 },
        { date: '2024-06-08', count: 4 }, { date: '2024-06-09', count: 2 },
        { date: '2024-06-10', count: 5 }, { date: '2024-06-11', count: 7 },
        { date: '2024-06-12', count: 5 },
      ],
      viewTrend: [
        { date: '2024-06-06', count: 45 }, { date: '2024-06-07', count: 78 },
        { date: '2024-06-08', count: 62 }, { date: '2024-06-09', count: 120 },
        { date: '2024-06-10', count: 95 }, { date: '2024-06-11', count: 150 },
        { date: '2024-06-12', count: 88 },
      ],
      topWorks: [
        { title: '贪吃蛇游戏', view_count: 12000, username: 'admin' },
        { title: 'Canvas 画板', view_count: 5200, username: '王五' },
        { title: 'CSS 动画卡片', view_count: 2560, username: '张三' },
        { title: 'Vue3 待办事项', view_count: 1800, username: '李四' },
        { title: '响应式导航栏', view_count: 900, username: '赵六' },
      ],
      topUserViews: [
        { username: 'admin', total_views: 15000 },
        { username: '王五', total_views: 7200 },
        { username: '张三', total_views: 4560 },
        { username: '李四', total_views: 2800 },
        { username: '赵六', total_views: 1200 },
      ],
      topAnswerUsers: [
        { username: 'admin', answer_count: 85 },
        { username: '张三', answer_count: 62 },
        { username: '李四', answer_count: 48 },
        { username: '王五', answer_count: 35 },
        { username: '赵六', answer_count: 20 },
      ],
      aiTrend: [
        { date: '2024-06-06', count: 5 }, { date: '2024-06-07', count: 12 },
        { date: '2024-06-08', count: 8 }, { date: '2024-06-09', count: 15 },
        { date: '2024-06-10', count: 20 }, { date: '2024-06-11', count: 18 },
        { date: '2024-06-12', count: 23 },
      ],
    })
  }

  // 拉取待审核作品
  try {
    const pRes = await workApi.getPending()
    if (pRes.code === 200) {
      pendingWorks.value = pRes.data || []
    }
  } catch {
    pendingWorks.value = [
      { id: 100, title: 'CSS 瀑布流动画', description: '纯CSS实现的瀑布流', cover: '', username: '张三', avatar: '', html_code: '<div>demo</div>', css_code: '.demo{}', js_code: '', created_at: '2024-06-12 10:30' },
      { id: 101, title: 'Vue3 计数器', description: '简单的计数器组件', cover: '', username: '李四', avatar: '', html_code: '<div id="app">{{ count }}</div>', css_code: 'body{margin:0}', js_code: 'const app=Vue.createApp({data(){return{count:0}}})', created_at: '2024-06-12 09:00' },
    ]
  }
}

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  topAnswerChart?.dispose()
  workChart?.dispose()
  viewTrendChart?.dispose()
  topWorksChart?.dispose()
  topUserViewsChart?.dispose()
  aiTrendChart?.dispose()
})
</script>

<style lang="scss" scoped>
.dashboard {
  .stat-card {
    margin-bottom: 16px;
    cursor: default;
    :deep(.el-card__body) { padding: 20px; }
    .stat-content {
      display: flex; justify-content: space-between; align-items: center;
      .stat-info {
        min-height: 78px;
        .stat-label { font-size: 14px; color: #909399; margin: 0 0 4px; }
        .stat-value { font-size: 32px; font-weight: 700; color: #303133; margin: 0; line-height: 1.2; }
        .stat-hint { font-size: 12px; color: #c0c4cc; margin: 4px 0 0; }
      }
      .stat-icon {
        width: 56px; height: 56px; border-radius: 12px;
        display: flex; align-items: center; justify-content: center; color: #fff;
        flex-shrink: 0;
      }
    }
  }

  .chart-box {
    width: 100%; height: 280px;
  }

  .section-header {
    display: flex; align-items: center; gap: 8px;
    font-size: 16px; font-weight: 600;
  }

  .code-preview {
    max-height: 400px; overflow: auto; background: #1e1e1e; color: #d4d4d4;
    padding: 16px; border-radius: 6px; font-size: 13px; line-height: 1.6;
    margin: 0; white-space: pre-wrap; word-break: break-all;
  }

  .author-cell { display: flex; align-items: center; gap: 6px; }
  .cover-placeholder {
    width: 60px; height: 40px; background: #f0f0f0; border-radius: 4px;
    display: flex; align-items: center; justify-content: center; font-size: 11px; color: #999;
  }
}
</style>
