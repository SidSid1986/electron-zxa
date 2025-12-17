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
            <div class="swiper-item-point">
              {{ item.points.map((p) => p.name).join("、") }}
            </div>
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
import { ref, watch, onUnmounted, onMounted, nextTick } from "vue";
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
const remainingTimeMap = ref({});
const renderKeyMap = ref({});
// 新增：记录每页完成的项数（key：swiper页码，value：完成数）
const pageCompletedCount = ref({});
// 演示模式配置（可通过props传入，此处先固定）
const isDemoMode = ref(true); // 是否演示模式
const demoItemDuration = ref(8); // 演示模式单条倒计时时长（秒）

onMounted(() => {
  isComponentMounted.value = true;
});

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

// 生成唯一标识（基于name+chooseName+points组合）
const getUniqueKey = (item) => {
  const pointNames = item.points.map((p) => p.name).join("-");
  return `${item.name}-${item.chooseName}-${pointNames}`;
};

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

// 核心修正：彻底统一时长单位（time=60 → 60秒）
const formatData = (data, activeIndex) => {
  return data.map((item, index) => {
    // 核心：演示模式强制使用8秒，非演示模式使用原始秒数
    let timeSeconds = parseInt(item.time) || 60;
    if (isDemoMode.value) {
      timeSeconds = demoItemDuration.value; // 演示模式固定8秒/项
    }
    
    const timeMinutes = timeSeconds / 60; // 秒转分钟（用于显示）
    const totalTimeMs = timeSeconds * 1000; // 转换为毫秒（倒计时用）
    const uniqueKey = getUniqueKey(item);
    const hasValidTime = timeSeconds > 0;

    return {
      ...item,
      uniqueKey,
      // 显示格式：8秒 → 00:00:08（时:分:秒），60秒 → 00:01:00
      time1: hasValidTime
        ? `00:${Math.floor(timeMinutes).toString().padStart(2, "0")}:${(timeSeconds % 60).toString().padStart(2, "0")}`
        : "00:00:00",
      // 倒计时显示：8秒 → 00:08（分:秒），60秒 → 01:00
      time2: hasValidTime
        ? `${Math.floor(timeMinutes).toString().padStart(2, "0")}:${(timeSeconds % 60).toString().padStart(2, "0")}`
        : "00:00",
      countdownTime: totalTimeMs,
      useTime: remainingTimeMap.value[uniqueKey] || totalTimeMs,
      renderKey: renderKeyMap.value[uniqueKey] || 1,
      isActive: index === activeIndex,
      status: "idle",
      hasValidTime,
      completedMarked: false, // 新增：完成标记，避免重复统计
    };
  });
};

// 分组逻辑：每页3个item
const groupByPage = (formattedData, pageSize = 3) => {
  const pages = [];
  for (let i = 0; i < formattedData.length; i += pageSize) {
    pages.push(formattedData.slice(i, i + pageSize));
  }
  return pages;
};

// 处理progress事件
const handleCountdownProgress = (data, uniqueKey) => {
  remainingTimeMap.value[uniqueKey] = data.totalMilliseconds;
};

