<!--
 * @Author: Sid Li
 * @Date: 2025-12-19 15:36:43
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-19 15:36:48
 * @FilePath: \zi-xiao-ai\src\components\DragScrollWrapper.vue
 * @Description: 可拖拽滚动容器组件
-->

<template>
  <div
    class="drag-scroll-wrapper"
    @mousedown="handleDragStart"
    @mousemove="handleDragMove"
    @mouseup="handleDragEnd"
    @mouseleave="handleDragEnd"
  >
    <!-- 占位容器：承载插槽内容 -->
    <div ref="placeholderRef" class="placeholder-container">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

const placeholderRef = ref(null);
const isDragging = ref(false);
let startY = 0;
let startScrollTop = 0;
let scrollContainer = null; // 真正的滚动容器

// 适配 Element UI：自动查找 .el-scrollbar__wrap
const findScrollContainer = () => {
  if (!placeholderRef.value) return null;
  // 优先找 Element UI 内置滚动容器
  const elScrollWrap = placeholderRef.value.querySelector(".el-scrollbar__wrap");
  if (elScrollWrap) return elScrollWrap;
  // 兼容普通滚动容器
  return placeholderRef.value.querySelector(".scroll-container") || placeholderRef.value;
};

// 开始拖拽
const handleDragStart = (e) => {
  if (e.target.closest("button, input, .el-checkbox, .el-tag")) return;

  scrollContainer = findScrollContainer();
  if (!scrollContainer) return;

  isDragging.value = true;
  startY = e.clientY;
  startScrollTop = scrollContainer.scrollTop;
  e.preventDefault();
};

// 拖拽中
const handleDragMove = (e) => {
  if (!isDragging.value || !scrollContainer) return;
  const moveY = e.clientY - startY;
  scrollContainer.scrollTop = startScrollTop - moveY;
};

// 结束拖拽
const handleDragEnd = () => {
  isDragging.value = false;
};

// 监听插槽内容变化，重新查找滚动容器
onMounted(() => {
  setTimeout(() => {
    scrollContainer = findScrollContainer();
  }, 300); // 适配 Element UI 渲染延迟
});
</script>

<style scoped>
.drag-scroll-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  user-select: none;
  cursor: grab;
}

.drag-scroll-wrapper:active {
  cursor: grabbing;
}

.placeholder-container {
  width: 100%;
  height: 100%;
}
</style>
