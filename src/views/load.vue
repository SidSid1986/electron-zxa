<template>
  <div class="container">
    <div>test</div>

    <div class="memory-info">
      内存使用: {{ memoryUsage.used }}MB / {{ memoryUsage.total }}GB
    </div>
    <div>test</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// 初始化内存数据
const memoryUsage = ref({ used: "0", total: "0" });
let removeMemoryListener = null;

onMounted(() => {
  if (window.electronAPI) {
    removeMemoryListener = window.electronAPI.onMemoryUsage((data) => {
      if (data && typeof data === "object") {
        memoryUsage.value = {
          used: data.used || "0",
          total: data.total || "0",
        };
      }
    });
  }
});

onUnmounted(() => {
  if (removeMemoryListener) removeMemoryListener();
});
</script>

<style scoped lang="scss">
.container {
  display: flex;
  width: 100%;
  height: 100vh;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  font-size: 40px;
  color: red;
  .memory-info {
    font-size: 40px;
    color: red;
  }
}
</style>
