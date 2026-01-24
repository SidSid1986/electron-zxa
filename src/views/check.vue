<!--
 * @Author: Sid Li
 * @Date: 2025-12-01 08:40:17
 * @LastEditors: Sid Li
 * @LastEditTime: 2026-01-24 14:40:35
 * @FilePath: \ZiXiaoAi-build\src\views\check.vue
 * @Description: 自检页面（背景旋转，文字静止）
-->
<template>
  <div class="container">
    <div class="home-content">
      <!-- 旋转的背景容器 -->
      <div class="rotate-bg" :class="{ rotating: isRotating }"></div>
      <!-- 静止的文字内容 -->
      <div class="text-content">
        <div class="check-title">等待自检</div>
        <div class="check-progress">{{ progress }}%</div>
        <div class="check-status">{{ statusText }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router"; // 路由跳转

import { initRobot } from "@/api/common.js";
import { ElMessageBox } from "element-plus";

const router = useRouter();

// 旋转状态控制
const isRotating = ref(false);
// 自检进度
const progress = ref(0);
// 状态文本
const statusText = ref("准备开始...");
// 进度更新间隔（毫秒）
const progressInterval = 100;
// 进度定时器（用于随时停止/重启）
let progressTimer = null;
// 是否已触发初始化接口（避免重复调用）
let isInitCalled = false;

// ========== 核心修改：显式定义总时长常量 ==========
// 自检总时长（毫秒）- 明确标注5000ms的总时长
const TOTAL_CHECK_DURATION = 5000;
// 接口调用前的进度占比（85%）
const PROGRESS_BEFORE_API = 85;
// 接口调用前的时长（4250ms = 5000ms * 85%）
const DURATION_BEFORE_API = TOTAL_CHECK_DURATION * (PROGRESS_BEFORE_API / 100);
// 接口调用后的时长（750ms = 5000ms * 15%）
const DURATION_AFTER_API = TOTAL_CHECK_DURATION - DURATION_BEFORE_API;

/**
 * 调用机器人初始化接口
 */
const initRobotFunc = async () => {
  try {
    statusText.value = "验证机器人状态...";
    const res = await initRobot();

    // 检查机器人状态码 0 正常
    if (res.code === 0) {
      console.log("机器人初始化成功");
      return true;
    } else {
      console.error("机器人初始化失败，code:", res.code);
      return false;
    }
  } catch (error) {
    console.error("机器人初始化接口调用异常:", error);
    return false;
  }
};

/**
 * 开始自检流程
 */
const startSelfCheck = () => {
  isRotating.value = true; // 开始旋转
  // ========== 核心修改：基于常量计算步长 ==========
  // 接口调用前的进度步长（4250ms内到85%）
  const stepBeforeApi = PROGRESS_BEFORE_API / (DURATION_BEFORE_API / progressInterval);

  // 启动进度定时器
  progressTimer = setInterval(async () => {
    // 1. 进度未到85%：正常推进
    if (progress.value < PROGRESS_BEFORE_API) {
      // 最后一步精准停在85%，避免超进度
      if (progress.value + stepBeforeApi >= PROGRESS_BEFORE_API) {
        progress.value = PROGRESS_BEFORE_API;
      } else {
        progress.value += stepBeforeApi;
      }

      // 更新状态文本
      if (progress.value < 30) {
        statusText.value = "初始化系统...";
      } else if (progress.value < 60) {
        statusText.value = "检测硬件设备...";
      } else if (progress.value < PROGRESS_BEFORE_API) {
        statusText.value = "验证网络连接...";
      }
    }

    // 2. 进度精准到85%且未调用过初始化接口：暂停进度，执行接口
    if (progress.value === PROGRESS_BEFORE_API && !isInitCalled) {
      isInitCalled = true; // 标记已调用，避免重复执行
      clearInterval(progressTimer); // 暂停进度更新

      // 调用初始化接口
      const initSuccess = await initRobotFunc();
      if (initSuccess) {
        // 2.1 接口成功：重启定时器，从85%推进到100%
        statusText.value = "验证通过，完成自检...";
        // ========== 核心修改：基于常量计算剩余步长 ==========
        // 接口调用后的进度步长（750ms内到100%）
        const stepAfterApi = (100 - PROGRESS_BEFORE_API) / (DURATION_AFTER_API / progressInterval);
        
        progressTimer = setInterval(() => {
          if (progress.value < 100) {
            // 最后一步精准到100%
            if (progress.value + stepAfterApi >= 100) {
              progress.value = 100;
            } else {
              progress.value += stepAfterApi;
            }
            statusText.value = "自检完成，准备跳转...";
          } else {
            // 进度到100%，停止定时器并跳转
            clearInterval(progressTimer);
            finishCheck();
          }
        }, progressInterval);
      } else {
        // 2.2 接口失败：永久停在85%，停止旋转，更新状态
        isRotating.value = false;
        statusText.value = "机器人初始化异常";
        // 弹窗逻辑预留位置
        ElMessageBox.alert(
          "机器人<i style='color: #ff4949;'>初始化异常</i>，无法进入系统，请<i style='color: #ff4949;'>人工检查</i>后重新连接设备",
          "<i class='el-icon-error' style='color: #ff4949; margin-right: 8px;'></i>异常", // 补充你之前要的图标
          {
            confirmButtonText: "确认",
            type: "warning",
            showClose: false,
            customClass: "check-message-box",
            callback: () => {
              router.push("/home");
            },
            dangerouslyUseHTMLString: true,
          }
        );
      }
    }
  }, progressInterval);
};

/**
 * 自检完成处理
 */
const finishCheck = () => {
  setTimeout(() => {
    isRotating.value = false;
    router.push("/main"); // 能走到这里说明初始化已成功，直接跳转
  }, 1000);
};

onMounted(() => {
  console.log("组件挂载了");
  startSelfCheck(); // 组件挂载后开始自检
});
</script>

<style scoped lang="scss">
.container {
  // height: 96vh;
  height: 100vh;
  box-sizing: border-box;
  background: url("@/assets/pic/bg01.jpg") no-repeat;
  background-position: center center;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 4vh;

  .home-content {
    width: 30vw;
    height: 30vw;
    // border: 1px solid red;
    position: relative; // 作为定位容器
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    // 旋转的背景图片容器
    .rotate-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url("@/assets/pic/round.png") no-repeat;
      background-position: center center;
      background-size: 100% 100%;
      z-index: 0; // 背景层级
    }

    // 静止的文字内容容器
    .text-content {
      position: relative;
      z-index: 1; // 文字层级高于背景
      text-align: center;
    }

    .check-title {
      font-size: 50px;
      font-weight: bold;
      color: #56236d;
      margin-bottom: 30px;
    }

    .check-progress {
      font-size: 40px;
      font-weight: 600;
      color: #7b3fb4;
      margin-bottom: 15px;
    }

    .check-status {
      font-size: 18px;
      color: #9a67c8;
      opacity: 0.9;
    }

    // 旋转动画类（只作用于背景）
    .rotating {
      animation: rotate 3s linear infinite;
    }
  }
}

// 旋转动画定义
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式调整
@media (max-width: 768px) {
  .container {
    .home-content {
      width: 30vw;
      height: 30vw;

      .check-title {
        font-size: 36px;
      }

      .check-progress {
        font-size: 30px;
      }
    }
  }
}
</style>

<style lang="scss">
.check-message-box {
  max-width: 500px !important;
  .el-message-box__message {
    font-size: 20px !important;
  }
}
</style>