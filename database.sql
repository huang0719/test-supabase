-- =============================================
-- Supabase 权限管理系统数据库脚本
-- 基于若依框架的 RBAC 权限模型
-- =============================================

-- 1. 用户表
CREATE TABLE IF NOT EXISTS sys_user (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  user_name VARCHAR(30) NOT NULL UNIQUE,
  nick_name VARCHAR(30) NOT NULL,
  email VARCHAR(50) NOT NULL,
  phonenumber VARCHAR(11) DEFAULT '',
  sex CHAR(1) DEFAULT '0',
  avatar VARCHAR(100) DEFAULT '',
  password VARCHAR(100) DEFAULT '',
  status CHAR(1) DEFAULT '0',
  del_flag CHAR(1) DEFAULT '0',
  login_ip VARCHAR(128) DEFAULT '',
  login_date TIMESTAMP DEFAULT NULL,
  create_by VARCHAR(64) DEFAULT '',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_by VARCHAR(64) DEFAULT '',
  update_time TIMESTAMP DEFAULT NULL,
  remark VARCHAR(500) DEFAULT NULL,
  dept_id BIGINT DEFAULT NULL
);

COMMENT ON TABLE sys_user IS '用户信息表';
COMMENT ON COLUMN sys_user.id IS '用户ID';
COMMENT ON COLUMN sys_user.user_name IS '用户账号';
COMMENT ON COLUMN sys_user.nick_name IS '用户昵称';
COMMENT ON COLUMN sys_user.email IS '用户邮箱';
COMMENT ON COLUMN sys_user.phonenumber IS '手机号码';
COMMENT ON COLUMN sys_user.sex IS '用户性别（0男 1女 2未知）';
COMMENT ON COLUMN sys_user.avatar IS '头像地址';
COMMENT ON COLUMN sys_user.status IS '帐号状态（0正常 1停用）';
COMMENT ON COLUMN sys_user.del_flag IS '删除标志（0代表存在 2代表删除）';

-- 2. 角色表
CREATE TABLE IF NOT EXISTS sys_role (
  role_id BIGSERIAL PRIMARY KEY,
  role_name VARCHAR(30) NOT NULL,
  role_key VARCHAR(100) NOT NULL,
  role_sort INTEGER NOT NULL,
  data_scope CHAR(1) DEFAULT '1',
  menu_check_strictly BOOLEAN DEFAULT TRUE,
  dept_check_strictly BOOLEAN DEFAULT TRUE,
  status CHAR(1) NOT NULL,
  del_flag CHAR(1) DEFAULT '0',
  create_by VARCHAR(64) DEFAULT '',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_by VARCHAR(64) DEFAULT '',
  update_time TIMESTAMP DEFAULT NULL,
  remark VARCHAR(500) DEFAULT NULL
);

COMMENT ON TABLE sys_role IS '角色信息表';
COMMENT ON COLUMN sys_role.role_id IS '角色ID';
COMMENT ON COLUMN sys_role.role_name IS '角色名称';
COMMENT ON COLUMN sys_role.role_key IS '角色权限字符串';
COMMENT ON COLUMN sys_role.role_sort IS '显示顺序';
COMMENT ON COLUMN sys_role.data_scope IS '数据范围（1：全部数据权限 2：自定数据权限 3：本部门数据权限 4：本部门及以下数据权限）';
COMMENT ON COLUMN sys_role.status IS '角色状态（0正常 1停用）';

-- 3. 菜单表
CREATE TABLE IF NOT EXISTS sys_menu (
  menu_id BIGSERIAL PRIMARY KEY,
  menu_name VARCHAR(50) NOT NULL,
  parent_id BIGINT DEFAULT 0,
  order_num INTEGER DEFAULT 0,
  path VARCHAR(200) DEFAULT '',
  component VARCHAR(255) DEFAULT NULL,
  query VARCHAR(255) DEFAULT NULL,
  is_frame CHAR(1) DEFAULT '0',
  is_cache CHAR(1) DEFAULT '0',
  menu_type CHAR(1) DEFAULT '',
  visible CHAR(1) DEFAULT '0',
  status CHAR(1) DEFAULT '0',
  perms VARCHAR(100) DEFAULT NULL,
  icon VARCHAR(100) DEFAULT '',
  create_by VARCHAR(64) DEFAULT '',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_by VARCHAR(64) DEFAULT '',
  update_time TIMESTAMP DEFAULT NULL,
  remark VARCHAR(500) DEFAULT ''
);

