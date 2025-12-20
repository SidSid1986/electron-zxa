<template>
  <div class="device-container">
    <div class="device-title">操作演示</div>

    <div class="operate-outer">
      <DragScrollWrapper>
        <div class="operate-content scroll-container">
          <div class="operate-line">
            <div class="operate-item" v-for="item in operateList" :key="item.id">
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
      </DragScrollWrapper>
    </div>

    <div>
      <el-button class="add-btn" type="primary" @click="backMain">返回</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import DPlayerCom from "@/components/DPlayerCom.vue";
import DragScrollWrapper from "@/components/DragScrollWrapper.vue"; // 引入通用拖拽组件
import demoVideo from "@/assets/demo.mp4";

const router = useRouter();

// 操作列表
const operateList = ref([
  { id: 1, name: "更换滤芯", videoUrl: demoVideo },
  { id: 2, name: "更换钢管", videoUrl: demoVideo },
  { id: 3, name: "清理油桶", videoUrl: demoVideo },
]);

// 视频事件处理
const handlePlay = () => console.log("视频开始播放");
const handleEnded = () => console.log("视频播放结束");
const backMain = () => router.push("/main");
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

.operate-outer {
  width: 80%;
  height: 71vh;
  margin-bottom: 3vh;
  overflow: hidden;
  box-sizing: border-box;
}

// 滚动容器
.operate-content {
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  height: 71vh; // 固定高度
  box-sizing: border-box;
  user-select: none;

  // 完全隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  .operate-line {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    padding: 10px;
    flex-wrap: wrap;
    min-height: 100%;

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
      cursor: default; // 播放器区域光标正常
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

// 播放器区域光标修正
:deep(.dplayer-container) {
  cursor: default !important;
}
</style>
