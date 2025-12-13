<!--
 * @Author: Sid Li
 * @Date: 2025-12-12 14:38:40
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-13 09:52:04
 * @FilePath: \zi-xiao-ai\src\views\newPlan.vue
 * @Description: 新增灸方页面  
-->
<template>
  <div class="container">
    <div class="point-nav">
      <span class="plan-name">{{ name }}</span>
    </div>
    <div class="point-content">
      <div class="point-content-left">
        <div class="left-img">
          <img src="@/assets/pic/body/body2.png" alt="" />
        </div>
      </div>
      <div class="point-content-right">
        <div class="right-content">
          <div class="table-nav">
            <el-button class="add-btn" type="primary">新增</el-button>
          </div>
          <div class="table-content">
            <div class="table-header">
              <div class="header-item">灸法</div>
              <div class="header-item">时长</div>
              <div class="header-item">穴位</div>
              <div class="header-item">操作</div>
            </div>

            <!-- 外层容器：限制高度 + 隐藏滚动条 -->
            <div
              class="table-data"
              @mousedown="handleRightDragStart"
              @mouseup="handleRightDragEnd"
              @mouseleave="handleRightDragEnd"
              @mousemove="handleRightDragMove"
              @wheel="handleRightWheel"
            >
              <!-- 内层容器：实际滚动内容（添加transform实现拖拽滚动） -->
              <div
                class="table-data-content"
                :style="{
                  transform: `translateY(${rightDragOffset}px)`,
                  transition: rightIsDragging
                    ? 'none'
                    : 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                }"
              >
                <div
                  class="table-line"
                  v-for="item in tableData"
                  :key="item.id"
                >
                  <div class="table-item">{{ item.name }}</div>
                  <div class="table-item">{{ item.time }}</div>
                  <div class="table-item">{{ item.area }}</div>
                  <div class="table-item">
                    <el-button class="edit-btn" type="primary">编辑</el-button>
                    <el-button class="delete-btn" type="danger">删除</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="table-foot">
            <el-button @click="handleCancel" class="cancel-btn" type="primary"
              >取消</el-button
            >
            <el-button class="save-btn" type="primary">保存</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from "vue";
import caseData from "@/data/caseData.json";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();

// 拖拽滚动核心状态（复刻plan.vue逻辑）
const rightIsDragging = ref(false);
const rightStartY = ref(0);
const rightDragOffset = ref(0);
const rightLastY = ref(0);
const rightVelocity = ref(0);
const rightInertiaTimer = ref(null);
const rightContentHeight = ref(0); // 内容总高度
const rightContainerHeight = ref(0); // 容器可视高度
const rightMaxOffset = ref(0); // 最大滚动偏移（底部边界）

// 页面数据
const name = ref("");
const tableData = ref([
  { id: 1, name: "灸法1", time: "10分钟", area: "头、肩、胸" },
  { id: 2, name: "灸法2", time: "15分钟", area: "头、肩、胸" },
  { id: 3, name: "灸法3", time: "20分钟", area: "头、肩、胸" },
  { id: 4, name: "灸法4", time: "25分钟", area: "头、肩、胸" },
  { id: 5, name: "灸法5", time: "30分钟", area: "头、肩、胸" },
  { id: 6, name: "灸法6", time: "35分钟", area: "头、肩、胸" },
  { id: 7, name: "灸法7", time: "40分钟", area: "头、肩、胸" },
  { id: 8, name: "灸法8", time: "45分钟", area: "头、肩、胸" },
  { id: 9, name: "灸法9", time: "50分钟", area: "头、肩、胸" },
  { id: 10, name: "灸法10", time: "55分钟", area: "头、肩、胸" },
  { id: 11, name: "灸法11", time: "60分钟", area: "头、肩、胸" },
  { id: 12, name: "灸法12", time: "65分钟", area: "头、肩、胸" },
]);

const handleCancel = () => {
  router.push("/plan");
};

// 更新最大滚动偏移（边界计算）
const updateRightMaxOffset = () => {
  if (rightContentHeight.value <= rightContainerHeight.value) {
    rightMaxOffset.value = 0;
    rightDragOffset.value = 0; // 内容不足时重置偏移
  } else {
    rightMaxOffset.value =
      rightContainerHeight.value - rightContentHeight.value;
  }
};

