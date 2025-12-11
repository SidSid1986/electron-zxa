<template>
  <div
    class="virtual-keyboard-wrapper"
    v-show="visible"
    :style="{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      zIndex: 9999,
      background: '#ececec',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      padding: '10px',
      boxSizing: 'border-box',
    }"
    @click.stop
  >
    <!-- 关闭按钮 -->
    <div
      class="keyboard-close"
      @click="handleClose"
      style="
        position: absolute;
        top: 5px;
        right: 20px;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        z-index: 10000;
      "
    >
      ×
    </div>

    <!-- 中英文切换按钮 -->
    <div
      class="input-method-switch"
      @click="toggleChineseMode"
      style="
        position: absolute;
        top: 5px;
        left: 20px;
        font-size: 18px;
        cursor: pointer;
        color: #666;
        z-index: 10000;
        padding: 2px 8px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
      "
    >
      {{ isChineseMode ? "中文" : "英文" }}
    </div>

    <!-- 键盘容器（填满宽度） -->
    <div
      ref="keyboardRef"
      class="simple-keyboard-container"
      style="height: 320px; margin-top: 30px; width: 100%"
    ></div>
  </div>
</template>

<script setup>
import {
  ref,
  watch,
  onMounted,
  onUnmounted,
  defineProps,
  defineEmits,
  defineExpose,
  nextTick,
} from "vue";
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";
// 引入官方中文布局（核心：实现完整中文输入）
import chineseLayout from "simple-keyboard-layouts/build/layouts/chinese.js";

// 定义Props（极简，仅核心参数）
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: String,
    default: "",
  },
  // 数字精度（可选）
  precision: {
    type: Number,
    default: 2,
  },
});

// 定义Emits（仅核心事件）
const emit = defineEmits(["update:modelValue", "close", "enter"]);

// 内部状态
const keyboardRef = ref(null);
const keyboardInstance = ref(null);
const currentValue = ref(props.modelValue);
const isChineseMode = ref(false); // 默认中文模式

// 基础布局（精简版：仅保留核心按键）
const baseLayout = {
  default: [
    "1 2 3 4 5 6 7 8 9 0 {bksp}",
    "q w e r t y u i o p",
    "a s d f g h j k l",
    "z x c v b n m {shift}",
    "{space} {enter} {clear}",
  ],
  shift: [
    "1 2 3 4 5 6 7 8 9 0 {bksp}",
    "Q W E R T Y U I O P",
    "A S D F G H J K L",
    "Z X C V B N M {shift}",
    "{space} {enter} {clear}",
  ],
};

// 初始化键盘
const initKeyboard = () => {
  if (!keyboardRef.value) return;

  // 销毁旧实例
  if (keyboardInstance.value) {
    keyboardInstance.value.destroy();
  }

  // 创建键盘实例（集成官方中文布局）
  keyboardInstance.value = new Keyboard(keyboardRef.value, {
    onChange: (input) => {
      currentValue.value = input;
      emit("update:modelValue", input);
    },
    onKeyPress: handleKeyPress,
    onInit: (kbd) => {
      kbd.setInput(currentValue.value);
      // 初始化中文布局（关键）
      if (isChineseMode.value) {
        kbd.setOptions({
          layoutCandidates: chineseLayout.layoutCandidates, // 中文候选词
          enableCandidates: true, // 显示候选词框
        });
      }
    },
    layout: baseLayout,
    layoutName: "default",
    display: {
      "{bksp}": "删除",
      "{shift}": "大小写",
      "{space}": "空格",
      "{enter}": "回车",
      "{clear}": "清空",
    },
    theme: "hg-theme-default",
    adaptive: true, // 自适应宽度
  });
};

