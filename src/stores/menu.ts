import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Menu, RouteConfig } from '@/types'
import { supabase } from '@/utils/supabase'
import { handleTree } from '@/utils'
import Layout from '@/layout/index.vue'

export const useMenuStore = defineStore('menu', () => {
  const menus = ref<Menu[]>([])
  const routes = ref<RouteConfig[]>([])
  const sidebarRoutes = ref<RouteConfig[]>([])

  // 获取菜单列表
  async function getMenuList(userId?: string) {
    try {
      let query = supabase
        .from('sys_menu')
        .select('*')
        .eq('status', '0')
        .order('order_num', { ascending: true })

      // 如果传入了用户ID，则只获取该用户有权限的菜单
      if (userId) {
        const { data: userRoles } = await supabase
          .from('sys_user_role')
          .select('role_id')
          .eq('user_id', userId)

        const roleIds = userRoles?.map(item => item.role_id) || []

        if (roleIds.length > 0) {
          const { data: roleMenus } = await supabase
            .from('sys_role_menu')
            .select('menu_id')
            .in('role_id', roleIds)

          const menuIds = roleMenus?.map(item => item.menu_id) || []

          if (menuIds.length > 0) {
            query = query.in('menu_id', menuIds)
          }
        }
      }

      const { data, error } = await query

      if (error) throw error

      // 转换为树形结构
      const menuList = data?.map(item => ({
        menuId: item.menu_id,
        menuName: item.menu_name,
        parentId: item.parent_id,
        orderNum: item.order_num,
        path: item.path,
        component: item.component,
        query: item.query,
        isFrame: item.is_frame,
        isCache: item.is_cache,
        menuType: item.menu_type,
        visible: item.visible,
        status: item.status,
        perms: item.perms,
        icon: item.icon,
        createTime: item.create_time
      })) || []

      menus.value = handleTree(menuList, 'menuId', 'parentId', 'children')
      return menus.value
    } catch (error) {
      console.error('获取菜单列表失败:', error)
      throw error
    }
  }

  // 动态加载组件
  const loadView = (view: string) => {
    // 使用动态导入
    const modules = import.meta.glob('@/views/**/*.vue')
    const componentPath = `/src/views/${view}.vue`
    
    if (modules[componentPath]) {
      return modules[componentPath]
    } else {
      console.error(`组件不存在: ${componentPath}，请检查文件路径`)
      return null
    }
  }

  // 构建路由
  function buildRoutes(menuList: Menu[]): RouteConfig[] {
    const routes: RouteConfig[] = []

    menuList.forEach(menu => {
      if (menu.menuType === 'F') return // 跳过按钮
      if (menu.visible === '1') return // 跳过隐藏菜单

      // 确保路径格式正确
      const menuPath = menu.path.startsWith('/') ? menu.path : `/${menu.path}`
      
      // 父路由不设置name，避免与子路由冲突
      const route: RouteConfig = {
        path: menuPath,
        component: Layout,
        meta: {
          title: menu.menuName,
          icon: menu.icon,
          hidden: menu.visible === '1',
          noCache: menu.isCache === '1',
          permissions: menu.perms ? [menu.perms] : []
        }
      }

      // 如果是目录且有子菜单
      if (menu.menuType === 'M' && menu.children && menu.children.length > 0) {
        route.children = []
        
        // 过滤有效的子菜单
        const validChildren = menu.children.filter(child => 
          child.menuType !== 'F' && child.visible !== '1'
        )
        
        validChildren.forEach(child => {
          const childRoute: RouteConfig = {
            path: child.path,
            name: child.menuName,
            meta: {
              title: child.menuName,
              icon: child.icon,
              hidden: child.visible === '1',
              noCache: child.isCache === '1',
              permissions: child.perms ? [child.perms] : []
            }
          }

          // 如果是菜单（C类型），加载组件
          if (child.menuType === 'C' && child.component && child.component !== '#') {
            const component = loadView(child.component)
            if (component) {
              childRoute.component = component as any
            } else {
              console.warn(`子菜单 ${child.menuName} 的组件加载失败`)
            }
          }

          route.children!.push(childRoute)
        })
        
        // 如果目录有子菜单，设置重定向到第一个子菜单
        if (route.children && route.children.length > 0 && route.children[0]) {
          const firstChildPath = route.children[0].path
          // 确保重定向路径格式正确
          route.redirect = menuPath + (firstChildPath.startsWith('/') ? '' : '/') + firstChildPath
        }
      }
      // 如果是单个菜单（C类型）
      else if (menu.menuType === 'C') {
        // 只有当组件路径有效时才创建路由
        if (!menu.component) {
          console.warn(`菜单 ${menu.menuName} 没有配置有效的组件路径`)
          return
        }
        
        // 加载组件
        const component = loadView(menu.component)
        if (!component) {
          console.warn(`菜单 ${menu.menuName} 的组件加载失败，跳过该路由`)
          return
        }
        
        route.children = [{
          path: '',
          name: menu.menuName,
          component: component as any,
          meta: {
            title: menu.menuName,
            icon: menu.icon,
            hidden: menu.visible === '1',
            noCache: menu.isCache === '1',
            permissions: menu.perms ? [menu.perms] : [],
            affix: menu.path === 'dashboard' // 仪表盘固定标签
          }
        }]
      }

      // 只添加有效的路由（有子路由的）
      if (route.children && route.children.length > 0) {
        routes.push(route)
      }
    })

    return routes
  }

  // 生成路由
  async function generateRoutes(userId: string) {
    const menuList = await getMenuList(userId)
    const accessedRoutes = buildRoutes(menuList)
    routes.value = accessedRoutes
    sidebarRoutes.value = accessedRoutes.filter(route => !route.meta?.hidden)
    
    console.log(`✅ 动态路由生成成功，共加载 ${accessedRoutes.length} 个路由`)
    return accessedRoutes
  }

  return {
    menus,
    routes,
    sidebarRoutes,
    getMenuList,
    generateRoutes
  }
})

