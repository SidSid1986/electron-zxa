<template>
  <!-- 左侧列表容器：原生滚动 + 拖动交互 -->
  <div
    class="left-table"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
    @mousemove="handleMouseMove"
    @wheel="handleWheel"
    :style="{ cursor: isDragging ? 'grabbing' : 'grab' }"
  >
    <!-- 列表内容 -->
    <div
      class="table-content flex-row line-one"
      v-for="(item, index) in listData"
      :key="item.id"
      @click="handleItemClick(item.id)"
      :class="{
        'line-one-bottom': index !== listData.length - 1,
        'line-one-selected': item.id === selectedId,
      }"
    >
      <span class="title">{{ item.name }}</span>
      <div class="btn">预设</div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from "vue";

// 接收父组件参数
const props = defineProps({
  // 列表数据
  listData: {
    type: Array,
    default: () => [],
    required: true,
  },
  // 当前选中ID
  selectedId: {
    type: [Number, String],
    default: 1,
  },
  // 容器高度
  containerHeight: {
    type: String,
    default: "70vh",
  },
  // 容器宽度
  containerWidth: {
    type: String,
    default: "100%",
  },
});

// 触发事件
const emit = defineEmits(["item-click"]);

// 拖动相关变量
const isDragging = ref(false);
const startY = ref(0);
const startScrollTop = ref(0);

// 点击列表项
const handleItemClick = (id) => {
  emit("item-click", id);
};

// 鼠标按下（开始拖动）
const handleMouseDown = (e) => {
  const container = e.currentTarget;
  // 内容未超出容器时不触发拖动
  if (container.scrollHeight <= container.clientHeight) return;

  isDragging.value = true;
  startY.value = e.clientY;
  startScrollTop.value = container.scrollTop;
  e.preventDefault(); // 阻止选中文本
  document.body.style.userSelect = "none";
};

// 鼠标松开/离开
const handleMouseUp = () => {
  isDragging.value = false;
  document.body.style.userSelect = "auto";
};

// 鼠标移动（处理拖动）
const handleMouseMove = (e) => {
  if (!isDragging.value) return;

  const container = e.currentTarget;
  const moveY = e.clientY - startY.value;
  // 反向滚动：鼠标向下拖，内容向上滚
  container.scrollTop = startScrollTop.value - moveY;
};

// 滚轮事件
const handleWheel = (e) => {
  const container = e.currentTarget;
  if (container.scrollHeight <= container.clientHeight) {
    e.preventDefault();
    return;
  }

  e.preventDefault();
  const scrollStep = Math.abs(e.deltaY) > 100 ? 50 : 30;
  container.scrollTop += e.deltaY > 0 ? scrollStep : -scrollStep;
};

onMounted(() => {
  // 全局监听鼠标松开（防止移出容器后无法结束）
  document.addEventListener("mouseup", handleMouseUp);
});

onUnmounted(() => {
  document.removeEventListener("mouseup", handleMouseUp);
});
</script>

<style scoped lang="scss">
.left-table {
  width: v-bind(containerWidth);
  height: v-bind(containerHeight);
  overflow-y: auto; // 原生滚动核心
  overflow-x: hidden;
  box-sizing: border-box;
  border: 1px solid #b99aca;
  margin-top: 10px;
  user-select: none;
  cursor: grab;

  // 隐藏滚动条（保留滚动功能）
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  &:active {
    cursor: grabbing;
  }
  -webkit-tap-highlight-color: transparent;
}

.table-content {
  box-sizing: border-box;
  width: 100%;
  justify-content: space-between;
  padding: 0px 5px 0px 20px;
  background-color: #fff;
  height: 5vh;
  transition: background-color 0.2s ease;
  display: flex;
  flex-direction: row;
  align-items: center;

  .title {
    font-size: 18px;
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
</style>
