<template>
  <div class="container">
    <div class="main-top">
      <img
        @click="openMenu"
        draggable="false"
        class="logo"
        src="@/assets/pic/logo.png"
        alt=""
      />
      <div class="main-top-middle flex-row">
        <div class="flex-row nav-text">
          <img
            draggable="false"
            src="@/assets/pic/file-icon/clear_off.png"
            alt=""
          />
          <span>清灰</span>
        </div>
        <div class="flex-row nav-text">
          <img
            draggable="false"
            src="@/assets/pic/file-icon/change_off.png"
            alt=""
          />
          <span>艾条装卸</span>
        </div>
      </div>

      <!-- 显示当前登录用户的昵称 -->
      <div @click="handleClickUser" class="flex-row nav-text">
        <img draggable="false" src="@/assets/pic/file-icon/user.png" alt="" />
        <span>{{ currentUser.nickName || "未登录" }}</span>
      </div>
    </div>
    <div class="main-content">
      <div class="left">
        <div class="title">
          <span>方案灸</span>
          <el-button round type="primary" class="title-btn">自由灸</el-button>
        </div>

        <!-- 外层容器：限制高度 + 隐藏滚动条 -->
        <div
          class="left-table"
          @mousedown="handleDragStart"
          @mouseup="handleDragEnd"
          @mouseleave="handleDragEnd"
          @mousemove="handleDragMove"
          @wheel="handleWheel"
        >
          <!-- 内层容器：实际滚动内容 -->
          <div
            class="table-content"
            :style="{
              transform: `translateY(${dragOffset}px)`,
              transition: isDragging
                ? 'none'
                : 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }"
          >
            <div
              @click="handleClick(item.id)"
              class="flex-row line-one"
              :class="{
                'line-one-bottom': index !== caseArr.length - 1,
                'line-one-selected': item.id === selectedCaseId,
              }"
              v-for="(item, index) in caseArr"
              :key="item.id"
            >
              <span class="title">{{ item.name }}</span>
              <div class="btn">预设</div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="right-top">
          <span>灸法</span>
          <span>时长</span>
          <span>穴位</span>
        </div>

        <!-- 右侧外层容器：最大55vh，最小自适应 -->
        <div
          class="right-table"
          @mousedown="handleRightDragStart"
          @mouseup="handleRightDragEnd"
          @mouseleave="handleRightDragEnd"
          @mousemove="handleRightDragMove"
          @wheel="handleRightWheel"
        >
          <!-- 右侧内层容器：完全复刻左侧结构 -->
          <div
            class="right-table-content"
            :style="{
              transform: `translateY(${rightDragOffset}px)`,
              transition: rightIsDragging
                ? 'none'
                : 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }"
          >
            <div
              class="right-bottom"
              v-for="(item, index) in selectedPlan"
              :key="index"
              :class="{
                'right-bottom-last': index === selectedPlan.length - 1,
              }"
            >
              <span>
                <span class="right-name">{{ item.name }}</span>
              </span>
              <span>{{ item.time }}</span>
              <span>{{ item.point }}</span>
            </div>
          </div>
        </div>

        <!-- 开始按钮容器 -->
        <div class="start-content">
          <el-button
            round
            type="primary"
            class="start-btn"
            @click="handleStartClick"
            >开始</el-button
          >
        </div>
      </div>
    </div>

    <!-- dialog -->
    <el-dialog v-model="dialogVisible" width="500">
      <div class="dialog-content">
        <div class="dialog-title">预备定穴</div>
        <div class="dialog-text">客户在艾灸床上躺好后，点击</div>
        <div class="dialog-text">下方【开始定穴】按钮，进行定穴</div>
        <div class="dialog-btn-content">
          <el-button
            round
            type="primary"
            @click="cancelDialog"
            class="title-btn"
            >取消</el-button
          >
          <el-button
            round
            type="primary"
            @click="confirmDialog"
            class="title-btn"
            >开始定穴</el-button
          >
        </div>
      </div>
    </el-dialog>

    <!-- 抽屉 -->

    <el-drawer
      class="drawer-content"
      v-model="drawerVisible"
      :modal="false"
      direction="ltr"
      modal-penetrable
    >
      <DrawerList />
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import { getCaseData, getCaseById } from "@/utils/caseDataManager";
import DrawerList from "@/components/DrawerList.vue";

const router = useRouter();

// 新增：获取当前登录用户信息
const currentUser = ref(
  JSON.parse(localStorage.getItem("userInfo") || '{"nickName":"未登录"}')
);

