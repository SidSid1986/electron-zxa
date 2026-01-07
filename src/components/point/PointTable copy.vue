<!-- src/components/PointTable.vue -->
<template>
  <!-- 外层容器：解决滚动条占位 + 完整边框 -->
  <div class="table-outer">
    <div class="table-wrapper">
      <!-- 固定表头 -->
      <div class="table-header">
        <div class="table-cell header-item1">灸法</div>
        <div class="table-cell header-item2">时长</div>
        <div class="table-cell header-item3">穴位</div>
        <div class="table-cell header-item4 no-border">定穴状态</div>
      </div>

      <!-- 可滚动表体（动态高度：最小/最大） -->
      <div
        class="table-body"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @mousemove="handleMouseMove"
        @wheel="handleWheel"
        :style="{
          cursor: isDragging ? 'grabbing' : 'grab',
          minHeight: minBodyHeight,
          maxHeight: maxBodyHeight,
          height: 'fit-content',
        }"
      >
        <!-- 表体数据行 -->
        <div
          v-for="(item, index) in tableData"
          :key="index"
          :class="[
            'table-row',
            index === selectedIndex ? 'table-item-border-index' : 'right-table-content',
          ]"
          @click="handleRowClick(item, index)"
        >
          <!-- 灸法列 -->
          <div class="table-cell table-item1">
            <div class="table-item-left" v-if="index === selectedIndex"></div>
            <div class="table-item-left-trans" v-else></div>
            <div class="table-line-name">{{ item.chooseName }}</div>
          </div>

          <!-- 时长列 -->
          <div class="table-cell table-item2">
            {{ item.time }}
          </div>

          <!-- 穴位列 -->
          <div class="table-cell table-item3">
            <div
              v-for="(area, areaIndex) in item.points"
              :key="areaIndex"
              class="point-name-item"
            >
              {{ area.name }}
            </div>
          </div>

          <!-- 定穴状态列 -->
          <div class="table-cell table-item4 no-border">
            <div
              v-for="(point, pointIndex) in item.points"
              :key="pointIndex"
              class="point-status-item"
              @click.stop="handlePointStatusClick(item, index, point, pointIndex)"
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
        <!-- 空数据占位 -->
        <div v-if="!tableData || tableData.length === 0" class="empty-row">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";

const props = defineProps({
  // 表格数据源
  tableData: {
    type: Array,
    required: true,
    default: () => [],
  },
  // 当前选中行索引
  selectedIndex: {
    type: Number,
    required: true,
    default: 0,
  },
  // 表体最小高度
  minBodyHeight: {
    type: String,
    default: "5vh",
  },
  // 表体最大高度
  maxBodyHeight: {
    type: String,
    default: "50vh",
  },
  // 表头高度
  headerHeight: {
    type: String,
    default: "6vh",
  },
  // 表格宽度
  tableWidth: {
    type: String,
    default: "100%",
  },
});

// 对外暴露的事件
const emit = defineEmits([
  "row-click", // 行点击
  "point-status-click", // 穴位状态点击
  "scroll-change", // 滚动位置变化
]);

// 拖动滚动相关变量（对齐参考示例）
const isDragging = ref(false);
const startY = ref(0);
const startScrollTop = ref(0);
const tableBodyRef = ref(null); // 表体DOM引用

// 鼠标按下事件（开始拖动）
const handleMouseDown = (e) => {
  const tableBody = e.currentTarget;
  if (!tableBody) return;

  isDragging.value = true;
  startY.value = e.clientY;
  startScrollTop.value = tableBody.scrollTop;
  e.preventDefault(); // 阻止默认行为
};

// 鼠标松开/离开事件（结束拖动）
const handleMouseUp = () => {
  isDragging.value = false;
};

// 鼠标移动事件（处理拖动滚动）
const handleMouseMove = (e) => {
  if (!isDragging.value) return;

  const tableBody = e.currentTarget;
  const moveY = e.clientY - startY.value;
  // 反向滚动：鼠标向下拖  内容向上滚
  tableBody.scrollTop = startScrollTop.value - moveY;

  // 通知父组件滚动位置变化
  emit("scroll-change", tableBody.scrollTop);
};

