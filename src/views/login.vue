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
            @focus="handleFormFocus"
          >
            <!-- 用户名输入 -->
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入绑定账号"
                class="login-input"
                size="large"
                @focus="() => openKeyboard('username')"
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
                show-password
                @focus="() => openKeyboard('password')"
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
                :disabled="isLoginLoading"
              >
                返回
              </el-button>
              <el-button
                type="primary"
                class="login-btn"
                @click="handleLogin"
                :loading="isLoginLoading"
                :disabled="isLoginLoading"
              >
                登录
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 引入虚拟键盘组件 -->
    <Keyboard
      v-model="keyboardValue"
      :visible="keyboardVisible"
      :layout-type="keyboardLayout"
      @close="keyboardVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import loginData from "@/data/loginData.json";
// 引入键盘组件
import Keyboard from "@/components/Keyboard.vue";

const router = useRouter();

const loginForm = ref({
  username: "",
  password: "",
});

const isLoginLoading = ref(false);

// 虚拟键盘状态
const keyboardVisible = ref(false);
const keyboardValue = ref("");
const keyboardLayout = ref("default");
let currentInputField = ref("");

const loginRules = ref({
  username: [
    { required: true, message: "请输入绑定账号", trigger: ["blur", "change"] },
    {
      min: 1,
      max: 20,
      message: "账号长度不能超过20个字符",
      trigger: ["blur", "change"],
    },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: ["blur", "change"] },
    {
      pattern: /^[a-zA-Z0-9]+$/,
      message: "密码仅允许输入字母和数字",
      trigger: ["blur", "change"],
    },
    {
      min: 6,
      max: 20,
      message: "密码长度需在6-20个字符之间",
      trigger: ["blur", "change"],
    },
  ],
});

const loginFormRef = ref(null);

const handleFormFocus = (e) => {
  const form = loginFormRef.value;
  if (!form) return;
  Object.keys(loginForm.value).forEach((prop) => {
    if (prop === (e.target.dataset.prop || "")) return;
    form.validateField(prop);
  });
};

// 打开键盘
const openKeyboard = (field) => {
  currentInputField.value = field;
  keyboardValue.value = loginForm.value[field];
  keyboardLayout.value = "default"; // 账号/密码都用默认布局
  keyboardVisible.value = true;
};

// 同步键盘值到表单
watch(
  () => keyboardValue.value,
  (val) => {
    if (currentInputField.value) {
      loginForm.value[currentInputField.value] = val;
    }
  }
);

// 返回按钮逻辑：直接跳回main页（保留当前用户）
const handleReturn = () => {
  router.push("/main");
};

// 登录逻辑：替换用户信息 + 刷新main页
const handleLogin = async () => {
  try {
    await loginFormRef.value.validate();
  } catch (error) {
    ElMessage.error("请检查账号或密码格式");
    return;
  }

  isLoginLoading.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const matchUser = loginData.find((item) => {
      return (
        item.username === loginForm.value.username &&
        item.password === loginForm.value.password
      );
    });

    if (matchUser) {
      // 替换本地存储的用户信息（新用户）
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          nickName: matchUser.nickName,
          username: matchUser.username,
          role: matchUser.role,
        })
      );
      ElMessage.success(`登录成功，欢迎 ${matchUser.nickName}！`);
      // 跳转到main页（触发页面刷新，显示新用户）
      router.push("/main");
    } else {
      ElMessage.error("账号或密码错误，请重新输入");
    }
  } catch (error) {
    ElMessage.error("登录出错，请稍后重试");
    console.error("登录异常：", error);
  } finally {
    isLoginLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
// 你的原有样式完全保留（此处省略，和你原代码一致）
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
    width: 50vh;
    height: 50vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 20vh;

    .left-pic {
      width: 100%;
      height: 100%;
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
    width: 50vh;
    height: 50vh;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    margin-bottom: 20vh;

    .right-pic {
      box-sizing: border-box;
      background-color: #e0dde9;
      border-radius: 20px;

      box-shadow: 0px 6px 16px 2px rgba(0, 0, 0, 0.18);
      padding: 60px 100px;
      width: 100%;
      height: 100%;
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
  i {
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
