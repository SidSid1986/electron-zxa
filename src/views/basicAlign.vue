<!--
 * @Author: Sid Li
 * @Date: 2025-12-12 16:15:42
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-16 11:27:23
 * @FilePath: \zi-xiao-ai\src\views\basicAlign.vue
 * @Description: 
-->

<template>
  <div class="device-container">
    <div class="device-title">设备校准</div>
    <div class="device-item-container">
      <div class="device-item">
        <div class="align-name">除灰位置校准</div>
        <div class="align-info">
          先点击【开始校准】，再移动机械臂，使艾灸头位置对准除灰位置，并点击【确认】
        </div>
        <div class="align-btn-content">
          <el-button class="align-btn" type="primary" @click="alignGray"
            >开始校准</el-button
          >
          <el-button class="align-btn" type="primary" @click="alignGray"
            >确认</el-button
          >
        </div>
      </div>
      <div class="device-item">
        <div class="align-name">艾灸参考点校准</div>
        <div class="align-info">
          先点击【开始校准】，再移动机械臂，使艾灸头位置对准除灰位置，并点击【确认】
        </div>
        <div class="align-btn-content">
          <el-button class="align-btn" type="primary" @click="alignGray"
            >开始校准</el-button
          >
          <el-button class="align-btn" type="primary" @click="alignGray"
            >确认</el-button
          >
        </div>
      </div>
      <div class="device-item">
        <div class="align-name">初始位置校准</div>
        <div class="align-info">
          先点击【开始校准】，再移动机械臂，使艾灸头位置对准除灰位置，并点击【确认】
        </div>
        <div class="align-btn-content">
          <el-button class="align-btn" type="primary" @click="alignGray"
            >开始校准</el-button
          >
          <el-button class="align-btn" type="primary" @click="alignGray"
            >确认</el-button
          >
        </div>
      </div>
    </div>
    <div class="item-btn-line">
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

  height: 50vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  .device-item {
    padding: 2vh;
    width: 25vw;
    height: 35vh;
    background-color: #fff;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
    box-sizing: border-box;
    font-size: 24px;
    margin: 0 1vw;
    .align-name {
      font-size: 28px;
      font-weight: bold;
      color: #4d1166;
      height: 4vh;
      line-height: 4vh;
      text-align: center;
    }
    .align-info {
      height: 20vh;
      font-size: 20px;
      color: #4b4848;
      height: 8vh;
      line-height: 2;
      text-align: center;
      margin-top: 3vh;
    }
    .align-btn-content {
      width: 100%;
      height: 6vh;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      margin-top: 8vh;
    }
  }
}

.item-btn-line {
  width: 100%;
  height: 6vh;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 8vh;
}

:deep(.align-btn) {
  width: 100px;
  height: 40px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 10px;
  margin: 0 40px;
  box-shadow: 0 4px 6px rgba(218, 205, 231, 0.2);
  transition: all 0.3s ease;

  --el-button-text-color: #6e2f8b; /* 深色文字，对比度高 */
  --el-button-bg-color: #dacde7;
  --el-button-border-color: #dacde7;
  --el-button-hover-text-color: #333;
  --el-button-hover-bg-color: #cabbd7; /* 稍深的颜色 */
  --el-button-hover-border-color: #cabbd7;
  --el-button-active-text-color: #333;
  --el-button-active-bg-color: #baa9c7; /* 更深的颜色 */
  --el-button-active-border-color: #baa9c7;
}

:deep(.device-btn-back) {
  width: 150px;
  height: 60px;
  font-size: 20px;
  font-weight: bold;
  border-radius: 10px;
  margin: 0 200px;
  box-shadow: 0 4px 6px rgba(218, 205, 231, 0.2);
  transition: all 0.3s ease;
  --el-button-text-color: #6e2f8b; /* 深色文字，对比度高 */
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
