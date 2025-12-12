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
              <span class="left-nav-text">定穴中</span>
            </div>
          </div>
          <FuXie :picType="picType" :picUrl="picUrl" :tableData="tableData" />
        </div>
      </div>
      <div class="point-content-right">
        <div class="point-content-right-border">
          <div class="right-table-border">
            <div class="right-table-header">
              <div class="header-item item-border">灸法</div>
              <div class="header-item item-border">时长</div>
              <div class="header-item item-border">穴位</div>
              <div class="header-item">定穴状态</div>
            </div>

            <div
              class="right-table-content-border"
              @mousedown="handleTableDragStart"
              @mouseup="handleTableDragEnd"
              @mouseleave="handleTableDragEnd"
              @mousemove="handleTableDragMove"
              @wheel="handleTableWheel"
            >
              <div
                class="table-scroll-content"
                :style="{
                  transform: `translateY(${tableDragOffset}px)`,
                  transition: tableIsDragging
                    ? 'none'
                    : 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                }"
              >
                <div
                  v-for="(item, index) in tableData"
                  :key="index"
                  :class="
                    index == selectedAutoIndex
                      ? 'table-item-border-index'
                      : 'right-table-content'
                  "
                >
                  <div class="table-item-first table-item table-item-border">
                    <div
                      class="table-item-left"
                      v-show="index == selectedAutoIndex"
                    ></div>
                    <div class="table-line-name">{{ item.name }}</div>
                  </div>
                  <div class="table-item table-item-border">
                    {{ item.time }}
                  </div>
                  <div class="table-item table-item-border">
                    {{ item.point }}
                  </div>
                  <!-- 定穴状态 0 未定穴 1 正在定穴 2 已定穴 -->
                  <div class="table-item">
                    <span
                      :class="
                        item.status == 1
                          ? 'status-red'
                          : item.status == 0
                            ? 'status-blue'
                            : 'status-green'
                      "
                      >{{
                        item.status == 0
                          ? "未定穴"
                          : item.status == 1
                            ? "正在定穴"
                            : "已定穴"
                      }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="right-ins">
            移动摇杆，讲红点制动到指定穴位后，点击下方【使用此穴位】按钮
          </div>

          <div class="right-btn">
            <el-button @click="handleCancel" class="use-btn" type="primary"
              >取消订单</el-button
            >
            <el-button
              class="use-btn"
              @click="usePoint(selectedAutoIndex)"
              type="primary"
              >使用此穴位</el-button
            >
          </div>
        </div>
      </div>
    </div>

    <!-- dialog -->
    <el-dialog v-model="dialogVisible" width="500" :show-close="false">
      <div class="dialog-content">
        <div class="dialog-title">成功</div>
        <div class="dialog-text">定穴完成</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, onUnmounted } from "vue";
import caseData from "@/data/caseData.json";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import FuXie from "@/components/FuXie.vue";

import BodyPic from "@/assets/pic/body/5.png";
import LegPic from "@/assets/pic/body/3.png";

const $ws = inject("$ws");

const router = useRouter();
const route = useRoute();
const basicData = ref([]);
const picType = ref(-1);
const picUrl = ref("");
const dialogVisible = ref(false);
const selectedCaseId = ref("");
const selectedCase = ref({});

const planList = ref([]);
const planLength = ref(0);
const currentOperateIndex = ref(0);

const tableData = ref([]);

const selectedAutoIndex = ref(0);
const selectedObj = ref({});
const tableIsDragging = ref(false);
const tableStartY = ref(0);
const tableLastY = ref(0);
const tableDragOffset = ref(0);
const tableVelocity = ref(0);
const tableInertiaTimer = ref(null);
const tableContentHeight = ref(0);
const tableContainerHeight = ref(0);
const tableMaxOffset = ref(0);

