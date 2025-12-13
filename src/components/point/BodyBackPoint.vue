<!--
 * @Author: Sid Li
 * @Date: 2025-12-13 14:48:09
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-13 19:05:29
 * @FilePath: \electron-zxa\src\components\point\BodyBackPoint.vue
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
import { ref, onMounted, onUnmounted, watch } from "vue";
// 若使用Vue Router，引入路由实例（根据项目实际路径调整）
import { useRouter } from "vue-router";
import PointData from "@/data/pointData.json";

const emit = defineEmits(["getNewPlan"]);
// 初始化路由实例（Vue Router场景）
const router = useRouter();

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

// 处理穴位选择（基于treatType判断单选/多选，单选支持反选）
const treatPoint = (item) => {
  const isMultiSelect = currentPlan.value.treatType === 3;
  const isSelected = isPointSelected(item); // 先判断当前穴位是否选中

  // 统一设置status（0未选中，1选中）
  item.status = isSelected ? 0 : 1;

  if (isMultiSelect) {
    // 多选模式：切换选中状态
    if (isSelected) {
      currentPlan.value.points = currentPlan.value.points.filter(
        (p) => p.id !== item.id
      );
    } else {
      currentPlan.value.points.push(item);
    }
  } else {
    // 单选模式：支持反选（核心修改）
    if (isSelected) {
      // 已选中当前穴位 → 清空数组（取消选中）
      currentPlan.value.points = [];
    } else {
      // 未选中 → 替换为当前穴位
      currentPlan.value.points = [item];
    }
  }

  // 同步到localStorage（包含bodyType字段）
  localStorage.setItem("newPlan", JSON.stringify(currentPlan.value));
  emit("getNewPlan");
};

// 清空选中状态的方法（抽离为通用函数）
const clearSelectedPoints = () => {
  console.log("222");
  // 清空points数组
  currentPlan.value.points = [];
  // 同步到localStorage
  localStorage.setItem("newPlan", JSON.stringify(currentPlan.value));
  // 通知父组件更新
  emit("getNewPlan");
};

onMounted(() => {
  console.log("组件挂载了");
  pointList.value = PointData.filter((item) => item.type == 2);

  currentPlan.value.bodyType = 2;
  localStorage.setItem("newPlan", JSON.stringify(currentPlan.value));

  console.log("筛选后的穴位列表:", pointList.value);
  console.log("当前计划数据:", currentPlan.value); // 可看到bodyType:2

  // 【可选】路由切换时清空（Vue Router场景）
  if (router) {
    // 监听路由变化，离开当前页面时清空
    router.afterEach((to, from) => {
      // 假设当前组件对应的路由路径是 /bodyBackPoint，根据实际路径修改
      if (from.path === "/bodyBackPoint") {
        clearSelectedPoints();
      }
    });
  }
});

// 【核心】组件卸载时清空选中状态（必加）
onUnmounted(() => {
  clearSelectedPoints();
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
