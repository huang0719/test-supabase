import type { Directive } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * 权限指令
 * v-permission="['system:user:add']"
 */
export const permission: Directive = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()

    if (value && Array.isArray(value) && value.length > 0) {
      const permissions = value
      const hasPermission = permissions.some((permission: string) => {
        return userStore.hasPermission(permission)
      })

      if (!hasPermission) {
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error('请设置操作权限标签值')
    }
  }
}

/**
 * 角色指令
 * v-role="['admin']"
 */
export const role: Directive = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()

    if (value && Array.isArray(value) && value.length > 0) {
      const roles = value
      const hasRole = roles.some((role: string) => {
        return userStore.hasRole(role)
      })

      if (!hasRole) {
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error('请设置角色权限标签值')
    }
  }
}

