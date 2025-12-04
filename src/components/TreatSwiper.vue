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
        <!-- 整页内部用 flex 布局展示3个 item -->
        <div
          class="swiper-item"
          v-for="(item, itemIndex) in pageData"
          :key="'item-' + pageIndex + '-' + itemIndex"
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
                <div class="circle-text">{{ item.time2 }}</div>
              </div>
            </div>
            <div class="circle-btn">修改</div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
    <span class="custom-swiper-button-next" @click="goNext"></span>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { Navigation } from "swiper/modules";
import "swiper/css/navigation";

const modules = [Navigation];
const treatData = ref([]);
const currentDataType = ref("body");
const swiperInstance = ref(null);
const selectIndex = ref(0);
const oneItem = ref({});

const props = defineProps({
  swiperData: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const emit = defineEmits(["dataTypeChange", "detailSelectOne"]);

watch(
  () => props.swiperData,
  (newVal) => {
    console.log("原始数据：", newVal);
    if (newVal.length > 0) {
      const formatData = newVal.map((item) => {
        const timeNum = parseInt(item.time) || 0;
        return {
          ...item,
          time1: `00:${timeNum.toString().padStart(2, "0")}:00`,
          time2: `${timeNum.toString().padStart(2, "0")}:00`,
        };
      });

      treatData.value = [
        formatData.filter((item) => item.type === 0), // body 数据集
        formatData.filter((item) => item.type === 1), // leg 数据集
      ];

      console.log("处理后二维数组：", treatData.value);
      currentDataType.value = "body";
      emit("dataTypeChange", currentDataType.value);
    }
  },
  { immediate: true }
);

const onSwiper = (swiper) => {
  swiperInstance.value = swiper;
  console.log("Swiper初始化，当前页码：", swiper.activeIndex);
};

const onSlideChange = (swiper) => {
  currentDataType.value = swiper.activeIndex === 0 ? "body" : "leg";
  emit("dataTypeChange", currentDataType.value);
  console.log("切换到：", currentDataType.value, "数据集");
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

const detailIconClick = (item, index) => {
  selectIndex.value = index;
  oneItem.value = item;
  localStorage.setItem("oneItem", JSON.stringify(oneItem.value));
  emit("detailSelectOne", item);
  console.log("选中项：", item);
};
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
  border: 1px solid pink;
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

  // 关键修复1：整页 slide 宽度设为100%，取消之前的1/3设置
  :deep(.swiper-slide) {
    width: 100% !important;
    height: 100%;
    box-sizing: border-box;
  }
}

// 关键修复2：整页 slide 内部用 flex 布局，展示3个 item
.page-slide {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  gap: 10px; // item 之间的间距
  box-sizing: border-box;
}

// 单个 item 样式：flex 均分宽度，最多显示3个
.swiper-item {
  flex: 1;
  max-width: 30%; // 限制宽度，确保同时显示3个
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0 20px;

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
      font-size: 24px;
      width: 50%;
      height: 5vh;
      line-height: 5vh;
      border-right: 1px solid #ffffff;
      text-align: center;
    }

    .swiper-item-point {
      font-size: 24px;
      width: 50%;
      height: 5vh;
      line-height: 5vh;
      border-left: 1px solid #ffffff;
      text-align: center;
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
    }
  }
}

.custom-swiper-button-prev,
.custom-swiper-button-next {
  z-index: 99;
  width: 7vh;
  height: 7vh;
  cursor: pointer;
  border: 1px solid red;
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