// 监听localStorage变化（登录新用户时刷新用户信息）
const watchUserInfo = () => {
  window.addEventListener("storage", (e) => {
    if (e.key === "userInfo") {
      currentUser.value = JSON.parse(e.newValue || '{"nickName":"未登录"}');
    }
  });
};

// 点击用户头像：强制跳转到login页（无限制）
const handleClickUser = () => {
  router.push("/login");
};

// 原有逻辑不变（以下为你的原有代码）
const dialogVisible = ref(false);
const selectedCaseId = ref(1);
const selectedPlan = ref([]);
const caseArr = ref(getCaseData());

// 左侧/右侧拖拽滚动相关状态
const isDragging = ref(false);
const startY = ref(0);
const dragOffset = ref(0);
const lastY = ref(0);
const velocity = ref(0);
const inertiaTimer = ref(null);
const contentHeight = ref(0);
const containerHeight = ref(0);
const maxOffset = ref(0);

const rightIsDragging = ref(false);
const rightStartY = ref(0);
const rightDragOffset = ref(0);
const rightLastY = ref(0);
const rightVelocity = ref(0);
const rightInertiaTimer = ref(null);
const rightContentHeight = ref(0);
const rightContainerHeight = ref(0);
const rightMaxOffset = ref(0);
const drawerVisible = ref(false);
const openMenu = () => {
  drawerVisible.value = true;
};

const updateMaxOffset = () => {
  if (contentHeight.value <= containerHeight.value) {
    maxOffset.value = 0;
    dragOffset.value = 0;
  } else {
    maxOffset.value = containerHeight.value - contentHeight.value;
  }
};

const updateRightMaxOffset = () => {
  if (rightContentHeight.value <= rightContainerHeight.value) {
    rightMaxOffset.value = 0;
    rightDragOffset.value = 0;
  } else {
    rightMaxOffset.value =
      rightContainerHeight.value - rightContentHeight.value;
  }
};

const initLeftHeight = () => {
  const leftContainer = document.querySelector(".left-table");
  const leftContent = document.querySelector(".table-content");
  if (leftContainer && leftContent) {
    containerHeight.value = leftContainer.clientHeight;
    contentHeight.value = leftContent.offsetHeight;
    updateMaxOffset();
  }
};

const initRightHeight = () => {
  const rightContainer = document.querySelector(".right-table");
  const rightContent = document.querySelector(".right-table-content");
  if (rightContainer && rightContent) {
    const contentNaturalHeight = rightContent.scrollHeight;
    const maxHeight = window.innerHeight * 0.55;
    rightContainerHeight.value = Math.min(contentNaturalHeight, maxHeight);
    rightContainer.style.height = `${rightContainerHeight.value}px`;
    rightContentHeight.value = contentNaturalHeight;
    updateRightMaxOffset();
  }
};

const handleStartClick = () => {
  console.log("start");
  dialogVisible.value = true;
};

onMounted(() => {
  setTimeout(() => {
    initLeftHeight();
    initRightHeight();
  }, 100);
  window.addEventListener("resize", initRightHeight);
  const selectedItem = getCaseById(selectedCaseId.value);
  selectedPlan.value = selectedItem?.plan || [];

  // 监听用户信息变化
  watchUserInfo();
});

onUnmounted(() => {
  if (inertiaTimer.value) clearInterval(inertiaTimer.value);
  if (rightInertiaTimer.value) clearInterval(rightInertiaTimer.value);
  window.removeEventListener("resize", initRightHeight);
});

const handleDragStart = (e) => {
  if (contentHeight.value <= containerHeight.value) return;
  isDragging.value = true;
  startY.value = e.clientY;
  lastY.value = e.clientY;
  velocity.value = 0;
  document.body.style.cursor = "grabbing";
  document.body.style.userSelect = "none";
  if (inertiaTimer.value) clearInterval(inertiaTimer.value);
};

const handleDragMove = (e) => {
  if (!isDragging.value) return;
  if (contentHeight.value <= containerHeight.value) return;
  const currentY = e.clientY;
  const moveY = currentY - lastY.value;
  lastY.value = currentY;
  velocity.value = moveY * 0.5;
  let newOffset = dragOffset.value + moveY;
  newOffset = Math.max(maxOffset.value, Math.min(0, newOffset));
  dragOffset.value = newOffset;
};

const handleDragEnd = () => {
  isDragging.value = false;
  document.body.style.cursor = "grab";
  document.body.style.userSelect = "auto";
  if (contentHeight.value <= containerHeight.value) return;
  if (Math.abs(velocity.value) > 1) {
    startInertiaScroll();
  }
};

