<template>
  <div class="role-container">
    <el-card>
      <!-- 搜索栏 -->
      <el-form :model="queryParams" inline>
        <el-form-item label="角色名称">
          <el-input v-model="queryParams.roleName" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="权限字符">
          <el-input v-model="queryParams.roleKey" placeholder="请输入权限字符" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="角色状态" clearable>
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
            v-permission="['system:role:add']"
            type="primary"
            :icon="Plus"
            @click="handleAdd"
          >
            新增
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-permission="['system:role:remove']"
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
        :data="roleList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="角色编号" prop="role_id" width="120" />
        <el-table-column label="角色名称" prop="role_name" width="120"/>
        <el-table-column label="权限字符" prop="role_key" />
        <el-table-column label="显示顺序" prop="role_sort" width="100" />
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
              v-permission="['system:role:edit']"
              type="primary"
              link
              :icon="Edit"
              @click="handleUpdate(row)"
            >
              修改
            </el-button>
            <el-button
              v-permission="['system:role:remove']"
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
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限字符" prop="roleKey">
          <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="roleSort">
          <el-input-number v-model="form.roleSort" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="数据范围" prop="dataScope">
          <el-select v-model="form.dataScope" placeholder="请选择数据范围">
            <el-option label="全部数据权限" value="1" />
            <el-option label="自定数据权限" value="2" />
            <el-option label="本部门数据权限" value="3" />
            <el-option label="本部门及以下数据权限" value="4" />
            <el-option label="仅本人数据权限" value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-tree
            ref="menuTreeRef"
            :data="menuOptions"
            show-checkbox
            node-key="menu_id"
            :props="{ children: 'children', label: 'menu_name' }"
            :default-expand-all="false"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
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
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { supabase } from '@/utils/supabase'
import { formatDate, handleTree } from '@/utils'
import type { ElTree } from 'element-plus'

const loading = ref(false)
const open = ref(false)
const title = ref('')
const multiple = ref(true)
const roleList = ref<any[]>([])
const total = ref(0)
const ids = ref<number[]>([])
const menuOptions = ref<any[]>([])

const formRef = ref<FormInstance>()
const menuTreeRef = ref<InstanceType<typeof ElTree>>()

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleName: '',
  roleKey: '',
  status: ''
})

const form = reactive({
  roleId: null as number | null,
  roleName: '',
  roleKey: '',
  roleSort: 0,
  dataScope: '1',
  status: '0',
  remark: ''
})

const rules: FormRules = {
  roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
  roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }],
  roleSort: [{ required: true, message: '角色顺序不能为空', trigger: 'blur' }]
}

// 查询角色列表
async function getList() {
  loading.value = true
  try {
    let query = supabase
      .from('sys_role')
      .select('*', { count: 'exact' })
      .order('role_sort', { ascending: true })

    if (queryParams.roleName) {
      query = query.ilike('role_name', `%${queryParams.roleName}%`)
    }
    if (queryParams.roleKey) {
      query = query.ilike('role_key', `%${queryParams.roleKey}%`)
    }
    if (queryParams.status) {
      query = query.eq('status', queryParams.status)
    }

    const from = (queryParams.pageNum - 1) * queryParams.pageSize
    const to = from + queryParams.pageSize - 1

    const { data, error, count } = await query.range(from, to)

    if (error) throw error

    roleList.value = data || []
    total.value = count || 0
  } catch (error: any) {
    ElMessage.error(error.message || '查询失败')
  } finally {
    loading.value = false
  }
}

// 获取菜单树
async function getMenuTree() {
  try {
    const { data, error } = await supabase
      .from('sys_menu')
      .select('*')
      .order('parent_id', { ascending: true })
      .order('order_num', { ascending: true })

    if (error) throw error

    menuOptions.value = handleTree(data || [], 'menu_id', 'parent_id', 'children')
  } catch (error: any) {
    ElMessage.error(error.message || '获取菜单树失败')
  }
}

