import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo, Role } from '@/types'
import { supabase, getCurrentUser, signOut } from '@/utils/supabase'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>('')
  const roles = ref<Role[]>([])
  const permissions = ref<string[]>([])
  const loading = ref<boolean>(false)

  // 登录
  async function login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      token.value = data.session?.access_token || ''
      await getUserInfo()
      return data
    } catch (error: any) {
      // ElMessage.error(error.message || '登录失败')
      throw error
    }
  }

  // 注册
  async function register(email: string, password: string, userName: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_name: userName
          }
        }
      })

      if (error) throw error
      return data
    } catch (error: any) {
      ElMessage.error(error.message || '注册失败')
      throw error
    }
  }

  // 获取用户信息
  async function getUserInfo() {
    // 防止重复调用
    if (loading.value) {
      return userInfo.value
    }
    
    loading.value = true
    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('未登录')
      }

      // 查询用户详细信息
      const { data: userData, error: userError } = await supabase
        .from('sys_user')
        .select(`
          *,
          sys_dept (
            dept_id,
            dept_name
          )
        `)
        .eq('id', user.id)
        .single()

      if (userError) throw userError

      // 查询用户角色
      const { data: userRoles, error: rolesError } = await supabase
        .from('sys_user_role')
        .select(`
          sys_role (
            role_id,
            role_name,
            role_key,
            role_sort,
            data_scope,
            status
          )
        `)
        .eq('user_id', user.id)

      if (rolesError) throw rolesError

      // 将数据库字段名转换为驼峰命名
      roles.value = (userRoles?.map((item: any) => {
        const role = item.sys_role
        if (!role) return null
        return {
          roleId: role.role_id,
          roleName: role.role_name,
          roleKey: role.role_key,
          roleSort: role.role_sort,
          dataScope: role.data_scope,
          status: role.status
        } as Role
      }).filter((role): role is Role => role !== null) || []) as Role[]

      // 查询用户权限
      const roleIds = roles.value.map(role => role.roleId).filter(id => id !== undefined)
      if (roleIds.length > 0) {
        const { data: menuData, error: menuError } = await supabase
          .from('sys_role_menu')
          .select(`
            sys_menu (
              perms
            )
          `)
          .in('role_id', roleIds)
          
        if (menuError) throw menuError

        const permsSet = new Set<string>()
        menuData?.forEach((item: any) => {
          if (item.sys_menu?.perms) {
            permsSet.add(item.sys_menu.perms)
          }
        })
        permissions.value = Array.from(permsSet)
      }

      userInfo.value = {
        id: userData.id,
        userName: userData.user_name,
        nickName: userData.nick_name,
        email: userData.email,
        phonenumber: userData.phonenumber,
        sex: userData.sex,
        avatar: userData.avatar,
        status: userData.status,
        deptId: userData.dept_id,
        createTime: userData.create_time,
        remark: userData.remark,
        roles: roles.value,
        permissions: permissions.value
      }

      return userInfo.value
    } catch (error: any) {
      console.error('获取用户信息失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 登出
  async function logout() {
    try {
      await signOut()
      reset()
    } catch (error: any) {
      console.error('登出失败:', error)
      throw error
    }
  }

  // 重置状态
  function reset() {
    userInfo.value = null
    token.value = ''
    roles.value = []
    permissions.value = []
    loading.value = false
  }

  // 判断是否是管理员
  function isAdmin() {
    return roles.value.some(role => role.roleKey === 'admin')
  }

  // 判断是否有指定角色
  function hasRole(roleKey: string) {
    return roles.value.some(role => role.roleKey === roleKey)
  }

  // 判断是否有指定权限
  function hasPermission(permission: string) {
    if (isAdmin()) return true
    return permissions.value.includes(permission)
  }

  return {
    userInfo,
    token,
    roles,
    permissions,
    loading,
    login,
    register,
    getUserInfo,
    logout,
    reset,
    isAdmin,
    hasRole,
    hasPermission
  }
})