const startInertiaScroll = () => {
  if (inertiaTimer.value) clearInterval(inertiaTimer.value);
  inertiaTimer.value = setInterval(() => {
    velocity.value *= 0.92;
    let newOffset = dragOffset.value + velocity.value;
    newOffset = Math.max(maxOffset.value, Math.min(0, newOffset));
    dragOffset.value = newOffset;
    if (Math.abs(velocity.value) < 0.5) {
      clearInterval(inertiaTimer.value);
    }
  }, 16);
};

const handleWheel = (e) => {
  if (contentHeight.value <= containerHeight.value) {
    e.preventDefault();
    return;
  }
  e.preventDefault();
  const scrollStep = Math.abs(e.deltaY) > 100 ? 50 : 30;
  let newOffset = dragOffset.value + (e.deltaY > 0 ? -scrollStep : scrollStep);
  newOffset = Math.max(maxOffset.value, Math.min(0, newOffset));
  dragOffset.value = newOffset;
};

const handleRightDragStart = (e) => {
  if (rightContentHeight.value <= rightContainerHeight.value) return;
  rightIsDragging.value = true;
  rightStartY.value = e.clientY;
  rightLastY.value = e.clientY;
  rightVelocity.value = 0;
  document.body.style.cursor = "grabbing";
  document.body.style.userSelect = "none";
  if (rightInertiaTimer.value) clearInterval(rightInertiaTimer.value);
};

const handleRightDragMove = (e) => {
  if (!rightIsDragging.value) return;
  if (rightContentHeight.value <= rightContainerHeight.value) return;
  const currentY = e.clientY;
  const moveY = currentY - rightLastY.value;
  rightLastY.value = currentY;
  rightVelocity.value = moveY * 0.5;
  let newOffset = rightDragOffset.value + moveY;
  newOffset = Math.max(rightMaxOffset.value, Math.min(0, newOffset));
  rightDragOffset.value = newOffset;
};

const handleRightDragEnd = () => {
  rightIsDragging.value = false;
  document.body.style.cursor = "grab";
  document.body.style.userSelect = "auto";
  if (rightContentHeight.value <= rightContainerHeight.value) return;
  if (Math.abs(rightVelocity.value) > 1) {
    startRightInertiaScroll();
  }
};

const startRightInertiaScroll = () => {
  if (rightInertiaTimer.value) clearInterval(rightInertiaTimer.value);
  rightInertiaTimer.value = setInterval(() => {
    rightVelocity.value *= 0.92;
    let newOffset = rightDragOffset.value + rightVelocity.value;
    newOffset = Math.max(rightMaxOffset.value, Math.min(0, newOffset));
    rightDragOffset.value = newOffset;
    if (Math.abs(rightVelocity.value) < 0.5) {
      clearInterval(rightInertiaTimer.value);
    }
  }, 16);
};

const handleRightWheel = (e) => {
  if (rightContentHeight.value <= rightContainerHeight.value) {
    e.preventDefault();
    return;
  }
  e.preventDefault();
  const scrollStep = Math.abs(e.deltaY) > 100 ? 50 : 30;
  let newOffset =
    rightDragOffset.value + (e.deltaY > 0 ? -scrollStep : scrollStep);
  newOffset = Math.max(rightMaxOffset.value, Math.min(0, newOffset));
  rightDragOffset.value = newOffset;
};

const handleClick = (id) => {
  selectedCaseId.value = id;
  const selectedItem = getCaseById(id);
  selectedPlan.value = selectedItem?.plan || [];
  rightDragOffset.value = 0;
  nextTick(() => {
    setTimeout(initRightHeight, 50);
  });
};

const confirmDialog = () => {
  localStorage.setItem("selectedCaseId", selectedCaseId.value);
  router.push(`/point?id=${selectedCaseId.value}`);
};
const cancelDialog = () => {
  dialogVisible.value = false;
};
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
}

.main-top {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 6vh;
  width: 100%;
  border-bottom: 1px solid #c293d5;
  padding: 0 30px;

  .logo {
    width: 6vw;
    height: 4vh;
    cursor: pointer;
  }

  .main-top-middle {
    justify-content: center;
  }

  .nav-text {
    margin: 0 20px;
    cursor: pointer;

    span {
      font-size: 18px;
      color: #511d6a;
      margin-left: 8px;
    }

    img {
      width: 3vh;
      height: 3vh;
      object-fit: contain;
    }
  }
}

