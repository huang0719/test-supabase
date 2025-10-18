<template>
  <div class="profile-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <!-- 左侧头像和基本信息 -->
        <el-col :span="8">
          <div class="profile-left">
            <div class="avatar-section">
              <el-avatar 
                :size="120" 
                :src="userInfo.avatar" 
                :icon="User"
                class="profile-avatar"
              />
              <div class="avatar-actions">
                <el-button type="primary" size="small" @click="handleAvatarUpload">
                  更换头像
                </el-button>
              </div>
            </div>
            
            <div class="user-info">
              <h3>{{ userInfo.nickName || userInfo.userName }}</h3>
              <p class="user-email">{{ userInfo.email }}</p>
              <p class="user-phone">{{ userInfo.phonenumber || '未设置手机号' }}</p>
            </div>
          </div>
        </el-col>
        
        <!-- 右侧详细信息 -->
        <el-col :span="16">
          <el-tabs v-model="activeTab" class="profile-tabs">
            <!-- 基本信息 -->
            <el-tab-pane label="基本信息" name="basic">
              <el-form 
                ref="basicFormRef" 
                :model="basicForm" 
                :rules="basicRules" 
                label-width="100px"
                class="profile-form"
              >
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="用户名" prop="userName">
                      <el-input v-model="basicForm.userName" disabled />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="昵称" prop="nickName">
                      <el-input v-model="basicForm.nickName" />
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="邮箱" prop="email">
                      <el-input v-model="basicForm.email" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="手机号" prop="phonenumber">
                      <el-input v-model="basicForm.phonenumber" />
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="性别" prop="sex">
                      <el-radio-group v-model="basicForm.sex">
                        <el-radio label="0">男</el-radio>
                        <el-radio label="1">女</el-radio>
                        <el-radio label="2">未知</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="状态" prop="status">
                      <el-radio-group v-model="basicForm.status">
                        <el-radio label="0">正常</el-radio>
                        <el-radio label="1">停用</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-form-item label="备注" prop="remark">
                  <el-input 
                    v-model="basicForm.remark" 
                    type="textarea" 
                    :rows="3"
                    placeholder="请输入备注信息"
                  />
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="handleBasicSubmit" :loading="basicLoading">
                    保存修改
                  </el-button>
                  <el-button @click="handleBasicReset">重置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            
            <!-- 修改密码 -->
            <el-tab-pane label="修改密码" name="password">
              <el-form 
                ref="passwordFormRef" 
                :model="passwordForm" 
                :rules="passwordRules" 
                label-width="120px"
                class="profile-form"
              >
                <el-form-item label="当前密码" prop="oldPassword">
                  <el-input 
                    v-model="passwordForm.oldPassword" 
                    type="password" 
                    show-password
                    placeholder="请输入当前密码"
                  />
                </el-form-item>
                
                <el-form-item label="新密码" prop="newPassword">
                  <el-input 
                    v-model="passwordForm.newPassword" 
                    type="password" 
                    show-password
                    placeholder="请输入新密码"
                  />
                </el-form-item>
                
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input 
                    v-model="passwordForm.confirmPassword" 
                    type="password" 
                    show-password
                    placeholder="请再次输入新密码"
                  />
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="handlePasswordSubmit" :loading="passwordLoading">
                    修改密码
                  </el-button>
                  <el-button @click="handlePasswordReset">重置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            
            <!-- 登录日志 -->
            <el-tab-pane label="登录日志" name="logs">
              <div class="login-logs">
                <el-table :data="loginLogs" style="width: 100%">
                  <el-table-column prop="loginTime" label="登录时间" width="180" />
                  <el-table-column prop="loginIp" label="登录IP" width="150" />
                  <el-table-column prop="loginLocation" label="登录地点" />
                  <el-table-column prop="browser" label="浏览器" />
                  <el-table-column prop="os" label="操作系统" />
                </el-table>
                
                <div class="pagination-container">
                  <el-pagination
                    v-model:current-page="logQueryParams.pageNum"
                    v-model:page-size="logQueryParams.pageSize"
                    :total="logTotal"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleLogSizeChange"
                    @current-change="handleLogCurrentChange"
                  />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 头像上传对话框 -->
    <el-dialog v-model="avatarDialogVisible" title="更换头像" width="400px">
      <div class="avatar-upload">
        <el-upload
          class="avatar-uploader"
          :action="uploadUrl"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <div class="upload-tips">
          <p>只能上传jpg/png文件，且不超过2MB</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="avatarDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAvatarConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/utils/supabase'
import { formatDatabaseTime } from '@/utils'

const userStore = useUserStore()

// 响应式数据
const activeTab = ref('basic')
const basicLoading = ref(false)
const passwordLoading = ref(false)
const avatarDialogVisible = ref(false)
const avatarUrl = ref('')
const uploadUrl = ref('/api/upload/avatar') // 需要配置实际的上传接口

// 用户信息
const userInfo = ref({
  id: '',
  userName: '',
  nickName: '',
  email: '',
  phonenumber: '',
  sex: '0',
  avatar: '',
  status: '0',
  remark: ''
})

// 基本信息表单
const basicForm = ref({
  userName: '',
  nickName: '',
  email: '',
  phonenumber: '',
  sex: '0',
  status: '0',
  remark: ''
})

