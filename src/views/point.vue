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
          <div class="body-content">
            <component
              :is="currentComponent"
              ref="bodyRef"
              :newPlanPoint="newPlanPoint"
              :currentPoint="currentPoint"
            />
          </div>
        </div>
      </div>
      <div class="point-content-right">
        <div class="point-content-right-border">
          <div class="right-table-border">
            <div class="right-table-header">
              <div class="header-item1 item-border">灸法</div>
              <div class="header-item2 item-border">时长</div>
              <div class="header-item3 item-border">穴位</div>
              <div class="header-item4">定穴状态</div>
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
                  <div class="table-item-first table-item1 table-item-border">
                    <div
                      class="table-item-left"
                      v-show="index == selectedAutoIndex"
                    ></div>
                    <div class="table-line-name">{{ item.chooseName }}</div>
                  </div>
                  <div class="table-item2 table-item-border">
                    {{ item.time }}
                  </div>
                  <div class="table-item3 table-item-border">
                    <div
                      v-for="(area, areaIndex) in item.points"
                      :key="areaIndex"
                      class="point-name-item"
                    >
                      {{ area.name }}
                    </div>
                  </div>
                  <!-- 多穴位分别显示状态 -->
                  <div class="table-item4">
                    <div
                      v-for="(point, pointIndex) in item.points"
                      :key="pointIndex"
                      class="point-status-item"
                    >
                      <span
                        :class="[
                          point.status === 1
                            ? 'status-red'
                            : point.status === 0
                              ? 'status-blue'
                              : 'status-green',
                        ]"
                      >
                        {{
                          point.status === 0
                            ? "未定穴"
                            : point.status === 1
                              ? "正在定穴"
                              : "已定穴"
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="right-ins">
            移动摇杆，将红点制动到指定穴位后，点击下方【使用此穴位】按钮<br />
            当前定穴：{{ currentPoint.name || "请选择穴位" }}
          </div>

          <div class="right-btn">
            <el-button @click="handleCancel" class="use-btn" type="primary"
              >取消订单</el-button
            >
            <el-button
              class="use-btn"
              @click="useCurrentPoint()"
              type="primary"
              :disabled="!currentPoint.id"
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
import {
  ref,
  onMounted,
  computed,
  nextTick,
  onUnmounted,
  inject,
  shallowRef,
  markRaw,
} from "vue";
import caseData from "@/data/caseData.json";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import BodyCom from "@/components/BodyCom.vue";

import BodyFront from "@/components/body/BodyFront.vue";
import BodyBack from "@/components/body/BodyBack.vue";
import LegFront from "@/components/body/LegFront.vue";
import LegBack from "@/components/body/LegBack.vue";

import BodyPic from "@/assets/pic/body/body0.png";
import LegPic from "@/assets/pic/body/body1.png";

const $ws = inject("$ws");

const currentComponent = shallowRef(markRaw(BodyBack));

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

const newPlanPoint = ref([]);

// 当前选中的单个穴位
const currentPoint = ref({
  id: "",
  name: "",
  rowIndex: -1,
  pointIndex: -1,
});

// 初始化数据：第一个穴位组的第一个穴位设为正在定穴
const initTableData = (plan) => {
  const newPlan = JSON.parse(JSON.stringify(plan));
  // 初始化所有穴位为未定穴
  newPlan.forEach((row) => {
    row.points.forEach((point) => {
      point.status = 0;
    });
  });
  // 第一个穴位组的第一个穴位设为正在定穴
  if (newPlan.length > 0 && newPlan[0].points.length > 0) {
    newPlan[0].points[0].status = 1;
    // 默认选中第一个穴位
    currentPoint.value = {
      ...newPlan[0].points[0],
      rowIndex: 0,
      pointIndex: 0,
    };
  }
  return newPlan;
};

const chooseBody = (item) => {
  switch (item.bodyType) {
    case 0:
      currentComponent.value = markRaw(BodyFront);
      break;
    case 1:
      currentComponent.value = markRaw(LegFront);
      break;
    case 2:
      currentComponent.value = markRaw(BodyBack);
      break;
    case 3:
      currentComponent.value = markRaw(LegBack);
      break;
    default:
      break;
  }
};

const getPoint = (id) => {
  const caseDataCopy = JSON.parse(JSON.stringify(caseData));

  selectedCase.value = caseDataCopy.find((item) => {
    return item.id * 1 === id * 1;
  });

  // 初始化数据
  tableData.value = initTableData(selectedCase.value.plan);
  console.log("初始化后表格数据:", tableData.value);

  newPlanPoint.value = tableData.value[0].points;
  chooseBody(newPlanPoint.value[0]);
  console.log(newPlanPoint.value);

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
    const cleanedStr = str.replace(/^\{|\}$/g, "");
    const strArray = cleanedStr.split(",");
    const numArray = strArray.map((item) => {
      const num = parseFloat(item.trim());
      if (isNaN(num)) {
        throw new Error(`无效的数值: ${item}`);
      }
      return num;
    });
    return numArray;
  } catch (error) {
    console.error("字符串转数组失败:", error.message);
    return [];
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

// 使用当前选中的单个穴位
const useCurrentPoint = () => {
  if (!currentPoint.value.id) {
    ElMessage.warning("请先选择要定穴的穴位");
    return;
  }

  getPointWs();
};

const getPointWs = () => {
  if (!$ws.Status) {
    console.log("WebSocket未连接，请稍候重试");
    return;
  }
  console.log("正在请求连接设备...");

  const sendResult = $ws.SendMessage("GetPose", "", (data) => {
    console.log(data);
    const numArray = parseStringToNumberArray(data.result.message);
    if (numArray.length !== 6) {
      console.error("数据长度错误，无法更新:", numArray);
      return;
    }

    const { rowIndex, pointIndex } = currentPoint.value;
    const newPlan = JSON.parse(JSON.stringify(tableData.value));

    // 更新当前选中穴位的状态和坐标
    newPlan[rowIndex].points[pointIndex] = {
      ...newPlan[rowIndex].points[pointIndex],
      status: 2, // 标记为已定穴
      x: numArray[0],
      y: numArray[1],
      z: numArray[2],
      rx: numArray[3],
      ry: numArray[4],
      rz: numArray[5],
    };

    console.log("更新穴位坐标:", newPlan[rowIndex].points[pointIndex]);

    // 核心修正：检查当前行所有穴位的完成状态
    const currentRow = newPlan[rowIndex];
    // 统计当前行未完成的穴位数量（status=0 或 status=1）
    const unfinishedPoints = currentRow.points.filter((p) => p.status !== 2);
    // 查找当前行下一个未完成的穴位
    const nextPointIndex = currentRow.points.findIndex((p) => p.status === 0);

    if (unfinishedPoints.length > 0 && nextPointIndex > -1) {
      // 情况1：当前行还有未完成的穴位（1个或2个），继续处理当前行的下一个穴位
      currentRow.points[nextPointIndex].status = 1;
      // 更新当前选中穴位（仍在当前行）
      currentPoint.value = {
        ...currentRow.points[nextPointIndex],
        rowIndex,
        pointIndex: nextPointIndex,
      };
      // 同步更新newPlanPoint为当前行的穴位列表（关键修正）
      newPlanPoint.value = currentRow.points;
      // 更新当前行的身体部位显示
      chooseBody(currentRow.points[nextPointIndex]);
      console.log(
        "当前行还有未完成穴位，切换到同组下一个:",
        currentRow.points[nextPointIndex].name
      );
    } else {
      // 情况2：当前行所有穴位已完成（1个或2个都完成），查找下一组
      const nextRowIndex = newPlan.findIndex(
        (row, idx) => idx > rowIndex && row.points.some((p) => p.status === 0)
      );

      if (nextRowIndex > -1) {
        // 切换到下一组第一个未完成穴位
        const firstUnfinished = newPlan[nextRowIndex].points.findIndex(
          (p) => p.status === 0
        );
        newPlan[nextRowIndex].points[firstUnfinished].status = 1;
        currentPoint.value = {
          ...newPlan[nextRowIndex].points[firstUnfinished],
          rowIndex: nextRowIndex,
          pointIndex: firstUnfinished,
        };
        selectedAutoIndex.value = nextRowIndex;

        // 更新newPlanPoint为下一行的穴位列表
        newPlanPoint.value = newPlan[nextRowIndex].points;
        // 更新身体部位显示
        chooseBody(newPlan[nextRowIndex].points[firstUnfinished]);
        console.log(
          "当前行完成，切换到下一行:",
          newPlan[nextRowIndex].points[firstUnfinished].name
        );
      } else {
        // 所有穴位都已完成
        stopDrag();
        localStorage.setItem(
          "selectedCase",
          JSON.stringify({
            ...selectedCase.value,
            plan: newPlan,
          })
        );

        // 显示弹窗并跳转
        dialogVisible.value = true;
        setTimeout(() => {
          dialogVisible.value = false;
          router.push({ path: "/setting" });
        }, 2000);
      }
    }

    // 更新表格数据
    tableData.value = newPlan;
    selectedCase.value.plan = newPlan;

    ElMessage.success(`成功定穴：${currentPoint.value.name}`);
  });

  if (!sendResult) {
    console.log("指令发送失败，请检查连接");
    return;
  }
};

onMounted(() => {
  console.log("组件挂载了");
  startDrag();
  selectedCaseId.value = route.query.id;
  getPoint(selectedCaseId.value);

  nextTick(() => {
    setTimeout(calcTableScrollHeight, 100);
  });

  window.addEventListener("resize", calcTableScrollHeight);
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
      font-size: 30px;
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
    justify-content: space-between;
    padding: 0 4vh;

    .point-content-left {
      box-sizing: border-box;
      width: 30%;
      height: 100%;
      height: 86vh;
      // padding: 20px 10px 20px 20px;

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
            font-size: 24px;
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
              font-size: 20px;
              font-weight: bold;
              color: #fff;
            }
          }
        }

        .body-content {
          box-sizing: border-box;
          width: 100%;
          height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .point-content-right {
      box-sizing: border-box;
      width: 66%;
      height: 100%;
      height: 86vh;

      .point-content-right-border {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        border-radius: 20px;
        overflow: hidden;
        background-color: #ffffff;

        .right-table-border {
          // padding: 20px 20px 60px 20px;
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
          font-size: 20px;
          color: #111;

          .header-item1 {
            box-sizing: border-box;
            height: 100%;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .header-item2 {
            box-sizing: border-box;
            height: 100%;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .header-item3 {
            box-sizing: border-box;
            height: 100%;
            flex: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .header-item4 {
            box-sizing: border-box;
            height: 100%;
            flex: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .item-border {
            border-right: 1px solid #ffffff;
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
            height: 100%;

            display: flex;
            flex-direction: row;
            align-items: center;
            font-size: 18px;
            color: #511d6a;
            background-color: #ffffff;

            .table-item1 {
              box-sizing: border-box;
              height: 8vh;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              background-color: #ffffff;
            }
            .table-item2 {
              box-sizing: border-box;
              height: 8vh;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              background-color: #ffffff;
            }
            .table-item3 {
              box-sizing: border-box;
              height: 8vh;
              flex: 2;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              background-color: #ffffff;
            }
            .table-item4 {
              box-sizing: border-box;
              height: 8vh;
              flex: 2;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              background-color: #ffffff;
            }

            .table-item-border {
              border-right: 1px solid #af7dc4;
            }

            // 穴位名称项
            .point-name-item {
              width: 100%;
              margin: 4px 0;
              font-size: 16px;
            }

            // 穴位状态项
            .point-status-item {
              width: 100%;
              margin: 4px 0;

              span {
                cursor: pointer;
                transition: all 0.2s;

                &:hover {
                  transform: scale(1.05);
                }
              }
            }
          }

          .table-item-border-index {
            box-sizing: border-box;
            width: 100%;
            height: auto;

            display: flex;
            flex-direction: row;
            align-items: center;
            font-size: 20px;
            color: #511d6a;

            .table-item1 {
              box-sizing: border-box;
              height: 8vh;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              background-color: #f3ebf4;
            }
            .table-item2 {
              box-sizing: border-box;
              height: 8vh;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              background-color: #f3ebf4;
            }
            .table-item3 {
              box-sizing: border-box;
              height: 8vh;
              flex: 2;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              background-color: #f3ebf4;
            }
            .table-item4 {
              box-sizing: border-box;
              height: 8vh;
              flex: 2;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              background-color: #f3ebf4;
            }

            .table-item-border {
              border-right: 1px solid #af7dc4;
            }

            // 穴位名称项
            .point-name-item {
              width: 100%;
              margin: 4px 0;
              font-size: 16px;
            }

            // 穴位状态项
            .point-status-item {
              width: 100%;
              margin: 4px 0;

              span {
                cursor: pointer;
                transition: all 0.2s;

                &:hover {
                  transform: scale(1.05);
                }
              }
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
          height: auto;
          min-height: 6vh;
          line-height: 1.5;
          font-size: 18px;
          color: #511d6a;
          background: #f3eef4;
          padding: 10px 20px;
          text-align: center;
        }

        .right-btn {
          margin-top: 20px;
          height: 8vh;
          background: #ffffff;
          padding: 0 18px;
          text-align: center;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
        }

        :deep(.use-btn) {
          width: 140px;
          height: 50px;
          font-size: 18px;
          font-weight: bold;
          border-radius: 40px;
          margin: 0 100px;
          --el-button-text-color: #fff;
          --el-button-bg-color: #af7dc4;
          --el-button-border-color: #af7dc4;
          --el-button-hover-text-color: #fff;
          --el-button-hover-bg-color: #9a6cb8;
          --el-button-hover-border-color: #9a6cb8;
          --el-button-active-text-color: #fff;
          --el-button-active-bg-color: #8a5ca0;
          --el-button-active-border-color: #8a5ca0;

          &:disabled {
            --el-button-bg-color: #ccc;
            --el-button-border-color: #ccc;
            cursor: not-allowed;
          }
        }
      }
    }
  }
}

// 状态样式
.status-blue {
  display: inline-block;
  width: 80px;
  height: 30px;
  line-height: 30px;
  font-size: 16px;

  background-color: #bdbdba;
  border-radius: 40px;
  color: #111;
  text-align: center;
}

.status-red {
  display: inline-block;
  width: 80px;
  height: 30px;
  line-height: 30px;
  background-color: #de2b1f;
  border-radius: 40px;
  color: #ffffff;
  text-align: center;
  font-size: 16px;
}

.status-green {
  display: inline-block;
  width: 80px;
  height: 30px;
  line-height: 30px;
  font-size: 16px;

  background-color: #6c359d;
  border-radius: 40px;
  color: #ffffff;
  text-align: center;
}

// Dialog 样式
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

// 隐藏滚动条
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
