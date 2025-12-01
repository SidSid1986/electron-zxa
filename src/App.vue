<!--
 * @Author: Sid Li
 * @Date: 2025-11-29 10:30:03
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-01 16:04:56
 * @FilePath: \ai\src\App.vue
 * @Description: 
-->
<!-- App.vue -->
<template>
  <div id="app">
    <!-- 自定义标题栏 -->
    <CustomTitleBar />

    <!-- 主内容区域（需要留出标题栏高度） -->
    <div class="main-content" :class="{ fullscreen: isFullScreen }">
      <!-- 你的应用内容 -->
      <router-view />
    </div>
  </div>
</template>

<script setup>
import CustomTitleBar from "./components/CustomTitleBar.vue";
import { ref, onMounted, onUnmounted } from "vue";

// 监听全屏状态，优化内容显示
const isFullScreen = ref(false);
let removeFullscreenListener = null;

onMounted(() => {
  if (window.electronAPI) {
    // 只监听全屏状态（App.vue不需要内存数据）
    removeFullscreenListener = window.electronAPI.onFullScreenStatus((data) => {
      isFullScreen.value = data?.isFullScreen || false;
    });
  }
});

onUnmounted(() => {
  if (removeFullscreenListener) removeFullscreenListener();
});
</script>

<style>
/* 原有样式 */
.main-content {
  height: 96vh;
  box-sizing: border-box;
  /* transition: all 0.3s ease; */
  /* overflow: hidden ; */
  /* background: blue; */
}

.main-content.fullscreen {
  min-height: 100vh;
}

/* 全局样式，确保没有滚动条 */
html,
body,
#app {
  margin: 0;
  padding: 0;
  overflow: hidden !important; /* 强制隐藏滚动条 */
}
</style>
