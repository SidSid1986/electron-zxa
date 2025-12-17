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
        :key="`page-${pageIndex}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`"
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
                <div
                  v-if="item.isActive && item.status === 'running'"
                  class="light-border"
                ></div>
                <div
                  v-if="
                    item.isActive &&
                    (item.status === 'ended' || item.status === 'paused')
                  "
                  class="light-border-red"
                ></div>
                <div class="circle-text">
                  <!-- 🔥 替换为手动倒计时显示 -->
                  <span v-if="item.isActive && item.status === 'running'">
                    {{ formatTime(item.remainingSeconds) }}
                  </span>
                  <span v-else>
                    {{ item.time2 }}
                  </span>
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
import { ref, watch, onUnmounted, onMounted, nextTick } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { Navigation } from "swiper/modules";
import "swiper/css/navigation";
import { ElMessage, ElMessageBox } from "element-plus";

// 基础配置
const modules = [Navigation];
const treatData = ref([]);
const swiperInstance = ref(null);
const isComponentMounted = ref(false);

// 手动倒计时核心状态
const countdownTimers = ref({}); // 存储每个穴位的定时器 { uniqueKey: intervalId }
const remainingSecondsMap = ref({}); // 存储每个穴位的剩余秒数 { uniqueKey: number }

// Props定义
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

// 格式化时间为 00:00 格式
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

// 格式化数据（新增remainingSeconds字段）
const formatData = (data, activeIndex) => {
  return data.map((item, index) => {
    const timeNum = parseInt(item.time) || 60; // 单位：秒
    const uniqueKey = item.uniqueId || `${item.name}-${item.point}`;
    const hasValidTime = timeNum > 0;

    // 秒数转 分:秒
    const minutes = Math.floor(timeNum / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timeNum % 60).toString().padStart(2, "0");

    // 初始化剩余秒数
    remainingSecondsMap.value[uniqueKey] = timeNum;

    return {
      ...item,
      uniqueKey,
      time1: hasValidTime ? `00:${minutes}:${seconds}` : "00:00:00",
      time2: hasValidTime ? `${minutes}:${seconds}` : "00:00",
      totalSeconds: timeNum,
      remainingSeconds: remainingSecondsMap.value[uniqueKey],
      isActive: index === activeIndex,
      status: "idle",
      hasValidTime,
      renderKey: 1,
    };
  });
};

// 按数量分页
const groupByPageSize = (data, pageSize = 3) => {
  const pages = [];
  for (let i = 0; i < data.length; i += pageSize) {
    pages.push(data.slice(i, i + pageSize));
  }
  return pages;
};

// 🔥 手动启动倒计时
const startCountdown = (targetIndex) => {
  if (!props.isTreating || targetIndex === -1) return;
  if (!isComponentMounted.value) return;

  const allItems = treatData.value.flat();
  const targetItem = allItems[targetIndex];

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

  // 停止当前所有倒计时
  Object.keys(countdownTimers.value).forEach((key) => {
    clearInterval(countdownTimers.value[key]);
    delete countdownTimers.value[key];
  });

  // 重置目标穴位状态
  targetItem.status = "running";
  targetItem.isActive = true;
  remainingSecondsMap.value[targetItem.uniqueKey] = targetItem.totalSeconds;
  targetItem.remainingSeconds = remainingSecondsMap.value[targetItem.uniqueKey];

  // 重置其他穴位状态
  allItems.forEach((item) => {
    if (item.uniqueKey !== targetItem.uniqueKey) {
      item.isActive = false;
      item.status = "idle";
    }
  });

  // 启动手动倒计时
  countdownTimers.value[targetItem.uniqueKey] = setInterval(() => {
    // 确保组件已挂载且治疗中
    if (!isComponentMounted.value || !props.isTreating) {
      clearInterval(countdownTimers.value[targetItem.uniqueKey]);
      delete countdownTimers.value[targetItem.uniqueKey];
      return;
    }

    // 剩余秒数减1
    remainingSecondsMap.value[targetItem.uniqueKey] -= 1;
    targetItem.remainingSeconds =
      remainingSecondsMap.value[targetItem.uniqueKey];

    // 倒计时结束
    if (remainingSecondsMap.value[targetItem.uniqueKey] <= 0) {
      clearInterval(countdownTimers.value[targetItem.uniqueKey]);
      delete countdownTimers.value[targetItem.uniqueKey];

      targetItem.status = "ended";
      targetItem.remainingSeconds = 0;

      // 延迟触发父组件事件
      setTimeout(() => {
        emit("countdownEnd", targetItem);
        ElMessage.success(`${targetItem.point} 倒计时已结束`);
      }, 100);
    }
  }, 1000); // 精准1秒触发，无丢帧
};

