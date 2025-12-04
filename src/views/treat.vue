<template>
  <div class="container">
    <div class="point-nav">
      <span>定穴</span>
    </div>
    <div class="point-content">
      <div class="point-content-left">
        <div class="point-content-left-border">
          <div class="content-left-nav">
            <div class="left-nav-title">灸疗方案</div>
            <div class="left-nav-text-box">
              <span class="point-ball"></span>
              <span class="left-nav-text">治疗中</span>
            </div>
          </div>
          <FuXie
            :picType="picType"
            :picUrl="picUrl"
            :selectedObj="selectedObj"
            :tableData="tableData"
          />
        </div>
      </div>
      <div class="point-content-right">
        <div class="point-content-right-border">
          <div class="tool-bar">
            <el-button @click="usePoint()" type="primary" size="small"
              >test</el-button
            >
            <img src="@/assets/pic/temperature.png" alt="" />
            <img src="@/assets/pic/volume.png" alt="" />
            <img src="@/assets/pic/music.png" alt="" />
          </div>
          <div class="swiper-content">
            <TreatSwiper
              ref="treatSwiperRef"
              @swiperChange="handleSwiperChange"
              :swiperData="tableData"
            />
          </div>
          <div class="btn-content">
            <el-button type="primary" size="small">暂停</el-button>
            <el-button type="primary" size="small">继续</el-button>
            <el-button type="primary" size="small">结束</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import caseData from "@/data/caseData.json";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import FuXie from "@/components/FuXie.vue";
import TreatSwiper from "@/components/TreatSwiper.vue";

// 图片路径
const BodyPic = "/src/assets/pic/per_obverse.png";
const LegPic = "/src/assets/pic/leg_obverse.png";

// 响应式变量
const picType = ref(-1);
const picUrl = ref("");
const selectedCaseId = ref("");
const selectedCase = ref({});
const tableData = ref([]);
const selectedObj = ref({});
const testIndex = ref(0); // 唯一数据源
const treatSwiperRef = ref(null);
const swiperInstance = ref(null);

// 初始化数据
const getPoint = (id) => {
  const caseDataCopy = JSON.parse(JSON.stringify(caseData));
  selectedCase.value = caseDataCopy.find((item) => item.id * 1 === id * 1);

  if (
    !selectedCase.value ||
    !selectedCase.value.plan ||
    selectedCase.value.plan.length === 0
  ) {
    ElMessage.error("未找到有效穴位计划");
    return;
  }

  // 初始化第一个穴位
  const planList = selectedCase.value.plan;
  planList[0].status = 1;
  selectedObj.value = planList[0];
  picType.value = planList[0].type;
  picUrl.value = planList[0].type === 0 ? BodyPic : LegPic;

  tableData.value = JSON.parse(JSON.stringify(planList));

  // 初始化Swiper到对应页面
  nextTick(() => {
    if (swiperInstance.value) {
      swiperInstance.value.slideTo(planList[0].type);
    }
  });
};

// 核心：自动切换穴位（test按钮）
const usePoint = () => {
  const planList = selectedCase.value.plan || [];
  const planLength = planList.length;

  if (planLength === 0) {
    ElMessage.warning("无穴位计划可执行");
    return;
  }

  // 1. 标记当前穴位为已完成
  if (testIndex.value < planLength) {
    planList[testIndex.value].status = 2;
  }

  // 2. 计算下一个索引
  const nextIndex = testIndex.value + 1;

  // 3. 最后一个穴位
  if (nextIndex >= planLength) {
    ElMessage.success("所有穴位处理完成！");
    tableData.value = JSON.parse(JSON.stringify(planList));
    return;
  }

  // 4. 更新状态（唯一数据源）
  planList[nextIndex].status = 1;
  selectedObj.value = planList[nextIndex];
  picType.value = planList[nextIndex].type;
  picUrl.value = planList[nextIndex].type === 0 ? BodyPic : LegPic;

  // 5. 同步Swiper
  nextTick(() => {
    if (swiperInstance.value) {
      swiperInstance.value.slideTo(planList[nextIndex].type);
    }
  });

  // 6. 更新唯一数据源
  testIndex.value = nextIndex;
  tableData.value = JSON.parse(JSON.stringify(planList));

  console.log(`自动切换到索引${nextIndex}，type=${planList[nextIndex].type}`);
};

