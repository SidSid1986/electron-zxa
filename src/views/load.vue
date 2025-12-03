<template>
  <div class="container">
    <div class="loading-wrapper">
      <!-- 背景和图片 -->
      <div class="loading-bg">
        <img src="@/assets/pic/device.png" alt="device" />
      </div>

      <!-- 进度环（进一步放大） -->
      <svg class="progress-ring" viewBox="0 0 500 500">
        <!-- 进度圆环 -->
        <circle
          cx="250"
          cy="250"
          r="240"
          stroke="#c293d5"
          stroke-width="8"
          fill="none"
          stroke-linecap="round"
          class="progress-circle"
          :style="{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }"
        />
      </svg>
    </div>
    <div class="load-title">紫小艾</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 圆的周长 = 2 * π * r（半径增大到240）
const radius = 240;
const circumference = 2 * Math.PI * radius;

// 进度值（0-100）
const progress = ref(0);

// 计算 stroke-dashoffset 值
const strokeDashoffset = computed(() => {
  return circumference * (1 - progress.value / 100);
});

// 模拟加载进度
onMounted(() => {
  const timer = setInterval(() => {
    progress.value += 1;

    // 加载完成，跳转到目标页面
    if (progress.value >= 100) {
      clearInterval(timer);
      // 替换为你的目标路由
      router.push("/home");
    }
  }, 30); // 调整速度，总时长约3秒
});
</script>

<style scoped lang="scss">
.container {
  display: flex;
  width: 100%;
  // height: 96vh;
  height: 100vh;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;

  .loading-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    .loading-bg {
      width: 400px;
      height: 400px;
      background: url("@/assets/pic/backgroundImage.png");
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: relative;
      z-index: 2;

      img {
        width: 300px;
        height: 300px;
      }
    }

    .progress-ring {
      position: absolute;
      width: 450px; /* 圆环width */
      height: 450px; /* 圆环height*/
      transform: rotate(-90deg); /* 让进度从顶部开始 */
      z-index: 1; /* 确保圆环在背景图片下方 */
    }

    .progress-circle {
      transition: stroke-dashoffset 0.05s linear;
    }
  }

  .load-title {
    margin-top: 3vh;
    font-size: 24px;
    color: #c293d5;
  }
}
</style>
