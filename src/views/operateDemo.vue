<!--
 * @Author: Sid Li
 * @Date: 2025-12-12 16:15:42
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-17 15:01:00
 * @FilePath: \zi-xiao-ai\src\views\operateDemo.vue
 * @Description: 
-->

<template>
  <div class="device-container">
    <div class="device-title">操作演示</div>

    <div class="operate-content">
      <div class="operate-line">
        <div class="operate-item" v-for="item in operateList" :key="item.id">
          <DPlayerCom
            class="dplayer-item"
            :video="{
              url: item.videoUrl, // 用script中解析好的路径
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
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import DPlayerCom from "@/components/DPlayerCom.vue";
// 直接导入本地视频文件（Vite 会自动解析路径）
import demoVideo from "@/assets/demo.mp4";

const router = useRouter();

const operateList = ref([
  {
    id: 1,
    name: "更换滤芯",
    videoUrl: demoVideo, // 列表中也用导入的路径
  },
  {
    id: 2,
    name: "更换钢管",
    videoUrl: demoVideo,
  },
  {
    id: 3,
    name: "清理油桶",
    videoUrl: demoVideo,
  },
]);

// 修复2：定义缺失的事件方法
const handlePlay = () => {
  console.log("视频开始播放");
};

const handleEnded = () => {
  console.log("视频播放结束");
};

const backMain = () => {
  router.push("/main");
};

onMounted(() => {
  console.log("组件挂载了");
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

.operate-content {
  width: 80%;
  height: 80vh;

  .operate-line {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 10px;

    height: 40vh;

    .operate-item {
      height: 35vh;
      width: 25vw;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;

      span {
        font-size: 24px;
        font-weight: bold;
        color: #4d1166;
      }
    }

    .dplayer-item {
      height: 28vh !important;
      width: 25vw;
      margin-bottom: 1vh;
    }
  }
}
.dplayer-item {
  height: 50vh !important;
  width: 25vw;
  margin-bottom: 1vh;
}
</style>
