<template>
  <!-- 模板部分保持不变，无需修改 -->
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
            <el-button @click="usePoint(testIndex)" type="primary" size="small"
              >test</el-button
            >
            <img src="@/assets/pic/temperature.png" alt="" />
            <img src="@/assets/pic/volume.png" alt="" />
            <img src="@/assets/pic/music.png" alt="" />
          </div>

          <div class="swiper-content">
            <TreatSwiper
              @dataTypeChange="handleDataTypeChange"
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
// 脚本部分保持不变，无需修改
import { ref, onMounted, watch, computed, nextTick, onUnmounted } from "vue";
import caseData from "@/data/caseData.json";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import FuXie from "@/components/FuXie.vue";
import TreatSwiper from "@/components/TreatSwiper.vue";

import BodyPic from "@/assets/pic/per_obverse.png";
import LegPic from "@/assets/pic/leg_obverse.png";

const router = useRouter();
const route = useRoute();

const picType = ref(-1);
const picUrl = ref("");

const selectedCaseId = ref("");
const selectedCase = ref({});
const tableData = ref([]);

const selectedObj = ref({});
// 当前数据集类型（body/leg）
const currentDataType = ref("body");
const testIndex = ref(0);
const selectedAutoIndex = ref(0);

watch(
  () => currentDataType.value,
  (newType) => {
    if (newType === "body") {
      picUrl.value = BodyPic;
      picType.value = 0;
    } else if (newType === "leg") {
      picUrl.value = LegPic;
      picType.value = 1;
    }
  }
);

const getPoint = (id) => {
  const caseDataCopy = JSON.parse(JSON.stringify(caseData));

  selectedCase.value = caseDataCopy.find((item) => {
    return item.id * 1 === id * 1;
  });
  console.log(selectedCase.value);

  // 初始化第一个定穴状态为正在定穴
  selectedCase.value.plan[0].status = 1;

  selectedObj.value = selectedCase.value.plan[0];

  picType.value = selectedCase.value.plan[0].type;

  switch (selectedCase.value.plan[0].type) {
    case 0:
      picUrl.value = BodyPic;
      break;
    case 1:
      picUrl.value = LegPic;
      break;
    default:
      break;
  }

  tableData.value = selectedCase.value.plan;
  console.log(tableData.value);
};

const usePoint = (index) => {
  //  获取计划数据和长度，避免重复取值
  const planList = selectedCase.value.plan;
  const planLength = planList.length;

  //  边界判断：索引超出范围直接返回
  if (index < 0 || index >= planLength) {
    console.warn("索引超出范围", index);
    return;
  }

  //  检查是否是最后一个穴位（核心：index === length - 1）
  if (index === planLength - 1) {
    // 处理最后一个穴位：仅标记状态为已使用，不修改图片相关状态
    planList[index].status = 2;
    console.log("finish：所有穴位处理完成，保留当前图片");

    // 只更新表格数据，不改动picUrl/picType/selectedObj
    tableData.value = [...planList];
    return;
  }

  // 非最后一个穴位：执行正常切换逻辑
  // 改变当前穴位的状态为已使用
  planList[index].status = 2;

  // 改变下一个穴位的状态为正在定穴
  const nextIndex = index + 1;
  planList[nextIndex].status = 1;
  selectedAutoIndex.value = nextIndex;

  // 获取下一个穴位的类型，切换图片
  const nextItem = planList[nextIndex];
  picType.value = nextItem.type;
  selectedObj.value = nextItem;

  // 切换图片（body/leg）
  picUrl.value = picType.value === 0 ? BodyPic : LegPic;

  console.log("切换到下一个穴位：", nextIndex, "类型：", picType.value);

  // 更新表格数据
  tableData.value = [...planList];
  testIndex.value = nextIndex;
};

// 处理数据集类型变化
const handleDataTypeChange = (newType) => {
  currentDataType.value = newType;
};

onMounted(() => {
  console.log("组件挂载了");
  selectedCaseId.value = localStorage.getItem("selectedCaseId");
  getPoint(selectedCaseId.value);
});

onUnmounted(() => {});
</script>

<style scoped lang="scss">
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
  // height: 96vh;
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
          align-items: center;
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
          // border: 1px solid red;
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
  // background-color: #de2b1f;
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

// Dialog 整体文字样式：居中 + 颜色 #D4BFE1
:deep(.el-dialog__body) {
  // 让内部所有文本居中
  text-align: center;
  // 移除默认内边距，自定义更美观的间距
  padding: 30px 20px !important;
  background-color: #d4bfe1;

  // 所有直接文本节点和 div 内文字的颜色
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

// 隐藏所有浏览器的滚动条
::-webkit-scrollbar {
  display: none;
}
* {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  touch-action: pan-y;
  margin: 0;
  padding: 0;
  font-family: "Microsoft YaHei", sans-serif;
  box-sizing: border-box !important; /* 强制所有元素使用border-box */
}
</style>
