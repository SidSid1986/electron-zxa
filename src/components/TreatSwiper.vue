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
        :key="`page-${pageIndex}`"
      >
        <div
          class="swiper-item"
          v-for="(item, itemIndex) in pageData"
          :key="item.uniqueKey"
          @click="detailIconClick(item, itemIndex)"
        >
          <div class="swiper-item-title">
            <div class="swiper-item-name">{{ item.chooseName }}</div>
            <div class="swiper-item-point">{{ item.point }}</div>
          </div>
          <div class="swiper-item-time">时长:{{ item.time1 }}</div>
          <div class="swiper-item-circle">
            <div class="circle-bg">
              <div class="circle-content">
                <!-- 运行中：白圈 -->
                <div
                  v-if="item.isActive && item.status === 'running'"
                  class="light-border"
                ></div>
                <!-- 暂停/结束：红圈（ 恢复暂停状态的红圈） -->
                <div
                  v-if="
                    item.isActive && (item.status === 'paused' || item.status === 'ended')
                  "
                  class="light-border-red"
                ></div>
                <div class="circle-text">
                  <span>
                    {{ formatTime(item.remainingSeconds) }}
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

    <el-dialog v-model="durationDialogVisible" title="修改倒计时时长" width="500px">
      <el-input
        v-model="durationInputValue"
        :placeholder="`请输入${isDemoMode ? '秒数' : '分钟数'}`"
        @click.stop
        keyboard="true"
        data-mode="num"
      />
      <template #footer>
        <el-button @click="durationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDurationConfirm">确定</el-button>
      </template>

      <VirtualKeyboard />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, onMounted, nextTick } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { Navigation } from "swiper/modules";
import "swiper/css/navigation";
import { ElMessage, ElMessageBox } from "element-plus";
import VirtualKeyboard from "@/components/VirtualKeyboard.vue";

const modules = [Navigation];
const treatData = ref([]);
const swiperInstance = ref(null);
const isComponentMounted = ref(false);
const countdownTimers = ref({});
const remainingSecondsMap = ref({});

