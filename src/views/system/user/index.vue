<template>
  <div>
    <el-card>
      <!-- 搜索栏 -->
      <el-form :model="queryParams" inline>
        <el-form-item label="用户名">
          <el-input v-model="queryParams.userName" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select sty v-model="queryParams.status" placeholder="用户状态" clearable>
            <el-option label="正常" value="0" />
            <el-option label="停用" value="1" /> 
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <el-row :gutter="10" style="margin-bottom: 10px">
        <el-col :span="1.5">
          <el-button
            v-permission="['system:user:add']"
            type="primary"
            :icon="Plus"
            @click="handleAdd"
          >
            新增
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-permission="['system:user:remove']"
            type="danger"
            :icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
          >
            删除
          </el-button>
        </el-col>
      </el-row>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="userList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="用户名" prop="user_name" />
        <el-table-column label="昵称" prop="nick_name" />
        <el-table-column label="邮箱" prop="email" />
        <el-table-column label="手机号码" prop="phonenumber" />
        <el-table-column label="状态" prop="status">
          <template #default="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'">
              {{ row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="角色" prop="roles" width="200">
          <template #default="{ row }">
            <el-tag v-for="role in row.roles" :key="role.role_id" style="margin-right: 5px;">
              {{ role.role_name }}
            </el-tag>
            <span v-if="!row.roles || row.roles.length === 0" style="color: #999;">未分配角色</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="create_time" width="180">
          <template #default="{ row }">
            {{ formatDate(row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button
              v-permission="['system:user:edit']"
              type="primary"
              link
              :icon="Edit"
              @click="handleUpdate(row)"
            >
              修改
            </el-button>
            <el-button
              v-permission="['system:user:edit']"
              type="warning"
              link
              :icon="UserFilled"
              @click="handleRoleAssign(row)"
            >
              分配角色
            </el-button>
            <el-button
              v-permission="['system:user:remove']"
              type="danger"
              link
              :icon="Delete"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getList"
        @current-change="getList"
      />
    </el-card>

    <!-- 添加或修改对话框 -->
    <el-dialog
      v-model="open"
      :title="title"
      width="600px"
      append-to-body
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!form.id">
          <el-input v-model="form.password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input v-model="form.phonenumber" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="form.sex" placeholder="请选择性别">
            <el-option label="男" value="0" />
            <el-option label="女" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="open = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 角色分配对话框 -->
    <el-dialog
      v-model="roleDialogOpen"
      title="分配角色"
      width="500px"
      append-to-body
    >
      <div style="margin-bottom: 20px;">
        <strong>用户：</strong>{{ currentUser.userName }} ({{ currentUser.nickName }})
      </div>
      <el-checkbox-group v-model="selectedRoles">
        <el-checkbox
          v-for="role in roleOptions"
          :key="role.role_id"
          :label="role.role_id"
          :disabled="role.status === '1'"
        >
          {{ role.role_name }}
          <span v-if="role.status === '1'" style="color: #999;">(已停用)</span>
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="roleDialogOpen = false">取消</el-button>
        <el-button type="primary" :loading="roleSubmitLoading" @click="submitRoleAssign">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, UserFilled } from '@element-plus/icons-vue'
import { supabase } from '@/utils/supabase'
import { formatDate } from '@/utils'

const loading = ref(false)
const open = ref(false)
const title = ref('')
const multiple = ref(true)
const userList = ref<any[]>([])
const total = ref(0)
const ids = ref<string[]>([])
const submitLoading = ref(false)

// 角色分配相关
const roleDialogOpen = ref(false)
const roleSubmitLoading = ref(false)
const roleOptions = ref<any[]>([])
const selectedRoles = ref<number[]>([])
const currentUser = ref<any>({})

const formRef = ref<FormInstance>()

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  phonenumber: '',
  status: ''
})

const form = reactive({
  id: '',
  userName: '',
  nickName: '',
  email: '',
  phonenumber: '',
  sex: '0',
  status: '0',
  remark: '',
  password: ''
})

const rules: FormRules = {
  userName: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  nickName: [{ required: true, message: '昵称不能为空', trigger: 'blur' }],
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
}

// 查询用户列表
async function getList() {
  loading.value = true
  try {
    let query = supabase
      .from('sys_user')
      .select(`
        *,
        sys_user_role(
          role_id,
          sys_role(
            role_id,
            role_name,
            role_key,
            status
          )
        )
      `, { count: 'exact' })
      .order('create_time', { ascending: false })

    if (queryParams.userName) {
      query = query.ilike('user_name', `%${queryParams.userName}%`)
    }
    if (queryParams.phonenumber) {
      query = query.ilike('phonenumber', `%${queryParams.phonenumber}%`)
    }
    if (queryParams.status) {
      query = query.eq('status', queryParams.status)
    }

    const from = (queryParams.pageNum - 1) * queryParams.pageSize
    const to = from + queryParams.pageSize - 1

    const { data, error, count } = await query.range(from, to)

    if (error) throw error

    // 处理角色数据
    const processedData = (data || []).map(user => ({
      ...user,
      roles: user.sys_user_role?.map((ur: any) => ur.sys_role).filter(Boolean) || []
    }))

    userList.value = processedData
    total.value = count || 0
  } catch (error: any) {
    ElMessage.error(error.message || '查询失败')
  } finally {
    loading.value = false
  }
}

// 搜索
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

// 重置
function resetQuery() {
  queryParams.userName = ''
  queryParams.phonenumber = ''
  queryParams.status = ''
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection: any[]) {
  ids.value = selection.map(item => item.id)
  multiple.value = !ids.value.length
}

// 新增按钮
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加用户'
}

// 修改按钮
function handleUpdate(row: any) {
  reset()
  open.value = true
  title.value = '修改用户'
  // 在对话框打开后再填充数据和清除表单验证
  setTimeout(() => {
    form.id = row.id
    form.userName = row.user_name
    form.nickName = row.nick_name
    form.email = row.email
    form.phonenumber = row.phonenumber
    form.sex = row.sex
    form.status = row.status
    form.remark = row.remark
    form.password = row.password
    formRef.value?.clearValidate()
  }, 0)
}

// 删除按钮
async function handleDelete(row?: any) {
  const userIds = row?.id ? [row.id] : ids.value
  
  try {
    await ElMessageBox.confirm('是否确认删除选中的数据?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const { error } = await supabase
      .from('sys_user')
      .delete()
      .in('id', userIds)

    if (error) throw error

    ElMessage.success('删除成功')
    getList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 提交表单
async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true

      try {
        const userData = {
          user_name: form.userName,
          nick_name: form.nickName,
          email: form.email,
          phonenumber: form.phonenumber,
          sex: form.sex,
          status: form.status,
          remark: form.remark,
          password: form.password
        }

        if (form.id) {
          // 修改
          const { error } = await supabase
            .from('sys_user')
            .update({...userData, password: ''})
            .eq('id', form.id)

          if (error) throw error
          ElMessage.success('修改成功')
        } else {
          // 注册到supabase
          const res1 = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password
          })
          if (res1.error) throw res1.error

          // 新增到数据库
          const res2 = await supabase.from('sys_user').insert({...userData,password:'', id: res1.data.user?.id})
          if (res2.error) throw res2.error
          ElMessage.success('新增成功')
        }

        open.value = false
        getList()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 获取角色列表
async function getRoleOptions() {
  try {
    const { data, error } = await supabase
      .from('sys_role')
      .select('role_id, role_name, role_key, status')
      .order('role_sort', { ascending: true })

    if (error) throw error
    roleOptions.value = data || []
  } catch (error: any) {
    ElMessage.error(error.message || '获取角色列表失败')
  }
}

// 获取用户已分配的角色
async function getUserRoles(userId: string) {
  try {
    const { data, error } = await supabase
      .from('sys_user_role')
      .select('role_id')
      .eq('user_id', userId)

    if (error) throw error
    return (data || []).map(item => item.role_id)
  } catch (error: any) {
    ElMessage.error(error.message || '获取用户角色失败')
    return []
  }
}

// 分配角色按钮
async function handleRoleAssign(row: any) {
  currentUser.value = {
    id: row.id,
    userName: row.user_name,
    nickName: row.nick_name
  }
  
  await getRoleOptions()
  
  // 获取用户当前角色
  const userRoles = await getUserRoles(row.id)
  selectedRoles.value = userRoles
  
  roleDialogOpen.value = true
}

// 提交角色分配
async function submitRoleAssign() {
  roleSubmitLoading.value = true
  
  try {
    const userId = currentUser.value.id
    
    // 先删除用户的所有角色
    await supabase
      .from('sys_user_role')
      .delete()
      .eq('user_id', userId)
    
    // 插入新的角色关联
    if (selectedRoles.value.length > 0) {
      const userRoles = selectedRoles.value.map(roleId => ({
        user_id: userId,
        role_id: roleId
      }))
      
      const { error } = await supabase
        .from('sys_user_role')
        .insert(userRoles)
      
      if (error) throw error
    }
    
    ElMessage.success('角色分配成功')
    roleDialogOpen.value = false
    getList() // 刷新用户列表
  } catch (error: any) {
    ElMessage.error(error.message || '角色分配失败')
  } finally {
    roleSubmitLoading.value = false
  }
}

// 重置表单
function reset() {
  form.id = ''
  form.userName = ''
  form.nickName = ''
  form.email = ''
  form.phonenumber = ''
  form.sex = '0'
  form.status = '0'
  form.remark = ''
  form.password = ''
  // 清除表单验证状态
  formRef.value?.clearValidate()
  formRef.value?.resetFields()
}

onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss">

</style>

