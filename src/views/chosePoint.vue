<!--
 * @Author: Sid Li
 * @Date: 2025-12-12 14:38:40
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-13 17:27:25
 * @FilePath: \zi-xiao-ai\src\views\chosePoint.vue
 * @Description: 选择穴位页面  
-->
<template>
  <div class="container">
    <div class="point-nav">
      <span class="plan-name">穴位选择</span>
    </div>
    <div class="point-content">
      <div class="point-content-left">
        <component
          :is="currentComponent"
          ref="bodyRef"
          :newPlanPoint="newPlanPoint"
        />
      </div>
      <div class="point-content-right">
        <div class="right-content">
          <div class="point-tab">
            <div
              @click="chooseBody(item, index)"
              v-for="(item, index) in tabData"
              :key="item.id"
              class="tab-item"
              :class="[{ 'selected-tab-item': index == chooseBodyIndex }]"
            >
              {{ item.name }}
            </div>
          </div>
          <div class="point-point">
            <BodyBackPoint @getNewPlan="getNewPlan" />
          </div>
          <div class="point-info"></div>
          <div class="point-btn"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from "vue";
import caseData from "@/data/caseData.json";
import { useRoute, useRouter } from "vue-router";
import BodyFront from "@/components/body/BodyFront.vue";
import BodyBack from "@/components/body/BodyBack.vue";
import LegFront from "@/components/body/LegFront.vue";
import LegBack from "@/components/body/LegBack.vue";
// import BodyFrontPoint from "@/components/point/BodyFrontPoint.vue";
import BodyBackPoint from "@/components/point/BodyBackPoint.vue";
// import LegFrontPoint from "@/components/point/LegFrontPoint.vue";
// import LegBackPoint from "@/components/point/LegBackPoint.vue";

const router = useRouter();
const chooseBodyIndex = ref(0);
const currentComponent = shallowRef(markRaw(BodyBack));

const newPlanPoint = ref([]);

const tabData = ref([
  {
    id: 1,
    name: "背部",
    type: 2,
  },
  {
    id: 2,
    name: "正面",
    type: 0,
  },
  {
    id: 3,
    name: "腿-背",
    type: 3,
  },
  {
    id: 4,
    name: "腿-正",
    type: 1,
  },
]);

const chooseBody = (item, index) => {
  switch (item.type) {
    case 0:
      currentComponent.value = markRaw(BodyFront);
      break;
    case 1:
      currentComponent.value = markRaw(LegFront);
      break;
    case 2:
      currentComponent.value = markRaw(BodyBack);
      break;
    case 3:
      currentComponent.value = markRaw(LegBack);
      break;
    default:
      break;
  }

  chooseBodyIndex.value = index;
};

// 刷新newPlan
const getNewPlan = () => {
  console.log(111111);
  newPlanPoint.value = JSON.parse(localStorage.getItem("newPlan")).points || {};
};

// 页面初始化
onMounted(() => {});

// 组件卸载：清理定时器和事件监听
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
    box-sizing: border-box;
    width: 100%;
    height: 6vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e3daec;
    border: 1px solid #693098;

    .plan-name {
      font-size: 36px;
      font-weight: bold;
      color: #693098;
    }
  }

  .point-content {
    box-sizing: border-box;
    width: 100%;
    height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid red;

    .point-content-left {
      box-sizing: border-box;
      width: 35%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid blue;
      padding: 5vh 2vh;
    }

    .point-content-right {
      box-sizing: border-box;
      width: 65%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      padding: 5vh 2vh;

      .right-content {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: space-between;

        background-color: #fff;
        border-radius: 12px;
        .point-tab {
          box-sizing: border-box;
          width: 100%;
          height: 8vh;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid red;
          background-color: #f3eef4;
          padding: 10px;
          .tab-item {
            box-sizing: border-box;
            width: 24%;
            height: 4vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: #693098;
            background-color: #efe5f0;
            cursor: pointer;
            border-radius: 12px;
          }
          .selected-tab-item {
            background-color: #dfcae8;
            font-weight: bold;
          }
        }
        .point-point {
          box-sizing: border-box;
          width: 100%;
          height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid green;
        }
        .point-info {
          box-sizing: border-box;
          width: 100%;
          height: 8vh;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid red;
        }
        .point-btn {
          box-sizing: border-box;
          width: 100%;
          height: 8vh;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid red;
        }
      }
    }
  }
}

:deep(.edit-btn) {
  width: 80px;
  height: 40px;
  font-size: 18px;
  margin-right: 10px;
  border-radius: 12px;
  --el-button-text-color: #6a3a8a;
  --el-button-bg-color: #eee8f0;
  --el-button-border-color: #eee8f0;
  --el-button-hover-text-color: #6a3a8a;
  --el-button-hover-bg-color: #e0d7e3;
  --el-button-hover-border-color: #e0d7e3;
  --el-button-active-text-color: #6a3a8a;
  --el-button-active-bg-color: #d2c6d6;
  --el-button-active-border-color: #d2c6d6;
}

:deep(.delete-btn) {
  width: 80px;
  height: 40px;
  font-size: 18px;
  border-radius: 12px;
  --el-button-text-color: #9b5b5b;
  --el-button-bg-color: #fdf0ec;
  --el-button-border-color: #fdf0ec;
  --el-button-hover-text-color: #9b5b5b;
  --el-button-hover-bg-color: #f4e0d8;
  --el-button-hover-border-color: #f4e0d8;
  --el-button-active-text-color: #9b5b5b;
  --el-button-active-bg-color: #ebd0c4;
  --el-button-active-border-color: #ebd0c4;
}
</style>
