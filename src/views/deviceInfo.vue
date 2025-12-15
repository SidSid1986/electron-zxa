<!--
 * @Author: Sid Li
 * @Date: 2025-12-12 16:15:42
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-15 16:17:29
 * @FilePath: \zi-xiao-ai\src\views\deviceInfo.vue
 * @Description: 
-->

<template>
  <div class="device-container">
    <div class="device-title">设备信息</div>
    <div class="device-item-container">
      <div class="device-item-border">
        <div class="device-item">
          <span>当前设备号:</span>
          <span>12343413131</span>
        </div>
        <div class="device-item">
          <span>激活状态:</span>
          <span :class="info.activeStatus === 1 ? 'active' : 'inactive'"
            >已激活</span
          >
        </div>
        <div class="device-item">
          <span>主控板版本:</span>
          <span>v123</span>
        </div>
        <div class="device-item">
          <span>锁定状态:</span>
          <span :class="info.activeStatus === 1 ? 'active' : 'inactive'"
            >未锁定</span
          >
        </div>
        <div class="device-item">
          <span>末端采集板版本:</span>
          <span>v11</span>
        </div>
        <div class="device-item">
          <span>精度:</span>
          <span>未知</span>
        </div>
        <div class="device-item">
          <span>机器人软件版本:</span>
          <span>v122</span>
        </div>
        <div class="device-item">
          <span>维度:</span>
          <span>1111</span>
        </div>
        <div class="device-item">
          <span>APP版本:</span>
          <span>v1.0.0</span>
        </div>
        <div class="device-item">
          <span>更新日期:</span>
          <span>2025-12-15</span>
        </div>
        <div class="device-item no-border">
          <span>累计灸时:</span>
          <span>1小时1分钟</span>
        </div>
        <div class="device-item no-border"></div>
      </div>
    </div>
    <div class="item-btn-line">
      <el-button class="device-btn" type="primary" @click="updateFunc"
        >刷新设备信息</el-button
      >
      <el-button class="device-btn-back" type="primary" @click="backMain"
        >返回</el-button
      >
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

import { useRoute, useRouter } from "vue-router";
const router = useRouter();

const info = ref({
  activeStatus: 1,
});

const updateFunc = () => {
  console.log("更新");
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
  padding: 20px 60px;
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

.device-item-container {
  width: 100%;
  height: 70vh;
  background-color: #fff;
  box-sizing: border-box;
  padding: 5vh;
  border-radius: 12px;

  .device-item-border {
    height: 60vh;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    .device-item {
      padding-left: 1vw;
      box-sizing: border-box;
      border-bottom: 1px solid #e0e0e0;
      width: 50%;
      height: 10vh;
      font-size: 16px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      font-size: 20px;
      color: #4d1166;
      :nth-child(2n) {
        padding-left: 1vw;
        font-weight: bold;
      }

      .active {
        color: #008000;
      }
      .inactive {
        color: #ff0000;
      }
    }
    .device-item:nth-child(2n) {
      border-left: 1px solid #e0e0e0;
    }
    .no-border {
      border-bottom: none;
    }
  }
}

.item-btn-line {
  width: 100%;
  height: 10vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

:deep(.device-btn) {
  width: 120px;
  height: 60px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 10px;
  margin: 0 200px;
  box-shadow: 0 4px 6px rgba(97, 31, 137, 0.2);
  transition: all 0.3s ease;

  --el-button-text-color: #fff;
  --el-button-bg-color: #611f89;
  --el-button-border-color: #611f89;
  --el-button-hover-text-color: #fff;
  --el-button-hover-bg-color: #511770; /* 稍深的颜色 */
  --el-button-hover-border-color: #511770;
  --el-button-active-text-color: #fff;
  --el-button-active-bg-color: #411058; /* 更深的颜色 */
  --el-button-active-border-color: #411058;
}
:deep(.device-btn-back) {
  width: 100px;
  height: 60px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 10px;
  margin: 0 200px;
  box-shadow: 0 4px 6px rgba(218, 205, 231, 0.2);
  transition: all 0.3s ease;

  --el-button-text-color: #411058; /* 深色文字，对比度高 */
  --el-button-bg-color: #dacde7;
  --el-button-border-color: #dacde7;
  --el-button-hover-text-color: #333;
  --el-button-hover-bg-color: #cabbd7; /* 稍深的颜色 */
  --el-button-hover-border-color: #cabbd7;
  --el-button-active-text-color: #333;
  --el-button-active-bg-color: #baa9c7; /* 更深的颜色 */
  --el-button-active-border-color: #baa9c7;
}
</style>
