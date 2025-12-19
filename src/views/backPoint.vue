<!--
 * @Author: Sid Li
 * @Date: 2025-12-12 16:15:42
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-19 13:57:34
 * @FilePath: \zi-xiao-ai\src\views\backPoint.vue
 * @Description: 
-->

<template>
  <div class="back-container">
    <div class="back-title">机器人回打包位</div>
    <div class="back-item-container">
      <div class="back-item-line">
        <div class="back-item">
          <span>当前状态:</span
          ><span
            :class="{
              'status-ok': robotInfo.status === 0,
              'status-error': robotInfo.status === 1,
            }"
            >{{ robotInfo.status === 0 ? "待命" : "工作中" }}</span
          >
        </div>
        <div class="back-item">
          <span>当前位置:</span
          ><span class="item-text">{{
            robotInfo.position === 0 ? "工作区" : "打包位"
          }}</span>
        </div>
        <div class="back-item">
          <span>设备编号:</span><span class="item-text">{{ robotInfo.deviceId }}</span>
        </div>
      </div>

      <div class="back-item-line-btn">
        <div>点击下方按钮，机器人将自动回打包位</div>
        <el-button class="back-line-btn" type="primary" @click="backPoint"
          >回打包位</el-button
        >
      </div>
    </div>
    <div class="item-btn-line">
      <el-button class="back-btn" type="primary" @click="backMain">返回</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

import { useRoute, useRouter } from "vue-router";
const router = useRouter();

const robotInfo = ref({
  status: 0,
  position: 0,
  deviceId: "8887788788",
});

const backPoint = () => {
  // robotInfo.value.position = 1;
};

const backMain = () => {
  router.push("/main");
};

onMounted(() => {
  console.log("组件挂载了");
});
</script>

<style scoped lang="scss">
.back-container {
  width: 100%;
  height: 100vh;
  background-color: #e0ddec;
  box-sizing: border-box;
  .back-title {
    font-size: 36px;
    font-weight: bold;
    padding: 20px;
    color: #4d1166;
    height: 8vh;
    line-height: 8vh;
    margin-top: 4vh;
    text-align: center;
  }

  .back-item-container {
    width: 100%;
    height: 55vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    // border: 1px solid red;
    .back-item-line {
      width: 32vw;
      height: 30vh;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      font-size: 18px;

      color: #4d1166;
      // border: 2px solid green;
      background-color: #fff;
      border-radius: 16px;
      padding: 20px 40px;
      box-sizing: border-box;
      .back-item {
        height: 8vh;
        width: 100%;
        border-bottom: 1px solid #ccc;
        margin: 10px;
        .item-text {
          color: #111;
          margin-left: 20px;
        }

        .status-ok {
          color: #008000;
          margin-left: 20px;
        }
        .status-error {
          color: #ff0000;
          margin-left: 20px;
        }
      }
    }

    .back-item-line-btn {
      width: 32vw;
      height: 20vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: 18px;

      color: #4d1166;
      // border: 2px solid green;
      background-color: #fff;
      border-radius: 16px;
      padding: 20px 40px;
      box-sizing: border-box;
      margin-top: 20px;
      div {
        height: 8vh;
        line-height: 8vh;
        margin-bottom: 20px;
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

:deep(.back-line-btn) {
  width: 120px;
  height: 40px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 10px;
  margin: 0 200px;

  --el-button-text-color: #ffffff;
  --el-button-bg-color: #7c55c2; /* 与基础色一致 */
  --el-button-border-color: #7c55c2;

  --el-button-hover-text-color: #ffffff;
  --el-button-hover-bg-color: #6a45a8; /* 基础色加深约15% */
  --el-button-hover-border-color: #6a45a8;

  --el-button-active-text-color: #ffffff;
  --el-button-active-bg-color: #5a3890; /* 基础色加深约30% */
  --el-button-active-border-color: #5a3890;
}

:deep(.back-btn) {
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