// 按键处理（核心逻辑）
const handleKeyPress = (button) => {
  const kbd = keyboardInstance.value;
  if (!kbd) return;

  switch (button) {
    case "{bksp}": // 删除
      currentValue.value = currentValue.value.slice(0, -1);
      emit("update:modelValue", currentValue.value);
      break;
    case "{shift}": // 大小写切换
      const newLayout =
        kbd.options.layoutName === "default" ? "shift" : "default";
      kbd.setOptions({ layoutName: newLayout });
      break;
    case "{enter}": // 回车
      emit("enter");
      break;
    case "{clear}": // 清空
      kbd.clearInput();
      currentValue.value = "";
      emit("update:modelValue", "");
      break;
    case "{space}": // 空格
      currentValue.value += " ";
      emit("update:modelValue", currentValue.value);
      break;
    default:
      // 保持输入焦点（可选）
      nextTick(() => {
        document.activeElement?.focus();
      });
      break;
  }
};

// 切换中英文模式
const toggleChineseMode = () => {
  isChineseMode.value = !isChineseMode.value;
  const kbd = keyboardInstance.value;
  if (kbd) {
    kbd.setOptions({
      layoutCandidates: isChineseMode.value
        ? chineseLayout.layoutCandidates
        : null,
      enableCandidates: isChineseMode.value, // 中文模式显示候选词，英文隐藏
    });
  }
};

// 关闭键盘（含数字精度处理）
const handleClose = () => {
  // 数字精度处理（可选）
  if (props.precision && currentValue.value) {
    currentValue.value = currentValue.value
      ?.replace(new RegExp(`(\\d+)\\.(\\d{${props.precision}}).*$`), "$1.$2")
      .replace(/\.$/, "");
    emit("update:modelValue", currentValue.value);
  }
  emit("close");
};

// 监听Props变化
watch(
  () => props.visible,
  (val) => {
    if (val) {
      currentValue.value = props.modelValue;
      nextTick(initKeyboard); // 确保DOM渲染后初始化
    }
  },
  { immediate: true }
);

watch(
  () => props.modelValue,
  (val) => {
    if (props.visible && val !== currentValue.value) {
      currentValue.value = val;
      keyboardInstance.value?.setInput(val);
    }
  }
);

// 生命周期
onMounted(() => {
  if (props.visible) initKeyboard();
});

onUnmounted(() => {
  if (keyboardInstance.value) {
    keyboardInstance.value.destroy();
  }
});

// 暴露方法（可选）
defineExpose({
  initKeyboard,
  handleClose,
  toggleChineseMode,
});
</script>

<style scoped>
/* 核心样式：填满宽度+适配触屏 */
.virtual-keyboard-wrapper {
  font-size: 16px !important;
}

:deep(.hg-theme-default) {
  width: 100% !important;
  max-width: none !important;
}

:deep(.hg-row) {
  display: flex;
  justify-content: stretch;
  gap: 2px;
  margin: 5px 0;
}

:deep(.hg-button) {
  height: 70px !important;
  font-size: 20px !important;
  line-height: 70px !important;
  flex: 1 !important;
  min-width: 40px !important;
  border-radius: 8px !important;
  background: #f5f5f5 !important;
  border: 1px solid #e0e0e0 !important;
  text-align: center;
}

/* 功能键样式 */
:deep(.hg-button-bksp),
:deep(.hg-button-shift),
:deep(.hg-button-enter),
:deep(.hg-button-clear) {
  flex: 1.5 !important;
}

:deep(.hg-button-space) {
  flex: 3 !important;
}

:deep(.hg-button:active) {
  background: #e0e0e0 !important;
}

/* 中文候选词框样式（核心） */
:deep(.hg-candidate-box) {
  background: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
  padding: 8px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

:deep(.hg-candidate-box button) {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 16px;
}

:deep(.hg-candidate-box button:hover) {
  background: #e8e8e8;
}

/* 输入法切换按钮 hover 效果 */
.input-method-switch:hover {
  background: #f5f5f5;
}
</style>
// .hg-candidate-box { // margin-top: -20px; // }
