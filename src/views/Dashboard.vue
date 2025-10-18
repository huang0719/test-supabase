<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon user-icon">
              <el-icon><User /></el-icon>
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.userCount }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon role-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.roleCount }}</div>
              <div class="stat-label">角色总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon menu-icon">
              <el-icon><Menu /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.menuCount }}</div>
              <div class="stat-label">菜单总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon dept-icon">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.deptCount }}</div>
              <div class="stat-label">部门总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button
              v-permission="['system:user:add']"
              type="primary"
              :icon="Plus"
              @click="$router.push('/system/user')"
            >
              新增用户
            </el-button>
            <el-button
              v-permission="['system:role:add']"
              type="success"
              :icon="Plus"
              @click="$router.push('/system/role')"
            >
              新增角色
            </el-button>
            <el-button
              v-permission="['system:menu:add']"
              type="warning"
              :icon="Plus"
              @click="$router.push('/system/menu')"
            >
              新增菜单
            </el-button>
            <el-button
              v-permission="['system:dept:add']"
              type="info"
              :icon="Plus"
              @click="$router.push('/system/dept')"
            >
              新增部门
            </el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
            </div>
          </template>
          <div class="user-info">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="用户名">
                {{ userStore.userInfo?.userName }}
              </el-descriptions-item>
              <el-descriptions-item label="昵称">
                {{ userStore.userInfo?.nickName }}
              </el-descriptions-item>
              <el-descriptions-item label="邮箱">
                {{ userStore.userInfo?.email }}
              </el-descriptions-item>
              <el-descriptions-item label="角色">
                <el-tag
                  v-for="role in userStore.roles"
                  :key="role.roleId"
                  type="success"
                  style="margin-right: 5px;"
                >
                  {{ role.roleName }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { User, UserFilled, Menu, OfficeBuilding, Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/utils/supabase'

const userStore = useUserStore()

const stats = ref({
  userCount: 0,
  roleCount: 0,
  menuCount: 0,
  deptCount: 0
})

const loadStats = async () => {
  try {
    // 获取统计数据
    const [userResult, roleResult, menuResult, deptResult] = await Promise.all([
      supabase.from('sys_user').select('id', { count: 'exact', head: true }),
      supabase.from('sys_role').select('role_id', { count: 'exact', head: true }),
      supabase.from('sys_menu').select('menu_id', { count: 'exact', head: true }),
      supabase.from('sys_dept').select('dept_id', { count: 'exact', head: true })
    ])

    stats.value = {
      userCount: userResult.count || 0,
      roleCount: roleResult.count || 0,
      menuCount: menuResult.count || 0,
      deptCount: deptResult.count || 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  .stat-card {
    margin-bottom: 20px;
    
    .stat-content {
      display: flex;
      align-items: center;
      
      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20px;
        
        .el-icon {
          font-size: 30px;
          color: #fff;
        }
        
        &.user-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        &.role-icon {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        
        &.menu-icon {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        
        &.dept-icon {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
      }
      
      .stat-info {
        flex: 1;
        
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #999;
        }
      }
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
  }
  
  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>