const durationDialogVisible = ref(false); // Dialog显隐
const durationInputValue = ref(""); // 输入框值
const currentEditItem = ref(null); // 当前修改的item（仅存储，无复杂逻辑）
const isDemoMode = computed(() => props.isDemoMode);

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
  isDemoMode: {
    // 接收演示模式状态
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

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

//  格式化数据：完全使用传入的time1/time2，不重新计算
const formatData = (data, activeIndex) => {
  return data.map((item, index) => {
    const timeNum = parseInt(item.time) || 60;
    const uniqueKey = item.uniqueId || `${item.name}-${item.point}`;
    const hasValidTime = timeNum > 0;

    //  使用props传入的time1/time2（修改后的值），
    const time1 = item.time1 || `00:01:00`; // 默认1分钟
    const time2 = item.time2 || `01:00`; // 默认1分钟

    // 初始化剩余秒数（ 用已存在的，避免覆盖修改后的值）
    if (!remainingSecondsMap.value[uniqueKey]) {
      remainingSecondsMap.value[uniqueKey] = timeNum;
    }

    return {
      ...item,
      uniqueKey,
      time1: time1,
      time2: time2,
      totalSeconds: timeNum,
      remainingSeconds: remainingSecondsMap.value[uniqueKey],
      isActive: index === activeIndex,
      status: index === activeIndex ? "paused" : "idle",
      hasValidTime,
    };
  });
};

// 分页
const groupByPageSize = (data, pageSize = 3) => {
  const pages = [];
  for (let i = 0; i < data.length; i += pageSize) {
    pages.push(data.slice(i, i + pageSize));
  }
  return pages;
};

// 启动倒计时
const startCountdown = (targetIndex) => {
  if (!props.isTreating || targetIndex === -1) return;
  const allItems = treatData.value.flat();
  const targetItem = allItems[targetIndex];

  if (!targetItem || !targetItem.hasValidTime || targetItem.status === "ended") {
    return;
  }

  // 1. 停止所有其他定时器
  Object.keys(countdownTimers.value).forEach((key) => {
    clearInterval(countdownTimers.value[key]);
    delete countdownTimers.value[key];
  });

  // 2. 重置所有穴位状态（
  allItems.forEach((item) => {
    if (item.uniqueKey === targetItem.uniqueKey) {
      item.status = "running"; // 运行中 绿圈
      item.isActive = true;
    } else {
      item.status = "idle";
      item.isActive = false;
    }
  });

  // 3. 初始化剩余时间（用总时长）
  if (targetItem.remainingSeconds <= 0) {
    targetItem.remainingSeconds = targetItem.totalSeconds;
    remainingSecondsMap.value[targetItem.uniqueKey] = targetItem.totalSeconds;
  }

  // 4. 启动定时器
  countdownTimers.value[targetItem.uniqueKey] = setInterval(() => {
    if (!isComponentMounted.value || !props.isTreating) {
      clearInterval(countdownTimers.value[targetItem.uniqueKey]);
      delete countdownTimers.value[targetItem.uniqueKey];
      targetItem.status = "paused"; // 暂停  红圈
      return;
    }

    remainingSecondsMap.value[targetItem.uniqueKey] -= 1;
    targetItem.remainingSeconds = remainingSecondsMap.value[targetItem.uniqueKey];

    if (targetItem.remainingSeconds <= 0) {
      clearInterval(countdownTimers.value[targetItem.uniqueKey]);
      delete countdownTimers.value[targetItem.uniqueKey];
      targetItem.status = "ended"; // 结束 红圈
      targetItem.remainingSeconds = 0;
      setTimeout(() => {
        emit("countdownEnd", targetItem);
      }, 100);
    }
  }, 1000);
};

// 暂停倒计时（保留剩余时间）
const pauseCountdown = () => {
  const activeKey = Object.keys(countdownTimers.value)[0];
  if (!activeKey) return;

  clearInterval(countdownTimers.value[activeKey]);
  delete countdownTimers.value[activeKey];

  const targetItem = treatData.value.flat().find((item) => item.uniqueKey === activeKey);
  if (targetItem) {
    targetItem.status = "paused"; // 标记暂停
  }
};

// 继续倒计时（ 找到暂停状态的激活项）
const resumeCountdown = () => {
  const allItems = treatData.value.flat();
  // 精准找到：激活+暂停状态的穴位
  const activeItem = allItems.find((item) => item.isActive && item.status === "paused");

  if (!activeItem) {
    ElMessage.warning("暂无暂停的倒计时可继续");
    return;
  }

  if (activeItem.remainingSeconds <= 0) {
    ElMessage.warning("剩余时长不足1秒，无法继续");
    return;
  }

  // 启动倒计时（用修改后的剩余时间）
  activeItem.status = "running";
  countdownTimers.value[activeItem.uniqueKey] = setInterval(() => {
    if (!isComponentMounted.value || !props.isTreating) {
      clearInterval(countdownTimers.value[activeItem.uniqueKey]);
      delete countdownTimers.value[activeItem.uniqueKey];
      return;
    }

    remainingSecondsMap.value[activeItem.uniqueKey] -= 1;
    activeItem.remainingSeconds = remainingSecondsMap.value[activeItem.uniqueKey];

    if (activeItem.remainingSeconds <= 0) {
      clearInterval(countdownTimers.value[activeItem.uniqueKey]);
      delete countdownTimers.value[activeItem.uniqueKey];
      activeItem.status = "ended";
      activeItem.remainingSeconds = 0;
      setTimeout(() => {
        emit("countdownEnd", activeItem);
      }, 100);
    }
  }, 1000);
  ElMessage.info("倒计时已恢复");
};

// 停止所有倒计时
const stopCountdown = () => {
  Object.keys(countdownTimers.value).forEach((key) => {
    clearInterval(countdownTimers.value[key]);
    delete countdownTimers.value[key];
  });
  treatData.value.flat().forEach((item) => {
    item.status = "idle";
    item.isActive = false;
    item.remainingSeconds = item.totalSeconds;
    remainingSecondsMap.value[item.uniqueKey] = item.totalSeconds;
  });
};

//  修改时长方法：输入分钟，转换为秒
const editTime = (item) => {
  emit("pauseEdit", item);
  pauseCountdown();

  // 1. 存储当前item（和原逻辑一致）
  currentEditItem.value = item;
  // 2. 初始化输入值（和原逻辑完全一致）
  durationInputValue.value = isDemoMode.value
    ? (item.time || 60).toString()
    : Math.floor((item.time || 60) / 60).toString();
  // 3. 打开Dialog（替代原ElMessageBox）
  durationDialogVisible.value = true;
};

const handleDurationConfirm = () => {
  const inputVal =
    parseInt(durationInputValue.value.trim()) || (isDemoMode.value ? 8 : 1);
  const newTimeInSeconds = isDemoMode.value ? inputVal : inputVal * 60;

  const minutes = Math.floor(newTimeInSeconds / 60);
  const seconds = newTimeInSeconds % 60;
  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = seconds.toString().padStart(2, "0");
  const newTime1 = `00:${minutesStr}:${secondsStr}`;
  const newTime2 = `${minutesStr}:${secondsStr}`;

  const newSwiperData = JSON.parse(JSON.stringify(props.swiperData)).map((d) => {
    if (d.uniqueKey === currentEditItem.value.uniqueKey) {
      return {
        ...d,
        time: newTimeInSeconds,
        time1: newTime1,
        time2: newTime2,
        totalSeconds: newTimeInSeconds,
        remainingSeconds: newTimeInSeconds,
      };
    }
    return d;
  });
  emit("updateSwiperData", newSwiperData);

  nextTick(() => {
    const formatted = formatData(newSwiperData, props.activeIndex);
    treatData.value = groupByPageSize(formatted, 3);

    const targetItem = treatData.value
      .flat()
      .find((i) => i.uniqueKey === currentEditItem.value.uniqueKey);
    if (targetItem) {
      targetItem.time = newTimeInSeconds;
      targetItem.totalSeconds = newTimeInSeconds;
      targetItem.time1 = newTime1;
      targetItem.time2 = newTime2;
      targetItem.remainingSeconds = newTimeInSeconds;
      targetItem.status = "paused";
      targetItem.isActive = true;
      remainingSecondsMap.value[targetItem.uniqueKey] = newTimeInSeconds;
    }
  });

  const tipText = isDemoMode.value
    ? `已将${currentEditItem.value.point}时长修改为 ${inputVal} 秒`
    : `已将${currentEditItem.value.point}时长修改为 ${inputVal} 分钟（${newTimeInSeconds} 秒）`;
  ElMessage.success(tipText);

  // 关闭Dialog
  durationDialogVisible.value = false;
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

//  监听swiperData时强制刷新（deep+immediate）
watch(
  () => props.swiperData,
  (newVal) => {
    if (!newVal.length) return;
    // 每次数据变化都重新格式化+分页，确保DOM刷新
    const formatted = formatData(newVal, props.activeIndex);
    treatData.value = groupByPageSize(formatted, 3);
  },
  { immediate: true, deep: true }
);

// 监听激活索引（仅更新状态，不自动启动）
watch(
  () => props.activeIndex,
  (newIndex) => {
    if (newIndex === -1) {
      stopCountdown();
      return;
    }
    //  标记激活状态，不启动倒计时
    const allItems = treatData.value.flat();
    allItems.forEach((item, idx) => {
      item.isActive = idx === newIndex;
      if (item.isActive && item.status === "idle") {
        item.status = "paused"; // 激活项默认暂停
      }
    });
  },
  { immediate: true }
);

onMounted(() => {
  isComponentMounted.value = true;
});

onUnmounted(() => {
  Object.keys(countdownTimers.value).forEach((key) => {
    clearInterval(countdownTimers.value[key]);
  });
  countdownTimers.value = {};
  remainingSecondsMap.value = {};
});

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
