<template>
  <div class="user-management">
    <!-- 搜索工具栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" :inline="true">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="搜索用户名" clearable />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.email" placeholder="搜索邮箱" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width:120px">
            <el-option label="正常" :value="1" />
            <el-option label="封禁" :value="0" />
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
        <span class="table-title">用户列表</span>
        <el-button type="primary" @click="openDialog()">新增用户</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe border style="margin-top:12px">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 'male' ? '男' : row.gender === 'female' ? '女' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="level" label="等级" width="70" />
        <el-table-column prop="exp" label="经验" width="80" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar v-if="row.avatar" :src="row.avatar" :size="36" />
            <el-avatar v-else :size="36" icon="UserFilled" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="bio" label="简介" min-width="150" show-overflow-tooltip />
        <el-table-column prop="created_at" label="注册时间" width="170" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              link
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '封禁' : '解封' }}
            </el-button>
            <el-popconfirm title="确定删除该用户？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <!-- 编辑/新增对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="550px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="2-20个字符" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="8-20个字符" show-password />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="formData.gender">
            <el-radio value="male">男</el-radio>
            <el-radio value="female">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="formData.bio" type="textarea" :rows="3" placeholder="最多100字" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="等级">
          <el-input-number v-model="formData.level" :min="1" :max="99" />
        </el-form-item>
        <el-form-item label="经验">
          <el-input-number v-model="formData.exp" :min="0" :max="99999" />
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
import { userApi } from '@/utils/api.js'

// 搜索
const searchForm = reactive({ username: '', email: '', status: null })
const tableData = ref([])
const loading = ref(false)

const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null, username: '', password: '', email: '', gender: 'male', bio: '', level: 1, exp: 0,
})

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度 2-20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 20, message: '长度 8-20 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
}

// 获取数据
async function fetchData() {
  loading.value = true
  try {
    const res = await userApi.getList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm,
    })
    if (res.code === 200) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch {
    // 后端未就绪时使用 mock 数据
    tableData.value = getMockUsers()
    pagination.total = 6
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function resetSearch() {
  Object.assign(searchForm, { username: '', email: '', status: null })
  handleSearch()
}

// 新增/编辑
function openDialog(row) {
  isEdit.value = !!row
  if (row) {
    Object.assign(formData, {
      id: row.id, username: row.username, email: row.email,
      gender: row.gender || 'male', bio: row.bio || '', level: row.level, exp: row.exp,
    })
  } else {
    formRef.value?.resetFields()
    Object.assign(formData, { id: null, username: '', password: '', email: '', gender: 'male', bio: '', level: 1, exp: 0 })
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await userApi.update(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      await userApi.create(formData)
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

// 封禁/解封
async function handleToggleStatus(row) {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await userApi.toggleStatus(row.id, newStatus)
    ElMessage.success(newStatus === 1 ? '已解封' : '已封禁')
    fetchData()
  } catch {
    ElMessage.success(newStatus === 1 ? '已解封（前端模拟）' : '已封禁（前端模拟）')
    row.status = newStatus
  }
}

// 删除
async function handleDelete(id) {
  try {
    await userApi.delete(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    ElMessage.success('删除成功（前端模拟）')
    tableData.value = tableData.value.filter((u) => u.id !== id)
  }
}

// Mock 数据
function getMockUsers() {
  return [
    { id: 1, username: 'admin', email: 'admin@mato.com', gender: 'male', level: 99, exp: 99999, bio: '超级管理员', status: 1, created_at: '2024-01-01 00:00' },
    { id: 2, username: '张三', email: 'zhangsan@qq.com', gender: 'male', level: 12, exp: 3200, bio: '前端爱好者', status: 1, created_at: '2024-03-15 10:30' },
    { id: 3, username: '李四', email: 'lisi@163.com', gender: 'female', level: 8, exp: 1800, bio: '学习CSS中', status: 1, created_at: '2024-05-20 14:20' },
    { id: 4, username: '王五', email: 'wangwu@gmail.com', gender: 'male', level: 3, exp: 500, bio: '', status: 1, created_at: '2024-06-01 09:00' },
    { id: 5, username: '被封用户', email: 'spam@test.com', gender: 'male', level: 1, exp: 0, bio: '违规内容', status: 0, created_at: '2024-06-08 16:45' },
    { id: 6, username: '赵六', email: 'zhaoliu@outlook.com', gender: 'female', level: 5, exp: 1000, bio: 'Vue学习者', status: 1, created_at: '2024-06-10 11:00' },
  ]
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.table-header {
  display: flex; justify-content: space-between; align-items: center;
  .table-title { font-size: 16px; font-weight: 600; }
}
.pagination-box {
  display: flex; justify-content: flex-end; margin-top: 16px;
}
</style>