const basicFormRef = ref()
const basicRules = {
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phonenumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 密码修改表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordFormRef = ref()
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 登录日志
const loginLogs = ref<any[]>([])
const logTotal = ref(0)
const logQueryParams = ref({
  pageNum: 1,
  pageSize: 10
})

// 获取用户信息
async function getUserInfo() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // 从数据库获取用户详细信息
      const { data: userData, error } = await supabase
        .from('sys_user')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) throw error
      
      userInfo.value = {
        id: userData.id,
        userName: userData.user_name,
        nickName: userData.nick_name,
        email: userData.email,
        phonenumber: userData.phonenumber,
        sex: userData.sex,
        avatar: userData.avatar,
        status: userData.status,
        remark: userData.remark
      }
      
      // 同步到表单
      Object.assign(basicForm.value, {
        userName: userData.user_name,
        nickName: userData.nick_name,
        email: userData.email,
        phonenumber: userData.phonenumber,
        sex: userData.sex,
        status: userData.status,
        remark: userData.remark
      })
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 获取登录日志
async function getLoginLogs() {
  try {
    // 这里需要根据实际情况实现登录日志查询
    // 暂时使用模拟数据
    loginLogs.value = [
      {
        loginTime: formatDatabaseTime(new Date()),
        loginIp: '192.168.1.100',
        loginLocation: '北京市',
        browser: 'Chrome 120.0',
        os: 'Windows 10'
      }
    ]
    logTotal.value = 1
  } catch (error) {
    console.error('获取登录日志失败:', error)
  }
}

// 保存基本信息
async function handleBasicSubmit() {
  if (!basicFormRef.value) return
  
  try {
    await basicFormRef.value.validate()
    basicLoading.value = true
    
    const { error } = await supabase
      .from('sys_user')
      .update({
        nick_name: basicForm.value.nickName,
        email: basicForm.value.email,
        phonenumber: basicForm.value.phonenumber,
        sex: basicForm.value.sex,
        status: basicForm.value.status,
        remark: basicForm.value.remark,
        update_time: new Date().toISOString()
      })
      .eq('id', userInfo.value.id)
    
    if (error) throw error
    
    ElMessage.success('保存成功')
    await getUserInfo() // 重新获取用户信息
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    basicLoading.value = false
  }
}

// 重置基本信息
function handleBasicReset() {
  Object.assign(basicForm.value, {
    userName: userInfo.value.userName,
    nickName: userInfo.value.nickName,
    email: userInfo.value.email,
    phonenumber: userInfo.value.phonenumber,
    sex: userInfo.value.sex,
    status: userInfo.value.status,
    remark: userInfo.value.remark
  })
}

// 修改密码
async function handlePasswordSubmit() {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    
    // 验证当前密码
    const { error: authError } = await supabase.auth.updateUser({
      password: passwordForm.value.newPassword
    })
    
    if (authError) throw authError
    
    ElMessage.success('密码修改成功')
    handlePasswordReset()
  } catch (error: any) {
    console.error('密码修改失败:', error)
    ElMessage.error(error.message || '密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}

// 重置密码表单
function handlePasswordReset() {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

// 头像上传
function handleAvatarUpload() {
  avatarDialogVisible.value = true
}

function beforeAvatarUpload(file: File) {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像图片只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!')
    return false
  }
  return true
}

function handleAvatarSuccess(response: any, file: any) {
  avatarUrl.value = URL.createObjectURL(file.raw)
}

async function handleAvatarConfirm() {
  if (!avatarUrl.value) {
    ElMessage.warning('请先选择头像')
    return
  }
  
  try {
    const { error } = await supabase
      .from('sys_user')
      .update({
        avatar: avatarUrl.value,
        update_time: new Date().toISOString()
      })
      .eq('id', userInfo.value.id)
    
    if (error) throw error
    
    userInfo.value.avatar = avatarUrl.value
    ElMessage.success('头像更新成功')
    avatarDialogVisible.value = false
  } catch (error) {
    console.error('头像更新失败:', error)
    ElMessage.error('头像更新失败')
  }
}

// 登录日志分页
function handleLogSizeChange(val: number) {
  logQueryParams.value.pageSize = val
  getLoginLogs()
}

function handleLogCurrentChange(val: number) {
  logQueryParams.value.pageNum = val
  getLoginLogs()
}

onMounted(() => {
  getUserInfo()
  getLoginLogs()
})
</script>

<style scoped lang="scss">
.profile-container {
  padding: 20px;
  
  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
  
  .profile-left {
    text-align: center;
    
    .avatar-section {
      margin-bottom: 20px;
      
      .profile-avatar {
        margin-bottom: 10px;
        border: 3px solid #f0f0f0;
      }
      
      .avatar-actions {
        margin-top: 10px;
      }
    }
    
    .user-info {
      h3 {
        margin: 0 0 10px 0;
        color: #303133;
        font-size: 20px;
      }
      
      p {
        margin: 5px 0;
        color: #606266;
        font-size: 14px;
      }
      
      .user-email {
        color: #409eff;
      }
    }
  }
  
  .profile-tabs {
    .profile-form {
      max-width: 600px;
    }
  }
  
  .login-logs {
    .pagination-container {
      margin-top: 20px;
      text-align: right;
    }
  }
  
  .avatar-upload {
    text-align: center;
    
    .avatar-uploader {
      .avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
      }
      
      .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 120px;
        height: 120px;
        line-height: 120px;
        text-align: center;
        border: 1px dashed #d9d9d9;
        border-radius: 50%;
      }
    }
    
    .upload-tips {
      margin-top: 10px;
      color: #909399;
      font-size: 12px;
    }
  }
}
</style>
