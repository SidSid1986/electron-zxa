<!--
 * @Author: Sid Li
 * @Date: 2025-12-13 14:48:09
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-13 16:04:06
 * @FilePath: \zi-xiao-ai\src\components\point\BodyBackPoint.vue
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
        :class="[
          { da: item.name == '大椎穴' },
          { ming: item.name == '命门穴' },
          { active: isPointSelected(item) },
        ]"
      >
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import PointData from "@/data/pointData.json";

// 初始化newPlan，补充points数组 + 自动添加bodyType=2
const initNewPlan = () => {
  const storedPlan = JSON.parse(localStorage.getItem("newPlan")) || {};

  // 1. 补充points数组（兼容旧数据）
  if (!storedPlan.points) storedPlan.points = [];
  // 2. 强制添加/更新bodyType字段为2（进入页面即设置）
  storedPlan.bodyType = 2;

  return storedPlan;
};

// 响应式存储当前计划
const currentPlan = ref(initNewPlan());
const pointList = ref([]);

// 判断穴位是否被选中
const isPointSelected = (item) => {
  return currentPlan.value.points.some((p) => p.id === item.id);
};

// 处理穴位选择（基于chooseType判断单选/多选）
const treatPoint = (item) => {
  const isMultiSelect = currentPlan.value.treatType === 3;

  if (isMultiSelect) {
    // 多选模式：切换选中状态
    const isSelected = isPointSelected(item);
    if (isSelected) {
      currentPlan.value.points = currentPlan.value.points.filter(
        (p) => p.id !== item.id
      );
    } else {
      currentPlan.value.points.push(item);
    }
  } else {
    // 单选模式：直接替换数组
    currentPlan.value.points = [item];
  }

  // 同步到localStorage（包含bodyType字段）
  localStorage.setItem("newPlan", JSON.stringify(currentPlan.value));
};

onMounted(() => {
  console.log("组件挂载了");
  pointList.value = PointData.filter((item) => item.type == 2);

  currentPlan.value.bodyType = 2;
  localStorage.setItem("newPlan", JSON.stringify(currentPlan.value));

  console.log("筛选后的穴位列表:", pointList.value);
  console.log("当前计划数据:", currentPlan.value); // 可看到bodyType:2
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
  border: 1px solid green;
  padding: 3vh;

  .point-item-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    border: 3px solid blue;
    position: relative;

    .point-item {
      box-sizing: border-box;
      width: 20vw;
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
