<template>
  <div class="table-outer">
    <div class="table-wrapper">
      <div class="table-header">
        <div class="table-cell">订单时间</div>
        <div class="table-cell">顾客姓名</div>
        <div class="table-cell no-border">是否完成</div>
      </div>

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
        <div class="table-row" v-for="(item, index) in tableData" :key="index">
          <div class="table-cell line-bg">{{ item.date }}</div>
          <div class="table-cell line-bg">{{ item.name }}</div>
          <div class="table-cell line-bg no-border">
            {{ item.isComplete === 1 ? "已完成" : "未完成" }}
          </div>
        </div>

        <div v-if="!tableData || tableData.length === 0" class="empty-row">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  tableData: {
    type: Array,
    default: () => [],
    required: true,
  },
  minBodyHeight: {
    type: String,
    default: "5vh",
  },
  maxBodyHeight: {
    type: String,
    default: "20vh",
  },
  headerHeight: {
    type: String,
    default: "5vh",
  },
  tableWidth: {
    type: String,
    default: "90vw",
  },
});

const isDragging = ref(false);
const startY = ref(0);
const startScrollTop = ref(0);

const handleMouseDown = (e) => {
  isDragging.value = true;
  startY.value = e.clientY;
  startScrollTop.value = e.target.scrollTop || e.currentTarget.scrollTop;
  e.preventDefault();
};

const handleMouseUp = () => {
  isDragging.value = false;
};

const handleMouseMove = (e) => {
  if (!isDragging.value) return;
  const moveY = e.clientY - startY.value;
  const tableBody = e.currentTarget;
  tableBody.scrollTop = startScrollTop.value - moveY;
};

onMounted(() => {
  document.addEventListener("mouseup", handleMouseUp);
});

onUnmounted(() => {
  document.removeEventListener("mouseup", handleMouseUp);
});
</script>

<style scoped lang="scss">
.table-outer {
  width: v-bind(tableWidth);
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid #c293d5;
}

.table-wrapper {
  width: calc(100%);
  box-sizing: border-box;
}

.table-header {
  display: flex;
  height: v-bind(headerHeight);
  width: 100%;
  background-color: #c293d5;
  border-bottom: 1px solid #c293d5;
  box-sizing: border-box;
  color: #ffffff;

  .table-cell {
    width: 33.3333%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #ffffff;
    box-sizing: border-box;
    font-weight: bold;
    font-size: 20px;
    text-align: center;
    word-break: break-all;

    &.no-border {
      border-right: none;
    }
  }
}

.table-body {
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
  user-select: none;
  cursor: grab;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

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
    width: 33.3333%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #c293d5;
    box-sizing: border-box;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    word-break: break-all;

    &.no-border {
      border-right: none;
    }
  }
}

.empty-row {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}
</style>