const getPoint = (id) => {
  const caseDataCopy = JSON.parse(JSON.stringify(caseData));

  selectedCase.value = caseDataCopy.find((item) => {
    return item.id * 1 === id * 1;
  });

  // 初始化第一个定穴状态为正在定穴
  selectedCase.value.plan[0].status = 1;

  selectedObj.value = selectedCase.value.plan[0];

  picType.value = selectedCase.value.plan[0].type;
  picUrl.value = selectedCase.value.plan[0].type === 0 ? BodyPic : LegPic;
  // switch (selectedCase.value.plan[0].type) {
  //   case 0:
  //     picUrl.value = BodyPic;
  //     break;
  //   case 1:
  //     picUrl.value = LegPic;
  //     break;
  //   default:
  //     break;
  // }

  tableData.value = selectedCase.value.plan;

  nextTick(() => {
    setTimeout(calcTableScrollHeight, 50);
  });
};

const calcTableScrollHeight = () => {
  const container = document.querySelector(".right-table-content-border");
  const content = document.querySelector(".table-scroll-content");
  if (container && content) {
    tableContainerHeight.value = container.clientHeight;
    tableContentHeight.value = content.scrollHeight;

    if (tableContentHeight.value <= tableContainerHeight.value) {
      tableMaxOffset.value = 0;
      tableDragOffset.value = 0;
    } else {
      tableMaxOffset.value =
        tableContainerHeight.value - tableContentHeight.value;
    }
  }
};

const handleTableDragStart = (e) => {
  if (tableContentHeight.value <= tableContainerHeight.value) return;

  tableIsDragging.value = true;
  tableStartY.value = e.clientY;
  tableLastY.value = e.clientY;
  tableVelocity.value = 0;
  document.body.style.cursor = "grabbing";
  document.body.style.userSelect = "none";

  if (tableInertiaTimer.value) clearInterval(tableInertiaTimer.value);
};

const handleTableDragMove = (e) => {
  if (!tableIsDragging.value) return;
  if (tableContentHeight.value <= tableContainerHeight.value) return;

  const currentY = e.clientY;
  const moveY = currentY - tableLastY.value;
  tableLastY.value = currentY;

  tableVelocity.value = moveY * 0.5;
  let newOffset = tableDragOffset.value + moveY;
  newOffset = Math.max(tableMaxOffset.value, Math.min(0, newOffset));
  tableDragOffset.value = newOffset;
};

const handleTableDragEnd = () => {
  tableIsDragging.value = false;
  document.body.style.cursor = "grab";
  document.body.style.userSelect = "auto";

  if (tableContentHeight.value <= tableContainerHeight.value) return;

  if (Math.abs(tableVelocity.value) > 1) {
    startTableInertiaScroll();
  }
};

const startTableInertiaScroll = () => {
  if (tableInertiaTimer.value) clearInterval(tableInertiaTimer.value);

  tableInertiaTimer.value = setInterval(() => {
    tableVelocity.value *= 0.92;
    let newOffset = tableDragOffset.value + tableVelocity.value;
    newOffset = Math.max(tableMaxOffset.value, Math.min(0, newOffset));
    tableDragOffset.value = newOffset;

    if (Math.abs(tableVelocity.value) < 0.5) {
      clearInterval(tableInertiaTimer.value);
    }
  }, 16);
};

const handleTableWheel = (e) => {
  if (tableContentHeight.value <= tableContainerHeight.value) {
    e.preventDefault();
    return;
  }

  e.preventDefault();
  const scrollStep = Math.abs(e.deltaY) > 100 ? 50 : 30;
  let newOffset =
    tableDragOffset.value + (e.deltaY > 0 ? -scrollStep : scrollStep);
  newOffset = Math.max(tableMaxOffset.value, Math.min(0, newOffset));
  tableDragOffset.value = newOffset;
};

const handleCancel = () => {
  localStorage.removeItem("selectedCaseId");
  router.push({
    path: "/main",
  });
};