// 处理手动切换Swiper
const handleSwiperChange = (swiperIndex) => {
  const planList = selectedCase.value.plan || [];
  if (planList.length === 0) return;

  // 核心修复：根据Swiper索引（0=body，1=leg）直接更新picType
  const targetType = swiperIndex; // Swiper索引0对应type=0，索引1对应type=1
  picType.value = targetType;
  picUrl.value = targetType === 0 ? BodyPic : LegPic;
  console.log(`手动切换Swiper到索引${swiperIndex}，同步picType=${targetType}`);

  // 同步testIndex（可选：找到当前type下的第一个治疗中穴位）
  const currentItem = planList.find(
    (item) => item.type === targetType && item.status === 1
  );
  if (currentItem) {
    testIndex.value = planList.indexOf(currentItem);
  }
};
// 监听Swiper实例
watch(
  () => treatSwiperRef.value,
  (swiperComp) => {
    if (swiperComp) {
      swiperInstance.value = swiperComp.swiperInstance;
    }
  },
  { immediate: true }
);

// 初始化
onMounted(() => {
  selectedCaseId.value = localStorage.getItem("selectedCaseId") || 1; // 兜底默认值
  getPoint(selectedCaseId.value);
});
</script>

<style scoped lang="scss">
/* 样式完全不变，保留你原有代码 */
.container {
  box-sizing: border-box;
  background: url("@/assets/pic/backgroundImage.png") no-repeat;
  background-position: center center;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  padding-top: 4vh;

  .point-nav {
    box-sizing: border-box;
    width: 100%;
    height: 6vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #c293d5;

    span {
      font-size: 36px;
      font-weight: bold;
      color: #fff;
    }
  }

  .point-content {
    box-sizing: border-box;
    width: 100%;
    height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;

    .point-content-left {
      box-sizing: border-box;
      width: 35%;
      height: 100%;
      padding: 20px 10px 20px 20px;

      .point-content-left-border {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        border-radius: 20px;
        overflow: hidden;
        border: 1px solid #ffffff;

        .content-left-nav {
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #c293d5;
          height: 8vh;
          padding: 0 20px;

          .left-nav-title {
            font-size: 36px;
            font-weight: bold;
            color: #fff;
            height: 8vh;
            line-height: 8vh;
          }

          .left-nav-text-box {
            height: 8vh;
            min-width: 25%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: row;

            .point-ball {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background-color: #58c08d;
              margin-right: 10px;
            }

            .left-nav-text {
              height: 3vh;
              line-height: 3vh;
              font-size: 24px;
              font-weight: bold;
              color: #fff;
            }
          }
        }
      }
    }

    .point-content-right {
      box-sizing: border-box;
      width: 65%;
      height: 100%;
      padding: 20px 20px 20px 10px;

      .point-content-right-border {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        border-radius: 20px;
        overflow: hidden;
        background-color: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 40px;

        .tool-bar {
          box-sizing: border-box;
          width: 100%;
          height: 10vh;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-direction: row;
          border: 1px solid red;

          img {
            cursor: pointer;
          }
        }

        .swiper-content {
          box-sizing: border-box;
          width: 100%;
          height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-content {
          box-sizing: border-box;
          width: 100%;
          height: 8vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: row;
          border: 1px solid red;
        }
      }
    }
  }
}

.status-blue {
  width: 150px;
  height: 50px;
  line-height: 50px;
  background-color: #bdbdba;
  border-radius: 40px;
  color: #111;
}

.status-red {
  color: #ffffff;
  width: 150px;
  height: 50px;
  line-height: 50px;
  border-radius: 40px;
}

.status-green {
  color: #ffffff;
  width: 150px;
  height: 50px;
  line-height: 50px;
  background-color: #6c359d;
  border-radius: 40px;
}

:deep(.el-dialog__body) {
  text-align: center;
  padding: 30px 20px !important;
  background-color: #d4bfe1;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 15vh;

  .dialog-title {
    font-size: 40px;
    font-weight: bold;
    color: #511d6a;
    margin-bottom: 40px;
  }

  .dialog-text {
    font-size: 24px;
    font-weight: 500;
    color: #4c1c64;
    margin-bottom: 20px;
  }
}

.dialog-btn-content {
  margin-top: 40px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

:deep(.el-dialog) {
  --el-dialog-bg-color: #d4bfe1 !important;
}

:deep(.el-dialog__close) {
  color: #ffffff;
}

:deep(.el-dialog__headerbtn):hover .el-dialog__close {
  color: #ffffff !important;
}

::-webkit-scrollbar {
  display: none;
}

* {
  scrollbar-width: none;
  -ms-overflow-style: none;
  touch-action: pan-y;
  margin: 0;
  padding: 0;
  font-family: "Microsoft YaHei", sans-serif;
  box-sizing: border-box !important;
}
</style>
