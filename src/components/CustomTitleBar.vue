<!-- components/CustomTitleBar.vue -->
<template>
  <div class="custom-title-bar" :class="{ hidden: isFullScreen }">
    <!-- 图标和标题 -->
    <div class="title-section">
      <img src="/home.png" alt="图标" class="window-icon" />
      <!-- <span class="window-title">紫小艾 - {{ memoryUsage.used }}MB</span> -->
      <span class="window-title">紫小艾</span>
    </div>

    <!-- 窗口控制按钮 -->
    <div class="window-controls">
      <button @click="minimizeWindow" class="control-btn minimize">
        <i class="iconfont icon-chuangkouzuixiaohua"></i>
      </button>
      <button @click="maximizeWindow" class="control-btn maximize">
        <i class="iconfont icon-chuangkouzuidahua"></i>
      </button>
      <button @click="closeWindow" class="control-btn close">
        <i class="iconfont icon-delete_line"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const memoryUsage = ref({ used: "0", total: "0" });
const isFullScreen = ref(false);

// 存储监听移除函数
let removeMemoryListener = null;
let removeFullscreenListener = null;

// 窗口控制方法
const minimizeWindow = () => {
  window.electronAPI?.minimizeWindow();
};

const maximizeWindow = () => {
  window.electronAPI?.maximizeWindow();
};

const closeWindow = () => {
  window.electronAPI?.closeWindow();
};

onMounted(() => {
  if (window.electronAPI) {
    // 监听内存使用（添加空值保护）
    removeMemoryListener = window.electronAPI.onMemoryUsage((data) => {
      if (data && typeof data === "object") {
        memoryUsage.value = {
          used: data.used || "0",
          total: data.total || "0",
        };
      }
    });

    // 监听全屏状态（添加空值保护）
    removeFullscreenListener = window.electronAPI.onFullScreenStatus((data) => {
      isFullScreen.value = data?.isFullScreen || false;
    });
  }
});

onUnmounted(() => {
  // 正确移除监听
  if (removeMemoryListener) removeMemoryListener();
  if (removeFullscreenListener) removeFullscreenListener();
});
</script>

<style scoped lang="scss">
.custom-title-bar {
  height: 4vh;
  background-color: #c293d5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  -webkit-app-region: drag;
  // position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  user-select: none;
  transition: opacity 0.3s, transform 0.3s;
  box-sizing: border-box;
}

/* 全屏时隐藏标题栏 */
.custom-title-bar.hidden {
  opacity: 0;
  transform: translateY(-100%);
  pointer-events: none; /* 防止隐藏后仍可点击 */
}

.title-section {
  display: flex;
  align-items: center;

  img {
    width: 40px;
    height: 40px;
    margin-right: 10px;
  }
}

.window-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.window-title {
  font-size: 24px;
  font-weight: 500;
}

.window-controls {
  display: flex;

  -webkit-app-region: no-drag;
}

.control-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  color: white;
  background-color: #c293d5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background-color 0.2s;
  margin-left: 20px;
  i {
    font-size: 24px;
  }
}

.control-btn:hover {
  background-color: #555;
}

.control-btn.close:hover {
  background-color: #ff3b30;
}

:global(body) {
  overflow: hidden;
}

:global(html) {
  overflow: hidden;
  height: 100%;
}

:global(#app) {
  height: 100%;
  overflow: hidden;
}
</style>
