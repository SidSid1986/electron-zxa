<template>
  <div class="swiper-main">
    <span class="custom-swiper-button-prev" @click="goPrev"></span>
    <swiper
      class="home-swiper"
      :modules="modules"
      direction="horizontal"
      :slides-per-view="1"
      :slides-per-group="1"
      :initial-slide="0"
      @swiper="onSwiper"
      @slideChange="onSlideChange"
    >
      <swiper-slide
        class="page-slide"
        v-for="(pageData, pageIndex) in treatData"
        :key="'page-' + pageIndex"
      >
        <div
          class="swiper-item"
          v-for="(item, itemIndex) in pageData"
          :key="item.renderKey"
          @click="detailIconClick(item, itemIndex)"
        >
          <div class="swiper-item-title">
            <div class="swiper-item-name">{{ item.name }}</div>
            <div class="swiper-item-point">{{ item.point }}</div>
          </div>
          <div class="swiper-item-time">时长:{{ item.time1 }}</div>
          <div class="swiper-item-circle">
            <div class="circle-bg">
              <div class="circle-content">
                <!-- <div v-if="item.isActive" class="light-border"></div> -->
                <!-- 绿色闪烁框：仅激活且运行中显示 -->
                <div
                  v-if="item.isActive && item.status === 'running'"
                  class="light-border"
                ></div>

                <!-- 红色边框：仅激活且已结束显示（修正后的逻辑） -->
                <div
                  v-if="
                    item.isActive &&
                    (item.status === 'ended' || item.status === 'paused')
                  "
                  class="light-border-red"
                ></div>
                <div class="circle-text">
                  <Countdown
                    v-if="item.hasValidTime"
                    :ref="(el) => setCountdownRef(el, item.uniqueKey)"
                    :time="item.useTime"
                    :key="item.renderKey"
                    :auto-start="false"
                    :emit-events="true"
                    :transform="transformSlotProps"
                    @end="handleCountdownEnd(item)"
                    @start="handleCountdownStart(item)"
                    @progress="
                      (data) => handleCountdownProgress(data, item.uniqueKey)
                    "
                    tag="span"
                  >
                    <template v-slot="{ minutes, seconds }">
                      {{
                        item.isActive
                          ? `${minutes}:${seconds}`
                          : `${item.time2}`
                      }}
                    </template>
                  </Countdown>
                  <span v-else>00:00</span>
                </div>
              </div>
            </div>
            <div class="circle-btn" @click="editTime(item)">修改</div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
    <span class="custom-swiper-button-next" @click="goNext"></span>
  </div>
</template>

<script setup>
import {
  ref,
  watch,
  defineExpose,
  onUnmounted,
  onMounted,
  nextTick,
} from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { Navigation } from "swiper/modules";
import "swiper/css/navigation";
import Countdown from "@chenfengyuan/vue-countdown";
import { ElMessage, ElMessageBox } from "element-plus";

// 基础配置
const modules = [Navigation];
const treatData = ref([]);
const swiperInstance = ref(null);
const countdownRefs = ref({});
const activeKey = ref("");
const isComponentMounted = ref(false);
// 记录剩余时间、渲染key
const remainingTimeMap = ref({});
const renderKeyMap = ref({});

onMounted(() => {
  isComponentMounted.value = true;
});