.main-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  box-sizing: border-box;
  height: 90vh;
  width: 100%;
  padding: 50px 30px 30px 20px;
  gap: 20px;

  .left {
    width: 30%;
    height: calc(90vh - 80px);
    box-sizing: border-box;
    padding: 10px 20px;

    .title {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      span {
        height: 50px;
        line-height: 50px;
        font-size: 30px;
        color: #511d6a;
        font-weight: bold;
      }

      :deep(.title-btn) {
        width: 120px;
        height: 50px;
        font-size: 24px;
        border-radius: 40px;
        margin-left: 20px;
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

    // 左侧容器样式（保持不变）
    .left-table {
      margin-top: 10px;
      border-left: 1px solid #b99aca;
      border-right: 1px solid #b99aca;
      height: 70vh;
      overflow: hidden;
      position: relative;
      cursor: grab;
      &:active {
        cursor: grabbing;
      }
      -webkit-tap-highlight-color: transparent;

      .table-content {
        will-change: transform;
      }

      .line-one {
        box-sizing: border-box;
        width: 100%;
        justify-content: space-between;
        padding: 0px 5px 0px 20px;
        background-color: #fff;
        height: 5vh;
        transition: background-color 0.2s ease;

        .title {
          font-size: 24px;
          color: #511d6a;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          height: auto;
          line-height: normal;
        }

        .btn {
          width: 50px;
          height: 25px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          background: #ff860e;
          font-size: 12px;
          color: #ffffff;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }

        &:hover {
          background-color: #f5f0fa;
          .btn {
            background: #ff9f43;
          }
        }
      }

      .line-one-bottom {
        border-bottom: 1px solid #b99aca;
      }

      .line-one-selected {
        background-color: #d8c7e5;
        &:hover {
          background-color: #d8c7e5;
        }
      }
    }
  }

  .right {
    padding-top: 4vh;
    width: 70%;
    height: calc(90vh - 80px);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    .right-top {
      height: 5vh;
      line-height: 5vh;
      font-size: 24px;
      color: #511d6a;
      font-weight: bold;
      border-bottom: 1px solid #c293d5;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      background: #c293d5;
      box-sizing: border-box;

      span {
        color: #ffffff;
        text-align: center;
        box-sizing: border-box;
      }

      :nth-child(1) {
        width: 25%;
      }

      :nth-child(2) {
        width: 25%;
        border-left: 1px solid #ffffff;
        border-right: 1px solid #ffffff;
      }

      :nth-child(3) {
        width: 50%;
      }
    }

    // 右侧容器样式：关键优化！不固定高度，由JS动态设置
    .right-table {
      margin-top: 0;
      border-left: 1px solid #b99aca;
      border-right: 1px solid #b99aca;
      border-bottom: 1px solid #b99aca;
      overflow: hidden;
      position: relative;
      cursor: grab;
      &:active {
        cursor: grabbing;
      }
      -webkit-tap-highlight-color: transparent;
      /* 高度由JS动态设置，这里不写固定值 */
    }

    // 右侧内容容器：保持与左侧一致
    .right-table-content {
      will-change: transform;
    }

    .right-bottom {
      box-sizing: border-box;
      width: 100%;
      height: 5vh;
      line-height: 5vh;
      font-size: 24px;
      color: #511d6a;
      font-weight: 500;
      border-bottom: 1px solid #b99aca;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      background-color: #dad2e6;

      span {
        box-sizing: border-box;
      }

      .right-name {
        padding-left: 20px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: left;
      }

      :nth-child(1) {
        width: 25%;
      }

      :nth-child(2) {
        width: 25%;
        border-left: 1px solid #b99aca;
        border-right: 1px solid #b99aca;
        text-align: center;
        // background-color: red;
      }

      :nth-child(3) {
        width: 50%;
        border-right: none;
        text-align: center;
      }
    }

    .right-bottom-last {
      border-bottom: none !important;
    }

    .start-content {
      height: 5vh;
      line-height: 5vh;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      margin-top: 20px;
      :deep(.start-btn) {
        width: 300px;
        height: 80px;
        font-size: 24px;
        font-weight: bold;
        border-radius: 40px;
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

.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;

  img {
    width: 60px;
    height: 60px;
    margin-right: 10px;
  }

  span {
    font-size: 30px;
    margin-right: 40px;
    color: #511d6a;
  }
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
  height: 25vh;
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

// 按钮样式优化（可选，让按钮与文字颜色协调）
:deep(.el-dialog .title-btn) {
  width: 150px;
  height: 60px;
  border-radius: 40px;
  margin: 0 60px;
  font-size: 24px;
  font-weight: bold;
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

:deep(.el-dialog) {
  --el-dialog-bg-color: #d4bfe1 !important;
  border-radius: 20px;
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
}

// 抽屉内容样式
</style>
<style lang="scss">
.drawer-content {
  height: 86vh;
  box-sizing: border-box;
  margin-top: 4vh;
  width: 20vw !important;
  .el-drawer__header {
    display: none;
  }
}
</style>