const parseStringToNumberArray = (str) => {
  try {
    // 1. 去除首尾的 {} 符号
    const cleanedStr = str.replace(/^\{|\}$/g, "");
    // 2. 按逗号分割成字符串数组
    const strArray = cleanedStr.split(",");
    // 3. 转换为数值类型（Number）
    const numArray = strArray.map((item) => {
      const num = parseFloat(item.trim());
      // 校验是否为有效数字
      if (isNaN(num)) {
        throw new Error(`无效的数值: ${item}`);
      }
      return num;
    });
    return numArray;
  } catch (error) {
    console.error("字符串转数组失败:", error.message);
    return []; // 转换失败返回空数组
  }
};

const startDrag = () => {
  $ws.SendMessage("StartDrag", "", (data) => {
    console.log(data);
  });
};
const stopDrag = () => {
  $ws.SendMessage("StopDrag", "", (data) => {
    console.log(data);
  });
};

const getPointWs = () => {
  // 校验WS是否已连接
  if (!$ws.Status) {
    console.log("WebSocket未连接，请稍候重试");
    return;
  }
  console.log("正在请求连接设备...");

  // 发送设备连接指令

  const sendResult = $ws.SendMessage("GetPose", "", (data) => {
    console.log(data);
    const numArray = parseStringToNumberArray(data.result.message);
    console.log("ceshi");
    if (numArray.length !== 6) {
      console.error("数据长度错误，无法更新:", numArray);
      return;
    }

    // 1. 获取基础数据
    const planList = selectedCase.value.plan;
    const planLength = planList.length;
    const index = currentOperateIndex.value; // 当前操作的索引

    console.log("转换后的数组:", numArray);
    console.log("更新前的plan项:", planList[selectedAutoIndex.value]);

    // 2. 深拷贝并更新坐标数据
    const newPlan = JSON.parse(JSON.stringify(planList));
    newPlan[selectedAutoIndex.value] = {
      ...newPlan[selectedAutoIndex.value],
      x: numArray[0],
      y: numArray[1],
      z: numArray[2],
      rx: numArray[3],
      ry: numArray[4],
      rz: numArray[5],
    };

    // 3. 核心业务逻辑：判断是否是最后一个穴位
    if (index === planLength - 1) {
      // 处理最后一个穴位的逻辑
      newPlan[index].status = 2; // 标记为已使用
      picType.value = newPlan[index].type;
      picUrl.value = picType.value === 0 ? BodyPic : LegPic;
      selectedObj.value = newPlan[index];

      console.log("finish：最后一个穴位处理完成，保留当前图片");

      // 4. 更新数据并触发视图刷新
      tableData.value = [];
      nextTick(() => {
        selectedCase.value.plan = newPlan;
        tableData.value = [...newPlan];
        //停止拖拽
        stopDrag();

        selectedCase.value.plan.forEach((item) => {
          item.status = 0;
        });
        localStorage.setItem(
          "selectedCase",
          JSON.stringify(selectedCase.value)
        );

        // 显示弹窗并跳转页面
        dialogVisible.value = true;
        setTimeout(() => {
          dialogVisible.value = false;
          router.push({ path: "/setting" });
        }, 2000);
      });
    } else {
      // 处理非最后一个穴位的逻辑
      newPlan[index].status = 2; // 当前穴位标记为已使用
      newPlan[index + 1].status = 1; // 下一个穴位标记为正在定穴

      // 更新选中索引和图片信息
      selectedAutoIndex.value = index + 1;
      picType.value = newPlan[index + 1].type;
      selectedObj.value = newPlan[index + 1];
      picUrl.value = picType.value === 0 ? BodyPic : LegPic;

      // 5. 更新数据并触发视图刷新
      tableData.value = [];
      nextTick(() => {
        selectedCase.value.plan = newPlan;
        tableData.value = [...newPlan];

        console.log(
          "更新后的plan项:",
          selectedCase.value.plan[selectedAutoIndex.value]
        );
        console.log("更新后的tableData:", tableData.value);
      });
    }
  });
  // 发送失败的兜底处理
  if (!sendResult) {
    console.log("指令发送失败，请检查连接");
    return;
  }
};