// 获取角色的菜单权限
async function getRoleMenus(roleId: number) {
  try {
    const { data, error } = await supabase
      .from('sys_role_menu')
      .select('menu_id')
      .eq('role_id', roleId)

    if (error) throw error

    return (data || []).map(item => item.menu_id)
  } catch (error: any) {
    ElMessage.error(error.message || '获取角色菜单失败')
    return []
  }
}

// 搜索
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

// 重置
function resetQuery() {
  queryParams.roleName = ''
  queryParams.roleKey = ''
  queryParams.status = ''
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection: any[]) {
  ids.value = selection.map(item => item.role_id)
  multiple.value = !ids.value.length
}

// 新增按钮
async function handleAdd() {
  reset()
  await getMenuTree()
  open.value = true
  title.value = '添加角色'
  // 在对话框打开后再清除表单验证
  setTimeout(() => {
    formRef.value?.clearValidate()
  }, 0)
}

// 修改按钮
async function handleUpdate(row: any) {
  reset()
  await getMenuTree()
  open.value = true
  title.value = '修改角色'
  
  // 在对话框打开后再填充数据和清除表单验证
  setTimeout(async () => {
    form.roleId = row.role_id
    form.roleName = row.role_name
    form.roleKey = row.role_key
    form.roleSort = row.role_sort
    form.dataScope = row.data_scope
    form.status = row.status
    form.remark = row.remark
    
    // 加载角色的菜单权限
    const menuIds = await getRoleMenus(row.role_id)
    menuTreeRef.value?.setCheckedKeys(menuIds)
    
    formRef.value?.clearValidate()
  }, 0)
}

// 删除按钮
async function handleDelete(row?: any) {
  const roleIds = row?.role_id ? [row.role_id] : ids.value
  
  try {
    await ElMessageBox.confirm('是否确认删除选中的数据?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const { error } = await supabase
      .from('sys_role')
      .delete()
      .in('role_id', roleIds)

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
        const roleData = {
          role_name: form.roleName,
          role_key: form.roleKey,
          role_sort: form.roleSort,
          data_scope: form.dataScope,
          status: form.status,
          remark: form.remark
        }

        // 获取选中的菜单ID
        const checkedKeys = menuTreeRef.value?.getCheckedKeys() || []
        const halfCheckedKeys = menuTreeRef.value?.getHalfCheckedKeys() || []
        const menuIds = [...checkedKeys, ...halfCheckedKeys] as number[]

        let roleId = form.roleId

        if (form.roleId) {
          // 修改
          const { error } = await supabase
            .from('sys_role')
            .update(roleData)
            .eq('role_id', form.roleId)

          if (error) throw error
        } else {
          // 新增
          const { data, error } = await supabase
            .from('sys_role')
            .insert(roleData)
            .select('role_id')
            .single()

          if (error) throw error
          roleId = data.role_id
        }

        // 更新角色菜单关联
        if (roleId) {
          // 先删除旧的关联
          await supabase
            .from('sys_role_menu')
            .delete()
            .eq('role_id', roleId)

          // 插入新的关联
          if (menuIds.length > 0) {
            const roleMenus = menuIds.map(menuId => ({
              role_id: roleId,
              menu_id: menuId
            }))

            const { error: menuError } = await supabase
              .from('sys_role_menu')
              .insert(roleMenus)

            if (menuError) throw menuError
          }
        }

        ElMessage.success(form.roleId ? '修改成功' : '新增成功')
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
  form.roleId = null
  form.roleName = ''
  form.roleKey = ''
  form.roleSort = 0
  form.dataScope = '1'
  form.status = '0'
  form.remark = ''
  // 清除表单验证状态
  formRef.value?.clearValidate()
  formRef.value?.resetFields()
  menuTreeRef.value?.setCheckedKeys([])
}

onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss">
.role-container {
}
</style>