COMMENT ON TABLE sys_menu IS '菜单权限表';
COMMENT ON COLUMN sys_menu.menu_id IS '菜单ID';
COMMENT ON COLUMN sys_menu.menu_name IS '菜单名称';
COMMENT ON COLUMN sys_menu.parent_id IS '父菜单ID';
COMMENT ON COLUMN sys_menu.order_num IS '显示顺序';
COMMENT ON COLUMN sys_menu.path IS '路由地址';
COMMENT ON COLUMN sys_menu.component IS '组件路径';
COMMENT ON COLUMN sys_menu.menu_type IS '菜单类型（M目录 C菜单 F按钮）';
COMMENT ON COLUMN sys_menu.visible IS '菜单状态（0显示 1隐藏）';
COMMENT ON COLUMN sys_menu.status IS '菜单状态（0正常 1停用）';
COMMENT ON COLUMN sys_menu.perms IS '权限标识';
COMMENT ON COLUMN sys_menu.icon IS '菜单图标';

-- 4. 部门表
CREATE TABLE IF NOT EXISTS sys_dept (
  dept_id BIGSERIAL PRIMARY KEY,
  parent_id BIGINT DEFAULT 0,
  ancestors VARCHAR(50) DEFAULT '',
  dept_name VARCHAR(30) DEFAULT '',
  order_num INTEGER DEFAULT 0,
  leader VARCHAR(20) DEFAULT NULL,
  phone VARCHAR(11) DEFAULT NULL,
  email VARCHAR(50) DEFAULT NULL,
  status CHAR(1) DEFAULT '0',
  del_flag CHAR(1) DEFAULT '0',
  create_by VARCHAR(64) DEFAULT '',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_by VARCHAR(64) DEFAULT '',
  update_time TIMESTAMP DEFAULT NULL
);

COMMENT ON TABLE sys_dept IS '部门表';
COMMENT ON COLUMN sys_dept.dept_id IS '部门id';
COMMENT ON COLUMN sys_dept.parent_id IS '父部门id';
COMMENT ON COLUMN sys_dept.dept_name IS '部门名称';
COMMENT ON COLUMN sys_dept.order_num IS '显示顺序';
COMMENT ON COLUMN sys_dept.leader IS '负责人';
COMMENT ON COLUMN sys_dept.status IS '部门状态（0正常 1停用）';