const usePoint = (index) => {
  // 记录当前操作的索引（传递给消息处理函数）
  currentOperateIndex.value = index;

  getPointWs();
};

onMounted(() => {
  console.log("组件挂载了");
  startDrag(); // 开始拖拽
  selectedCaseId.value = route.query.id;
  getPoint(selectedCaseId.value);

  // nextTick(() => {
  //   setTimeout(calcTableScrollHeight, 100);
  // });

  // window.addEventListener("resize", calcTableScrollHeight);
});

onUnmounted(() => {
  if (tableInertiaTimer.value) clearInterval(tableInertiaTimer.value);
  window.removeEventListener("resize", calcTableScrollHeight);
});
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

        .right-table-border {
          padding: 20px 20px 60px 20px;
          box-sizing: border-box;
          width: 100%;
          background-color: #fbfcf9;
        }

        .right-table-header {
          width: 100%;
          height: 6vh;
          display: flex;
          flex-direction: row;
          align-items: center;
          background-color: #fcd700;
          font-size: 24px;
          color: #111;
          .header-item {
            box-sizing: border-box;
            height: 100%;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 0 4px;
          }
          .item-border {
            border-right: 2px solid #ffffff;
          }
        }

        .right-table-content-border {
          box-sizing: border-box;
          width: 100%;
          max-height: 50vh;
          overflow: hidden;
          position: relative;
          cursor: grab;
          &:active {
            cursor: grabbing;
          }
          -webkit-tap-highlight-color: transparent;

          .table-scroll-content {
            will-change: transform;
            width: 100%;
          }

          .right-table-content {
            box-sizing: border-box;
            width: 100%;
            height: 10vh;
            display: flex;
            flex-direction: row;
            align-items: center;
            font-size: 24px;
            color: #511d6a;
            background-color: #ffffff;

            .table-item {
              box-sizing: border-box;
              height: 100%;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              background-color: #ffffff;
            }
            .table-item-border {
              border-right: 2px solid #af7dc4;
            }
          }

          .table-item-border-index {
            box-sizing: border-box;
            width: 100%;
            height: 10vh;
            display: flex;
            flex-direction: row;
            align-items: center;

            font-size: 24px;
            color: #511d6a;
            .table-item {
              box-sizing: border-box;
              height: 100%;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              background-color: #f3ebf4;
            }
            .table-item-border {
              border-right: 2px solid #af7dc4;
            }
          }

          .table-item-first {
            justify-content: flex-start !important;
            .table-line-name {
              margin-left: 40%;
            }
          }

          .table-item-left {
            width: 4px;
            height: 100%;
            background-color: #af7dc4;
          }
        }

        .right-ins {
          height: 6vh;
          line-height: 6vh;
          font-size: 20px;
          color: #511d6a;
          background: #f3eef4;
          padding: 0 20px;
          text-align: center;
        }

        .right-btn {
          margin-top: 50px;
          height: 8vh;
          background: #ffffff;
          padding: 0 20px;
          text-align: center;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
        }

        :deep(.use-btn) {
          width: 200px;
          height: 60px;
          font-size: 24px;
          font-weight: bold;
          border-radius: 40px;
          margin: 0 160px;
          --el-button-text-color: #fff;
          --el-button-bg-color: #af7dc4;
          --el-button-border-color: #af7dc4;
          --el-button-hover-text-color: #fff;
          --el-button-hover-bg-color: #9a6cb8;
          --el-button-hover-border-color: #9a6cb8;
          --el-button-active-text-color: #fff;
          --el-button-active-bg-color: #8a5ca0;
          --el-button-active-border-color: #8a5ca0;
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
  background-color: #de2b1f;
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
  border-radius: 20px;
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
