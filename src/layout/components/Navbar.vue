<template>
  <div class="navbar">
    <div class="left-menu">
      <el-icon class="hamburger" @click="toggleSidebar">
        <Expand v-if="appStore.sidebarCollapse" />
        <Fold v-else />
      </el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item
          v-for="(item, index) in breadcrumbs"
          :key="item.path"
        >
          <span v-if="index === breadcrumbs.length - 1" class="no-redirect">
            {{ item.meta?.title }}
          </span>
          <a v-else @click.prevent="handleLink(item)">
            {{ item.meta?.title }}
          </a>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="right-menu">
      <el-dropdown @command="handleCommand">
        <div class="avatar-wrapper">
          <el-avatar :size="32" :src="userStore.userInfo?.avatar || undefined">
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
          <span class="username">{{ userStore.userInfo?.nickName || userStore.userInfo?.userName }}</span>
          <el-icon class="el-icon-caret-bottom"><CaretBottom /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { 
  Expand, 
  Fold, 
  UserFilled, 
  User, 
  SwitchButton,
  CaretBottom 
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  
  // 如果不在首页，添加首页到面包屑
  if (matched.length > 0 && matched[0].path !== '/') {
    const dashboard = {
      path: '/',
      redirect: '/dashboard',
      meta: { title: '首页', icon: 'Odometer' }
    }
    return [dashboard, ...matched]
  }
  
  return matched
})

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const handleLink = (item: any) => {
  const { redirect, path } = item
  if (redirect) {
    router.push(redirect)
    return
  }
  router.push(path)
}

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/system/profile')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await userStore.logout()
        ElMessage.success('退出成功')
        router.push('/login')
      } catch (error) {
        // 取消操作
      }
      break
  }
}
</script>

<style scoped lang="scss">
.navbar {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .left-menu {
    display: flex;
    align-items: center;
    
    .hamburger {
      font-size: 20px;
      cursor: pointer;
      margin-right: 15px;
      
      &:hover {
        color: #409eff;
      }
    }
  }

  .right-menu {
    display: flex;
    align-items: center;
    
    .avatar-wrapper {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      .username {
        margin: 0 8px;
        font-size: 14px;
      }
      
      &:hover {
        opacity: 0.8;
      }
    }
  }
}

:deep(.el-breadcrumb__inner) {
  font-weight: normal;
  color: #97a8be;
  
  a {
    color: #97a8be;
    cursor: pointer;
    transition: color 0.2s;
    
    &:hover {
      color: #409eff;
    }
  }
  
  .no-redirect {
    color: #303133;
    cursor: text;
    font-weight: 500;
  }
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #303133;
  font-weight: 500;
}
</style>