// 滚轮事件（增强滚动体验）
const handleWheel = (e) => {
  const tableBody = e.currentTarget;
  // 自定义滚动步长
  const scrollStep = Math.abs(e.deltaY) > 100 ? 50 : 30;
  tableBody.scrollTop += e.deltaY > 0 ? scrollStep : -scrollStep;

  emit("scroll-change", tableBody.scrollTop);
};

// 行点击事件
const handleRowClick = (item, index) => {
  // emit("row-click", item, index);
};

// 穴位状态点击事件
const handlePointStatusClick = (item, rowIndex, point, pointIndex) => {
  emit("point-status-click", { item, rowIndex, point, pointIndex });
};

// 监听数据源变化
watch(
  () => props.tableData,
  () => {
    nextTick(() => {
      // 数据更新后重置滚动位置
      if (tableBodyRef.value) {
        tableBodyRef.value.scrollTop = 0;
      }
    });
  },
  { deep: true }
);

onMounted(() => {
  // 全局监听鼠标松开（防止移出表体后无法结束拖动）
  document.addEventListener("mouseup", handleMouseUp);
  // 绑定表体Ref
  tableBodyRef.value = document.querySelector(".table-body");
});

onUnmounted(() => {
  // 移除全局监听，避免内存泄漏
  document.removeEventListener("mouseup", handleMouseUp);
});
</script>

<style scoped lang="scss">
// 外层容器：解决滚动条占位 + 完整边框（对齐参考示例）
.table-outer {
  width: v-bind(tableWidth);
  overflow: hidden;
  box-sizing: border-box;
  background-color: #fbfcf9;
}

// 表格整体容器
.table-wrapper {
  width: calc(100%);
  box-sizing: border-box;
}

// 表格表头
.table-header {
  display: flex;
  height: v-bind(headerHeight);
  width: 100%;
  background-color: #fcd700;
  border-bottom: 1px solid #ffffff;
  box-sizing: border-box;
  font-size: 20px;
  color: #111;

  .table-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-sizing: border-box;
    border-right: 1px solid #ffffff;
    font-weight: bold;
    padding: 0 8px;
    word-break: break-all;

    // 列宽分配
    &.header-item1 {
      width: 16.6667%;
    }
    &.header-item2 {
      width: 16.6667%;
    }
    &.header-item3 {
      width: 33.3333%;
    }
    &.header-item4 {
      width: 33.3333%;
    }

    // 最右侧单元格无边框
    &.no-border {
      border-right: none;
    }
  }
}

// 表格体容器
.table-body {
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
  user-select: none;
  cursor: grab;

  // 完全隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  // 空数据样式
  .empty-row {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
    font-size: 18px;
    padding: 20px 0;
  }
}

// 表格行基础样式
.table-row {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  height: 8vh;
  align-items: center;

  .table-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-sizing: border-box;
    border-right: 1px solid #af7dc4;
    // padding: 0 8px;
    word-break: break-all;
    height: 100%;

    // 列宽与表头严格对齐
    &.table-item1 {
      width: 16.6667%;
    }
    &.table-item2 {
      width: 16.6667%;
    }
    &.table-item3 {
      width: 33.3333%;
    }
    &.table-item4 {
      width: 33.3333%;
    }

    // 最右侧单元格无边框
    &.no-border {
      border-right: none;
    }

    // 灸法列特殊样式
    &.table-item1 {
      justify-content: flex-start;
      // padding-left: 20px;

      .table-item-left {
        width: 4px;
        height: 100%;
        background-color: #af7dc4;
        margin-right: 10px;
      }

      .table-item-left-trans {
        width: 4px;
        height: 100%;
        background-color: transparent;
        margin-right: 10px;
      }

      .table-line-name {
        margin-left: 20%;
        font-size: 18px;
      }
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
}

// 未选中行样式
.right-table-content {
  background-color: #ffffff;
  color: #511d6a;
  font-size: 18px;
}

// 选中行样式
.table-item-border-index {
  background-color: #f3ebf4;
  color: #511d6a;
  font-size: 20px;
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
</style>
