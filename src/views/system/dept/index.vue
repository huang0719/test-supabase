<template>
  <div class="dept-container">
    <el-card>
      <!-- 搜索栏 -->
      <el-form :model="queryParams" inline>
        <el-form-item label="部门名称">
          <el-input v-model="queryParams.deptName" placeholder="请输入部门名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="部门状态" clearable>
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
            v-permission="['system:dept:add']"
            type="primary"
            :icon="Plus"
            @click="handleAdd"
          >
            新增
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="info"
            :icon="Sort"
            @click="toggleExpandAll"
          >
            展开/折叠
          </el-button>
        </el-col>
      </el-row>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="deptList"
        row-key="dept_id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="isExpandAll"
      >
        <el-table-column label="部门名称" prop="dept_name" width="260" />
        <el-table-column label="排序" prop="order_num" width="80" />
        <el-table-column label="负责人" prop="leader" />
        <el-table-column label="联系电话" prop="phone" />
        <el-table-column label="邮箱" prop="email" />
        <el-table-column label="状态" prop="status" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'">
              {{ row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="create_time" width="180">
          <template #default="{ row }">
            {{ formatDate(row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              v-permission="['system:dept:edit']"
              type="primary"
              link
              :icon="Edit"
              @click="handleUpdate(row)"
            >
              修改
            </el-button>
            <el-button
              v-permission="['system:dept:add']"
              type="success"
              link
              :icon="Plus"
              @click="handleAdd(row)"
            >
              新增
            </el-button>
            <el-button
              v-permission="['system:dept:remove']"
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
        label-width="100px"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级部门">
              <el-tree-select
                v-model="form.parentId"
                :data="deptOptions"
                :props="{ value: 'dept_id', label: 'dept_name', children: 'children' }"
                value-key="dept_id"
                placeholder="选择上级部门"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" :min="0" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入负责人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="open = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Sort } from '@element-plus/icons-vue'
import { supabase } from '@/utils/supabase'
import { formatDate, handleTree, collectTreeIds } from '@/utils'

const loading = ref(false)
const open = ref(false)
const title = ref('')
const isExpandAll = ref(false)
const deptList = ref<any[]>([])
const deptOptions = ref<any[]>([])

const formRef = ref<FormInstance>()

const queryParams = reactive({
  deptName: '',
  status: ''
})

const form = reactive({
  deptId: null as number | null,
  parentId: 0,
  deptName: '',
  orderNum: 0,
  leader: '',
  phone: '',
  email: '',
  status: '0'
})

const rules: FormRules = {
  deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
  orderNum: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }]
}

// 查询部门列表
async function getList() {
  loading.value = true
  try {
    let query = supabase
      .from('sys_dept')
      .select('*')
      .order('parent_id', { ascending: true })
      .order('order_num', { ascending: true })

    if (queryParams.deptName) {
      query = query.ilike('dept_name', `%${queryParams.deptName}%`)
    }
    if (queryParams.status) {
      query = query.eq('status', queryParams.status)
    }

    const { data, error } = await query

    if (error) throw error

    deptList.value = handleTree(data || [], 'dept_id', 'parent_id', 'children')
  } catch (error: any) {
    ElMessage.error(error.message || '查询失败')
  } finally {
    loading.value = false
  }
}

// 查询部门下拉树结构
async function getTreeselect() {
  try {
    const { data, error } = await supabase
      .from('sys_dept')
      .select('*')
      .eq('status', '0')
      .order('parent_id', { ascending: true })
      .order('order_num', { ascending: true })

    if (error) throw error

    const dept = { dept_id: 0, dept_name: '主类目', children: [] as any[] }
    dept.children = handleTree(data || [], 'dept_id', 'parent_id', 'children')
    deptOptions.value = [dept]
  } catch (error: any) {
    ElMessage.error(error.message || '查询失败')
  }
}

// 搜索
function handleQuery() {
  getList()
}

// 重置
function resetQuery() {
  queryParams.deptName = ''
  queryParams.status = ''
  handleQuery()
}

// 展开/折叠
function toggleExpandAll() {
  isExpandAll.value = !isExpandAll.value
}

// 新增按钮
function handleAdd(row?: any) {
  reset()
  getTreeselect()
  open.value = true
  title.value = '添加部门'
  // 在对话框打开后再清除表单验证和设置父级ID
  setTimeout(() => {
    formRef.value?.clearValidate()
    if (row != null && row.dept_id) {
      form.parentId = row.dept_id
    } else {
      form.parentId = 0
    }
  }, 0)
}

// 修改按钮
function handleUpdate(row: any) {
  reset()
  getTreeselect()
  open.value = true
  title.value = '修改部门'
  // 在对话框打开后再填充数据和清除表单验证
  setTimeout(() => {
    form.deptId = row.dept_id
    form.parentId = row.parent_id
    form.deptName = row.dept_name
    form.orderNum = row.order_num
    form.leader = row.leader
    form.phone = row.phone
    form.email = row.email
    form.status = row.status
    formRef.value?.clearValidate()
  }, 0)
}

// 删除按钮
async function handleDelete(row: any) {
  try {
    // 收集所有需要删除的ID（包括子级）
    const allIds = collectTreeIds(deptList.value, row, 'dept_id', 'parent_id', 'children')
    
    const message = allIds.length > 1 
      ? `是否确认删除名称为"${row.dept_name}"的数据项及其${allIds.length - 1}个子部门?`
      : `是否确认删除名称为"${row.dept_name}"的数据项?`
    
    await ElMessageBox.confirm(message, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 级联删除所有相关数据
    const { error } = await supabase
      .from('sys_dept')
      .delete()
      .in('dept_id', allIds)

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
      try {
        const deptData = {
          parent_id: form.parentId,
          dept_name: form.deptName,
          order_num: form.orderNum,
          leader: form.leader,
          phone: form.phone,
          email: form.email,
          status: form.status
        }

        if (form.deptId) {
          // 修改
          const { error } = await supabase
            .from('sys_dept')
            .update(deptData)
            .eq('dept_id', form.deptId)

          if (error) throw error
          ElMessage.success('修改成功')
        } else {
          // 新增
          const { error } = await supabase
            .from('sys_dept')
            .insert(deptData)

          if (error) throw error
          ElMessage.success('新增成功')
        }

        open.value = false
        getList()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

// 重置表单
function reset() {
  form.deptId = null
  form.parentId = 0
  form.deptName = ''
  form.orderNum = 0
  form.leader = ''
  form.phone = ''
  form.email = ''
  form.status = '0'
  // 清除表单验证状态
  formRef.value?.clearValidate()
  formRef.value?.resetFields()
}

onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss">
.dept-container {
}
</style>

