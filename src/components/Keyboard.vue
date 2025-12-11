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
import chineseLayout from "simple-keyboard-layouts/build/layouts/chinese.js";

// 定义Props：移除field，仅保留form和precision
const props = defineProps({
  form: {
    type: Object,
    required: true,
  },
  precision: {
    type: Number,
    default: 2,
  },
});

const emit = defineEmits(["close"]);

// 内部状态：新增currentField维护当前绑定字段（替代props.field）
const keyboardRef = ref(null);
const keyboardInstance = ref(null);
const visible = ref(false);
const isChineseMode = ref(false);
const isOpening = ref(false);
const keyboardWrapperRef = ref(null);
const currentValue = ref("");
const currentField = ref(""); // 新增：内部维护当前字段

// 基础布局不变
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

// 初始化键盘：将props.field改为currentField
const initKeyboard = () => {
  if (!keyboardRef.value || !currentField.value) return; // 改为currentField

  if (keyboardInstance.value) {
    keyboardInstance.value.destroy();
  }

  // 初始化值改为currentField
  currentValue.value = props.form[currentField.value] || "";

  keyboardInstance.value = new Keyboard(keyboardRef.value, {
    onChange: (input) => {
      currentValue.value = input;
      // 同步到表单：改为currentField
      props.form[currentField.value] = input;
    },
    onKeyPress: handleKeyPress,
    onInit: (kbd) => {
      kbd.setInput(currentValue.value);
      if (isChineseMode.value) {
        kbd.setOptions({
          layoutCandidates: chineseLayout.layoutCandidates,
          enableCandidates: true,
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
    adaptive: true,
  });
};

// 按键处理：所有props.field改为currentField
const handleKeyPress = (button) => {
  const kbd = keyboardInstance.value;
  if (!kbd) return;

  switch (button) {
    case "{bksp}":
      currentValue.value = currentValue.value.slice(0, -1);
      props.form[currentField.value] = currentValue.value; // 改为currentField
      break;
    case "{shift}":
      const newLayout =
        kbd.options.layoutName === "default" ? "shift" : "default";
      kbd.setOptions({ layoutName: newLayout });
      break;
    case "{enter}":
      handleClose();
      break;
    case "{clear}":
      kbd.clearInput();
      currentValue.value = "";
      props.form[currentField.value] = ""; // 改为currentField
      break;
    case "{space}":
      currentValue.value += " ";
      props.form[currentField.value] = currentValue.value; // 改为currentField
      break;
    default:
      nextTick(() => {
        document.activeElement?.focus();
      });
      break;
  }
};

// 切换中英文模式不变
const toggleChineseMode = () => {
  isChineseMode.value = !isChineseMode.value;
  const kbd = keyboardInstance.value;
  if (kbd) {
    kbd.setOptions({
      layoutCandidates: isChineseMode.value
        ? chineseLayout.layoutCandidates
        : null,
      enableCandidates: isChineseMode.value,
    });
  }
};

// 关闭键盘：props.field改为currentField
const handleClose = () => {
  if (props.precision && currentValue.value) {
    currentValue.value = currentValue.value
      ?.replace(new RegExp(`(\\d+)\\.(\\d{${props.precision}}).*$`), "$1.$2")
      .replace(/\.$/, "");
    props.form[currentField.value] = currentValue.value; // 改为currentField
  }
  visible.value = false;
  emit("close");
};

// 打开键盘：修改为给currentField赋值（不再修改props）
const open = (field) => {
  if (!field) return;
  isOpening.value = true;
  currentField.value = field; // 改为内部变量赋值
  visible.value = true;

  nextTick(() => {
    initKeyboard(); // 此时currentField已有值，能正常初始化
    keyboardWrapperRef.value = document.querySelector(
      ".virtual-keyboard-wrapper"
    );

    const inputEl = document.querySelector(
      `.login-input input[placeholder*="${field === "username" ? "账号" : "密码"}"]`
    );
    if (inputEl) {
      inputEl.focus();
      setTimeout(() => {
        inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length;
        isOpening.value = false;
      }, 0);
    }
  });

  setTimeout(() => {
    isOpening.value = false;
  }, 100);
};

// 点击外部关闭逻辑不变
const handleClickOutside = (e) => {
  if (!visible.value || isOpening.value) return;

  const wrapperEl =
    keyboardWrapperRef.value ||
    document.querySelector(".virtual-keyboard-wrapper");
  if (!wrapperEl) return;

  const isInput =
    e.target.tagName === "INPUT" &&
    e.target.classList.contains("el-input__inner");
  if (!wrapperEl.contains(e.target) && !isInput) {
    handleClose();
  }
};

// 监听表单变化：改为监听currentField对应的字段
watch(
  () => props.form[currentField.value], // 改为currentField
  (val) => {
    if (visible.value && val !== currentValue.value) {
      currentValue.value = val;
      keyboardInstance.value?.setInput(val);
    }
  },
  { deep: true }
);

// 生命周期不变
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  if (keyboardInstance.value) {
    keyboardInstance.value.destroy();
  }
  document.removeEventListener("click", handleClickOutside);
});

// 暴露方法不变
defineExpose({
  open,
  handleClose,
});
</script>

<style scoped>
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

.input-method-switch:hover {
  background: #f5f5f5;
}
</style>
