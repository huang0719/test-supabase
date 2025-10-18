<template>
  <template v-if="!item.meta?.hidden">
    <template v-if="hasOneShowingChild(item.children, item) && onlyOneChild && (!onlyOneChild.children || (onlyOneChild as any).noShowingChildren)">
      <el-menu-item :index="resolvePath(onlyOneChild.path)">
        <el-icon v-if="onlyOneChild.meta?.icon">
          <component :is="onlyOneChild.meta.icon" />
        </el-icon>
        <template #title>
          <span>{{ onlyOneChild.meta?.title }}</span>
        </template>
      </el-menu-item>
    </template>

    <el-sub-menu v-else :index="resolvePath(item.path)">
      <template #title>
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      <SidebarItem
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </template>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { isExternal } from '@/utils'

interface Props {
  item: RouteRecordRaw
  basePath: string
}

const props = defineProps<Props>()

const onlyOneChild = ref<RouteRecordRaw>()

function hasOneShowingChild(children: RouteRecordRaw[] = [], parent: RouteRecordRaw) {
  const showingChildren = children.filter(item => {
    if (item.meta?.hidden) {
      return false
    } else {
      onlyOneChild.value = item
      return true
    }
  })

  if (showingChildren.length === 1) {
    return true
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true } as any
    return true
  }

  return false
}

function resolvePath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  // 处理空路径的情况
  if (!routePath) {
    return props.basePath
  }
  // 处理basePath已经是完整路径的情况
  if (props.basePath.startsWith('/')) {
    // 如果routePath也以/开头，直接使用
    if (routePath.startsWith('/')) {
      return routePath
    }
    // 否则拼接
    return props.basePath + '/' + routePath
  }
  return props.basePath + '/' + routePath
}
</script>

<style scoped lang="scss">
.el-menu-item,
.el-sub-menu {
  &.is-active {
    background-color: #263445 !important;
  }
}
</style>

