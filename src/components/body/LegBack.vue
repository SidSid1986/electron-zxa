<!--
 * @Author: Sid Li
 * @Date: 2025-12-13 14:06:46
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-18 15:24:39
 * @FilePath: \zi-xiao-ai\src\components\body\LegBack.vue
 * @Description: 腿部背面图片组件
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
    // 父组件传入的分组数组（groupedData）
    type: Array,
    default: () => [],
  },
  currentPoint: {
    // 当前激活的穴位/分组（用于定位当前执行的分组）
    type: Object,
    default: () => ({}),
  },
  // 新增：治疗结束标识（父组件治疗结束时置为true）
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

// 初始化穴位基础数据（适配腿部背面：过滤bodyType=3）
const initPointTreat = () => {
  const pointDataJson = JSON.parse(localStorage.getItem("pointData")) || [];
  pointDataCopy.value = JSON.parse(JSON.stringify(pointDataJson));
  // 过滤bodyType=3的穴位（腿部背面），如果为空则用原始数据
  pointTreat.value =
    pointDataCopy.value.filter((item) => item.bodyType === 3) || pointDataCopy.value;
  console.log("初始化pointTreat（bodyType=3）：", pointTreat.value);
};

// 核心：平铺分组数据为穴位数组，并按治疗类型设置状态（强化结束状态优先级）
const flattenGroupData = (groupList) => {
  if (!Array.isArray(groupList) || groupList.length === 0) return [];

  // 1. 找到当前激活的分组（通过currentPoint的groupId匹配）
  const activeGroupId =
    props.currentPoint?.groupId || groupList.find((g) => g.isActive)?.groupId || "";
  const activeGroup = groupList.find((g) => g.groupId === activeGroupId) || {};

  // 2. 平铺所有分组的穴位，并标记状态
  let flatPoints = [];
  groupList.forEach((group) => {
    group.points.forEach((point) => {
      let status = 0; // 默认未激活

      // 优先级1：分组已结束（status=2），直接设为绿色
      if (group.status === 2) {
        status = 2;
      }
      // 优先级2：激活分组的治疗状态
      else if (group.groupId === activeGroupId) {
        // 往复灸（treatType=3）：激活分组下所有穴位设为status=1
        // 悬停灸（treatType=0）：仅当前激活的单个穴位设为status=1
        if (group.treatType === 3) {
          status = 1; // 往复灸：所有穴位闪烁
        } else if (group.treatType === 0 && point.id === props.currentPoint?.id) {
          status = 1; // 悬停灸：仅当前穴位闪烁
        }
      }
      // 优先级3：已完成的单个穴位
      else if (point.status === 2) {
        status = 2;
      }

      flatPoints.push({
        ...point,
        status, // 覆盖原有status
        groupId: group.groupId, // 关联分组ID
        treatType: group.treatType, // 关联治疗类型
      });
    });
  });

  return flatPoints;
};

// 替换穴位状态（适配平铺后的分组穴位数据）
const replaceStatusById = (flatPoints, targetArr) => {
  const statusMap = flatPoints.reduce((map, item) => {
    map[item.id] = item.status;
    return map;
  }, {});

  return targetArr.map((item) => {
    if (statusMap.hasOwnProperty(item.id)) {
      return { ...item, status: statusMap[item.id] };
    }
    return { ...item, status: 0 }; // 无匹配的穴位设为未激活
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
    console.log("腿部背面最终渲染的穴位数据：", pointData.value);
  });
};

// 监听分组数据变化（核心逻辑）
watch(
  () => [...props.newPlanPoint],
  (newVal) => {
    console.log("最新newPlanPoint分组数据（腿部背面）：", newVal);
    if (!newVal || newVal.length === 0) return;

    // 确保基础穴位数据已初始化
    if (pointTreat.value.length === 0) {
      initPointTreat();
    }
    updatePointStatus();
  },
  { immediate: true, deep: true }
);

// 监听当前激活穴位变化（切换分组/穴位时更新）
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
    console.log("pointData最终渲染数据（bodyType=3）：", newVal);
    const flashingPoints = newVal.filter((item) => item.status === 1);
    console.log(
      "腿部背面当前闪烁的穴位：",
      flashingPoints.map((p) => p.name)
    );
    console.log(
      "腿部背面治疗完成的穴位：",
      newVal.filter((item) => item.status === 2).map((p) => p.name)
    );
  },
  { deep: true }
);

onMounted(() => {
  console.log("LegBack组件挂载（bodyType=3）");
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
  width: 441px;
  height: 636px;
  background: url("@/assets/pic/body/body3.png") no-repeat center center;
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
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(241, 68, 55, 0.8);
  border: 1px solid #f14437;
  transform: scale(1.2);
  animation: blink 1.5s infinite ease-in-out;
  transform-origin: center center;
}

.light-ball-blue2 {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(182, 142, 187, 0.8);
  border: 1px solid #b68ebb;
}

.light-ball-green2 {
  position: absolute;
  width: 30px;
  height: 30px;
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
    opacity: 0.6; /* 初始透明度 */
    transform: scale(1.2); /* 初始放大比例 */
  }
  50% {
    opacity: 1; /* 最亮状态 */
    transform: scale(1.3); /* 轻微放大增强闪烁感 */
  }
  100% {
    opacity: 0.6; /* 回到初始状态 */
    transform: scale(1.2);
  }
}

.light-index {
  z-index: 9999 !important;
}
</style>
