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
          <div class="tool-bar"></div>

          <div class="swiper-content">
            <TreatSwiper :swiperData="tableData" />
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
import { ref, onMounted, computed, nextTick, onUnmounted } from "vue";
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
          height: 16vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: row;
          border: 1px solid red;
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