// Props定义（核心新增isTreating）
const props = defineProps({
  swiperData: {
    type: Array,
    required: true,
    default: () => [],
  },
  activeIndex: {
    type: Number,
    default: -1,
  },
  isTreating: {
    // 核心开关：是否允许启动倒计时
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "swiperChange",
  "detailSelectOne",
  "updateSwiperData",
  "countdownEnd",
  "pauseEdit",
]);

// 生成唯一标识
const getUniqueKey = (item) => `${item.name}-${item.point}`;

// 绑定Countdown实例
const setCountdownRef = (el, key) => {
  if (el) {
    countdownRefs.value[key] = el;
    if (remainingTimeMap.value[key] === undefined)
      remainingTimeMap.value[key] = 0;
    if (!renderKeyMap.value[key]) renderKeyMap.value[key] = 1;
  } else {
    if (countdownRefs.value[key]) {
      countdownRefs.value[key].abort();
      delete countdownRefs.value[key];
    }
  }
};

// 格式化slot props
const transformSlotProps = (props) => {
  const formatted = {};
  Object.entries(props).forEach(([key, value]) => {
    if (["minutes", "seconds"].includes(key)) {
      formatted[key] = value < 10 ? `0${value}` : String(value);
    } else {
      formatted[key] = value;
    }
  });
  return formatted;
};

// 格式化数据
// 子组件 TreatSwiper 中修改时长计算逻辑
const formatData = (data, activeIndex) => {
  return data.map((item, index) => {
    // 确保time是数字，且默认60秒（1分钟）
    const timeNum = parseInt(item.time) || 60;
    const uniqueKey = getUniqueKey(item);
    const hasValidTime = timeNum > 0;
    const totalTimeMs = hasValidTime ? timeNum * 1000 : 0; // 秒×1000

    return {
      ...item,
      uniqueKey,
      // 显示格式：1分钟=60秒 → 00:60:00 / 01:00（可选优化）
      time1: hasValidTime
        ? `00:${timeNum.toString().padStart(2, "0")}:00`
        : "00:00:00",
      time2: hasValidTime
        ? `${Math.floor(timeNum / 60)
            .toString()
            .padStart(2, "0")}:${(timeNum % 60).toString().padStart(2, "0")}`
        : "00:00",
      countdownTime: totalTimeMs,
      useTime: remainingTimeMap.value[uniqueKey] || totalTimeMs,
      renderKey: renderKeyMap.value[uniqueKey] || 1,
      isActive: index === activeIndex,
      status: "idle",
      hasValidTime,
    };
  });
};

// 处理progress事件
const handleCountdownProgress = (data, uniqueKey) => {
  remainingTimeMap.value[uniqueKey] = data.totalMilliseconds;
};

// 启动倒计时（核心拦截：非治疗中/索引无效直接返回）
const startCountdown = (targetIndex) => {
  // 双重拦截：治疗未开始 或 索引无效 → 不启动
  if (!props.isTreating || targetIndex === -1) return;
  if (!isComponentMounted.value) return;

  const allItems = treatData.value.flat();
  const index =
    typeof targetIndex === "number" ? targetIndex : props.activeIndex;
  const targetItem = allItems[index];

  if (
    !targetItem ||
    !targetItem.hasValidTime ||
    targetItem.status === "ended"
  ) {
    if (targetItem) {
      if (targetItem.status === "ended") {
        ElMessage.info(`${targetItem.name} 已完成，无需重复启动`);
      } else {
        ElMessage.warning(`${targetItem.name} 时长为0，无法启动倒计时`);
      }
    }
    return;
  }

  // 停止当前激活的倒计时
  if (activeKey.value && countdownRefs.value[activeKey.value]) {
    countdownRefs.value[activeKey.value].abort();
  }

  // 启动新倒计时
  nextTick(() => {
    const instance = countdownRefs.value[targetItem.uniqueKey];
    if (instance) {
      if (remainingTimeMap.value[targetItem.uniqueKey] === 0) {
        remainingTimeMap.value[targetItem.uniqueKey] = targetItem.countdownTime;
      }
      instance.start();
      targetItem.status = "running";
      activeKey.value = targetItem.uniqueKey;

      // 更新激活状态
      allItems.forEach((item) => {
        item.isActive = item.uniqueKey === targetItem.uniqueKey;
        if (!item.isActive) item.status = "idle";
      });
    }
  });
};

// 暂停倒计时
const pauseCountdown = () => {
  if (!activeKey.value || !countdownRefs.value[activeKey.value]) {
    // ElMessage.warning("暂无运行中的倒计时");
    return;
  }

  const instance = countdownRefs.value[activeKey.value];
  const targetItem = treatData.value
    .flat()
    .find((item) => item.uniqueKey === activeKey.value);

  if (targetItem && instance && targetItem.status === "running") {
    const currentRemaining = remainingTimeMap.value[activeKey.value];

    instance.abort();
    targetItem.status = "paused"; // 关键：暂停时设为 paused

    const remainingMinutes = Math.floor(currentRemaining / 60000);
    const remainingSeconds = Math.floor((currentRemaining % 60000) / 1000);
  } else {
    ElMessage.warning("当前无运行中的倒计时可暂停");
  }
};

// 继续倒计时（优化剩余时长逻辑）
const resumeCountdown = () => {
  if (
    !activeKey.value ||
    !countdownRefs.value[activeKey.value] ||
    !props.isTreating
  ) {
    ElMessage.warning("暂无暂停的倒计时可继续");
    return;
  }

  const targetItem = treatData.value
    .flat()
    .find((item) => item.uniqueKey === activeKey.value);
  const currentRemaining = remainingTimeMap.value[activeKey.value];

  if (targetItem) {
    if (targetItem.status === "paused") {
      if (currentRemaining > 100) {
        // 恢复剩余时长
        targetItem.useTime = currentRemaining;
        renderKeyMap.value[activeKey.value] += 1;
        targetItem.renderKey = renderKeyMap.value[activeKey.value];

        nextTick(() => {
          const newInstance = countdownRefs.value[activeKey.value];
          if (newInstance) {
            newInstance.start();
            targetItem.status = "running"; // 关键：继续时恢复为 running
          }
        });
      } else {
        ElMessage.warning("剩余时长不足1秒，无法继续");
        remainingTimeMap.value[activeKey.value] = 0;
      }
    } else if (targetItem.status === "running") {
      ElMessage.info("倒计时正在运行中");
    } else {
      ElMessage.warning("无法继续，倒计时已结束或未启动");
    }
  }
};
// 停止所有倒计时
const stopCountdown = () => {
  // 终止所有Countdown实例
  Object.keys(countdownRefs.value).forEach((key) => {
    if (countdownRefs.value[key]) {
      countdownRefs.value[key].abort();
    }
  });

  // 重置所有状态
  if (activeKey.value) {
    remainingTimeMap.value[activeKey.value] = 0;
    activeKey.value = "";
  }

  treatData.value.flat().forEach((item) => {
    item.status = "idle";
    item.isActive = false;
    renderKeyMap.value[item.uniqueKey] = 1;
    remainingTimeMap.value[item.uniqueKey] = 0;
    item.useTime = item.countdownTime;
    item.renderKey = 1;
  });

  // ElMessage.info("倒计时已重置");
};

// 倒计时启动事件
const handleCountdownStart = (item) => {
  item.status = "running";
};

// 倒计时结束事件
// TreatSwiper.vue 中的 handleCountdownEnd 方法
const handleCountdownEnd = (item) => {
  if (item.status !== "running") return;
  item.status = "ended"; // 关键：结束后设为 ended

  // item.isActive = false;
  remainingTimeMap.value[item.uniqueKey] = 0;
  activeKey.value = "";
  emit("countdownEnd", item);
  ElMessage.success(`${item.point} 倒计时已结束`);
};

// 监听swiperData变化（新增治疗状态判断）
watch(
  () => props.swiperData,
  (newVal) => {
    if (!newVal.length) return;
    const formatted = formatData(newVal, props.activeIndex);
    treatData.value = [
      formatted.filter((item) => item.type === 0),
      formatted.filter((item) => item.type === 1),
    ];

    // 仅治疗中且索引有效时才启动
    if (
      isComponentMounted.value &&
      props.isTreating &&
      props.activeIndex > -1
    ) {
      nextTick(() => {
        const targetItem = treatData.value.flat()[props.activeIndex];
        if (targetItem && targetItem.hasValidTime) {
          startCountdown(props.activeIndex);
        }
      });
    }
  },
  { immediate: true, deep: true }
);

// 监听activeIndex变化（新增治疗状态判断）
watch(
  () => props.activeIndex,
  (newIndex) => {
    // 仅治疗中且索引有效时才启动
    if (isComponentMounted.value && props.isTreating && newIndex > -1) {
      nextTick(() => {
        const targetItem = treatData.value.flat()[newIndex];
        if (targetItem && targetItem.hasValidTime) {
          startCountdown(newIndex);
        }
      });
    } else if (newIndex === -1) {
      // 索引为-1时停止当前倒计时
      if (activeKey.value && countdownRefs.value[activeKey.value]) {
        countdownRefs.value[activeKey.value].abort();
      }
    }
  },
  { immediate: true }
);

// 监听治疗状态变化
watch(
  () => props.isTreating,
  (newVal) => {
    if (!newVal) {
      // 关闭治疗状态时停止所有倒计时
      stopCountdown();
    }
  }
);

// Swiper实例回调
const onSwiper = (swiper) => {
  swiperInstance.value = swiper;
};

// Swiper滑动事件
const onSlideChange = (swiper) => {
  emit("swiperChange", swiper.activeIndex);
};

// 上一页
const goPrev = () => {
  if (swiperInstance.value && swiperInstance.value.activeIndex > 0) {
    swiperInstance.value.slidePrev();
  }
};

// 下一页
const goNext = () => {
  if (
    swiperInstance.value &&
    swiperInstance.value.activeIndex < treatData.value.length - 1
  ) {
    swiperInstance.value.slideNext();
  }
};

// 修改时长
// 修改时长方法（完整修复版）
const editTime = (item) => {
  // 1. 暂停当前倒计时（保留原逻辑）
  emit("pauseEdit", item);

  // 2. 保存修改前的关键状态（核心新增）
  const originalTime = item.time; // 原始时长（分钟）
  const originalRemainingTime = remainingTimeMap.value[item.uniqueKey]; // 原始剩余时长（毫秒）
  const originalStatus = item.status; // 原始状态（running/paused/idle）

  ElMessageBox.prompt("请输入时长（单位：分钟）", "修改倒计时时长", {
    inputPattern: /^\d+$/,
    inputErrorMessage: "请输入有效的正整数",
    inputValue: item.time || "0",
    confirmButtonText: "确认",
    cancelButtonText: "取消",
  })
    .then(({ value }) => {
      const newTime = parseInt(value.trim()) || 0;
      const newTimeMs = newTime * 60 * 1000;

      // 3. 确认修改：更新数据 + 用新时长重置倒计时
      // 通知父组件更新数据
      const newSwiperData = props.swiperData.map((d) =>
        d.name === item.name && d.point === item.point
          ? { ...d, time: newTime }
          : d
      );
      emit("updateSwiperData", newSwiperData);

      // 更新本地数据（用新时长重置）
      item.time = newTime;
      item.countdownTime = newTimeMs;
      item.time1 =
        newTime > 0
          ? `00:${newTime.toString().padStart(2, "0")}:00`
          : "00:00:00";
      item.time2 =
        newTime > 0 ? `${newTime.toString().padStart(2, "0")}:00` : "00:00";
      item.hasValidTime = newTime > 0;

      // 重置剩余时长为新时长
      remainingTimeMap.value[item.uniqueKey] = newTimeMs;
      renderKeyMap.value[item.uniqueKey] += 1;
      item.renderKey = renderKeyMap.value[item.uniqueKey];
      item.useTime = newTimeMs;

      // 4. 重新启动倒计时（如果治疗仍在进行）
      if (props.isTreating && newTime > 0) {
        nextTick(() => {
          const newInstance = countdownRefs.value[item.uniqueKey];
          if (newInstance) {
            newInstance.abort(); // 终止旧实例
            newInstance.start(); // 启动新时长的倒计时
          }
          item.status = "running";
          activeKey.value = item.uniqueKey;
        });
      }

      ElMessage.success(`已将${item.name}时长修改为 ${newTime} 分钟`);
    })
    .catch(() => {
      // 5. 取消修改：恢复原始状态 + 继续原剩余时长的倒计时
      // 恢复原始剩余时长
      remainingTimeMap.value[item.uniqueKey] = originalRemainingTime;
      item.useTime = originalRemainingTime || item.countdownTime;
      renderKeyMap.value[item.uniqueKey] += 1;
      item.renderKey = renderKeyMap.value[item.uniqueKey];

      // 恢复原始状态并继续计时（仅当治疗仍在进行且有剩余时长时）
      if (props.isTreating && originalRemainingTime > 0) {
        nextTick(() => {
          const instance = countdownRefs.value[item.uniqueKey];
          if (instance) {
            instance.abort();
            instance.start(); // 基于原剩余时长继续计时
          }
          item.status = originalStatus === "running" ? "running" : "paused";
          if (originalStatus === "running") {
            activeKey.value = item.uniqueKey;
          }
        });
      }

      ElMessage.info("已取消修改时长");
    });
};
// 点击item回调
const detailIconClick = (item) => {
  emit("detailSelectOne", item);
  localStorage.setItem("oneItem", JSON.stringify(item));
};

// 暴露给父组件的方法
defineExpose({
  startCountdown,
  pauseCountdown,
  resumeCountdown,
  stopCountdown,
  treatData,
  swiperInstance,
});

// 组件卸载清理
onUnmounted(() => {
  stopCountdown();
  countdownRefs.value = {};
  remainingTimeMap.value = {};
  renderKeyMap.value = {};
});
</script>

<style scoped lang="scss">
.swiper-main {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 5px;
  position: relative;
}

.home-swiper {
  box-sizing: border-box;
  width: calc(100% - 8vh);
  height: 100%;
  color: #ffffff;
  font-size: 16px;

  :deep(.swiper-button-prev),
  :deep(.swiper-button-next) {
    display: none !important;
  }

  :deep(.swiper-wrapper) {
    box-sizing: border-box;
    height: 100%;
  }

  :deep(.swiper-slide) {
    width: 100% !important;
    height: 100%;
    box-sizing: border-box;
  }
}

.page-slide {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
}

.swiper-item {
  flex: 1;
  max-width: 32%;
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  .swiper-item-title {
    width: 100%;
    height: 6vh;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background-color: #693e9c;
    border-radius: 12px;

    .swiper-item-name {
      font-size: 20px;
      width: 50%;
      height: 5vh;
      line-height: 5vh;
      border-right: 2px solid #ffffff;
      text-align: center;
    }

    .swiper-item-point {
      font-size: 20px;
      width: 50%;
      margin: 0 auto;
      text-align: center;
      word-wrap: break-word;
      white-space: normal;
    }
  }

  .swiper-item-time {
    width: 100%;
    line-height: 5vh;
    text-align: center;
    height: 5vh;
    color: #693e9c;
    font-size: 20px;
  }

  .swiper-item-circle {
    width: 100%;
    height: 60%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 5vh;

    .circle-bg {
      width: 20vh;
      height: 20vh;
      background: url("/src/assets/pic/round.png") no-repeat center center;
      background-size: 100% 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      .circle-content {
        width: 14vh;
        height: 14vh;
        position: relative;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        // border: 1px solid red;
        position: relative;

        .light-border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          border: 4px solid #58c08d;
          width: 8vh;
          height: 8vh;
          margin: auto;
          animation: blink 1.5s infinite ease-in-out;
        }
        .light-border-red {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          border: 4px solid rgba(222, 43, 31, 0.8);
          width: 8vh;
          height: 8vh;
          margin: auto;
        }

        @keyframes blink {
          0% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
        }

        &::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 16px solid #c69cd7;
          border-radius: 50%;
          padding: 20px;
          box-sizing: border-box;
          box-shadow: 0 0 10px rgba(198, 156, 215, 0.5);
        }
      }

      .circle-text {
        width: 9vh;
        height: 9vh;
        line-height: 9vh;
        text-align: center;
        background: #6c359d;
        border-radius: 50%;
        font-size: 24px;
        font-weight: bold;
        color: #ffffff;
      }
    }

    .circle-btn {
      width: 100%;
      height: 5vh;
      line-height: 5vh;
      text-align: center;
      color: #6c359d;
      font-size: 20px;
      cursor: pointer;
    }
  }
}