-- 5. 用户和角色关联表
CREATE TABLE IF NOT EXISTS sys_user_role (
  user_id UUID NOT NULL REFERENCES sys_user(id) ON DELETE CASCADE,
  role_id BIGINT NOT NULL REFERENCES sys_role(role_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

COMMENT ON TABLE sys_user_role IS '用户和角色关联表';

-- 6. 角色和菜单关联表
CREATE TABLE IF NOT EXISTS sys_role_menu (
  role_id BIGINT NOT NULL REFERENCES sys_role(role_id) ON DELETE CASCADE,
  menu_id BIGINT NOT NULL REFERENCES sys_menu(menu_id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, menu_id)
);

COMMENT ON TABLE sys_role_menu IS '角色和菜单关联表';

-- 7. 角色和部门关联表（数据权限）
CREATE TABLE IF NOT EXISTS sys_role_dept (
  role_id BIGINT NOT NULL REFERENCES sys_role(role_id) ON DELETE CASCADE,
  dept_id BIGINT NOT NULL REFERENCES sys_dept(dept_id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, dept_id)
);

COMMENT ON TABLE sys_role_dept IS '角色和部门关联表';

-- =============================================
-- 插入初始数据
-- =============================================

-- 1. 插入超级管理员角色
INSERT INTO sys_role (role_id, role_name, role_key, role_sort, data_scope, status, del_flag, remark)
VALUES (1, '超级管理员', 'admin', 1, '1', '0', '0', '超级管理员');

-- 2. 插入普通角色
INSERT INTO sys_role (role_id, role_name, role_key, role_sort, data_scope, status, del_flag, remark)
VALUES (2, '普通角色', 'common', 2, '2', '0', '0', '普通角色');

-- 插入部门经理角色
INSERT INTO sys_role (role_id, role_name, role_key, role_sort, data_scope, status, del_flag, remark)
VALUES (3, '部门经理', 'dept_manager', 3, '4', '0', '0', '部门经理，可以管理本部门及下属部门数据');

-- 插入访客角色
INSERT INTO sys_role (role_id, role_name, role_key, role_sort, data_scope, status, del_flag, remark)
VALUES (4, '访客', 'guest', 4, '1', '0', '0', '访客角色，只有查看权限');

-- 3. 插入顶级部门
INSERT INTO sys_dept (dept_id, parent_id, ancestors, dept_name, order_num, leader, status)
VALUES (100, 0, '0', '若依科技', 0, '若依', '0');

INSERT INTO sys_dept (dept_id, parent_id, ancestors, dept_name, order_num, leader, status)
VALUES (101, 100, '0,100', '深圳总公司', 1, '若依', '0');

INSERT INTO sys_dept (dept_id, parent_id, ancestors, dept_name, order_num, leader, status)
VALUES (102, 100, '0,100', '长沙分公司', 2, '若依', '0');

-- 插入深圳总公司下的部门
INSERT INTO sys_dept (dept_id, parent_id, ancestors, dept_name, order_num, leader, status)
VALUES (103, 101, '0,100,101', '研发部门', 1, '张三', '0');

INSERT INTO sys_dept (dept_id, parent_id, ancestors, dept_name, order_num, leader, status)
VALUES (104, 101, '0,100,101', '市场部门', 2, '李四', '0');

INSERT INTO sys_dept (dept_id, parent_id, ancestors, dept_name, order_num, leader, status)
VALUES (105, 101, '0,100,101', '财务部门', 3, '王五', '0');

-- 插入长沙分公司下的部门
INSERT INTO sys_dept (dept_id, parent_id, ancestors, dept_name, order_num, leader, status)
VALUES (106, 102, '0,100,102', '市场部门', 1, '赵六', '0');

INSERT INTO sys_dept (dept_id, parent_id, ancestors, dept_name, order_num, leader, status)
VALUES (107, 102, '0,100,102', '财务部门', 2, '孙七', '0');

-- 4. 插入示例管理员用户（可选）
-- 注意：这只是示例数据，实际使用时需要先在 Supabase Authentication 中创建用户
-- 以下 UUID 仅为示例，请替换为实际创建用户后得到的 UUID
-- 
-- 如果要使用此示例数据，请先在 Supabase Dashboard 的 Authentication 中创建用户：
-- 邮箱：admin@example.com
-- 密码：自行设置
-- 然后将下面的 UUID 替换为实际的用户 UUID，并取消注释

/*
-- 插入示例管理员用户
INSERT INTO sys_user (
  id, 
  user_name, 
  nick_name, 
  email, 
  phonenumber, 
  sex, 
  status, 
  dept_id,
  create_by,
  remark
) VALUES (
  '00000000-0000-0000-0000-000000000000',  -- 请替换为实际的用户 UUID
  'admin',
  '超级管理员',
  'admin@example.com',
  '13800138000',
  '0',
  '0',
  101,
  'system',
  '系统初始化创建的管理员账户'
);

-- 关联超级管理员角色
INSERT INTO sys_user_role (user_id, role_id) 
VALUES ('00000000-0000-0000-0000-000000000000', 1);  -- 请替换为实际的用户 UUID
*/

-- 5. 插入菜单数据
-- 仪表盘（一级菜单）
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, menu_type, visible, status, icon)
VALUES (0, '仪表盘', 0, 0, 'dashboard', 'Dashboard', 'C', '0', '0', 'Odometer');

-- 一级菜单
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, menu_type, visible, status, icon)
VALUES (1, '系统管理', 0, 1, 'system', NULL, 'M', '0', '0', 'Setting');

-- 二级菜单
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, menu_type, visible, status, perms, icon)
VALUES (100, '用户管理', 1, 1, 'user', 'system/user/index', 'C', '0', '0', 'system:user:list', 'User');

INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, menu_type, visible, status, perms, icon)
VALUES (101, '角色管理', 1, 2, 'role', 'system/role/index', 'C', '0', '0', 'system:role:list', 'UserFilled');

INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, menu_type, visible, status, perms, icon)
VALUES (102, '菜单管理', 1, 3, 'menu', 'system/menu/index', 'C', '0', '0', 'system:menu:list', 'Menu');

INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, menu_type, visible, status, perms, icon)
VALUES (103, '部门管理', 1, 4, 'dept', 'system/dept/index', 'C', '0', '0', 'system:dept:list', 'OfficeBuilding');

-- 用户管理按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, menu_type, visible, status, perms)
VALUES (1000, '用户查询', 100, 1, 'F', '0', '0', 'system:user:query');

INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, menu_type, visible, status, perms)
VALUES (1001, '用户新增', 100, 2, 'F', '0', '0', 'system:user:add');

INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, menu_type, visible, status, perms)
VALUES (1002, '用户修改', 100, 3, 'F', '0', '0', 'system:user:edit');

INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, menu_type, visible, status, perms)
VALUES (1003, '用户删除', 100, 4, 'F', '0', '0', 'system:user:remove');

-- 角色管理按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, menu_type, visible, status, perms)
VALUES (1004, '角色查询', 101, 1, 'F', '0', '0', 'system:role:query');

INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, menu_type, visible, status, perms)
VALUES (1005, '角色新增', 101, 2, 'F', '0', '0', 'system:role:add');

INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, menu_type, visible, status, perms)
VALUES (1006, '角色修改', 101, 3, 'F', '0', '0', 'system:role:edit');

INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, menu_type, visible, status, perms)
VALUES (1007, '角色删除', 101, 4, 'F', '0', '0', 'system:role:remove');

-- 菜单管理按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, menu_type, visible, status, perms)
VALUES (1008, '菜单查询', 102, 1, 'F', '0', '0', 'system:menu:query');

INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, menu_type, visible, status, perms)
VALUES (1009, '菜单新增', 102, 2, 'F', '0', '0', 'system:menu:add');

INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, menu_type, visible, status, perms)
VALUES (1010, '菜单修改', 102, 3, 'F', '0', '0', 'system:menu:edit');

INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, menu_type, visible, status, perms)
VALUES (1011, '菜单删除', 102, 4, 'F', '0', '0', 'system:menu:remove');

-- 部门管理按钮
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, menu_type, visible, status, perms)
VALUES (1012, '部门查询', 103, 1, 'F', '0', '0', 'system:dept:query');

INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, menu_type, visible, status, perms)
VALUES (1013, '部门新增', 103, 2, 'F', '0', '0', 'system:dept:add');

INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, menu_type, visible, status, perms)
VALUES (1014, '部门修改', 103, 3, 'F', '0', '0', 'system:dept:edit');

INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, menu_type, visible, status, perms)
VALUES (1015, '部门删除', 103, 4, 'F', '0', '0', 'system:dept:remove');

-- 5. 超级管理员分配所有权限
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 1, menu_id FROM sys_menu;

-- 6. 普通角色分配部分菜单权限（只分配查询权限）
INSERT INTO sys_role_menu (role_id, menu_id)
VALUES 
  (2, 0),     -- 仪表盘
  (2, 1),     -- 系统管理目录
  (2, 100),   -- 用户管理菜单
  (2, 1000),  -- 用户查询
  (2, 103),   -- 部门管理菜单
  (2, 1012);  -- 部门查询

-- 部门经理角色菜单权限（查询 + 部分编辑权限）
INSERT INTO sys_role_menu (role_id, menu_id)
VALUES 
  (3, 0),     -- 仪表盘
  (3, 1),     -- 系统管理目录
  (3, 100),   -- 用户管理菜单
  (3, 1000),  -- 用户查询
  (3, 1001),  -- 用户新增
  (3, 1002),  -- 用户修改
  (3, 103),   -- 部门管理菜单
  (3, 1012),  -- 部门查询
  (3, 1013),  -- 部门新增
  (3, 1014);  -- 部门修改

-- 访客角色菜单权限（只读）
INSERT INTO sys_role_menu (role_id, menu_id)
VALUES 
  (4, 0),     -- 仪表盘
  (4, 1),     -- 系统管理目录
  (4, 100),   -- 用户管理菜单
  (4, 1000),  -- 用户查询
  (4, 103),   -- 部门管理菜单
  (4, 1012);  -- 部门查询

-- 7. 角色部门关联（数据权限）
-- 超级管理员拥有所有部门的数据权限
INSERT INTO sys_role_dept (role_id, dept_id)
SELECT 1, dept_id FROM sys_dept;

-- 普通角色只能查看深圳总公司的数据
INSERT INTO sys_role_dept (role_id, dept_id)
VALUES (2, 101);

-- 部门经理角色可以查看深圳总公司及其下属部门
INSERT INTO sys_role_dept (role_id, dept_id)
VALUES 
  (3, 101),  -- 深圳总公司
  (3, 103),  -- 研发部门
  (3, 104),  -- 市场部门
  (3, 105);  -- 财务部门

-- 访客角色可以查看所有部门（只读）
INSERT INTO sys_role_dept (role_id, dept_id)
SELECT 4, dept_id FROM sys_dept;

-- =============================================
-- 完成
-- =============================================


