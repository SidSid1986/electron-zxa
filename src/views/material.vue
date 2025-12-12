<!--
 * @Author: Sid Li
 * @Date: 2025-12-12 15:19:19
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-12 16:06:34
 * @FilePath: \zi-xiao-ai\src\views\material.vue
 * @Description: material
-->
<template>
  <div class="material-container">
    <div class="material-title">耗材管理</div>
    <div class="material-item-container">
      <div
        class="material-item"
        v-for="(item, index) in meterialData"
        :key="item.id"
      >
        <div class="material-pic">
          <img :src="item.icon" alt="" />
        </div>
        <div class="material-right">
          <div class="material-progress">
            <el-progress
              :text-inside="true"
              :stroke-width="26"
              :percentage="70"
              color="#F1E9F4"
            />
          </div>
          <div class="material-name">{{ item.name }}</div>
          <div class="material-num">
            <div>
              <span class="time-text">预计剩余时间</span
              ><span class="time-num">{{ item.time }}小时</span>
            </div>
            <div class="change-btn-content">
              <el-button class="change-btn" type="primary">更换</el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="back-content">
        <el-button @click="backMain" class="back-btn" type="primary"
          >返回</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import icon1 from "@/assets/pic/filter_cotton.png";
import icon2 from "@/assets/pic/oil_tank.png";
import icon3 from "@/assets/pic/smoke_pipe.png";
import { useRoute, useRouter } from "vue-router";
const router = useRouter();
 

const meterialData = ref([
  {
    id: 1,
    name: "过滤棉",
    type: 1,
    time: 100,
    icon: icon1,
    status: 1,
    num: 80,
  },
  {
    id: 2,
    name: "油桶",
    type: 2,
    time: 100,
    icon: icon2,
    status: 2,
    num: 80,
  },
  {
    id: 3,
    name: "烟管",
    type: 3,
    time: 100,
    icon: icon3,
    status: 0,
    num: 80,
  },
]);

const backMain = () => {
  router.push("/main");
};

onMounted(() => {
  console.log("组件挂载了");
});
</script>

<style scoped lang="scss">
.material-container {
  width: 100%;
  height: 100vh;
  background-color: #e0ddec;
  box-sizing: border-box;
  .material-title {
    font-size: 36px;
    font-weight: bold;
    color: #333;
    padding: 20px;
    color: #4d1166;
    height: 8vh;
    line-height: 8vh;
    margin-top: 4vh;
    text-align: center;
  }

  .material-item-container {
    width: 100%;
    height: 82vh;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    .material-item {
      width: 60%;
      height: 15vh;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      background-color: #fdfdfb;
      margin-bottom: 2vh;
      border-radius: 12px;

      .material-pic {
        width: 10%;
        height: 10vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        img {
          // border: 1px solid yellow;
          background-color: #fffffd;
          box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
      }

      .material-right {
        width: 90%;
        height: 10vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-right: 20px;
        .material-progress {
          width: 100%;
          font-size: 24px;
          font-weight: bold;
          color: #333;
          color: #4d1166;

          height: 3vh;
          line-height: 3vh;
          text-align: center;
        }
        .material-name {
          width: 100%;
          font-size: 24px;
          font-weight: bold;
          color: #333;

          color: #4d1166;

          height: 3vh;
          line-height: 3vh;
          text-align: left;
          margin-bottom: 20px;
          margin-top: 10px;
        }
        .material-num {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          font-size: 24px;
          font-weight: bold;

          color: #4d1166;

          height: 3vh;
          line-height: 3vh;
          text-align: center;
          .time-text {
            margin-right: 10px;
            color: #333;
            font-size: 18px;
          }
          .time-num {
            font-size: 24px;
            font-weight: bold;
            font-size: 18px;
            color: #4d1166;
          }
          .change-btn-content {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-end;
          }
        }
      }
    }
  }

  .back-content {
    // border: 1px solid red;
    width: 60%;
    height: 10vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

:deep(.change-btn) {
  width: 80px;
  height: 40px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 10px;

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

:deep(.back-btn) {
  width: 100px;
  height: 60px;
  font-size: 20px;
  font-weight: bold;
  border-radius: 10px;

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

<style>
.el-progress-bar__innerText {
  font-size: 18px;
  font-weight: bold;
  color: #4d1166;
}
</style>