// 初始化高度（关键：获取容器和内容高度）
const initRightHeight = () => {
  nextTick(() => {
    const rightContainer = document.querySelector(".table-data");
    const rightContent = document.querySelector(".table-data-content");
    if (rightContainer && rightContent) {
      // 获取容器可视高度
      rightContainerHeight.value = rightContainer.clientHeight;
      // 获取内容总高度
      rightContentHeight.value = rightContent.offsetHeight;
      // 计算滚动边界
      updateRightMaxOffset();
    }
  });
};

// 拖拽开始
const handleRightDragStart = (e) => {
  // 内容不足时不触发拖拽
  if (rightContentHeight.value <= rightContainerHeight.value) return;

  rightIsDragging.value = true;
  rightStartY.value = e.clientY;
  rightLastY.value = e.clientY;
  rightVelocity.value = 0;

  // 样式优化
  document.body.style.cursor = "grabbing";
  document.body.style.userSelect = "none";

  // 清除原有惯性定时器
  if (rightInertiaTimer.value) clearInterval(rightInertiaTimer.value);
};

// 拖拽中
const handleRightDragMove = (e) => {
  if (!rightIsDragging.value) return;
  if (rightContentHeight.value <= rightContainerHeight.value) return;

  const currentY = e.clientY;
  const moveY = currentY - rightLastY.value;
  rightLastY.value = currentY;

  // 计算速度（用于惯性滚动）
  rightVelocity.value = moveY * 0.5;

  // 计算新偏移 + 边界限制（0：顶部，maxOffset：底部）
  let newOffset = rightDragOffset.value + moveY;
  newOffset = Math.max(rightMaxOffset.value, Math.min(0, newOffset));
  rightDragOffset.value = newOffset;
};

// 拖拽结束
const handleRightDragEnd = () => {
  rightIsDragging.value = false;

  // 恢复样式
  document.body.style.cursor = "grab";
  document.body.style.userSelect = "auto";

  // 内容不足时不触发惯性
  if (rightContentHeight.value <= rightContainerHeight.value) return;

  // 速度足够时触发惯性滚动
  if (Math.abs(rightVelocity.value) > 1) {
    startRightInertiaScroll();
  }
};

// 惯性滚动
const startRightInertiaScroll = () => {
  // 清除原有定时器
  if (rightInertiaTimer.value) clearInterval(rightInertiaTimer.value);

  rightInertiaTimer.value = setInterval(() => {
    // 速度衰减（模拟惯性）
    rightVelocity.value *= 0.92;

    // 计算新偏移 + 边界限制
    let newOffset = rightDragOffset.value + rightVelocity.value;
    newOffset = Math.max(rightMaxOffset.value, Math.min(0, newOffset));
    rightDragOffset.value = newOffset;

    // 速度过小时停止惯性
    if (Math.abs(rightVelocity.value) < 0.5) {
      clearInterval(rightInertiaTimer.value);
    }
  }, 16); // 60fps
};

// 滚轮事件（兼容鼠标滚轮）
const handleRightWheel = (e) => {
  if (rightContentHeight.value <= rightContainerHeight.value) {
    e.preventDefault();
    return;
  }

  e.preventDefault(); // 阻止默认滚动
  const scrollStep = Math.abs(e.deltaY) > 100 ? 50 : 30; // 滚轮步长

  // 计算新偏移 + 边界限制
  let newOffset =
    rightDragOffset.value + (e.deltaY > 0 ? -scrollStep : scrollStep);
  newOffset = Math.max(rightMaxOffset.value, Math.min(0, newOffset));
  rightDragOffset.value = newOffset;
};

// 页面初始化
onMounted(() => {
  // 获取灸方名称
  const newPlan = JSON.parse(
    localStorage.getItem("newPlan") || '{"name":"默认灸方"}'
  );
  name.value = newPlan.name;

  // 初始化高度（延迟确保DOM渲染完成）
  setTimeout(() => {
    initRightHeight();
  }, 100);

  // 监听窗口大小变化，重新计算高度
  window.addEventListener("resize", initRightHeight);
});

// 组件卸载：清理定时器和事件监听
onUnmounted(() => {
  if (rightInertiaTimer.value) clearInterval(rightInertiaTimer.value);
  window.removeEventListener("resize", initRightHeight);
});
</script>

