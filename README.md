# Supabase + Vue3 权限管理系统

一个基于 Supabase、Vue3、TypeScript、Element Plus 的权限管理系统，采用 RBAC 权限控制模型。

## ✨ 特性

- 🚀 采用最新技术栈：Vue3 + TypeScript + Vite + Pinia
- 🎨 UI 组件库：Element Plus
- 🔐 完整的权限系统：基于 RBAC 的权限控制
- 🌐 Supabase 后端：无需自建后端服务
- 📱 响应式设计：支持桌面和移动端
- 🎯 路由权限：动态路由 + 路由守卫
- 🔧 按钮权限：自定义指令控制按钮显示
- 📊 数据权限：通过 RLS 策略实现数据级权限

## 📦 技术栈

- **框架**: Vue 3.5+ (Composition API)
- **语言**: TypeScript 5.9+
- **构建工具**: Vite 7.1+
- **状态管理**: Pinia 3.0+
- **路由**: Vue Router 4.5+
- **UI 组件**: Element Plus 2.5+
- **图标**: @element-plus/icons-vue
- **后端服务**: Supabase
- **CSS 预处理**: Sass

## 🚀 快速开始

### 1. 环境准备

确保你的开发环境满足以下要求：

- Node.js >= 20.19.0
- pnpm >= 8.0.0 (推荐) 或 npm >= 9.0.0

### 2. 克隆项目

```bash
git clone <your-repo-url>
cd supabase-admin
```

### 3. 安装依赖

```bash
pnpm install
# 或
npm install
```

### 4. 配置 Supabase

#### 4.1 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 创建新项目
3. 记录以下信息：
   - Project URL: `https://your-project.supabase.co`
   - anon/public API Key: `your-anon-key`

#### 4.2 执行 SQL 脚本

在 Supabase SQL Editor 中执行 `database.sql` 文件中的 SQL 脚本，创建数据表和 RLS 策略。

#### 4.3 配置环境变量

复制 `.env.example` 为 `.env` 并填入你的 Supabase 配置：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_TITLE=权限管理系统
```

### 5. 启动开发服务器

```bash
pnpm dev
# 或
npm run dev
```

浏览器自动打开 `http://localhost:3000`

### 6. 创建管理员账户

#### 方式一：通过 Supabase Dashboard

1. 在 Supabase Dashboard 的 Authentication 页面创建用户
2. 记录用户 UUID
3. 在 SQL Editor 中执行：

```sql
-- 将用户关联到超级管理员角色
INSERT INTO sys_user_role (user_id, role_id) 
VALUES ('your-user-uuid', 1);

-- 更新用户信息
UPDATE sys_user 
SET user_name = 'admin', 
    nick_name = '超级管理员',
    status = '0'
WHERE id = 'your-user-uuid';
```

#### 方式二：通过代码注册

登录页面提供了注册功能（需要先实现注册页面）。

### 7. 登录系统

使用创建的管理员账户登录系统。

## 📂 项目结构

```
supabase-admin/
├── public/                  # 静态资源
├── src/
│   ├── assets/             # 资源文件（图片、样式等）
│   ├── components/         # 公共组件
│   ├── composables/        # 组合式函数
│   │   └── usePermission.ts # 权限检查
│   ├── directives/         # 自定义指令
│   │   ├── index.ts
│   │   └── permission.ts   # 权限指令
│   ├── layout/             # 布局组件
│   │   ├── components/
│   │   │   ├── AppMain.vue
│   │   │   ├── Navbar.vue
│   │   │   ├── Sidebar.vue
│   │   │   └── SidebarItem.vue
│   │   └── index.vue
│   ├── router/             # 路由配置
│   │   ├── index.ts        # 路由定义
│   │   └── permission.ts   # 路由守卫
│   ├── stores/             # 状态管理
│   │   ├── app.ts          # 应用状态
│   │   ├── menu.ts         # 菜单状态
│   │   └── user.ts         # 用户状态
│   ├── types/              # 类型定义
│   │   └── index.ts
│   ├── utils/              # 工具函数
│   │   ├── index.ts
│   │   ├── request.ts      # HTTP 请求
│   │   └── supabase.ts     # Supabase 客户端
│   ├── views/              # 页面组件
│   │   ├── system/         # 系统管理
│   │   │   ├── user/       # 用户管理
│   │   │   ├── role/       # 角色管理
│   │   │   ├── menu/       # 菜单管理
│   │   │   └── dept/       # 部门管理
│   │   ├── error/
│   │   │   └── 404.vue
│   │   ├── Dashboard.vue   # 仪表盘
│   │   └── Login.vue       # 登录页
│   ├── App.vue
│   └── main.ts
├── .env                    # 环境变量
├── .env.example            # 环境变量示例
├── database.sql            # 数据库脚本
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔐 权限系统

### RBAC 模型

```
用户(User) ──┬──> 角色(Role) ──> 菜单权限(Menu)
            │
            └──> 部门(Dept) ──> 数据权限
