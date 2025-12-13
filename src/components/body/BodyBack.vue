<!--
 * @Author: Sid Li
 * @Date: 2025-12-13 14:06:46
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-13 19:00:22
 * @FilePath: \electron-zxa\src\components\body\BodyBack.vue
 * @Description: 身体正面图片组件
-->
<template>
  <div class="body-img">
    <!-- <img src="@/assets/pic/body/body2.png" alt="" /> -->

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
import { ref, onMounted, watch } from "vue";

const props = defineProps({
  newPlanPoint: {
    type: Array,
    default: () => [],
  },
});

const pointData = ref([]);

const pointDataCopy = ref([]);

const replaceStatusById = (sourceArr, targetArr) => {
  // 1. 构建id->status的映射表（提升匹配效率）
  const statusMap = sourceArr.reduce((map, item) => {
    map[item.id] = item.status;
    return map;
  }, {});

  // 2. 遍历目标数组，替换匹配id的status（不修改原数组）
  return targetArr.map((item) => {
    // 若id在映射表中存在，则替换status，否则返回原数据
    if (statusMap.hasOwnProperty(item.id)) {
      return { ...item, status: statusMap[item.id] };
    }
    return { ...item }; // 浅拷贝原对象，避免修改原数组
  });
};

watch(
  () => props.newPlanPoint,
  (newVal) => {
    console.log(newVal);
    //比较newVal和pointData，然后把pointData里面的staus修改为newVal的status
    const updatedArr2 = replaceStatusById(newVal, pointDataCopy.value);
    console.log(updatedArr2);

    pointData.value = updatedArr2;

    console.log(pointData.value);
  },
  {
    immediate: true,
    deep: true,
  }
);

onMounted(() => {
  console.log("组件挂载了");
  const pointDataJson = JSON.parse(localStorage.getItem("pointData")) || [];
  pointDataCopy.value = JSON.parse(JSON.stringify(pointDataJson));
  pointData.value = pointDataCopy.value.filter((item) => item.type === 2);
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
  // background-color: #fff;
  border-radius: 12px;
  border: 1px solid green;

  .bg-body-norem {
    width: 441px;
    height: 636px;
    border: 1px solid red;
    background: url("@/assets/pic/body/body2.png") no-repeat center center;
    background-size: cover;
    border-radius: 12px;
    position: relative;
  }

  .light-ball-item {
    border: 2px solid green;
    height: 100%;
    width: 100%;
    position: absolute;
  }
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

.blink {
  transform: scale(1.2);
  animation: blink 1.5s infinite ease-in-out;
  transform-origin: center center;
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
