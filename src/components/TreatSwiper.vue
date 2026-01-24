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
        <!-- 保留3个/页的布局，遍历当前页的分组项 -->
        <div
          class="swiper-item"
          v-for="(group, groupIndex) in pageData"
          :key="group.groupId"
          @click="detailIconClick(group, groupIndex)"
        >
          <div class="swiper-item-title">
            <div class="swiper-item-name">{{ group.chooseName }}</div>
            <!-- 显示分组内的所有穴位名称 -->
            <div class="swiper-item-point">
              {{ group.points.map(p => p.name).join(' / ') }}
            </div>
          </div>
          <!-- 显示分组的正确时长 -->
          <div class="swiper-item-time">时长:{{ group.time1 }}</div>
          <div class="swiper-item-circle">
            <div class="circle-bg">
              <div class="circle-content">
                <!-- 仅当前激活分组闪烁 -->
                <div
                  v-if="group.isActive && group.status === 'running'"
                  class="light-border"
                ></div>
                <div
                  v-if="
                    group.isActive && (group.status === 'paused' || group.status === 'ended')
                  "
                  class="light-border-red"
                ></div>
                <div class="circle-text">
                  <span>{{ formatTime(group.remainingSeconds) }}</span>
                </div>
              </div>
            </div>
            <div class="circle-btn" @click="editTime(group)">修改</div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
    <span class="custom-swiper-button-next" @click="goNext"></span>

    <el-dialog
      class="treat-dialog"
      v-model="durationDialogVisible"
      title="修改倒计时时长"
      width="500px"
    >
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
import { ref, watch, onUnmounted, onMounted, nextTick, computed } from "vue";
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

const durationDialogVisible = ref(false);
const durationInputValue = ref("");
const currentEditItem = ref(null);
const isDemoMode = computed(() => props.isDemoMode);