.custom-swiper-button-prev,
.custom-swiper-button-next {
  z-index: 99;
  width: 7vh;
  height: 7vh;
  cursor: pointer;
  flex-shrink: 0;
}

.custom-swiper-button-next {
  background: url("@/assets/pic/next.png") no-repeat center center;
  background-size: 100% 100%;
}

.custom-swiper-button-prev {
  background: url("@/assets/pic/prev.png") no-repeat center center;
  background-size: 100% 100%;
}
</style>

<style lang="scss">
// 全局样式（消息提示美化）
.custom-message {
  &.el-message--success {
    background-color: rgba(105, 62, 156, 0.1) !important;
    border-left-color: #693e9c !important;

    .el-message__content {
      color: #693e9c !important;
    }

    .el-icon-success {
      color: #693e9c !important;
    }
  }

  &.el-message--info {
    background-color: rgba(105, 62, 156, 0.08) !important;
    border-left-color: #693e9c !important;

    .el-message__content {
      color: #693e9c !important;
    }

    .el-icon-info {
      color: #693e9c !important;
    }
  }
}

.el-message-box {
  .el-message-box__title {
    color: #693e9c !important;
    font-weight: 600;
  }

  .el-message-box__btns .el-button--primary {
    background-color: #693e9c !important;
    border-color: #693e9c !important;

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

  .el-message-box__input {
    .el-input__wrapper {
      border: 1px solid #693e9c !important;
      box-shadow: 0 0 0 1px rgba(105, 62, 156, 0.1) !important;

      &:hover {
        border-color: #7c4eb5 !important;
        box-shadow: 0 0 0 1px rgba(124, 78, 181, 0.2) !important;
      }

      &.is-focus {
        border-color: #693e9c !important;
        box-shadow: 0 0 0 2px rgba(105, 62, 156, 0.2) !important;
      }
    }

    .el-input__inner {
      color: #693e9c !important;
      font-size: 16px !important;
      padding: 8px 12px !important;

      &::placeholder {
        color: rgba(105, 62, 156, 0.5) !important;
        font-size: 15px !important;
      }
    }

    .el-input__error {
      color: #693e9c !important;
      margin-top: 4px;
      font-size: 14px !important;
    }
  }
}
</style>
