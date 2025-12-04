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
            <div class="circle-btn" @click="editTime(item)">修改</div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
    <span class="custom-swiper-button-next" @click="goNext"></span>

    <el-dialog title="修改时间" v-model="dialogVisible" width="30%">
      <el-form-item label="时长" prop="time2">
        <el-input v-model="timeSettingValue" placeholder="请输入时长" />
      </el-form-item>
      <template #footer>
        <el-button type="primary" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTime">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, defineExpose } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { Navigation } from "swiper/modules";
import "swiper/css/navigation";
import { ElMessage } from "element-plus";

const modules = [Navigation];
const treatData = ref([]);
const swiperInstance = ref(null);
const dialogVisible = ref(false);
const timeSettingValue = ref("");

// 暴露实例
defineExpose({
  swiperInstance: swiperInstance,
});

// 接收参数
const props = defineProps({
  swiperData: {
    type: Array,
    required: true,
    default: () => [],
  },
});

// 定义事件（只暴露swiper索引，不处理类型）
const emit = defineEmits(["swiperChange", "detailSelectOne"]);

// 格式化数据
watch(
  () => props.swiperData,
  (newVal) => {
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
        formatData.filter((item) => item.type === 0),
        formatData.filter((item) => item.type === 1),
      ];
    }
  },
  { immediate: true }
);

// Swiper初始化
const onSwiper = (swiper) => {
  swiperInstance.value = swiper;
};

// Swiper切换：只发送索引，不处理类型
const onSlideChange = (swiper) => {
  emit("swiperChange", swiper.activeIndex);
  console.log("Swiper手动切换到索引：", swiper.activeIndex);
};

// 手动切换按钮
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

// 其他功能不变
const editTime = (item) => {
  timeSettingValue.value = item.time || "";
  dialogVisible.value = true;
};

const saveTime = () => {
  if (!timeSettingValue.value || isNaN(timeSettingValue.value)) {
    ElMessage.error("请输入有效的时长数字");
    return;
  }
  dialogVisible.value = false;
  ElMessage.success("时长修改成功");
};

const detailIconClick = (item, index) => {
  emit("detailSelectOne", item);
  localStorage.setItem("oneItem", JSON.stringify(item));
};
</script>

<style scoped lang="scss">
/* 样式完全不变，保留你原有代码 */
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
  max-width: 30%;
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