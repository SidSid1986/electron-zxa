<template>
  <div class="swiper-main">
    <!-- 自定义左右切换按钮 -->
    <span class="custom-swiper-button-prev" @click="goPrev"></span>
    <swiper
      class="home-swiper"
      :modules="modules"
      direction="horizontal"
      :slides-per-view="showNum"
      :space-between="0"
      :slides-offset-before="0"
      :slides-offset-after="0"
      @swiper="onSwiper"
      @slideChange="onSlideChange"
      @slideChangeTransitionEnd="onSlideChangeTransitionEnd"
    >
      <swiper-slide
        class="swiper-slide"
        v-for="(item, index) in treatData"
        :key="index"
        @click="detailIconClick(item, index)"
      >
        <div class="swiper-item">
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
import { ref, computed, watch } from "vue";
// Import Swiper Vue.js components
import { Swiper, SwiperSlide, useSwiper } from "swiper/vue";
// Import Swiper styles
import "swiper/css";
import { Navigation, Pagination, A11y, Autoplay } from "swiper/modules";
const modules = [Navigation, Pagination, A11y];
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { el } from "element-plus/es/locale/index.mjs";

// 核心修改：设置同时显示3个
const showNum = ref(3);

const props = defineProps(["swiperData"]);

const treatData = ref([]);
// 新增：定义emit（原代码缺失）
const emit = defineEmits(["detailSelectOne"]);

const selectIndex = ref(0);
const oneItem = ref({});

watch(
  () => props.swiperData,
  (newVal) => {
    if (newVal.length > 0) {
      treatData.value = newVal.map((item) => {
        const timeNum = parseInt(item.time);
        return {
          ...item,
          time1: `00:${timeNum.toString().padStart(2, "0")}:00`, // 00:01:00 格式
          time2: `${timeNum.toString().padStart(2, "0")}:00`, // 01:00 格式
        };
      });
    }
  }
);

const detailIconClick = (item, index) => {
  selectIndex.value = index;
  oneItem.value = item;
  console.log(oneItem.value);
  localStorage.setItem("oneItem", JSON.stringify(oneItem.value));
  // 触发自定义事件
  emit("detailSelectOne", item);
};

const swiperInstance = ref(null);

const onSwiper = (swiper) => {
  swiperInstance.value = swiper;
};

const goPrev = () => {
  if (swiperInstance.value) {
    swiperInstance.value.slidePrev();
  }
};
const goNext = () => {
  if (swiperInstance.value) {
    swiperInstance.value.slideNext();
  }
};

const onSlideChange = (swiper) => {
  console.log("slideChange执行，当前索引：", swiper.activeIndex);
};

const onSlideChangeTransitionEnd = (swiper) => {
  // console.log("end!!!!!");
};

//获取图片路径
const getImageUrl = (url) => {
  return new URL(url, import.meta.url).href;
};
</script>

<style scoped lang="scss">
// 容器整体布局：按钮+轮播主体
.swiper-main {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 5px; /* 给按钮留出空间 */
  position: relative; /* 为轮播容器定位做基准 */
}

// 轮播主体容器
.home-swiper {
  box-sizing: border-box;
  border: 1px solid pink;
  width: calc(100% - 8vh); /* 减去左右按钮的宽度 */
  height: 100%;
  color: #ffffff;
  font-size: 16px;
  // 隐藏swiper默认的左右按钮（使用自定义按钮）
  :deep(.swiper-button-prev),
  :deep(.swiper-button-next) {
    display: none !important;
  }
  // 轮播容器内边距重置
  :deep(.swiper-wrapper) {
    box-sizing: border-box;
    height: 100%;
  }
}

// 单个轮播项样式
.swiper-slide {
  box-sizing: border-box;
  height: 100%;
  // 确保每个轮播项宽度适配（显示3个时自动均分）
  // width: calc(100% / 3) !important;
}

// 轮播项内部内容容器
.swiper-item {
  box-sizing: border-box;
  height: 100%;
  // background-color: pink;
  // border: 2px solid red;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0 20px;

  .swiper-item-title {
    box-sizing: border-box;
    width: 100%;
    height: 6vh;
    // border: 1px solid green;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background-color: #693e9c;
    border-radius: 12px;

    .swiper-item-name {
      box-sizing: border-box;
      font-size: 24px;
      width: 50%;
      height: 5vh;
      line-height: 5vh;
      border-right: 1px solid #ffffff;
      text-align: center;
    }
    .swiper-item-point {
      box-sizing: border-box;
      font-size: 24px;
      width: 50%;
      height: 5vh;
      line-height: 5vh;
      border-left: 1px solid #ffffff;
      text-align: center;
    }
  }
  .swiper-item-time {
    box-sizing: border-box;
    width: 100%;
    // border: 1px solid yellow;
    line-height: 5vh;
    text-align: center;
    height: 5vh;
    color: #693e9c;
    font-size: 20px;
  }
  .swiper-item-circle {
    box-sizing: border-box;
    width: 100%;
    // border: 1px solid yellow;
    height: 60%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 5vh;
    .circle-bg {
      // border: 1px solid blue;
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
        // background-color: #f8f9fa;

        display: flex;
        justify-content: center;
        align-items: center;

        // 圆环主体
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
      box-sizing: border-box;
      width: 100%;
      height: 5vh;
      line-height: 5vh;
      text-align: center;
      color: #6c359d;
      font-size: 20px;
    }
  }
  .swiper-item-btn {
    box-sizing: border-box;
    width: 100%;
    border: 1px solid yellow;
    height: 35%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
}

// 自定义左右按钮样式
.custom-swiper-button-prev,
.custom-swiper-button-next {
  z-index: 99; /* 确保按钮在最上层 */
  width: 7vh;
  height: 7vh;
  cursor: pointer;
  border: 1px solid red;
  // 按钮居中对齐
  flex-shrink: 0; /* 防止按钮被挤压 */
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
