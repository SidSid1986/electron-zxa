<!--
 * @Author: Sid Li
 * @Date: 2025-12-01 08:40:17
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-03 17:13:32
 * @FilePath: \ai\src\views\check.vue
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

const router = useRouter();

// 旋转状态控制
const isRotating = ref(false);
// 自检进度
const progress = ref(0);
// 状态文本
const statusText = ref("准备开始...");
// 自检总时长（毫秒）
const totalCheckTime = 5000;
// 进度更新间隔（毫秒）
const progressInterval = 100;

onMounted(() => {
  console.log("组件挂载了");
  startSelfCheck(); // 组件挂载后开始自检
});

/**
 * 开始自检流程
 */
const startSelfCheck = () => {
  isRotating.value = true; // 开始旋转
  const step = 200 / (totalCheckTime / progressInterval); // 每步进度增量

  // 模拟进度更新
  const progressTimer = setInterval(() => {
    progress.value += step;

    // 更新状态文本
    if (progress.value < 30) {
      statusText.value = "初始化系统...";
    } else if (progress.value < 60) {
      statusText.value = "检测硬件设备...";
    } else if (progress.value < 90) {
      statusText.value = "验证网络连接...";
    } else {
      statusText.value = "自检完成，准备跳转...";
    }

    // 进度满了之后停止旋转并跳转
    if (progress.value >= 100) {
      progress.value = 100;
      clearInterval(progressTimer);
      finishCheck();
    }
  }, progressInterval);
};

/**
 * 自检完成处理
 */
const finishCheck = () => {
  // 延迟1秒跳转（让用户看到完成状态）
  setTimeout(() => {
    isRotating.value = false; // 停止旋转
    // 跳转到目标页面（请替换为你的实际路由路径）
    router.push("/main");
    // 如果需要替换历史记录，使用：router.replace("/dashboard")
  }, 1000);
};
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

  .home-content {
    width: 500px;
    height: 500px;
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

// 响应式调整（可选）
@media (max-width: 768px) {
  .container {
    .home-content {
      width: 80vw;
      height: 80vw;

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
