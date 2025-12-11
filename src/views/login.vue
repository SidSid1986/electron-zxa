<template>
  <div class="login-container">
    <div class="login-container__title">
      <img src="@/assets/pic/logo.png" alt="logo" />
    </div>
    <div class="login-content">
      <div class="login-content-left">
        <div class="left-pic">
          <img src="@/assets/pic/device.png" alt="" />
        </div>
      </div>
      <div class="login-content-right">
        <div class="right-pic">
          <div class="right-pic-title">欢迎来到紫小艾平台</div>
          <!-- 账号密码 -->
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            label-width="0px"
          >
            <!-- 用户名输入 -->
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入绑定账号"
                class="login-input"
                size="large"
              >
                <template #prefix>
                  <i class="iconfont icon-yonghu"></i>
                </template>
              </el-input>
            </el-form-item>

            <!-- 密码输入 -->
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                class="login-input"
                size="large"
              >
                <template #prefix>
                  <i class="iconfont icon-lock"></i>
                </template>
              </el-input>
            </el-form-item>

            <!-- 按钮组 -->
            <div class="login-btn-group">
              <el-button
                type="primary"
                class="return-btn"
                @click="handleReturn"
              >
                返回
              </el-button>
              <el-button type="primary" class="login-btn" @click="handleLogin">
                登录
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";

// 1. 定义表单数据
const loginForm = ref({
  username: "", // 用户名
  password: "", // 密码
});

// 2. 定义表单验证规则
const loginRules = ref({
  // 用户名：必填
  username: [
    { required: true, message: "请输入绑定账号", trigger: "blur" },
    { min: 1, max: 20, message: "账号长度不能超过20个字符", trigger: "blur" },
  ],
  // 密码：必填 + 仅允许字母/数字
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9]+$/,
      message: "密码仅允许输入字母和数字",
      trigger: "blur",
    },
    { min: 6, max: 20, message: "密码长度需在6-20个字符之间", trigger: "blur" },
  ],
});

// 3. 表单引用（用于验证）
const loginFormRef = ref(null);

// 4. 返回按钮逻辑
const handleReturn = () => {
  // 可根据需求跳转页面，示例：router.back() 或 router.push('/')
  ElMessage.info("点击了返回按钮");
};

// 5. 登录按钮逻辑（含表单验证）
const handleLogin = async () => {
  // 先执行表单验证
  try {
    await loginFormRef.value.validate();
    // 验证通过：执行登录逻辑（示例，需替换为真实接口请求）
    console.log("表单验证通过，登录数据：", loginForm.value);
    // 模拟接口请求
    // const res = await api.login(loginForm.value)
    // if (res.code === 200) {
    //   ElMessage.success('登录成功')
    //   // 跳转首页等操作
    // } else {
    //   ElMessage.error(res.message || '登录失败')
    // }
    ElMessage.success("登录验证通过，即将跳转");
  } catch (error) {
    // 验证失败：Element Plus 会自动显示错误提示，无需额外处理
    console.log("表单验证失败：", error);
    ElMessage.error("请检查账号或密码格式");
  }
};
</script>

<style scoped lang="scss">
.login-container {
  box-sizing: border-box;
  background: url("@/assets/pic/backgroundImage.png") no-repeat;
  background-position: center center;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  padding-top: 4vh;
}

.login-container__title {
  width: 100%;
  height: 10vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding-left: 8vw;
}

.login-content {
  width: 100%;
  height: 86vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  .login-content-left {
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    margin-bottom: 20vh;

    .left-pic {
      width: 60%;
      height: 60%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;

      img {
        max-width: 100%;
        max-height: 100%;

        object-fit: contain;
      }
    }
  }

  .login-content-right {
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    margin-bottom: 20vh;

    .right-pic {
      box-sizing: border-box;
      background-color: #e0dde9;
      border-radius: 20px;
      // border: 1px solid #ffffff;
      box-shadow: 0px 6px 16px 2px rgba(0, 0, 0, 0.18);
      padding: 60px 100px;
      width: 50%;
      height: 60%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .right-pic-title {
        font-size: 36px;
        font-weight: bold;
        color: #511d6a;
        margin-bottom: 50px;
      }
    }
  }
}

// 登录表单样式
.login-form {
  margin-top: 20px;
  padding: 0 10px;
  width: 100%;
}

.login-input {
  --el-input-border-radius: 40px;
  --el-input-text-color: #511d6a;
  --el-input-placeholder-color: #9262a8;
  --el-input-border-color: #c1a6d5;
  --el-input-hover-border-color: #722a8f;
  --el-input-focus-border-color: #511d6a;
  --el-input-bg-color: #f9f5fc;
  margin-bottom: 40px;
  width: 100%;
  height: 60px;
  line-height: 60px;
  font-size: 20px;
  i{
    font-size: 24px;
    color: #9262a8;
    margin-right: 10px;
  }
}

// 错误提示文字样式
:deep(.el-form-item__error) {
  color: red;
  margin-top: -35px;
  padding-left: 10px;
  font-size: 16px;
}

/* 去除el-form-item的默认底边距 */
:deep(.el-form-item) {
  margin-bottom: 0;
  width: 100%;
}

.login-btn-group {
  margin-top: 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

:deep(.return-btn) {
  width: 150px;
  min-width: 120px;
  height: 50px;
  font-size: 24px;
  font-weight: bold;
  border-radius: 20px;
  line-height: 50px;
  --el-button-text-color: #fff;
  --el-button-bg-color: #af7dc4;
  --el-button-border-color: #af7dc4;
  --el-button-hover-text-color: #fff;
  --el-button-hover-bg-color: #9a6cb8;
  --el-button-hover-border-color: #9a6cb8;
  --el-button-active-text-color: #fff;
  --el-button-active-bg-color: #8a5ca0;
  --el-button-active-border-color: #8a5ca0;
}
:deep(.login-btn) {
  width: 150px;
  min-width: 120px;
  height: 50px;
  font-size: 24px;
  font-weight: bold;
  border-radius: 20px;
  line-height: 50px;
  --el-button-text-color: #fff;
  --el-button-bg-color: #af7dc4;
  --el-button-border-color: #af7dc4;
  --el-button-hover-text-color: #fff;
  --el-button-hover-bg-color: #9a6cb8;
  --el-button-hover-border-color: #9a6cb8;
  --el-button-active-text-color: #fff;
  --el-button-active-bg-color: #8a5ca0;
  --el-button-active-border-color: #8a5ca0;
}
</style>