```

### 权限使用

#### 1. 指令方式

```vue
<template>
  <!-- 按钮权限 -->
  <el-button v-permission="['system:user:add']">新增</el-button>
  
  <!-- 角色权限 -->
  <div v-role="['admin']">管理员可见内容</div>
</template>
```

#### 2. 编程方式

```vue
<script setup lang="ts">
import { usePermission } from '@/composables/usePermission'

const { hasPermission, hasRole, isAdmin } = usePermission()

// 检查权限
if (hasPermission('system:user:edit')) {
  // 执行操作
}

// 检查角色
if (hasRole('admin')) {
  // 执行操作
}

// 是否是管理员
if (isAdmin.value) {
  // 执行操作
}
</script>
```

#### 3. 路由权限

```typescript
{
  path: '/system/user',
  component: () => import('@/views/system/user/index.vue'),
  meta: {
    title: '用户管理',
    permissions: ['system:user:list'] // 需要的权限
  }
}
```

### 数据权限范围

- `1` - 全部数据权限
- `2` - 自定义数据权限
- `3` - 本部门数据权限
- `4` - 本部门及以下数据权限
- `5` - 仅本人数据权限

## 📝 核心功能

### 系统管理

- ✅ 用户管理：用户的增删改查、状态管理
- ✅ 角色管理：角色的增删改查、权限分配
- ✅ 菜单管理：菜单的增删改查、树形展示
- ✅ 部门管理：部门的增删改查、树形展示

### 功能特性

- ✅ 用户登录/登出
- ✅ 权限验证（路由级、按钮级）
- ✅ 动态路由
- ✅ 面包屑导航
- ✅ 侧边栏折叠
- ✅ 响应式布局

## 🛠️ 开发指南

### 添加新页面

1. 在 `src/views` 下创建页面组件
2. 在 `src/router/index.ts` 中添加路由
3. 在数据库中添加相应的菜单权限

### 添加新权限

1. 在数据库 `sys_menu` 表中添加权限标识
2. 将权限分配给相应的角色
3. 在页面中使用 `v-permission` 指令或 `hasPermission` 函数

### 样式开发

项目使用 Sass 作为 CSS 预处理器，支持嵌套、变量等特性。

## 📦 构建部署

### 构建生产版本

```bash
pnpm build
# 或
npm run build
```

构建产物在 `dist` 目录下。

### 预览生产版本

```bash
pnpm preview
# 或
npm run preview
```

### 部署

将 `dist` 目录部署到任何静态文件服务器即可，如：

- Vercel
- Netlify
- GitHub Pages
- 阿里云 OSS
- 腾讯云 COS

## ⚠️ 注意事项

1. **RLS 策略**：确保所有表都启用了 RLS，否则数据可能泄露
2. **权限缓存**：用户权限变更后需要重新登录
3. **超级管理员**：`role_key='admin'` 的角色拥有所有权限
4. **密码强度**：Supabase Auth 默认要求至少 6 位密码
5. **邮箱验证**：生产环境建议启用邮箱验证

## 🔗 相关链接

- [Vue 3 文档](https://cn.vuejs.org/)
- [Vite 文档](https://cn.vitejs.dev/)
- [Element Plus 文档](https://element-plus.org/)
- [Supabase 文档](https://supabase.com/docs)
- [Pinia 文档](https://pinia.vuejs.org/zh/)

## 📄 License

[MIT](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请提交 Issue。
