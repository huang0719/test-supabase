<template>
  <div class="menu-container">
    <el-card>
      <!-- 搜索栏 -->
      <el-form :model="queryParams" inline>
        <el-form-item label="菜单名称">
          <el-input v-model="queryParams.menuName" placeholder="请输入菜单名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="菜单状态" clearable>
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
            v-permission="['system:menu:add']"
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
        :data="menuList"
        row-key="menu_id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="isExpandAll"
      >
        <el-table-column label="菜单名称" prop="menu_name" width="200" />
        <el-table-column label="图标" prop="icon" width="100">
          <template #default="{ row }">
            <el-icon v-if="row.icon">
              <component :is="row.icon" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="order_num" width="80" />
        <el-table-column label="权限标识" prop="perms" />
        <el-table-column label="组件路径" prop="component" />
        <el-table-column label="状态" prop="status" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'">
              {{ row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否隐藏" prop="visible" width="100">
          <template #default="{ row }">
            <el-tag :type="row.visible === '0' ? 'success' : 'info'">
              {{ row.visible === '0' ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否缓存" prop="is_cache" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_cache === '0' ? 'info' : 'success'">
              {{ row.is_cache === '0' ? '不缓存' : '缓存' }}
            </el-tag>
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
              v-permission="['system:menu:edit']"
              type="primary"
              link
              :icon="Edit"
              @click="handleUpdate(row)"
            >
              修改
            </el-button>
            <el-button
              v-permission="['system:menu:add']"
              type="success"
              link
              :icon="Plus"
              @click="handleAdd(row)"
            >
              新增
            </el-button>
            <el-button
              v-permission="['system:menu:remove']"
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
      width="680px"
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
            <el-form-item label="上级菜单">
              <el-tree-select
                v-model="form.parentId"
                :data="menuOptions"
                :props="{ value: 'menu_id', label: 'menu_name', children: 'children' }"
                value-key="menu_id"
                placeholder="选择上级菜单"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="M">目录</el-radio>
                <el-radio label="C">菜单</el-radio>
                <el-radio label="F">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" :min="0" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单图标" prop="icon">
              <el-input v-model="form.icon" placeholder="请输入图标名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType !== 'F'">
            <el-form-item label="路由地址" prop="path">
              <el-input v-model="form.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType === 'C'">
            <el-form-item label="组件路径" prop="component">
              <el-input v-model="form.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限标识" prop="perms">
              <el-input v-model="form.perms" placeholder="请输入权限标识" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否隐藏" prop="visible">
              <el-radio-group v-model="form.visible">
                <el-radio label="0">显示</el-radio>
                <el-radio label="1">隐藏</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否缓存" prop="isCache">
              <el-radio-group v-model="form.isCache">
                <el-radio label="0">不缓存</el-radio>
                <el-radio label="1">缓存</el-radio>
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
const menuList = ref<any[]>([])
const menuOptions = ref<any[]>([])

const formRef = ref<FormInstance>()

const queryParams = reactive({
  menuName: '',
  status: ''
})

const form = reactive({
  menuId: null as number | null,
  parentId: 0,
  menuName: '',
  icon: '',
  menuType: 'M',
  orderNum: 0,
  path: '',
  component: '',
  perms: '',
  status: '0',
  visible: '0',
  isCache: '0'
})

const rules: FormRules = {
  menuName: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
  orderNum: [{ required: true, message: '菜单顺序不能为空', trigger: 'blur' }]
}

// 查询菜单列表
async function getList() {
  loading.value = true
  try {
    let query = supabase
      .from('sys_menu')
      .select('*')
      .order('parent_id', { ascending: true })
      .order('order_num', { ascending: true })

    if (queryParams.menuName) {
      query = query.ilike('menu_name', `%${queryParams.menuName}%`)
    }
    if (queryParams.status) {
      query = query.eq('status', queryParams.status)
    }

    const { data, error } = await query

    if (error) throw error

    menuList.value = handleTree(data || [], 'menu_id', 'parent_id', 'children')
    
  } catch (error: any) {
    ElMessage.error(error.message || '查询失败')
  } finally {
    loading.value = false
  }
}

// 查询菜单下拉树结构
async function getTreeselect() {
  try {
    const { data, error } = await supabase
      .from('sys_menu')
      .select('*')
      .eq('status', '0')
      .order('parent_id', { ascending: true })
      .order('order_num', { ascending: true })

    if (error) throw error

    const menu = { menu_id: 0, menu_name: '主类目', children: [] as any[] }
    menu.children = handleTree(data || [], 'menu_id', 'parent_id', 'children')
    menuOptions.value = [menu]
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
  queryParams.menuName = ''
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
  title.value = '添加菜单'
  // 在对话框打开后再清除表单验证和设置父级ID
  setTimeout(() => {
    formRef.value?.clearValidate()
    if (row != null && row.menu_id) {
      form.parentId = row.menu_id
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
  title.value = '修改菜单'
  // 在对话框打开后再填充数据和清除表单验证
  setTimeout(() => {
    form.menuId = row.menu_id
    form.parentId = row.parent_id
    form.menuName = row.menu_name
    form.icon = row.icon
    form.menuType = row.menu_type
    form.orderNum = row.order_num
    form.path = row.path
    form.component = row.component
    form.perms = row.perms
    form.status = row.status
    form.visible = row.visible || '0'
    form.isCache = row.is_cache || '0'
    formRef.value?.clearValidate()
  }, 0)
}

// 删除按钮
async function handleDelete(row: any) {
  try {
    // 收集所有需要删除的ID（包括子级）
    const allIds = collectTreeIds(menuList.value, row, 'menu_id', 'parent_id', 'children')
    
    const message = allIds.length > 1 
      ? `是否确认删除名称为"${row.menu_name}"的数据项及其${allIds.length - 1}个子项?`
      : `是否确认删除名称为"${row.menu_name}"的数据项?`
    
    await ElMessageBox.confirm(message, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 级联删除所有相关数据
    const { error } = await supabase
      .from('sys_menu')
      .delete()
      .in('menu_id', allIds)

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
        const menuData = {
          parent_id: form.parentId,
          menu_name: form.menuName,
          icon: form.icon,
          menu_type: form.menuType,
          order_num: form.orderNum,
          path: form.path,
          component: form.component,
          perms: form.perms,
          status: form.status,
          is_frame: '0',
          is_cache: form.isCache,
          visible: form.visible
        }

        if (form.menuId) {
          // 修改
          const { error } = await supabase
            .from('sys_menu')
            .update(menuData)
            .eq('menu_id', form.menuId)

          if (error) throw error
          ElMessage.success('修改成功')
        } else {
          // 新增
          const { error } = await supabase
            .from('sys_menu')
            .insert(menuData)

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
  form.menuId = null
  form.parentId = 0
  form.menuName = ''
  form.icon = ''
  form.menuType = 'M'
  form.orderNum = 0
  form.path = ''
  form.component = ''
  form.perms = ''
  form.status = '0'
  form.visible = '0'
  form.isCache = '0'
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

