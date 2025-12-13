<!--
 * @Author: Sid Li
 * @Date: 2025-12-12 14:38:40
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-13 16:05:32
 * @FilePath: \zi-xiao-ai\src\views\chooseType.vue
 * @Description: 选择灸方页面
-->
<template>
  <div class="container">
    <div class="point-nav">艾灸手法</div>
    <div class="point-content">
      <div class="point-content-top">
        <div
          @click="chooseItem(item, index)"
          :class="[
            { 'point-item-border': index != chooseData.length - 1 },
            { 'border-item-left-radius': index == 0 },
            { 'border-item-right-radius': index == chooseData.length - 1 },
            { 'selected-item': index == chooseIndex },
          ]"
          v-for="(item, index) in chooseData"
          :key="item.id"
          class="point-item"
        >
          {{ item.name }}
        </div>
      </div>
      <div class="point-content-bottom">
        <div class="bottom-nav">治疗时长</div>
        <div class="time-content">
          <div
            @click="chooseTimeItem(item, index)"
            :class="[{ 'selected-time-item': index == chooseTimeIndex }]"
            v-for="(item, index) in timeData"
            :key="item.id"
            class="time-item"
          >
            {{ item.value }}分钟
          </div>
        </div>
      </div>

      <div class="btn-content">
        <el-button @click="handleCancel" class="cancel-btn" type="primary"
          >取消</el-button
        >
        <el-button @click="handleSave" class="save-btn" type="primary"
          >确认</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from "vue";
import caseData from "@/data/caseData.json";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const newPlan = ref(JSON.parse(localStorage.getItem("newPlan")) || {});
const chooseData = ref([
  {
    id: 1,
    name: "悬停灸",
    treatType: 0,
  },
  {
    id: 2,
    name: "雀啄灸",
    treatType: 1,
  },
  {
    id: 3,
    name: "回旋灸",
    treatType: 2,
  },
  {
    id: 4,
    name: "往复灸",
    treatType: 3,
  },
]);
const chooseIndex = ref(0);
const chooseTimeIndex = ref(0);

const timeData = ref([
  {
    id: 1,
    value: 1,
  },
  {
    id: 2,
    value: 2,
  },
  {
    id: 3,
    value: 5,
  },
  {
    id: 4,
    value: 10,
  },
  {
    id: 5,
    value: 15,
  },
  {
    id: 6,
    value: 20,
  },
  {
    id: 7,
    value: 25,
  },
  {
    id: 8,
    value: 30,
  },
  {
    id: 9,
    value: 35,
  },
  {
    id: 10,
    value: 40,
  },
  {
    id: 11,
    value: 50,
  },
  {
    id: 12,
    value: 60,
  },
]);
const chooseObj = ref({
  treatType: 0,
  chooseName: "悬停灸",
  time: 1,
});

// 选择灸方
const chooseItem = (item, index) => {
  chooseIndex.value = index;
  chooseTimeIndex.value = 0;
  chooseObj.value.treatType = item.treatType;
  chooseObj.value.chooseName = item.name;
};

// 选择治疗时长
const chooseTimeItem = (item, index) => {
  chooseTimeIndex.value = index;
  chooseObj.value.time = item.value;
};

const handleCancel = () => {
  router.push("/newPlan");
};
const handleSave = () => {
  
  newPlan.value.treatType = chooseObj.value.treatType;
  newPlan.value.chooseName = chooseObj.value.chooseName;
  newPlan.value.time = chooseObj.value.time;
  localStorage.setItem("newPlan", JSON.stringify(newPlan.value));
  router.push("/chosePoint");
};

// 页面初始化
onMounted(() => {});

onUnmounted(() => {});
</script>

<style scoped lang="scss">
.container {
  box-sizing: border-box;
  background: #e3daec;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  padding-top: 4vh;
  .point-nav {
    width: 100%;
    height: 10vh;
    line-height: 10vh;
    text-align: center;
    font-size: 40px;
    font-weight: bold;
    color: #693098;
    margin-bottom: 2vh;
  }

  .point-content {
    box-sizing: border-box;
    height: 80vh;
    width: 100%;

    padding: 0 20px;
    .point-content-top {
      height: 20vh;
      width: 100%;

      margin-bottom: 5vh;
      background-color: #fff;
      border-radius: 12px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding: 0 20px;

      .point-item {
        width: 20vw;
        height: 6vh;
        line-height: 6vh;
        text-align: center;
        font-size: 30px;
        font-weight: bold;
        color: #999999;
        margin-bottom: 2vh;
        background-color: #ecdff0;
        cursor: pointer;
      }
      .point-item-border {
        border-right: 1px solid #d0cbcb;
      }
      .border-item-left-radius {
        border-top-left-radius: 12px;
        border-bottom-left-radius: 12px;
      }
      .border-item-right-radius {
        border-top-right-radius: 12px;
        border-bottom-right-radius: 12px;
      }
      .selected-item {
        color: #693098;
        background-color: #dec7e7;
      }
    }
    .point-content-bottom {
      height: 40vh;
      width: 100%;

      background-color: #fff;
      border-radius: 12px;
      .bottom-nav {
        height: 6vh;
        line-height: 6vh;
        text-align: center;
        font-size: 32px;
        font-weight: bold;
        color: #693098;
        margin-bottom: 2vh;
      }
      .time-content {
        height: 30vh;
        width: 100%;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        box-sizing: border-box;
        padding: 0 20px;
        .time-item {
          margin: 0 0.5vw;
          width: 20vw;
          height: 6vh;
          line-height: 6vh;
          text-align: center;
          font-size: 30px;
          font-weight: bold;
          color: #999999;
          margin-bottom: 2vh;
          background-color: #ffffff;
          cursor: pointer;
          border: 1px solid #d0cbcb;
          border-radius: 12px;
        }
        .selected-time-item {
          color: #ffffff;
          background-color: #ab81bd;
        }
      }
    }
    .btn-content {
      margin-top: 2vh;
      height: 10vh;
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }
  }
}

:deep(.cancel-btn) {
  margin: 0 120px;
  width: 120px;
  height: 50px;
  font-size: 24px;
  border-radius: 12px;
  --el-button-text-color: #511d6a;
  --el-button-bg-color: #e5dfed;
  --el-button-border-color: #f3f0f5;
  --el-button-hover-text-color: #511d6a;
  --el-button-hover-bg-color: #e5dfed;
  --el-button-hover-border-color: #e5dfed;
  --el-button-active-text-color: #511d6a;
  --el-button-active-bg-color: #d8cfe5;
  --el-button-active-border-color: #d8cfe5;
}

:deep(.save-btn) {
  margin: 0 120px;
  width: 120px;
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