// 启动倒计时
const startCountdown = (targetIndex) => {
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

  if (activeKey.value && countdownRefs.value[activeKey.value]) {
    countdownRefs.value[activeKey.value].abort();
  }

  nextTick(() => {
    const instance = countdownRefs.value[targetItem.uniqueKey];
    if (instance) {
      if (remainingTimeMap.value[targetItem.uniqueKey] === 0) {
        remainingTimeMap.value[targetItem.uniqueKey] = targetItem.countdownTime;
      }
      instance.start();
      targetItem.status = "running";
      activeKey.value = targetItem.uniqueKey;

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
    return;
  }

  const instance = countdownRefs.value[activeKey.value];
  const targetItem = treatData.value
    .flat()
    .find((item) => item.uniqueKey === activeKey.value);

  if (targetItem && instance && targetItem.status === "running") {
    const currentRemaining = remainingTimeMap.value[activeKey.value];

    instance.abort();
    targetItem.status = "paused";

    const remainingMinutes = Math.floor(currentRemaining / 60000);
    const remainingSeconds = Math.floor((currentRemaining % 60000) / 1000);
  } else {
    ElMessage.warning("当前无运行中的倒计时可暂停");
  }
};

// 继续倒计时
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
        targetItem.useTime = currentRemaining;
        renderKeyMap.value[activeKey.value] += 1;
        targetItem.renderKey = renderKeyMap.value[activeKey.value];

        nextTick(() => {
          const newInstance = countdownRefs.value[activeKey.value];
          if (newInstance) {
            newInstance.start();
            targetItem.status = "running";
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
  Object.keys(countdownRefs.value).forEach((key) => {
    if (countdownRefs.value[key]) {
      countdownRefs.value[key].abort();
    }
  });

  if (activeKey.value) {
    remainingTimeMap.value[activeKey.value] = 0;
    activeKey.value = "";
  }

  treatData.value.flat().forEach((item) => {
    item.status = "idle";
    item.isActive = false;
    item.completedMarked = false; // 重置完成标记
    renderKeyMap.value[item.uniqueKey] = 1;
    remainingTimeMap.value[item.uniqueKey] = 0;
    item.useTime = item.countdownTime;
    item.renderKey = 1;
  });
  
  // 重置每页完成数
  pageCompletedCount.value = {};
};

// 倒计时启动事件
const handleCountdownStart = (item) => {
  item.status = "running";
};

// 倒计时结束事件（核心修改：统计完成数+自动滑页）
const handleCountdownEnd = (item) => {
  if (item.status !== "running") return;
  item.status = "ended";

  remainingTimeMap.value[item.uniqueKey] = 0;
  activeKey.value = "";
  emit("countdownEnd", item);
  ElMessage.success(`${item.name}(${item.chooseName}) 倒计时已结束`);

  // 统计当前项所属页码 + 更新完成数
  const allItems = treatData.value.flat();
  const itemIndex = allItems.findIndex(i => i.uniqueKey === item.uniqueKey);
  if (itemIndex === -1) return;
  
  // 计算所属页码（每页3个）
  const currentPage = Math.floor(itemIndex / 3);
  // 初始化当前页完成数
  if (!pageCompletedCount.value[currentPage]) {
    pageCompletedCount.value[currentPage] = 0;
  }
  // 累加完成数（仅未统计过的项）
  if (item.status === "ended" && !item.completedMarked) {
    pageCompletedCount.value[currentPage] += 1;
    item.completedMarked = true; // 标记已统计，避免重复
  }

  // 判断是否当前页所有项都完成（3个）
  const currentPageItems = treatData.value[currentPage] || [];
  const currentPageTotal = currentPageItems.length;
  if (pageCompletedCount.value[currentPage] >= currentPageTotal) {
    // 非最后一页才滑动
    if (currentPage < treatData.value.length - 1 && swiperInstance.value) {
      // 自动滑到下一页
      swiperInstance.value.slideNext();
      // 滑动后重置当前页完成数
      pageCompletedCount.value[currentPage] = 0;
      
      // 自动启动下一页第一个有效项的倒计时
      nextTick(() => {
        const nextPage = currentPage + 1;
        const nextPageFirstItem = (treatData.value[nextPage] || [])[0];
        if (nextPageFirstItem && nextPageFirstItem.hasValidTime && props.isTreating) {
          // 计算下一页第一个项的索引
          const nextItemIndex = nextPage * 3;
          startCountdown(nextItemIndex);
        }
      });
    } else if (currentPage === treatData.value.length - 1) {
      // 最后一页完成，提示并重置所有完成数
      ElMessage.info("所有项已完成");
      pageCompletedCount.value = {};
    }
  }
};

// 监听swiperData变化
watch(
  () => props.swiperData,
  (newVal) => {
    if (!newVal.length) return;
    const formatted = formatData(newVal, props.activeIndex);
    treatData.value = groupByPage(formatted, 3);

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

// 监听activeIndex变化
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
      stopCountdown();
    }
  }
);

// Swiper实例回调
const onSwiper = (swiper) => {
  swiperInstance.value = swiper;
};

// Swiper滑动事件（核心修改：重置完成数+自动启动当前页第一个项）
const onSlideChange = (swiper) => {
  emit("swiperChange", swiper.activeIndex);
  // 重置当前页的完成数
  pageCompletedCount.value[swiper.activeIndex] = 0;
  // 滑动后自动启动当前页第一个有效项的倒计时（如果是治疗状态）
  if (props.isTreating) {
    const currentPageItems = treatData.value[swiper.activeIndex] || [];
    const firstValidItem = currentPageItems.find(item => item.hasValidTime);
    if (firstValidItem) {
      const allItems = treatData.value.flat();
      const firstValidIndex = allItems.findIndex(i => i.uniqueKey === firstValidItem.uniqueKey);
      startCountdown(firstValidIndex);
    }
  }
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

// 修改时长（适配秒单位）
const editTime = (item) => {
  emit("pauseEdit", item);

  const originalTime = item.time; // 原始值（秒）
  const originalRemainingTime = remainingTimeMap.value[item.uniqueKey];
  const originalStatus = item.status;

  ElMessageBox.prompt("请输入时长（单位：分钟）", "修改倒计时时长", {
    inputPattern: /^\d+$/,
    inputErrorMessage: "请输入有效的正整数",
    inputValue: Math.floor(parseInt(item.time) / 60) || "1", // 秒→分钟显示
    confirmButtonText: "确认",
    cancelButtonText: "取消",
  })
    .then(({ value }) => {
      const newTimeMinutes = parseInt(value.trim()) || 1; // 输入值（分钟）
      const newTimeSeconds = newTimeMinutes * 60; // 转换为秒存储
      const newTimeMs = newTimeSeconds * 1000; // 转换为毫秒（倒计时用）

      // 演示模式下强制使用配置的时长
      let finalTimeSeconds = newTimeSeconds;
      let finalTimeMs = newTimeMs;
      if (isDemoMode.value) {
        finalTimeSeconds = demoItemDuration.value;
        finalTimeMs = demoItemDuration.value * 1000;
      }

      // 通知父组件更新数据（存储为秒）
      const newSwiperData = props.swiperData.map((d) => {
        const dKey = getUniqueKey(d);
        return dKey === item.uniqueKey ? { ...d, time: finalTimeSeconds } : d;
      });
      emit("updateSwiperData", newSwiperData);

      // 更新本地数据
      item.time = finalTimeSeconds; // 存储为秒
      item.countdownTime = finalTimeMs;
      // 重新计算分/秒显示
      const showMinutes = Math.floor(finalTimeSeconds / 60);
      const showSeconds = finalTimeSeconds % 60;
      item.time1 = `00:${showMinutes.toString().padStart(2, "0")}:${showSeconds.toString().padStart(2, "0")}`;
      item.time2 = `${showMinutes.toString().padStart(2, "0")}:${showSeconds.toString().padStart(2, "0")}`;
      item.hasValidTime = finalTimeSeconds > 0;

      remainingTimeMap.value[item.uniqueKey] = finalTimeMs;
      renderKeyMap.value[item.uniqueKey] += 1;
      item.renderKey = renderKeyMap.value[item.uniqueKey];
      item.useTime = finalTimeMs;

      if (props.isTreating && finalTimeSeconds > 0) {
        nextTick(() => {
          const newInstance = countdownRefs.value[item.uniqueKey];
          if (newInstance) {
            newInstance.abort();
            newInstance.start();
          }
          item.status = "running";
          activeKey.value = item.uniqueKey;
        });
      }

      // 演示模式下提示实际时长
      const tipTime = isDemoMode.value ? demoItemDuration.value + "秒" : newTimeMinutes + "分钟";
      ElMessage.success(
        `已将${item.name}(${item.chooseName})时长修改为 ${tipTime}`
      );
    })
    // 取消逻辑无需改动（仅恢复原始值）
    .catch(() => {
      remainingTimeMap.value[item.uniqueKey] = originalRemainingTime;
      item.useTime = originalRemainingTime || item.countdownTime;
      renderKeyMap.value[item.uniqueKey] += 1;
      item.renderKey = renderKeyMap.value[item.uniqueKey];

      if (props.isTreating && originalRemainingTime > 0) {
        nextTick(() => {
          const instance = countdownRefs.value[item.uniqueKey];
          if (instance) {
            instance.abort();
            instance.start();
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

// 暴露方法
defineExpose({
  startCountdown,
  pauseCountdown,
  resumeCountdown,
  stopCountdown,
  treatData,
  swiperInstance,
  isDemoMode, // 暴露演示模式开关
  demoItemDuration, // 暴露演示模式时长配置
});

// 组件卸载清理
onUnmounted(() => {
  stopCountdown();
  countdownRefs.value = {};
  remainingTimeMap.value = {};
  renderKeyMap.value = {};
  pageCompletedCount.value = {}; // 清理完成数统计
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
