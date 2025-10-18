import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export function usePermission() {
  const userStore = useUserStore()

  // 是否是管理员
  const isAdmin = computed(() => userStore.isAdmin())

  // 判断是否有指定权限
  const hasPermission = (permission: string | string[]) => {
    if (isAdmin.value) return true

    if (typeof permission === 'string') {
      return userStore.hasPermission(permission)
    }

    if (Array.isArray(permission)) {
      return permission.some(p => userStore.hasPermission(p))
    }

    return false
  }

  // 判断是否有指定角色
  const hasRole = (role: string | string[]) => {
    if (isAdmin.value) return true

    if (typeof role === 'string') {
      return userStore.hasRole(role)
    }

    if (Array.isArray(role)) {
      return role.some(r => userStore.hasRole(r))
    }

    return false
  }

  // 判断是否有任一权限
  const hasAnyPermission = (permissions: string[]) => {
    if (isAdmin.value) return true
    return permissions.some(p => userStore.hasPermission(p))
  }

  // 判断是否有任一角色
  const hasAnyRole = (roles: string[]) => {
    if (isAdmin.value) return true
    return roles.some(r => userStore.hasRole(r))
  }

  // 判断是否拥有所有权限
  const hasAllPermissions = (permissions: string[]) => {
    if (isAdmin.value) return true
    return permissions.every(p => userStore.hasPermission(p))
  }

  // 判断是否拥有所有角色
  const hasAllRoles = (roles: string[]) => {
    if (isAdmin.value) return true
    return roles.every(r => userStore.hasRole(r))
  }

  return {
    isAdmin,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAnyRole,
    hasAllPermissions,
    hasAllRoles
  }
}

