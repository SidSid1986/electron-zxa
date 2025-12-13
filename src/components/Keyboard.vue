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
      style="height: 30vh; margin-top: 30px; width: 100%"
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

// 定义Props：支持两种模式（表单模式/普通值模式）
const props = defineProps({
  // 表单模式：表单对象 + 字段名
  form: {
    type: Object,
    default: null,
  },
  // 普通值模式：v-model绑定单个值
  modelValue: {
    type: [String, Number],
    default: "",
  },
  // 【新增】单一值模式下的输入框标识（用于定位输入框）
  inputId: {
    type: String,
    default: "",
  },
  // 精度限制（仅对数值有效）
  precision: {
    type: Number,
    default: 2,
  },
  // 是否仅允许数字（新增：适配数值输入）
  isNumber: {
    type: Boolean,
    default: false,
  },
});

// 定义事件：支持v-model和关闭事件
const emit = defineEmits(["update:modelValue", "close"]);

// 内部状态
const keyboardRef = ref(null);
const keyboardInstance = ref(null);
const visible = ref(false);
const isChineseMode = ref(false);
const isOpening = ref(false);
const keyboardWrapperRef = ref(null);
const currentValue = ref("");
const currentField = ref(""); // 表单模式-当前字段名
const currentInputId = ref(""); // 单一值模式-输入框ID

// 获取数据源（兼容表单/单一值模式）
const getCurrentDataSource = () => {
  // 表单模式
  if (props.form && currentField.value) {
    return {
      get: () => props.form[currentField.value] || "",
      set: (val) => {
        props.form[currentField.value] = val;
      },
      type: "form",
    };
  } 
  // 单一值模式
  else {
    return {
      get: () => props.modelValue || "",
      set: (val) => {
        emit("update:modelValue", val);
      },
      type: "single",
    };
  }
};

// 【新增】获取当前输入框元素（兼容两种模式）
const getCurrentInputEl = () => {
  // 表单模式：通过placeholder定位
  if (currentField.value) {
    return document.querySelector(
      `.login-input input[placeholder*="${currentField.value === "username" ? "账号" : "密码"}"]`
    );
  }
  // 单一值模式：通过ID定位
  else if (currentInputId.value) {
    return document.getElementById(currentInputId.value);
  }
  // 兜底：获取当前聚焦的输入框
  return document.activeElement?.tagName === "INPUT" 
    ? document.activeElement 
    : null;
};

