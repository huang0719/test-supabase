// 用户信息
export interface UserInfo {
  id: string
  userName: string
  nickName: string
  email: string
  phonenumber?: string
  sex?: string
  avatar?: string
  status: string
  deptId?: number
  createTime?: string
  remark?: string
  roles: Role[]
  permissions: string[]
}

// 角色
export interface Role {
  roleId: number
  roleName: string
  roleKey: string
  roleSort: number
  dataScope: string
  menuCheckStrictly: boolean
  deptCheckStrictly: boolean
  status: string
  delFlag: string
  createTime?: string
  remark?: string
}

// 菜单
export interface Menu {
  menuId: number
  menuName: string
  parentId: number
  orderNum: number
  path: string
  component?: string
  query?: string
  isFrame: string
  isCache: string
  menuType: 'M' | 'C' | 'F' // M目录 C菜单 F按钮
  visible: string
  status: string
  perms?: string
  icon?: string
  createTime?: string
  children?: Menu[]
}

// 部门
export interface Dept {
  deptId: number
  parentId: number
  ancestors?: string
  deptName: string
  orderNum: number
  leader?: string
  phone?: string
  email?: string
  status: string
  delFlag: string
  createTime?: string
  children?: Dept[]
}

// 路由配置
export interface RouteConfig {
  path: string
  name?: string
  component?: any
  redirect?: string
  meta?: {
    title?: string
    icon?: string
    hidden?: boolean
    alwaysShow?: boolean
    roles?: string[]
    permissions?: string[]
    noCache?: boolean
    affix?: boolean
    breadcrumb?: boolean
  }
  children?: RouteConfig[]
}

// 登录表单
export interface LoginForm {
  username: string
  password: string
  remember?: boolean
}

// 分页参数
export interface PageParams {
  pageNum: number
  pageSize: number
}

// 分页响应
export interface PageResult<T> {
  rows: T[]
  total: number
}

// API 响应
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