// 🔥 手动暂停倒计时
const pauseCountdown = () => {
  const activeKey = Object.keys(countdownTimers.value)[0];
  if (!activeKey) return;

  // 清除定时器
  clearInterval(countdownTimers.value[activeKey]);
  delete countdownTimers.value[activeKey];

  // 更新状态
  const targetItem = treatData.value
    .flat()
    .find((item) => item.uniqueKey === activeKey);
  if (targetItem) {
    targetItem.status = "paused";
  }
};

// 🔥 手动继续倒计时
const resumeCountdown = () => {
  const allItems = treatData.value.flat();
  const activeItem = allItems.find(
    (item) => item.isActive && item.status === "paused"
  );

  if (!activeItem || !props.isTreating) {
    ElMessage.warning("暂无暂停的倒计时可继续");
    return;
  }

  if (activeItem.remainingSeconds <= 0) {
    ElMessage.warning("剩余时长不足1秒，无法继续");
    return;
  }

  // 重新启动倒计时
  activeItem.status = "running";
  countdownTimers.value[activeItem.uniqueKey] = setInterval(() => {
    if (!isComponentMounted.value || !props.isTreating) {
      clearInterval(countdownTimers.value[activeItem.uniqueKey]);
      delete countdownTimers.value[activeItem.uniqueKey];
      return;
    }

    remainingSecondsMap.value[activeItem.uniqueKey] -= 1;
    activeItem.remainingSeconds =
      remainingSecondsMap.value[activeItem.uniqueKey];

    if (remainingSecondsMap.value[activeItem.uniqueKey] <= 0) {
      clearInterval(countdownTimers.value[activeItem.uniqueKey]);
      delete countdownTimers.value[activeItem.uniqueKey];

      activeItem.status = "ended";
      activeItem.remainingSeconds = 0;

      setTimeout(() => {
        emit("countdownEnd", activeItem);
        ElMessage.success(`${activeItem.point} 倒计时已结束`);
      }, 100);
    }
  }, 1000);
};

// 停止所有倒计时
const stopCountdown = () => {
  // 清除所有定时器
  Object.keys(countdownTimers.value).forEach((key) => {
    clearInterval(countdownTimers.value[key]);
    delete countdownTimers.value[key];
  });

  // 重置状态
  treatData.value.flat().forEach((item) => {
    item.status = "idle";
    item.isActive = false;
    item.remainingSeconds = item.totalSeconds;
    remainingSecondsMap.value[item.uniqueKey] = item.totalSeconds;
    item.renderKey += 1;
  });
};

