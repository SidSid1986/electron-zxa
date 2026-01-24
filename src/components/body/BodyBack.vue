<!--
 * @Author: Sid Li
 * @Date: 2025-12-13 14:06:46
 * @LastEditors: Sid Li
 * @LastEditTime: 2026-01-24 20:56:27
 * @FilePath: \electron-zxa\src\components\body\BodyBack.vue
 * @Description: 身体正面图片组件
-->

<template>
  <div class="body-img">
    <div class="bg-body-norem">
      <div class="light-ball-item" v-for="item in pointData" :key="item.id">
        <div
          :style="{
            top: `${item.top}px`,
            left: `${item.left}px`,
          }"
          :class="[
            { 'light-ball-red2': item.status === 1 },
            { 'light-ball-green2': item.status === 2 },
            { 'light-ball-blue2': item.status === 0 || !item },
          ]"
        ></div>
        <div
          :style="{
            top: `${item.top + 28}px`,
            left: `${item.left - 28}px`,
          }"
          v-if="item.status != 0"
          :class="{
            'light-ball-text-red2': item.status === 1,
            'light-ball-text-green2': item.status === 2,
          }"
        >
          {{ item.name || "" }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";

const props = defineProps({
  newPlanPoint: {
    type: Array,
    default: () => [],
  },
  currentPoint: {
    type: Object,
    default: () => ({}),
  },
  // 新增：治疗结束标识
  isTreatEnd: {
    type: Boolean,
    default: false,
  },
});

// 新增：触发父组件重置结束标识
const emit = defineEmits(["resetTreatEnd"]);

const pointData = ref([]);
const pointDataCopy = ref([]);
const pointTreat = ref([]);

// 初始化穴位基础数据（不同组件仅修改bodyType值：Back=2/Front=0/LegBack=3/LegFront=1）
const initPointTreat = () => {
  const pointDataJson = JSON.parse(localStorage.getItem("pointData")) || [];
  pointDataCopy.value = JSON.parse(JSON.stringify(pointDataJson));
  // ========== 不同组件仅修改此处的bodyType值 ==========
  pointTreat.value =
    pointDataCopy.value.filter((item) => item.bodyType === 2) || pointDataCopy.value;
  console.log("初始化pointTreat（bodyType=2）：", pointTreat.value);
};

// 核心：平铺分组数据为穴位数组，并按治疗类型设置状态（强化结束状态判断）
const flattenGroupData = (groupList) => {
  if (!Array.isArray(groupList) || groupList.length === 0) return [];

  const activeGroupId =
    props.currentPoint?.groupId || groupList.find((g) => g.isActive)?.groupId || "";
  const activeGroup = groupList.find((g) => g.groupId === activeGroupId) || {};

  let flatPoints = [];
  groupList.forEach((group) => {
    group.points.forEach((point) => {
      let status = 0;

      // 优先级1：分组已结束（status=2），直接设为绿色
      if (group.status === 2) {
        status = 2;
      }
      // 优先级2：激活分组的治疗状态
      else if (group.groupId === activeGroupId) {
        if (group.treatType === 3) {
          status = 1; // 往复灸：所有穴位闪烁
        } else if (group.treatType === 0 && point.id === props.currentPoint?.id) {
          status = 1; // 悬停灸：仅当前穴位闪烁
        }
      }
      // 优先级3：单个穴位已完成
      else if (point.status === 2) {
        status = 2;
      }

      flatPoints.push({
        ...point,
        status,
        groupId: group.groupId,
        treatType: group.treatType,
      });
    });
  });

  return flatPoints;
};

// 替换穴位状态
const replaceStatusById = (flatPoints, targetArr) => {
  const statusMap = flatPoints.reduce((map, item) => {
    map[item.id] = item.status;
    return map;
  }, {});

  return targetArr.map((item) => {
    if (statusMap.hasOwnProperty(item.id)) {
      return { ...item, status: statusMap[item.id] };
    }
    return { ...item, status: 0 };
  });
};

// 重构：状态更新核心函数（复用）
const updatePointStatus = () => {
  if (props.newPlanPoint.length === 0 || pointTreat.value.length === 0) return;

  const flatPoints = flattenGroupData(props.newPlanPoint);
  const updatedArr = replaceStatusById(flatPoints, pointTreat.value);

  pointData.value = [];
  nextTick(() => {
    pointData.value = updatedArr;
    console.log("穴位状态已更新：", pointData.value);
  });
};

// 监听分组数据变化
watch(
  () => [...props.newPlanPoint],
  () => {
    updatePointStatus();
  },
  { immediate: true, deep: true }
);

// 监听当前激活点变化
watch(
  () => props.currentPoint,
  () => {
    updatePointStatus();
  },
  { deep: true }
);

// 新增：监听治疗结束标识（核心修复）
watch(
  () => props.isTreatEnd,
  (isEnd) => {
    if (isEnd) {
      updatePointStatus();
      emit("resetTreatEnd"); // 通知父组件重置标识
    }
  },
  { immediate: true }
);

// 调试监听
watch(
  () => pointData.value,
  (newVal) => {
    console.log("pointData最终渲染数据：", newVal);
    const flashingPoints = newVal.filter((item) => item.status === 1);
    const finishedPoints = newVal.filter((item) => item.status === 2);
    console.log(
      "当前闪烁的穴位：",
      flashingPoints.map((p) => p.name)
    );
    console.log(
      "治疗完成的穴位：",
      finishedPoints.map((p) => p.name)
    );
  },
  { deep: true }
);

onMounted(() => {
  console.log("组件挂载了");
  initPointTreat();
  updatePointStatus();
});
</script>

<style scoped lang="scss">
.body-img {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 12px;
}

.bg-body-norem {
  width: 441px !important;
  height: 636px !important;
  background: url("@/assets/pic/body/body2.png") no-repeat center center;
  background-size: cover;
  border-radius: 12px;
  position: relative;
}

.light-ball-item {
  height: 100%;
  width: 100%;
  position: absolute;
}

.light-ball-red2 {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(241, 68, 55, 0.8);
  border: 1px solid #f14437;
  transform: scale(1.2);
  animation: blink 1.5s infinite ease-in-out;
  transform-origin: center center;
}

.light-ball-blue2 {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(182, 142, 187, 0.8);
  border: 1px solid #b68ebb;
}

.light-ball-green2 {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(88, 192, 141, 0.8);
  border: 1px solid #58c08d;
}

.light-ball-text-red2 {
  position: absolute;
  width: 100px;
  height: 3vh;
  line-height: 3vh;
  font-size: 16px;
  color: #ffffff;
  background-color: rgba(222, 43, 31, 0.8);
  padding: 0 10px;
  border-radius: 12px;
  text-align: center;
  z-index: 999 !important;
}

.light-ball-text-green2 {
  position: absolute;
  width: 100px;
  height: 3vh;
  line-height: 3vh;
  font-size: 16px;
  color: #ffffff;
  background-color: rgba(88, 192, 141, 0.8);
  padding: 0 10px;
  border-radius: 12px;
  text-align: center;
  z-index: 9999 !important;
}

@keyframes blink {
  0% {
    opacity: 0.6;
    transform: scale(1.2);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
  100% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}
</style>
