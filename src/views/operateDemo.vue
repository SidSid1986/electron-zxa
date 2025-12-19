<template>
  <div class="device-container">
    <div class="device-title">操作演示</div>

    <!-- 外层容器：解决滚动条占位 + 边框 -->
    <div class="operate-outer">
      <div class="operate-wrapper">
        <!-- 可滚动内容区（核心拖拽滚动） -->
        <div
          class="operate-content"
          @mousedown="handleMouseDown"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
          @mousemove="handleMouseMove"
          :style="{
            cursor: isDragging ? 'grabbing' : 'grab',
            height: '71vh',
          }"
        >
          <div class="operate-line">
            <div
              class="operate-item"
              v-for="item in operateList"
              :key="item.id"
            >
              <DPlayerCom
                class="dplayer-item"
                :video="{
                  url: item.videoUrl,
                  pic: '',
                  thumbnails: '',
                }"
                theme="#9033e9"
                :autoplay="false"
                :loop="true"
                :screenshot="true"
                @play="handlePlay"
                @ended="handleEnded"
              />
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <el-button class="add-btn" type="primary" @click="backMain"
        >返回</el-button
      >
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import DPlayerCom from "@/components/DPlayerCom.vue";
import demoVideo from "@/assets/demo.mp4";

const router = useRouter();

// 修复重复ID问题，保证key唯一性
const operateList = ref([
  { id: 1, name: "更换滤芯", videoUrl: demoVideo },
  { id: 2, name: "更换钢管", videoUrl: demoVideo },
  { id: 3, name: "清理油桶", videoUrl: demoVideo },
  { id: 4, name: "更换滤芯", videoUrl: demoVideo },
  { id: 5, name: "更换钢管", videoUrl: demoVideo },
  { id: 6, name: "清理油桶", videoUrl: demoVideo },
  { id: 7, name: "更换滤芯", videoUrl: demoVideo },
  { id: 8, name: "更换钢管", videoUrl: demoVideo },
  { id: 9, name: "清理油桶", videoUrl: demoVideo },
  { id: 1, name: "更换滤芯", videoUrl: demoVideo },
  { id: 2, name: "更换钢管", videoUrl: demoVideo },
  { id: 3, name: "清理油桶", videoUrl: demoVideo },
  { id: 4, name: "更换滤芯", videoUrl: demoVideo },
  { id: 5, name: "更换钢管", videoUrl: demoVideo },
  { id: 6, name: "清理油桶", videoUrl: demoVideo },
  { id: 7, name: "更换滤芯", videoUrl: demoVideo },
  { id: 8, name: "更换钢管", videoUrl: demoVideo },
  { id: 9, name: "清理油桶", videoUrl: demoVideo },
]);

// 视频事件处理
const handlePlay = () => console.log("视频开始播放");
const handleEnded = () => console.log("视频播放结束");
const backMain = () => router.push("/main");

// 拖拽滚动核心变量
const isDragging = ref(false); // 是否正在拖拽
const startY = ref(0); // 鼠标按下时的Y坐标
const startScrollTop = ref(0); // 按下时的滚动位置

// 鼠标按下（开始拖拽）
const handleMouseDown = (e) => {
  const container = e.currentTarget;
  // 内容未超出容器时不触发拖拽
  if (container.scrollHeight <= container.clientHeight) return;

  isDragging.value = true;
  startY.value = e.clientY; // 记录鼠标按下位置
  startScrollTop.value = container.scrollTop; // 记录当前滚动位置
  e.preventDefault(); // 阻止选中文本等默认行为
};

// 鼠标松开/离开（结束拖拽）
const handleMouseUp = () => {
  isDragging.value = false;
};

// 鼠标移动（处理拖拽滚动）
const handleMouseMove = (e) => {
  if (!isDragging.value) return;

  const container = e.currentTarget;
  const moveY = e.clientY - startY.value; // 计算鼠标移动距离
  // 反向滚动：鼠标向下拖 → 内容向上滚，鼠标向上拖 → 内容向下滚
  container.scrollTop = startScrollTop.value - moveY;
};

// 生命周期：全局监听鼠标松开（防止移出容器后无法结束拖拽）
onMounted(() => {
  document.addEventListener("mouseup", handleMouseUp);
});

onUnmounted(() => {
  // 移除全局监听，避免内存泄漏
  document.removeEventListener("mouseup", handleMouseUp);
});
</script>

<style scoped lang="scss">
.device-container {
  width: 100%;
  height: 100vh;
  background-color: #e0ddec;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.device-title {
  font-size: 36px;
  font-weight: bold;
  color: #4d1166;
  height: 8vh;
  line-height: 8vh;
  margin-top: 4vh;
  text-align: center;
}

// 外层容器：解决滚动条占位问题
.operate-outer {
  width: 80%;

  height: 71vh;
  margin-bottom: 3vh;
  overflow: hidden; // 隐藏内部滚动条占位
  box-sizing: border-box;
}

// 滚动包装器
.operate-wrapper {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

// 核心滚动容器
.operate-content {
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
  user-select: none;
  cursor: grab;

  // 完全隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  // 拖拽时的光标样式
  &:active {
    cursor: grabbing;
  }

  .operate-line {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    padding: 10px;

    flex-wrap: wrap;
    min-height: 100%;
    // border: 1px solid red;

    .operate-item {
      height: 35vh;
      width: calc(30%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;

      span {
        font-size: 24px;
        font-weight: bold;
        color: #4d1166;
        margin-top: 1vh;
      }
    }

    .dplayer-item {
      height: 28vh !important;
      width: 100%;
      margin-bottom: 0.5vh;
    }
  }
}

// 按钮样式
:deep(.add-btn) {
  width: 80px;
  height: 50px;
  font-size: 24px;
  border-radius: 12px;
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
