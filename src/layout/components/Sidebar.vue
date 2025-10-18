<template>
  <div class="sidebar-container" :class="{'is-collapse': appStore.sidebarCollapse}">
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapse"
        :unique-opened="false"
        :collapse-transition="false"
        mode="vertical"
        background-color="#ffffff"
        text-color="#606266"
        active-text-color="#409eff"
        router
      >
        <SidebarItem
          v-for="route in routes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useMenuStore } from '@/stores/menu'
import SidebarItem from './SidebarItem.vue'
import { constantRoutes } from '@/router'

const route = useRoute()
const appStore = useAppStore()
const menuStore = useMenuStore()

const routes = computed(() => {
  // 始终显示默认路由（首页）
  const defaultRoutes = constantRoutes.filter(route => !route.meta?.hidden)
  
  // 如果有动态路由，合并显示
  const dynamicRoutes = menuStore.sidebarRoutes
  if (dynamicRoutes && dynamicRoutes.length > 0) {
    return [...defaultRoutes, ...dynamicRoutes] as any
  }
  
  return defaultRoutes
})

const activeMenu = computed(() => {
  const { path } = route
  return path
})
</script>

<style scoped lang="scss">
.sidebar-container {
  width: 210px;
  height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #e4e7ed;
  transition: width 0.28s;
  overflow: hidden;
  position: relative;
  z-index: 1000;

  &.is-collapse {
    width: 64px;
  }

  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
  }

  :deep(.el-menu) {
    border: none;
    width: 100%;
  }
}

// 移动端适配
@media screen and (max-width: 768px) {
  .sidebar-container {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    transition: transform 0.28s;

    &.is-collapse {
      transform: translateX(-210px);
      width: 210px;
    }
  }
}
</style>

