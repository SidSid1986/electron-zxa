<!--
 * @Author: Sid Li
 * @Date: 2025-12-13 14:48:09
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-15 15:28:02
 * @FilePath: \zi-xiao-ai\src\components\point\BodyFrontPoint.vue
 * @Description: 
-->
<template>
  <div class="point-container">
    <div class="point-item-container">
      <div
        @click="treatPoint(item)"
        v-for="item in pointList"
        :key="item.id"
        class="point-item"
        :class="[{ active: isPointSelected(item) }]"
      >
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
// import PointData from "@/data/pointData.json";
import { ElMessageBox } from "element-plus";

const emit = defineEmits(["getNewPlan"]);
const router = useRouter();

// 响应式存储当前计划
const currentPlan = ref(JSON.parse(localStorage.getItem("newPlan")));
const pointList = ref([]);

// 最大可选数量（抽离为常量，便于后续修改）
const MAX_SELECT_COUNT = 2;

// 判断穴位是否被选中
const isPointSelected = (item) => {
  return currentPlan.value.points.some((p) => p.id === item.id);
};

// 处理穴位选择（基于treatType判断单选/多选，多选限制最多2个）
const treatPoint = (item) => {
  console.log(item);
  const isMultiSelect = currentPlan.value.treatType === 3;
  const isSelected = isPointSelected(item); // 当前穴位是否已选中

  // 统一设置status（0未选中，1选中）
  item.status = isSelected ? 0 : 1;

  if (isMultiSelect) {
    // 多选模式逻辑
    if (isSelected) {
      // 已选中 → 取消选中（不受数量限制）
      currentPlan.value.points = currentPlan.value.points.filter(
        (p) => p.id !== item.id
      );
    } else {
      // 未选中 → 先判断当前选中数量是否达上限
      if (currentPlan.value.points.length >= MAX_SELECT_COUNT) {
        // 达上限 → 弹窗提示，阻止添加
        ElMessageBox.alert(
          `最多只能选择${MAX_SELECT_COUNT}个穴位，请先取消已选的穴位`,
          "提示",
          {
            customClass: "custom-message-point",
            confirmButtonText: "确认",
            type: "warning", // 警告类型，视觉更友好
          }
        );
        return; // 终止后续逻辑
      }
      // 未达上限 → 添加当前穴位
      currentPlan.value.points.push(item);
    }
  } else {
    // 单选模式：支持反选
    if (isSelected) {
      currentPlan.value.points = [];
    } else {
      currentPlan.value.points = [item];
    }
  }

  const storedPlan = JSON.parse(localStorage.getItem("newPlan")) || {};
  // 2. 仅替换points字段为最新的newPoints
  storedPlan.points = currentPlan.value.points;
  // 3. 写回localStorage（仅points变化，其他字段完全保留）
  localStorage.setItem("newPlan", JSON.stringify(storedPlan));

  emit("getNewPlan");
};

// 清空选中状态的方法
const clearSelectedPoints = () => {
  currentPlan.value.points = [];
  localStorage.setItem("newPlan", JSON.stringify(currentPlan.value));
  emit("getNewPlan");
};

onMounted(() => {
  console.log("组件挂载了");
  const pointData = JSON.parse(localStorage.getItem("pointData")) || [];
  pointList.value = pointData.filter((item) => item.type == 0);
  // currentPlan.value.bodyType = 2;
  clearSelectedPoints(); // 挂载时清空选中状态
  console.log("筛选后的穴位列表:", pointList.value);
  console.log("当前计划数据:", currentPlan.value);
});

onUnmounted(() => {
  // clearSelectedPoints();
  console.log("组件卸载，已清空选中状态");
});
</script>

<style scoped lang="scss">
.point-container {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: flex-start;
  background-color: #fff;
  border-radius: 12px;
  // border: 1px solid green;
  padding: 3vh;

  .point-item-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    // border: 3px solid blue;
    position: relative;
    width: 100%;
    box-sizing: border-box;

    .point-item {
      margin: 0 0.5%;
      box-sizing: border-box;
      width: 30%;
      height: 6vh;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      border: 2px solid #fffaa3;
      background-color: #d7b5ea;
      color: #693098;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 1vh;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .point-item.active {
      background-color: #693098;
      color: #fff;
      border-color: #ffd700;
    }

    .da {
      position: absolute;
      top: 0;
      left: 47%;
      box-sizing: border-box;
      width: 6vh;
      height: 20vh;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      border: 2px solid #fffaa3;
      background-color: #d7b5ea;
      color: #693098;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 1vh;
      writing-mode: vertical-lr;
      text-orientation: upright;
      line-height: 1.2;
      transition: all 0.3s ease;
    }

    .da.active {
      background-color: #693098;
      color: #fff;
      border-color: #ffd700;
    }

    .ming {
      position: absolute;
      top: 22vh;
      right: 33%;
    }
  }
}
</style>

<style lang="scss">
.custom-message-point {
  width: 40vw !important;
  .el-message-box__title {
    color: #693e9c !important;
    font-weight: 600;
    font-size: 24px;
  }

  .el-message-box__content {
    font-size: 24px !important;
  }

  .el-message-box__btns .el-button--primary {
    background-color: #693e9c !important;
    border-color: #693e9c !important;

    font-size: 24px !important;
    width: 6vh !important;
    height: 3vh !important;

    &:hover {
      background-color: #7c4eb5 !important;
      border-color: #7c4eb5 !important;
    }
  }

  .el-message-box__btns .el-button--default {
    background-color: #ffffff !important;
    border-color: #693e9c !important;
    color: #693e9c !important;

    &:hover {
      background-color: rgba(105, 62, 156, 0.05) !important;
      border-color: #7c4eb5 !important;
      color: #7c4eb5 !important;
    }
  }
}
</style>
