<template>
  <div :class="['app-wrapper', { 'mobile': isMobile }]">
    <!-- 移动端遮罩 -->
    <div 
      v-if="isMobile && !appStore.sidebarCollapse" 
      class="drawer-bg" 
      @click="appStore.closeSidebar()"
    />
    
    <Sidebar />
    
    <div class="main-container" :class="{ 'has-sidebar': !appStore.sidebarCollapse && !isMobile }">
      <Navbar />
      <AppMain />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import AppMain from './components/AppMain.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const isMobile = computed(() => appStore.device === 'mobile')

// 监听窗口大小变化
const handleResize = () => {
  const width = document.body.clientWidth
  if (width < 768) {
    appStore.setDevice('mobile')
    appStore.closeSidebar()
  } else {
    appStore.setDevice('desktop')
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.app-wrapper {
  display: flex;
  width: 100%;
  height: 100vh;
  position: relative;
  
  .drawer-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 999;
  }
  
  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100%;
    transition: margin-left 0.28s;
    margin-left: 0;
    position: relative;
    width: 0; // 让 flex: 1 能正确计算宽度
    
    &.has-sidebar {
      margin-left: 0;
    }
  }
  
  &.mobile {
    .main-container {
      margin-left: 0;
      width: 100%;
    }
  }
}
</style>

