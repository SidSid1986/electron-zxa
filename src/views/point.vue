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
              <span class="left-nav-text">定穴中</span>
            </div>
          </div>
          <div class="content-left-img-border">
            <div class="content-left-img"></div>
          </div>
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
                  <div class="table-item">{{ item.status }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="right-ins">
            移动摇杆，讲红点制动到指定穴位后，点击下方【使用此穴位】按钮
          </div>

          <div class="right-btn">
            <el-button class="use-btn" type="primary">取消订单</el-button>
            <el-button class="use-btn" type="primary">使用此穴位</el-button>
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
import { useRoute } from "vue-router";

const route = useRoute();
const selectedCaseId = ref("");
const selectedCase = ref({});
const tableData = ref([]);

const selectedAutoIndex = ref(0);

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
  selectedCase.value = caseData.find((item) => {
    return item.id * 1 === id * 1;
  });
  console.log(selectedCase.value);
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

onMounted(() => {
  console.log("组件挂载了");
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
  height: 96vh;
  margin: 0;
  padding: 0;
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
            width: 20%;
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

        .content-left-img-border {
          width: 100%;
          height: calc(82vh - 40px);
          background-color: #fff;
          box-sizing: border-box;
          padding: 40px;

          .content-left-img {
            height: calc(82vh - 120px);
            background: url("@/assets/pic/per_obverse.png") no-repeat;
            background-position: center center;
            background-size: 100% 100%;
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
