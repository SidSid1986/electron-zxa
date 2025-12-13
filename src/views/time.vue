<!--
 * @Author: Sid Li
 * @Date: 2025-12-12 16:15:42
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-12 16:46:44
 * @FilePath: \zi-xiao-ai\src\views\time.vue
 * @Description: 
-->

<template>
  <div class="time-container">
    <div class="time-title">剩余灸时查询</div>
    <div class="time-item-container">
      <div class="time-item-border">
        <div class="time-line time-line-bottom-border">
          <div class="time-line-title">当前设备号</div>
          <div class="time-line-num">111111111111</div>
        </div>
        <div class="time-line time-line-bottom-border">
          <div class="time-line-title">剩余灸时</div>
          <div class="time-line-num">1小时23分钟</div>
        </div>
        <div class="time-line">
          <div class="time-line-title">更新时间</div>
          <div class="time-line-num">今天12:00:00</div>
        </div>
      </div>
    </div>
    <div class="item-btn-line">
      <el-button class="time-btn" type="primary" @click="updateFunc"
        >更新</el-button
      >
      <el-button class="time-btn" type="primary" @click="backMain"
        >返回</el-button
      >
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

import { useRoute, useRouter } from "vue-router";
const router = useRouter();

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
.time-container {
  width: 100%;
  height: 100vh;
  background-color: #e0ddec;
  box-sizing: border-box;
  .time-title {
    font-size: 36px;
    font-weight: bold;
    padding: 20px;
    color: #4d1166;
    height: 8vh;
    line-height: 8vh;
    margin-top: 4vh;
    text-align: center;
  }

  .time-item-container {
    width: 100%;
    height: 40vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .time-item-border {
      width: 80%;
      height: 100%;
      background-color: #ffffff;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
      .time-line {
        width: 100%;
        height: 8vh;
        line-height: 8vh;
        font-size: 24px;
        font-weight: bold;
        color: #333;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        .time-line-title {
          font-size: 24px;
          color: #a65adc;
        }
        .time-line-num {
          font-size: 24px;
          font-weight: bold;
          color: #42086c;
          font-weight: bold;
        }
      }
      .time-line-bottom-border {
        border-bottom: 1px solid #e0e0e0;
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
}

:deep(.time-btn) {
  width: 100px;
  height: 50px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 10px;
  margin: 0 200px;

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
