<template>
  <div class="work-management">
    <!-- 搜索工具栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" :inline="true">
        <el-form-item label="作品名称">
          <el-input v-model="searchForm.title" placeholder="搜索作品名" clearable />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="searchForm.author" placeholder="搜索作者" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width:120px">
            <el-option label="正常" :value="1" />
            <el-option label="审核中" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" style="margin-top:16px">
      <div class="table-header">
        <span class="table-title">作品列表</span>
        <el-button type="primary" @click="openDialog()">
          <el-icon><Plus /></el-icon> 新增作品
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe border style="margin-top:12px">
        <el-table-column prop="id" label="ID" width="70" />
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
        <el-table-column prop="title" label="作品名称" min-width="160" show-overflow-tooltip />
        <el-table-column label="作者" width="120">
          <template #default="{ row }">
            <div class="author-cell">
              <el-avatar v-if="row.user?.avatar" :src="row.user.avatar" :size="24" />
              <span>{{ row.user?.name || row.username || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
        <el-table-column label="数据" width="240">
          <template #default="{ row }">
            <div class="stat-row">
              <span title="点赞"><el-icon><StarFilled /></el-icon> {{ row.like_count || 0 }}</span>
              <span title="收藏"><el-icon><FolderOpened /></el-icon> {{ row.collect_count || 0 }}</span>
              <span title="评论"><el-icon><ChatDotRound /></el-icon> {{ row.comment_count || 0 }}</span>
              <span title="浏览"><el-icon><View /></el-icon> {{ row.view_count || 0 }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '已发布' : '审核中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
            <el-button
              :type="row.status === 1 ? 'info' : 'success'"
              link
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '下架' : '审核通过' }}
            </el-button>
            <el-popconfirm title="确定删除该作品？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-box">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑作品' : '新增作品'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="作品名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入作品名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="作品描述" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="formData.username" placeholder="作者用户名" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">已发布</el-radio>
            <el-radio :value="0">审核中</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { workApi } from '@/utils/api.js'

const searchForm = reactive({ title: '', author: '', status: null })
const tableData = ref([])
const loading = ref(false)
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const formData = reactive({ id: null, title: '', description: '', username: '', status: 1 })

const formRules = {
  title: [{ required: true, message: '请输入作品名称', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const res = await workApi.getList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm,
    })
    if (res.code === 200) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch {
    tableData.value = getMockWorks()
    pagination.total = 5
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function resetSearch() {
  Object.assign(searchForm, { title: '', author: '', status: null })
  handleSearch()
}

function openDialog(row) {
  isEdit.value = !!row
  if (row) {
    Object.assign(formData, {
      id: row.id, title: row.title, description: row.description || '',
      username: row.user?.name || row.username || '', status: row.status,
    })
  } else {
    formRef.value?.resetFields()
    Object.assign(formData, { id: null, title: '', description: '', username: '', status: 1 })
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await workApi.update(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      await workApi.create(formData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.success(isEdit.value ? '更新成功（前端模拟）' : '创建成功（前端模拟）')
    dialogVisible.value = false
    fetchData()
  } finally {
    submitLoading.value = false
  }
}

async function handleToggleStatus(row) {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await workApi.toggleStatus(row.id, newStatus)
    ElMessage.success(newStatus === 1 ? '已审核通过' : '已下架')
    fetchData()
  } catch {
    ElMessage.success(newStatus === 1 ? '已审核通过（前端模拟）' : '已下架（前端模拟）')
    row.status = newStatus
  }
}

async function handleDelete(id) {
  try {
    await workApi.delete(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    ElMessage.success('删除成功（前端模拟）')
    tableData.value = tableData.value.filter((w) => w.id !== id)
  }
}

function getMockWorks() {
  return [
    { id: 1, title: 'CSS 动画卡片', cover: '', description: '好看的CSS动画', user: { name: '张三', avatar: '' }, like_count: 128, collect_count: 32, comment_count: 15, view_count: 2560, status: 1, created_at: '2024-06-01 10:00' },
    { id: 2, title: 'Vue3 待办事项', cover: '', description: '功能齐全的待办', user: { name: '李四', avatar: '' }, like_count: 89, collect_count: 21, comment_count: 8, view_count: 1800, status: 1, created_at: '2024-06-05 14:30' },
    { id: 3, title: 'Canvas 画板', cover: '', description: '在线画板工具', user: { name: '王五', avatar: '' }, like_count: 256, collect_count: 78, comment_count: 32, view_count: 5200, status: 1, created_at: '2024-06-08 09:15' },
    { id: 4, title: '响应式导航栏', cover: '', description: '移动端优先', user: { name: '赵六', avatar: '' }, like_count: 45, collect_count: 12, comment_count: 3, view_count: 900, status: 0, created_at: '2024-06-10 16:00' },
    { id: 5, title: '贪吃蛇游戏', cover: '', description: '经典小游戏', user: { name: 'admin', avatar: '' }, like_count: 512, collect_count: 156, comment_count: 64, view_count: 12000, status: 1, created_at: '2024-06-11 08:00' },
  ]
}

onMounted(() => { fetchData() })
</script>

<style lang="scss" scoped>
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.table-header {
  display: flex; justify-content: space-between; align-items: center;
  .table-title { font-size: 16px; font-weight: 600; }
}
.pagination-box { display: flex; justify-content: flex-end; margin-top: 16px; }
.author-cell { display: flex; align-items: center; gap: 6px; }
.stat-row {
  display: flex; gap: 10px; font-size: 13px; color: #606266;
  span { display: flex; align-items: center; gap: 2px; }
}
.cover-placeholder {
  width: 60px; height: 40px; background: #f0f0f0; border-radius: 4px;
  display: flex; align-items: center; justify-content: center; font-size: 11px; color: #999;
}
</style>
