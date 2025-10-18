# 🚀 快速启动指南

## 第一步：配置 Supabase

### 1. 创建 Supabase 项目

访问 [https://supabase.com](https://supabase.com) 并登录（如果没有账号，需要先注册）

点击 "New Project" 创建新项目：
- 输入项目名称
- 设置数据库密码（请务必记住）
- 选择区域（建议选择离你最近的区域）
- 点击 "Create new project"

等待项目创建完成（大约需要 1-2 分钟）

### 2. 获取 API 密钥

项目创建完成后：
1. 点击左侧菜单的 "Settings" (齿轮图标)
2. 选择 "API"
3. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. 执行数据库脚本

1. 点击左侧菜单的 "SQL Editor"
2. 点击 "New query"
3. 打开项目中的 `database.sql` 文件，复制全部内容
4. 粘贴到 SQL Editor 中
5. 点击 "Run" 按钮执行

如果执行成功，你会看到 "Success. No rows returned" 的提示。

## 第二步：配置项目

### 1. 安装依赖

```bash
cd supabase-admin
pnpm install
```

如果没有安装 pnpm，可以先安装：
```bash
npm install -g pnpm
```

或者使用 npm：
```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Mac/Linux
cp .env.example .env
```

编辑 `.env` 文件，填入第一步获取的信息：
```env
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon_key
VITE_APP_TITLE=权限管理系统
```

## 第三步：创建管理员账户

### 自动创建（推荐）✨

现在创建管理员账户非常简单！数据库触发器会自动处理：

1. 在 Supabase Dashboard 中，点击左侧菜单的 "Authentication"
2. 点击 "Add user" → "Create new user"
3. 输入邮箱和密码（例如：admin@example.com / 123456）
4. 点击 "Create user"

**就这么简单！** 🎉

```sql
-- 第一步：插入或更新用户信息到 sys_user 表
INSERT INTO sys_user (id, user_name, nick_name, email, status, dept_id)
VALUES ('your-user-uuid', 'admin', '超级管理员', 'admin@example.com', '0', 101)
ON CONFLICT (id) 
DO UPDATE SET 
  user_name = 'admin', 
  nick_name = '超级管理员',
  status = '0',
  dept_id = 101;

-- 第二步：将用户关联到超级管理员角色
INSERT INTO sys_user_role (user_id, role_id) 
VALUES ('your-user-uuid', 1)
ON CONFLICT (user_id, role_id) DO NOTHING;
```

**记得替换**：
- `'your-user-uuid'` → 你的实际用户 UUID
- `'admin@example.com'` → 你的实际邮箱

## 第四步：启动项目

```bash
pnpm dev
```

或使用 npm：
```bash
npm run dev
```

项目会自动在浏览器中打开 `http://localhost:3000`

## 第五步：登录系统

使用刚才创建的管理员账户登录：
- 邮箱：`admin@example.com`
- 密码：`123456`

登录成功后，你就可以开始使用系统了！

## 常见问题

### 1. 触发器没有自动创建用户

**问题**：创建用户后无法登录，或者提示用户不存在

**原因**：
- 可能是旧版本的数据库脚本（没有自动触发器）
- 或者触发器执行失败

**解决方法**：

重新执行触发器创建脚本，在 SQL Editor 中运行：

```sql
-- 重新创建触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
  default_role_id BIGINT;
BEGIN
  INSERT INTO sys_user (id, user_name, nick_name, email, status, dept_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'nick_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    '0',
    101
  );
  
  SELECT COUNT(*) INTO user_count FROM sys_user WHERE id != NEW.id;
  
  IF user_count = 0 THEN
    default_role_id := 1;
  ELSE
    default_role_id := 2;
  END IF;
  
  INSERT INTO sys_user_role (user_id, role_id)
  VALUES (NEW.id, default_role_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

如果是已创建的用户，需要手动补充数据：

```sql
-- 手动插入用户数据（替换 UUID 和邮箱）
INSERT INTO sys_user (id, user_name, nick_name, email, status, dept_id)
VALUES ('your-user-uuid', 'admin', '超级管理员', 'your-email@example.com', '0', 101)
ON CONFLICT (id) DO NOTHING;

-- 关联到超级管理员角色
INSERT INTO sys_user_role (user_id, role_id) 
VALUES ('your-user-uuid', 1)
ON CONFLICT (user_id, role_id) DO NOTHING;
```

### 2. 连接 Supabase 失败

**问题**：浏览器控制台显示 "Failed to fetch" 或类似错误

**解决方法**：
- 检查 `.env` 文件中的 URL 和 API Key 是否正确
- 确保 Supabase 项目状态正常（在 Dashboard 中查看）
- 检查网络连接

### 3. 数据库脚本执行失败

**问题**：执行 `database.sql` 时报错

**解决方法**：
- 确保是在新创建的项目中执行
- 分段执行脚本，找出具体哪一段有问题
- 检查是否有语法错误

### 4. 登录后看不到菜单

**问题**：登录成功但是侧边栏没有菜单

**解决方法**：
- 检查用户是否正确关联到角色
- 在 SQL Editor 中执行：
```sql
-- 查看用户角色
SELECT * FROM sys_user_role WHERE user_id = 'your-user-uuid';

-- 查看角色菜单权限
SELECT * FROM sys_role_menu WHERE role_id = 1;
```

### 5. 没有权限访问某个页面

**问题**：点击菜单时提示 "您没有权限访问该页面"

**解决方法**：
- 确认该菜单的权限标识是否正确
- 确认角色是否分配了该权限
- 超级管理员（role_key='admin'）应该有所有权限

### 6. 依赖安装失败

**问题**：执行 `pnpm install` 或 `npm install` 失败

**解决方法**：
- 检查 Node.js 版本（需要 >= 20.19.0）
- 尝试清除缓存：
```bash
# pnpm
pnpm store prune

# npm
npm cache clean --force
```
- 切换到国内镜像：
```bash
# pnpm
pnpm config set registry https://registry.npmmirror.com

# npm
npm config set registry https://registry.npmmirror.com
```

## 下一步

现在你已经成功运行了项目！接下来你可以：

1. 📖 阅读 [README.md](README.md) 了解更多功能
2. 🔐 学习如何使用权限系统
3. 🎨 自定义样式和主题
4. 📝 添加新的页面和功能
5. 🚀 部署到生产环境

## 获取帮助

如果遇到问题：
1. 查看 [README.md](README.md) 中的详细文档
2. 检查浏览器控制台的错误信息
3. 查看 Supabase Dashboard 中的日志
4. 提交 Issue 到 GitHub

祝你使用愉快！🎉

