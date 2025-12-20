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
          <!-- 引入封装的表格组件 -->
          <div class="table-scrooll-content">
            <DragScrollWrapper>
              <PointTable
                :tableData="tableData"
                :selectedIndex="selectedAutoIndex"
                :minBodyHeight="'5vh'"
                :maxBodyHeight="'50vh'"
                :headerHeight="'6vh'"
                :tableWidth="'100%'"
                @row-click="handleTableRowClick"
                @point-status-click="handleTablePointStatusClick"
                @scroll-change="handleTableScrollChange"
              />
            </DragScrollWrapper>
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

import PointTable from "@/components/point/PointTable.vue"; // 引入封装的表格组件

import BodyFront from "@/components/body/BodyFront.vue";
import BodyBack from "@/components/body/BodyBack.vue";
import LegFront from "@/components/body/LegFront.vue";
import LegBack from "@/components/body/LegBack.vue";
import DragScrollWrapper from "@/components/DragScrollWrapper.vue";

const $ws = inject("$ws");

const currentComponent = shallowRef(markRaw(BodyBack));

const router = useRouter();
const route = useRoute();

const dialogVisible = ref(false);
const selectedCaseId = ref("");
const selectedCase = ref({});
const tableData = ref([]);
const selectedAutoIndex = ref(0);
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
};

// 表格行点击事件
const handleTableRowClick = (item, index) => {
  selectedAutoIndex.value = index;
  // 切换选中行的第一个未完成穴位
  const firstUnfinished = item.points.findIndex((p) => p.status === 0);
  if (firstUnfinished > -1) {
    currentPoint.value = {
      ...item.points[firstUnfinished],
      rowIndex: index,
      pointIndex: firstUnfinished,
    };
    newPlanPoint.value = item.points;
    chooseBody(item.points[firstUnfinished]);
  }
};

// 表格穴位状态点击事件
const handleTablePointStatusClick = ({ item, rowIndex, point, pointIndex }) => {
  console.log("点击穴位状态:", point.name, point.status);
  //手动切换穴位状态逻辑
  // const newTableData = JSON.parse(JSON.stringify(tableData.value));
  // newTableData[rowIndex].points[pointIndex].status = point.status === 0 ? 1 : 0;
  // tableData.value = newTableData;
};

// 表格滚动变化事件
const handleTableScrollChange = (offset) => {
  console.log("表格滚动位置:", offset);
  // 记录滚动位置或其他逻辑
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

    // 修正：检查当前行所有穴位的完成状态
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
      // 同步更新newPlanPoint为当前行的穴位列表
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
    console.log(newPlan);

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

  window.addEventListener("resize", () => {
    //  表格高度变化时重新计算
    // 表格组件内部已处理resize逻辑
  });
});

onUnmounted(() => {
  stopDrag(); // 组件卸载时停止拖拽
  window.removeEventListener("resize", () => {});
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
