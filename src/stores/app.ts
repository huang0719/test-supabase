import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 侧边栏是否折叠
  const sidebarCollapse = ref(false)
  
  // 设备类型
  const device = ref<'desktop' | 'mobile'>('desktop')

  // 页面尺寸
  const size = ref<'default' | 'large' | 'small'>('default')

  // 切换侧边栏
  function toggleSidebar() {
    sidebarCollapse.value = !sidebarCollapse.value
  }

  // 关闭侧边栏
  function closeSidebar() {
    sidebarCollapse.value = true
  }

  // 打开侧边栏
  function openSidebar() {
    sidebarCollapse.value = false
  }

  // 设置设备类型
  function setDevice(val: 'desktop' | 'mobile') {
    device.value = val
  }

  // 设置页面尺寸
  function setSize(val: 'default' | 'large' | 'small') {
    size.value = val
  }

  return {
    sidebarCollapse,
    device,
    size,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    setDevice,
    setSize
  }
})

