<template>
  <!-- 表格核心容器：解决滚动条占位 + 边框 -->
  <div class="table-outer">
    <div class="table-wrapper">
      <!-- 固定表头 -->
      <div class="table-header">
        <div class="table-cell">灸法</div>
        <div class="table-cell">时间</div>
        <div class="table-cell no-border">穴位</div>
      </div>

      <!-- 可滚动表体（动态高度：最小/最大） -->
      <div
        class="table-body"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @mousemove="handleMouseMove"
        :style="{
          cursor: isDragging ? 'grabbing' : 'grab',
          minHeight: minBodyHeight,
          maxHeight: maxBodyHeight,
          height: 'fit-content', // 自适应内容高度（不超最大高度）
        }"
      >
        <!-- 表体数据行 -->
        <div class="table-row" v-for="(item, index) in tableData" :key="index">
          <div class="table-cell line-bg">{{ item.chooseName }}</div>
          <div class="table-cell line-bg">{{ item.time }}分钟</div>
          <div class="table-cell line-bg no-border">
            {{ item.points?.map((point) => point.name).join("、") || "无" }}
          </div>
        </div>
        <!-- 空数据占位 -->
        <div v-if="!tableData || tableData.length === 0" class="empty-row">
          暂无数据
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// 接收父组件传入的表体数据
const props = defineProps({
  // 表体数据数组，结构需包含：chooseName、time、points（数组，含name字段）
  tableData: {
    type: Array,
    default: () => [],
    required: true,
  },
  // 新增：表体最小高度（默认5vh，适配1行数据）
  minBodyHeight: {
    type: String,
    default: "5vh",
  },
  // 新增：表体最大高度（默认20vh，超出滚动）
  maxBodyHeight: {
    type: String,
    default: "20vh",
  },
  // 可选：表头高度（默认5vh）
  headerHeight: {
    type: String,
    default: "5vh",
  },
  // 可选：表格宽度（默认90vw）
  tableWidth: {
    type: String,
    default: "90vw",
  },
});

// 拖动滚动相关变量
const isDragging = ref(false); // 是否正在拖动
const startY = ref(0); // 鼠标按下时的Y坐标
const startScrollTop = ref(0); // 鼠标按下时的滚动条位置

// 鼠标按下事件（开始拖动）
const handleMouseDown = (e) => {
  isDragging.value = true;
  startY.value = e.clientY; // 记录鼠标按下时的屏幕Y坐标
  // 获取表体当前的滚动位置
  startScrollTop.value = e.target.scrollTop || e.currentTarget.scrollTop;
  // 阻止默认行为（避免选中文字等）
  e.preventDefault();
};

// 鼠标松开/离开事件（结束拖动）
const handleMouseUp = () => {
  isDragging.value = false;
};

// 鼠标移动事件（处理拖动滚动）
const handleMouseMove = (e) => {
  if (!isDragging.value) return;

  // 计算鼠标移动的距离
  const moveY = e.clientY - startY.value;
  // 滚动表体（反向滚动：鼠标向下拖，内容向上滚；反之亦然）
  const tableBody = e.currentTarget;
  tableBody.scrollTop = startScrollTop.value - moveY;
};

onMounted(() => {
  // 全局监听鼠标松开（防止鼠标移出表体后无法结束拖动）
  document.addEventListener("mouseup", handleMouseUp);
});

onUnmounted(() => {
  // 移除全局监听，避免内存泄漏
  document.removeEventListener("mouseup", handleMouseUp);
});
</script>

<style scoped lang="scss">
// 外层包裹 - 解决滚动条占位 + 完整边框
.table-outer {
  width: v-bind(tableWidth); // 接收props的宽度
  overflow: hidden; // 隐藏内部滚动条的占位
  box-sizing: border-box;
  border: 1px solid #c293d5; // 外层完整边框
}

// 表格整体容器：补偿滚动条宽度
.table-wrapper {
  width: calc(100% + 17px); // 补偿浏览器默认滚动条宽度
  box-sizing: border-box;
}

// 表格表头
.table-header {
  display: flex;
  height: v-bind(headerHeight); // 接收props的表头高度
  width: 100%;
  background-color: #c293d5;
  border-bottom: 1px solid #c293d5;
  box-sizing: border-box;
  color: #ffffff;

  .table-cell {
    width: 33.3333%; // 固定三等分，精准对齐
    flex-shrink: 0; // 禁止收缩，避免列宽偏差
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #ffffff;
    box-sizing: border-box;
    font-weight: bold;
    padding: 0 8px;
    text-align: center;
    word-break: break-all; // 防止超长文字溢出

    // 最右侧单元格无边框
    &.no-border {
      border-right: none;
    }
  }
}

// 表格体容器（支持拖动+滚轮滚动）
.table-body {
  overflow-y: auto; // 原生滚动（拖动依赖此属性）
  width: 100%;
  box-sizing: border-box;
  user-select: none; // 禁止选中文本，提升拖动体验
  cursor: grab; // 悬浮显示可拖动光标

  // 完全隐藏滚动条（保留滚动功能）
  &::-webkit-scrollbar {
    display: none; // Chrome/Safari
  }
  -ms-overflow-style: none; // IE/Edge
  scrollbar-width: none; // Firefox
}

// 表格行样式
.table-row {
  display: flex;
  height: 5vh;
  width: 100%;
  border-bottom: 1px solid #c293d5;
  box-sizing: border-box;
  background-color: #dad2e6;
  color: #6a3e81;

  &:last-child {
    border-bottom: none;
  }

  .table-cell {
    width: 33.3333%; // 与表头严格对齐
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #c293d5;
    box-sizing: border-box;
    padding: 0 8px;
    text-align: center;
    word-break: break-all; // 防止超长穴位名称溢出
    font-size: 14px;

    // 最右侧单元格无边框
    &.no-border {
      border-right: none;
    }
  }
}

// 空数据样式
.empty-row {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}
</style>