// 修改时长
const editTime = (item) => {
  emit("pauseEdit", item);

  // 暂停当前倒计时
  if (countdownTimers.value[item.uniqueKey]) {
    clearInterval(countdownTimers.value[item.uniqueKey]);
    delete countdownTimers.value[item.uniqueKey];
  }

  const originalTime = item.time;
  const originalRemaining = remainingSecondsMap.value[item.uniqueKey];
  const originalStatus = item.status;

  ElMessageBox.prompt("请输入时长（单位：秒）", "修改倒计时时长", {
    inputPattern: /^\d+$/,
    inputErrorMessage: "请输入有效的正整数",
    inputValue: item.time || "60",
    confirmButtonText: "确认",
    cancelButtonText: "取消",
  })
    .then(({ value }) => {
      const newTime = parseInt(value.trim()) || 60;
      const minutes = Math.floor(newTime / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (newTime % 60).toString().padStart(2, "0");

      // 通知父组件
      const newSwiperData = props.swiperData.map((d) =>
        d.uniqueKey === item.uniqueKey ? { ...d, time: newTime } : d
      );
      emit("updateSwiperData", newSwiperData);

      // 更新本地数据
      item.time = newTime;
      item.totalSeconds = newTime;
      item.time1 = `00:${minutes}:${seconds}`;
      item.time2 = `${minutes}:${seconds}`;
      remainingSecondsMap.value[item.uniqueKey] = newTime;
      item.remainingSeconds = newTime;
      item.renderKey += 1;

      // 重新启动倒计时
      if (props.isTreating && newTime > 0) {
        item.status = "running";
        countdownTimers.value[item.uniqueKey] = setInterval(() => {
          if (!isComponentMounted.value || !props.isTreating) return;

          remainingSecondsMap.value[item.uniqueKey] -= 1;
          item.remainingSeconds = remainingSecondsMap.value[item.uniqueKey];

          if (item.remainingSeconds <= 0) {
            clearInterval(countdownTimers.value[item.uniqueKey]);
            delete countdownTimers.value[item.uniqueKey];

            item.status = "ended";
            item.remainingSeconds = 0;

            setTimeout(() => {
              emit("countdownEnd", item);
              ElMessage.success(`${item.point} 倒计时已结束`);
            }, 100);
          }
        }, 1000);
      }

      ElMessage.success(`已将${item.name}时长修改为 ${newTime} 秒`);
    })
    .catch(() => {
      // 恢复原始状态
      remainingSecondsMap.value[item.uniqueKey] = originalRemaining;
      item.remainingSeconds = originalRemaining;
      item.renderKey += 1;

      // 恢复倒计时
      if (
        props.isTreating &&
        originalRemaining > 0 &&
        originalStatus === "running"
      ) {
        item.status = "running";
        countdownTimers.value[item.uniqueKey] = setInterval(() => {
          if (!isComponentMounted.value || !props.isTreating) return;

          remainingSecondsMap.value[item.uniqueKey] -= 1;
          item.remainingSeconds = remainingSecondsMap.value[item.uniqueKey];

          if (item.remainingSeconds <= 0) {
            clearInterval(countdownTimers.value[item.uniqueKey]);
            delete countdownTimers.value[item.uniqueKey];

            item.status = "ended";
            item.remainingSeconds = 0;

            setTimeout(() => {
              emit("countdownEnd", item);
              ElMessage.success(`${item.point} 倒计时已结束`);
            }, 100);
          }
        }, 1000);
      } else if (originalStatus === "paused") {
        item.status = "paused";
      }

      ElMessage.info("已取消修改时长");
    });
};

// 其他辅助方法
const detailIconClick = (item) => {
  emit("detailSelectOne", item);
  localStorage.setItem("oneItem", JSON.stringify(item));
};

const goPrev = () => {
  if (swiperInstance.value && swiperInstance.value.activeIndex > 0) {
    swiperInstance.value.slidePrev();
  }
};

const goNext = () => {
  if (
    swiperInstance.value &&
    swiperInstance.value.activeIndex < treatData.value.length - 1
  ) {
    swiperInstance.value.slideNext();
  }
};

const onSwiper = (swiper) => {
  swiperInstance.value = swiper;
};

const onSlideChange = (swiper) => {
  emit("swiperChange", swiper.activeIndex);
};

// 监听数据变化
watch(
  () => props.swiperData,
  (newVal) => {
    if (!newVal.length) return;
    const formatted = formatData(newVal, props.activeIndex);
    treatData.value = groupByPageSize(formatted, 3);

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

// 监听激活索引变化
watch(
  () => props.activeIndex,
  (newIndex) => {
    if (isComponentMounted.value && props.isTreating && newIndex > -1) {
      nextTick(() => {
        const targetItem = treatData.value.flat()[newIndex];
        if (targetItem && targetItem.hasValidTime) {
          startCountdown(newIndex);
        }
      });
    } else if (newIndex === -1) {
      stopCountdown();
    }
  },
  { immediate: true }
);

// 监听治疗状态变化
watch(
  () => props.isTreating,
  (newVal) => {
    if (!newVal) {
      stopCountdown();
    }
  }
);

// 组件生命周期
onMounted(() => {
  isComponentMounted.value = true;
});

onUnmounted(() => {
  // 清除所有定时器
  Object.keys(countdownTimers.value).forEach((key) => {
    clearInterval(countdownTimers.value[key]);
  });
  countdownTimers.value = {};
  remainingSecondsMap.value = {};
});

// 暴露方法给父组件
defineExpose({
  startCountdown,
  pauseCountdown,
  resumeCountdown,
  stopCountdown,
  treatData,
  swiperInstance,
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
      font-size: 16px;
      width: 50%;
      height: 5vh;
      line-height: 5vh;
      border-right: 2px solid #ffffff;
      text-align: center;
    }

    .swiper-item-point {
      font-size: 16px;
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
    font-size: 16px;
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
        font-size: 20px;
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