<style scoped lang="scss">
.container {
  box-sizing: border-box;
  background: #e3daec;
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
    background-color: #e3daec;

    .plan-name {
      font-size: 28px;
      font-weight: bold;
      color: #693098;
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
      display: flex;
      align-items: center;
      justify-content: center;

      padding: 5vh;

      .left-img {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        background-color: #fff;
        border-radius: 12px;

        img {
          width: 441px;
          height: 636px;
        }
      }
    }

    .point-content-right {
      box-sizing: border-box;
      width: 65%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      padding: 5vh;

      .right-content {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: flex-start;

        background-color: #fff;
        border-radius: 12px;

        .table-nav {
          box-sizing: border-box;
          width: 100%;
          height: 10vh;
          display: flex;
          align-items: center;
          flex-direction: row;
          justify-content: flex-end;

          padding-right: 20px;
        }

        .table-content {
          box-sizing: border-box;
          width: 100%;
          height: 60vh;

          display: flex;
          align-items: center;
          flex-direction: column;
          justify-content: flex-start;

          .table-header {
            box-sizing: border-box;
            width: 100%;
            height: 6vh;
            display: flex;
            align-items: center;
            flex-direction: row;
            justify-content: space-between;

            padding-right: 20px;
            background-color: #b487c6;
            border-radius: 12px 12px 0 0;

            .header-item {
              font-size: 24px;
              font-weight: bold;
              color: #fff;
              height: 6vh;
              line-height: 6vh;
              width: 100%;
              text-align: center;
            }
          }

          // 滚动容器核心样式修改
          .table-data {
            box-sizing: border-box;
            width: 100%;
            height: 54vh;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;

            overflow: hidden;
            position: relative;
            cursor: grab;
            -webkit-tap-highlight-color: transparent;

            &:active {
              cursor: grabbing;
            }

            // 滚动内容容器
            .table-data-content {
              will-change: transform; // 性能优化
              width: 100%;
            }

            .table-line {
              box-sizing: border-box;
              width: 100%;
              height: 6vh;
              display: flex;
              align-items: center;
              flex-direction: row;
              justify-content: space-between;

              padding-right: 20px;

              .table-item {
                font-size: 24px;
                font-weight: bold;
                color: #693098;
                height: 6vh;
                line-height: 6vh;
                width: 100%;
                text-align: center;
              }
            }
          }
        }

        .table-foot {
          box-sizing: border-box;
          width: 100%;
          height: 10vh;
          display: flex;
          align-items: center;
          flex-direction: row;
          justify-content: center;
          background-color: #f9fbf8;
          border-top: 1px solid #d9d9d9;
          border-radius: 0 0 12px 12px;
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
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE/Edge */
  touch-action: pan-y;
  margin: 0;
  padding: 0;
  font-family: "Microsoft YaHei", sans-serif;
}

// 按钮样式优化（可选）
:deep(.add-btn) {
  width: 80px;
  height: 50px;
  font-size: 24px;
  border-radius: 12px;
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

:deep(.cancel-btn) {
  margin: 0 120px;
  width: 120px;
  height: 50px;
  font-size: 24px;
  border-radius: 12px;
  --el-button-text-color: #511d6a;
  --el-button-bg-color: #e5dfed;
  --el-button-border-color: #f3f0f5;
  --el-button-hover-text-color: #511d6a;
  --el-button-hover-bg-color: #e5dfed;
  --el-button-hover-border-color: #e5dfed;
  --el-button-active-text-color: #511d6a;
  --el-button-active-bg-color: #d8cfe5;
  --el-button-active-border-color: #d8cfe5;
}

:deep(.save-btn) {
  margin: 0 120px;
  width: 120px;
  height: 50px;
  font-size: 24px;
  border-radius: 12px;
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

:deep(.edit-btn) {
  width: 80px;
  height: 40px;
  font-size: 18px;
  margin-right: 10px;
  border-radius: 12px;
  --el-button-text-color: #6a3a8a;
  --el-button-bg-color: #eee8f0;
  --el-button-border-color: #eee8f0;
  --el-button-hover-text-color: #6a3a8a;
  --el-button-hover-bg-color: #e0d7e3;
  --el-button-hover-border-color: #e0d7e3;
  --el-button-active-text-color: #6a3a8a;
  --el-button-active-bg-color: #d2c6d6;
  --el-button-active-border-color: #d2c6d6;
}

:deep(.delete-btn) {
  width: 80px;
  height: 40px;
  font-size: 18px;
  border-radius: 12px;
  --el-button-text-color: #9b5b5b;
  --el-button-bg-color: #fdf0ec;
  --el-button-border-color: #fdf0ec;
  --el-button-hover-text-color: #9b5b5b;
  --el-button-hover-bg-color: #f4e0d8;
  --el-button-hover-border-color: #f4e0d8;
  --el-button-active-text-color: #9b5b5b;
  --el-button-active-bg-color: #ebd0c4;
  --el-button-active-border-color: #ebd0c4;
}
</style>
