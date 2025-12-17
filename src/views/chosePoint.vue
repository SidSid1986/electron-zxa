<!--
 * @Author: Sid Li
 * @Date: 2025-12-12 14:38:40
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-17 23:48:10
 * @FilePath: \electron-zxa\src\views\chosePoint.vue
 * @Description: 选择穴位页面  
-->
<template>
  <div class="container">
    <div class="point-nav">
      <span class="plan-name">穴位选择--{{ newPlanName }}</span>
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
            <!-- <BodyBackPoint @getNewPlan="getNewPlan" /> -->
            <component
              :is="currentPointComponent"
              ref="bodyPointRef"
              @getNewPlan="getNewPlan"
            />
          </div>
          <div class="point-info">
            <div class="point-info-selected">
              <div>已选择穴位:</div>
              <div v-for="item in newSelectedPoints" :key="item.id">
                {{ item.name }}
              </div>
              <div v-if="newSelectedPoints.length === 0">暂无选择</div>
            </div>

            <div class="point-info-warning">注意:往复灸需选择两个穴位</div>
          </div>
          <div class="point-btn">
            <el-button type="primary" class="btn-prev" @click="backToPlan"
              >上一步</el-button
            >
            <el-button type="primary" class="btn-prev" @click="cancelPlan"
              >取消</el-button
            >
            <el-button type="primary" class="delete-btn" @click="confirmPlan"
              >确定</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, watch } from "vue";
import caseData from "@/data/caseData.json";
import { useRoute, useRouter } from "vue-router";
import BodyFront from "@/components/body/BodyFront.vue";
import BodyBack from "@/components/body/BodyBack.vue";
import LegFront from "@/components/body/LegFront.vue";
import LegBack from "@/components/body/LegBack.vue";
import BodyFrontPoint from "@/components/point/BodyFrontPoint.vue";
import BodyBackPoint from "@/components/point/BodyBackPoint.vue";
import LegFrontPoint from "@/components/point/LegFrontPoint.vue";
import LegBackPoint from "@/components/point/LegBackPoint.vue";

const router = useRouter();
const chooseBodyIndex = ref(0);
const currentComponent = shallowRef(markRaw(BodyBack));
const currentPointComponent = shallowRef(markRaw(BodyBackPoint));

const newPlanPoint = ref([]);
const newPlanName = ref("");

const newSelectedPoints = ref([]);

const tabData = ref([
  {
    id: 1,
    name: "背部",
    bodyType: 2,
  },
  {
    id: 2,
    name: "正面",
    bodyType: 0,
  },
  {
    id: 3,
    name: "腿-背",
    bodyType: 3,
  },
  {
    id: 4,
    name: "腿-正",
    bodyType: 1,
  },
]);

const chooseBody = (item, index) => {
  console.log(item);
  switch (item.bodyType) {
    case 0:
      currentComponent.value = markRaw(BodyFront);
      currentPointComponent.value = markRaw(BodyFrontPoint);
      break;
    case 1:
      currentComponent.value = markRaw(LegFront);
      currentPointComponent.value = markRaw(LegFrontPoint);
      break;
    case 2:
      currentComponent.value = markRaw(BodyBack);
      currentPointComponent.value = markRaw(BodyBackPoint);
      break;
    case 3:
      currentComponent.value = markRaw(LegBack);
      currentPointComponent.value = markRaw(LegBackPoint);
      break;
    default:
      break;
  }

  chooseBodyIndex.value = index;

  // ========== 核心：修改bodyType字段（保留其他字段） ==========
  // 1. 读取localStorage中的完整newPlan（无则初始化空对象）
  const storedPlan = JSON.parse(localStorage.getItem("newPlan")) || {};
  // 2. 仅修改bodyType为当前item.bodyType
  storedPlan.bodyType = item.bodyType;
  // 3. 写回localStorage（保留所有原有字段，仅更新bodyType）
  localStorage.setItem("newPlan", JSON.stringify(storedPlan));
};

// 刷新newPlan
const getNewPlan = () => {
  console.log(111111);
  newPlanPoint.value = JSON.parse(localStorage.getItem("newPlan")).points;
};

watch(
  () => newPlanPoint.value,
  (newVal) => {
    newSelectedPoints.value = newVal.filter((p) => p.status === 1);
  },
  { deep: true }
);

const backToPlan = () => {
  router.push("/chooseType");
};

// 取消计划
const cancelPlan = () => {
  router.push("/plan");
};

// 确认计划
const confirmPlan = () => {
  if (newSelectedPoints.value.length === 0) {
    ElMessageBox.alert("请选择至少一个穴位", "提示", {
      customClass: "custom-message-point",
      confirmButtonText: "确认",
      type: "warning", // 警告类型，视觉更友好
    });
    return; // 终止后续逻辑
  }
  router.push("/newPlan");
};

// 页面初始化
onMounted(() => {
  newPlanName.value = JSON.parse(localStorage.getItem("newPlan")).chooseName;
});

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
    // border: 1px solid #693098;

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
    // border: 3px solid red;

    .point-content-left {
      box-sizing: border-box;
      width: 35%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      // border: 2px solid blue;
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
          // border: 1px solid red;
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
          // border: 3px solid green;
        }
        .point-info {
          box-sizing: border-box;
          width: 100%;
          height: 8vh;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          background-color: #7242ae;
          font-size: 24px;
          color: #fff;
          padding: 0 3vh;
        }
        .point-info-selected {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          font-size: 24px;
          color: #fff;
        }
        .point-info-warning {
          font-size: 18px;
          color: #fff;
        }
        .point-btn {
          box-sizing: border-box;
          width: 100%;
          height: 8vh;
          display: flex;
          align-items: center;
          justify-content: center;
          // border: 1px solid red;
        }
      }
    }
  }
}

:deep(.btn-prev) {
  width: 120px;
  height: 50px;
  font-size: 18px;
  margin-right: 10px;
  border-radius: 12px;
  margin: 0 10vh;

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
  width: 120px;
  height: 50px;
  font-size: 18px;
  margin-right: 10px;
  border-radius: 12px;
  margin: 0 10vh;
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
