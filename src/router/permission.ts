import router, { notFoundRoute } from './index'
import { useUserStore } from '@/stores/user'
import { useMenuStore } from '@/stores/menu'
import { getSession } from '@/utils/supabase'
import { ElLoading, ElMessage } from 'element-plus'

const whiteList = ['/login', '/register'] // 白名单

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const menuStore = useMenuStore()

  // 获取 session
  const session = await getSession()

  if (session) {
    // 已登录
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      // 判断是否已获取用户信息
      if (!userStore.userInfo) {
        try {
          ElLoading.service({
            lock: true,
            text: '加载中...',
          })

          // 获取用户信息
          await userStore.getUserInfo()
          
          // 生成并添加动态路由
          try {
            const accessRoutes = await menuStore.generateRoutes(userStore.userInfo!.id)
            
            // 动态添加可访问路由（包括隐藏的路由）
            // 注意：所有路由都需要注册到 Vue Router 中，即使它们在侧边栏中隐藏
            // 这样用户仍然可以通过直接访问 URL 来访问这些页面
            accessRoutes.forEach(route => {
              router.addRoute(route as any)
            })
            
            // 最后添加404路由，确保它在所有动态路由之后
            router.addRoute(notFoundRoute)
            
            console.log('动态路由加载成功，共', accessRoutes.length, '个路由')
          } catch (menuError) {
            console.error('动态路由生成失败:', menuError)
            ElMessage.error('菜单加载失败，部分功能可能无法使用')
            // 即使失败也添加404路由
            router.addRoute(notFoundRoute)
          }
          
          // 重新进入路由，让新添加的路由生效
          next({ ...to, replace: true })
        } catch (error) {
          // 获取用户信息失败，退出登录
          console.error('获取用户信息失败:', error)
          await userStore.logout()
          ElMessage.error('获取用户信息失败，请重新登录')
          next(`/login?redirect=${to.path}`)
        } finally {
          ElLoading.service().close()
        }
      } else {
        // 权限验证
        if (to.meta.permissions && Array.isArray(to.meta.permissions)) {
          const hasPermission = (to.meta.permissions as string[]).some(permission => 
            userStore.hasPermission(permission)
          )
          
          if (hasPermission) {
            next()
          } else {
            ElMessage.error('您没有权限访问该页面')
            next('/404')
          }
        } else {
          next()
        }
      }
    }
  } else {
    // 未登录
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router