// 基础布局（支持数字模式切换）
const getBaseLayout = () => {
  // 数字模式布局
  if (props.isNumber) {
    return {
      default: [
        "1 2 3 {bksp}",
        "4 5 6 {clear}",
        "7 8 9 {enter}",
        "0 . {space}",
      ],
    };
  }
  // 普通字母布局
  return {
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
};

// 初始化键盘
const initKeyboard = () => {
  if (!keyboardRef.value) return;

  // 销毁原有实例
  if (keyboardInstance.value) {
    keyboardInstance.value.destroy();
  }

  // 初始化当前值
  const dataSource = getCurrentDataSource();
  currentValue.value = dataSource.get();

  // 创建键盘实例
  keyboardInstance.value = new Keyboard(keyboardRef.value, {
    onChange: (input) => {
      // 数字模式：过滤非数字字符
      let finalInput = input;
      if (props.isNumber) {
        finalInput = input
          .replace(/[^0-9.]/g, "") // 仅保留数字和小数点
          .replace(/(\.\d*)\./g, "$1") // 仅保留一个小数点
          // 限制小数位数
          .replace(new RegExp(`(\\d+)\\.(\\d{${props.precision}}).*$`), "$1.$2")
          .replace(/\.$/, ""); // 移除末尾的小数点
      }

      currentValue.value = finalInput;
      // 更新数据源
      const dataSource = getCurrentDataSource();
      dataSource.set(finalInput);
      // 同步更新键盘实例的输入值
      if (keyboardInstance.value) {
        keyboardInstance.value.setInput(finalInput);
      }
      
      // 强制触发输入框事件（核心：解决回显问题）
      triggerInputEvent(finalInput);
    },
    onKeyPress: handleKeyPress,
    onInit: (kbd) => {
      // 初始化时强制设置输入值
      kbd.setInput(currentValue.value);
      // 中文模式配置
      if (isChineseMode.value && !props.isNumber) {
        kbd.setOptions({
          layoutCandidates: chineseLayout.layoutCandidates,
          enableCandidates: true,
        });
      }
    },
    layout: getBaseLayout(),
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

// 按键处理
const handleKeyPress = (button) => {
  const kbd = keyboardInstance.value;
  if (!kbd) return;

  const dataSource = getCurrentDataSource();

  switch (button) {
    case "{bksp}":
      currentValue.value = currentValue.value.slice(0, -1);
      dataSource.set(currentValue.value);
      kbd.setInput(currentValue.value);
      triggerInputEvent(currentValue.value);
      break;
    case "{shift}":
      if (!props.isNumber) {
        const newLayout = kbd.options.layoutName === "default" ? "shift" : "default";
        kbd.setOptions({ layoutName: newLayout });
      }
      break;
    case "{enter}":
      handleClose();
      break;
    case "{clear}":
      currentValue.value = "";
      dataSource.set("");
      kbd.clearInput();
      triggerInputEvent("");
      break;
    case "{space}":
      if (!props.isNumber) {
        currentValue.value += " ";
        dataSource.set(currentValue.value);
        kbd.setInput(currentValue.value);
        triggerInputEvent(currentValue.value);
      }
      break;
    default:
      nextTick(() => {
        document.activeElement?.focus();
      });
      break;
  }
};

// 【核心】触发输入框事件（兼容所有模式）
const triggerInputEvent = (val) => {
  nextTick(() => {
    const inputEl = getCurrentInputEl();
    if (inputEl) {
      // 强制设置输入框value
      inputEl.value = val;
      // 触发input事件（Vue v-model核心监听）
      inputEl.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      // 触发change事件（兜底）
      inputEl.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    }
  });
};

// 切换中英文模式（数字模式下禁用）
const toggleChineseMode = () => {
  if (props.isNumber) return;

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

// 关闭键盘
const handleClose = () => {
  // 精度处理（仅对数值有效）
  if (props.precision && currentValue.value) {
    let finalVal = currentValue.value;
    if (props.isNumber) {
      finalVal = finalVal
        .replace(new RegExp(`(\\d+)\\.(\\d{${props.precision}}).*$`), "$1.$2")
        .replace(/\.$/, "");
    }
    currentValue.value = finalVal;
    const dataSource = getCurrentDataSource();
    dataSource.set(finalVal);
    triggerInputEvent(finalVal);
  }

  visible.value = false;
  emit("close");
};

// 【重载open方法】支持两种模式：
// 1. 表单模式：open('username') 
// 2. 单一值模式：open(null, 'input-planName')
const open = (field, inputId) => {
  // 表单模式
  if (field) {
    currentField.value = field;
    currentInputId.value = "";
    // 初始化字段值
    if (props.form) {
      props.form[field] = props.form[field] || "";
    }
  }
  // 单一值模式
  else if (inputId || props.inputId) {
    currentField.value = "";
    currentInputId.value = inputId || props.inputId;
  }

  isOpening.value = true;
  visible.value = true;

  nextTick(() => {
    initKeyboard();
    keyboardWrapperRef.value = document.querySelector(".virtual-keyboard-wrapper");

    // 自动聚焦输入框
    const inputEl = getCurrentInputEl();
    if (inputEl) {
      // 同步初始值
      const dataSource = getCurrentDataSource();
      inputEl.value = dataSource.get();
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

// 点击外部关闭逻辑
const handleClickOutside = (e) => {
  if (!visible.value || isOpening.value) return;

  const wrapperEl =
    keyboardWrapperRef.value ||
    document.querySelector(".virtual-keyboard-wrapper");
  if (!wrapperEl) return;

  const isInput = e.target.tagName === "INPUT" && e.target.classList.contains("el-input__inner");
  if (!wrapperEl.contains(e.target) && !isInput) {
    handleClose();
  }
};

// 监听数据源变化
watch(
  [() => props.form, () => props.modelValue],
  () => {
    if (visible.value) {
      const dataSource = getCurrentDataSource();
      const newVal = dataSource.get();
      if (newVal !== currentValue.value) {
        currentValue.value = newVal;
        keyboardInstance.value?.setInput(newVal);
        triggerInputEvent(newVal);
      }
    }
  },
  { deep: true }
);

// 监听数字模式/精度变化
watch([() => props.isNumber, () => props.precision], () => {
  if (visible.value) {
    initKeyboard();
  }
});

// 生命周期
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  if (keyboardInstance.value) {
    keyboardInstance.value.destroy();
  }
  document.removeEventListener("click", handleClickOutside);
});

// 暴露方法
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
<style>
.hg-candidate-box {
  margin-top: -5vh !important;
}
</style>