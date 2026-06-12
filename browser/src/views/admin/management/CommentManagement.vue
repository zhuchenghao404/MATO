<template>
  <div class="comment-management">
    <!-- 搜索工具栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" :inline="true">
        <el-form-item label="内容">
          <el-input v-model="searchForm.content" placeholder="搜索评论内容" clearable />
        </el-form-item>
        <el-form-item label="评论人">
          <el-input v-model="searchForm.username" placeholder="搜索用户名" clearable />
        </el-form-item>
        <el-form-item label="作品ID">
          <el-input v-model="searchForm.workId" placeholder="作品ID" clearable style="width:120px" />
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
        <span class="table-title">评论列表</span>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe border style="margin-top:12px">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="content" label="评论内容" min-width="250" show-overflow-tooltip />
        <el-table-column label="评论人" width="130">
          <template #default="{ row }">
            <div class="author-cell">
              <el-avatar v-if="row.avatar" :src="row.avatar" :size="24" />
              <span>{{ row.username || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="work_id" label="作品ID" width="80" />
        <el-table-column prop="parent_id" label="父评论ID" width="90">
          <template #default="{ row }">
            {{ row.parent_id || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.parent_id ? 'info' : ''" size="small">
              {{ row.parent_id ? '回复' : '评论' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="评论时间" width="170" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">详情</el-button>
            <el-popconfirm title="确定删除该评论？" @confirm="handleDelete(row.id)">
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="评论详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="评论内容">{{ detailData.content }}</el-descriptions-item>
        <el-descriptions-item label="评论人">{{ detailData.username }}</el-descriptions-item>
        <el-descriptions-item label="作品ID">{{ detailData.work_id }}</el-descriptions-item>
        <el-descriptions-item label="父评论ID">{{ detailData.parent_id || '无' }}</el-descriptions-item>
        <el-descriptions-item label="评论时间">{{ detailData.created_at }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { commentApi } from '@/utils/api.js'

const searchForm = reactive({ content: '', username: '', workId: '' })
const tableData = ref([])
const loading = ref(false)
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const detailVisible = ref(false)
const detailData = reactive({})

async function fetchData() {
  loading.value = true
  try {
    const res = await commentApi.getList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm,
    })
    if (res.code === 200) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch {
    tableData.value = getMockComments()
    pagination.total = 8
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function resetSearch() {
  Object.assign(searchForm, { content: '', username: '', workId: '' })
  handleSearch()
}

function viewDetail(row) {
  Object.assign(detailData, row)
  detailVisible.value = true
}

async function handleDelete(id) {
  try {
    await commentApi.delete(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    ElMessage.success('删除成功（前端模拟）')
    tableData.value = tableData.value.filter((c) => c.id !== id)
  }
}

function getMockComments() {
  return [
    { id: 1, content: '这个作品太棒了！CSS动画效果非常流畅', username: '张三', avatar: '', work_id: 1, parent_id: null, created_at: '2024-06-10 14:30' },
    { id: 2, content: '同意，尤其是hover效果处理得很好', username: '李四', avatar: '', work_id: 1, parent_id: 1, created_at: '2024-06-10 15:00' },
    { id: 3, content: '代码结构清晰，学到了很多', username: '王五', avatar: '', work_id: 2, parent_id: null, created_at: '2024-06-09 10:20' },
    { id: 4, content: '能否分享一下源码？', username: '赵六', avatar: '', work_id: 3, parent_id: null, created_at: '2024-06-08 16:45' },
    { id: 5, content: '请查看我的GitHub主页', username: '张三', avatar: '', work_id: 3, parent_id: 4, created_at: '2024-06-08 17:00' },
    { id: 6, content: '这个贪吃蛇做得好经典', username: '李四', avatar: '', work_id: 5, parent_id: null, created_at: '2024-06-11 09:30' },
    { id: 7, content: '有意思，我也想做一个小游戏', username: '王五', avatar: '', work_id: 5, parent_id: null, created_at: '2024-06-11 10:00' },
    { id: 8, content: '建议优化一下性能', username: '赵六', avatar: '', work_id: 4, parent_id: null, created_at: '2024-06-10 18:20' },
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
</style>