const props = defineProps({
  swiperData: { // 父组件传入的分组数组（悬停灸、往复灸）
    type: Array,
    required: true,
    default: () => [],
  },
  activeIndex: { // 父组件传入的「分组在当前页的索引」（0=悬停灸，1=往复灸）
    type: Number,
    default: -1,
  },
  isTreating: {
    type: Boolean,
    default: false,
  },
  isDemoMode: {
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

// 格式化时间（不变）
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

// 核心修改1：格式化分组数据（保留分组属性，适配3个/页）
const formatData = (groupList, activeIndex) => {
  if (!Array.isArray(groupList)) return [];

  return groupList.map((group, groupIndex) => {
    // 分组时长（秒）：悬停灸60，往复灸120
    const groupTime = parseInt(group.time) || 60;
    // 初始化剩余秒数（按分组ID存储）
    if (!remainingSecondsMap.value[group.groupId]) {
      remainingSecondsMap.value[group.groupId] = groupTime;
    }

    return {
      ...group,
      totalSeconds: groupTime,
      remainingSeconds: remainingSecondsMap.value[group.groupId],
      // 激活状态：仅匹配父组件传入的activeIndex
      isActive: groupIndex === activeIndex,
      status: groupIndex === activeIndex ? "paused" : "idle",
      hasValidTime: groupTime > 0,
    };
  });
};

// 核心修改2：恢复分页逻辑（3个分组/页）
const groupByPageSize = (data, pageSize = 3) => {
  const pages = [];
  for (let i = 0; i < data.length; i += pageSize) {
    pages.push(data.slice(i, i + pageSize));
  }
  return pages;
};

// 核心修改3：启动倒计时（按分组索引）
const startCountdown = (targetIndex) => {
  if (!props.isTreating || targetIndex === -1) return;
  
  // 平铺所有分组项，找到目标分组
  const allGroups = treatData.value.flat();
  const targetGroup = allGroups[targetIndex];
  
  if (!targetGroup || !targetGroup.hasValidTime || targetGroup.status === "ended") {
    return;
  }

  // 停止所有其他定时器
  Object.keys(countdownTimers.value).forEach((key) => {
    clearInterval(countdownTimers.value[key]);
    delete countdownTimers.value[key];
  });

  // 重置所有分组状态
  allGroups.forEach((group) => {
    if (group.groupId === targetGroup.groupId) {
      group.status = "running"; // 运行中-绿圈
      group.isActive = true;
    } else {
      group.status = "idle";
      group.isActive = false;
    }
  });

  // 初始化剩余时间
  if (targetGroup.remainingSeconds <= 0) {
    targetGroup.remainingSeconds = targetGroup.totalSeconds;
    remainingSecondsMap.value[targetGroup.groupId] = targetGroup.totalSeconds;
  }

  // 启动分组倒计时
  countdownTimers.value[targetGroup.groupId] = setInterval(() => {
    if (!isComponentMounted.value || !props.isTreating) {
      clearInterval(countdownTimers.value[targetGroup.groupId]);
      delete countdownTimers.value[targetGroup.groupId];
      targetGroup.status = "paused";
      return;
    }

    remainingSecondsMap.value[targetGroup.groupId] -= 1;
    targetGroup.remainingSeconds = remainingSecondsMap.value[targetGroup.groupId];

    if (targetGroup.remainingSeconds <= 0) {
      clearInterval(countdownTimers.value[targetGroup.groupId]);
      delete countdownTimers.value[targetGroup.groupId];
      targetGroup.status = "ended";
      targetGroup.remainingSeconds = 0;
      setTimeout(() => {
        emit("countdownEnd", targetGroup);
      }, 100);
    }
  }, 1000);
};

// 暂停倒计时（按分组）
const pauseCountdown = () => {
  const activeKey = Object.keys(countdownTimers.value)[0];
  if (!activeKey) return;

  clearInterval(countdownTimers.value[activeKey]);
  delete countdownTimers.value[activeKey];

  const allGroups = treatData.value.flat();
  const targetGroup = allGroups.find((group) => group.groupId === activeKey);
  if (targetGroup) {
    targetGroup.status = "paused";
  }
};

// 继续倒计时（按分组）
const resumeCountdown = () => {
  const allGroups = treatData.value.flat();
  const activeGroup = allGroups.find((group) => group.isActive && group.status === "paused");

  if (!activeGroup) {
    ElMessage.warning("暂无暂停的倒计时可继续");
    return;
  }

  if (activeGroup.remainingSeconds <= 0) {
    ElMessage.warning("剩余时长不足1秒，无法继续");
    return;
  }

  activeGroup.status = "running";
  countdownTimers.value[activeGroup.groupId] = setInterval(() => {
    if (!isComponentMounted.value || !props.isTreating) {
      clearInterval(countdownTimers.value[activeGroup.groupId]);
      delete countdownTimers.value[activeGroup.groupId];
      return;
    }

    remainingSecondsMap.value[activeGroup.groupId] -= 1;
    activeGroup.remainingSeconds = remainingSecondsMap.value[activeGroup.groupId];

    if (activeGroup.remainingSeconds <= 0) {
      clearInterval(countdownTimers.value[activeGroup.groupId]);
      delete countdownTimers.value[activeGroup.groupId];
      activeGroup.status = "ended";
      activeGroup.remainingSeconds = 0;
      setTimeout(() => {
        emit("countdownEnd", activeGroup);
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
  const allGroups = treatData.value.flat();
  allGroups.forEach((group) => {
    group.status = "idle";
    group.isActive = false;
    group.remainingSeconds = group.totalSeconds;
    remainingSecondsMap.value[group.groupId] = group.totalSeconds;
  });
};

// 修改时长（适配分组）
const editTime = (group) => {
  emit("pauseEdit", group);
  pauseCountdown();

  currentEditItem.value = group;
  durationInputValue.value = isDemoMode.value
    ? (group.time || 60).toString()
    : Math.floor((group.time || 60) / 60).toString();
  
  durationDialogVisible.value = true;
};

// 确认修改时长
const handleDurationConfirm = () => {
  const inputVal = parseInt(durationInputValue.value.trim()) || (isDemoMode.value ? 8 : 1);
  const newTimeInSeconds = isDemoMode.value ? inputVal : inputVal * 60;

  // 格式化时长显示
  const minutes = Math.floor(newTimeInSeconds / 60).toString().padStart(2, "0");
  const seconds = (newTimeInSeconds % 60).toString().padStart(2, "0");
  const newTime1 = `00:${minutes}:${seconds}`;
  const newTime2 = `${minutes}:${seconds}`;

  // 更新分组数据
  const newSwiperData = JSON.parse(JSON.stringify(props.swiperData)).map((group) => {
    if (group.groupId === currentEditItem.value.groupId) {
      return {
        ...group,
        time: newTimeInSeconds,
        time1: newTime1,
        time2: newTime2,
        totalSeconds: newTimeInSeconds,
        remainingSeconds: newTimeInSeconds,
      };
    }
    return group;
  });

  emit("updateSwiperData", newSwiperData);

  nextTick(() => {
    const formatted = formatData(newSwiperData, props.activeIndex);
    treatData.value = groupByPageSize(formatted, 3);
    
    // 更新当前修改的分组
    const allGroups = treatData.value.flat();
    const targetGroup = allGroups.find(g => g.groupId === currentEditItem.value.groupId);
    if (targetGroup) {
      targetGroup.time = newTimeInSeconds;
      targetGroup.totalSeconds = newTimeInSeconds;
      targetGroup.time1 = newTime1;
      targetGroup.time2 = newTime2;
      targetGroup.remainingSeconds = newTimeInSeconds;
      targetGroup.status = "paused";
      targetGroup.isActive = true;
      remainingSecondsMap.value[targetGroup.groupId] = newTimeInSeconds;
    }
  });

  const tipText = isDemoMode.value
    ? `已将${currentEditItem.value.chooseName}时长修改为 ${inputVal} 秒`
    : `已将${currentEditItem.value.chooseName}时长修改为 ${inputVal} 分钟`;
  
  ElMessage.success(tipText);
  durationDialogVisible.value = false;
};

// 辅助方法
const detailIconClick = (group, index) => {
  emit("detailSelectOne", group);
  localStorage.setItem("oneItem", JSON.stringify(group));
};

const goPrev = () => {
  if (swiperInstance.value && swiperInstance.value.activeIndex > 0) {
    swiperInstance.value.slidePrev();
  }
};

const goNext = () => {
  if (swiperInstance.value && swiperInstance.value.activeIndex < treatData.value.length - 1) {
    swiperInstance.value.slideNext();
  }
};

const onSwiper = (swiper) => {
  swiperInstance.value = swiper;
};

const onSlideChange = (swiper) => {
  emit("swiperChange", swiper.activeIndex);
};

// 监听分组数据变化（格式化+分页）
watch(
  () => props.swiperData,
  (newVal) => {
    if (!newVal.length) return;
    const formatted = formatData(newVal, props.activeIndex);
    treatData.value = groupByPageSize(formatted, 3); // 恢复3个/页
  },
  { immediate: true, deep: true }
);

// 监听激活索引变化
watch(
  () => props.activeIndex,
  (newIndex) => {
    if (newIndex === -1) {
      stopCountdown();
      return;
    }
    const allGroups = treatData.value.flat();
    allGroups.forEach((group, idx) => {
      group.isActive = idx === newIndex;
      if (group.isActive && group.status === "idle") {
        group.status = "paused";
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
// 样式完全保留原有逻辑（3个/页的布局）
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
  max-width: 32%; // 保留3个/页的宽度
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
      width: 40%;
      height: 5vh;
      line-height: 5vh;
      border-right: 2px solid #ffffff;
      text-align: center;
    }

    .swiper-item-point {
      font-size: 16px;
      width: 60%;
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
// 全局样式保留不变
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
.treat-dialog {
  .el-dialog__title {
    font-size: 24px;
    font-weight: bold;
    color: #693e9c;
  }
}
</style>