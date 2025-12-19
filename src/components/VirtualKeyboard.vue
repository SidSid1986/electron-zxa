<template>
  <!-- 按文档要求：配置singleDict单字库、manyDict多词库，传递正确的public路径 -->
  <keyboard
    ref="innerKeyboardRef"
    :singleDict="'/dict/baseDict.json'"
    :manyDict="'/dict/chowder.json'"
    :maxQuantify="10"
    :transitionTime="'0.3s'"
    @initResult="handleDictInitResult"
  ></keyboard>
</template>

<script setup>
import { ref } from "vue";
// 导入键盘组件（按你的项目依赖）
import keyboard from "vue3-virtual-keyboard-cn/keyboardIndex.vue";

const innerKeyboardRef = ref(null);

// 词库加载结果回调
const handleDictInitResult = (result) => {
  if (result === "success") {
    console.log("单字库+多词库加载成功，支持词组输入");
  } else {
    console.error("词库加载失败，请检查public/dict目录下的词库文件是否存在");
  }
};

// 如需手动重新绑定键盘（动态输入框场景），可暴露该方法
const reBindKeyboard = () => {
  if (innerKeyboardRef.value) {
    innerKeyboardRef.value.inputBindKeyboard();
    console.log("键盘已重新绑定输入框");
  }
};

// 暴露手动绑定方法（可选，按需使用）
defineExpose({
  reBindKeyboard,
});
</script>

<style scoped>
/* 键盘样式优化，确保层级和布局正常 */
:deep(.keyboard-container) {
  z-index: 9999 !important;
  bottom: 0 !important;
  left: 0 !important;
  width: 100% !important;
  background-color: #fff !important;
}

/* 词组候选框样式优化，更清晰 */
:deep(.phrase-list) {
  border: 1px solid #e0dde9 !important;
  border-radius: 8px !important;
  padding: 6px !important;
  margin-bottom: 4px !important;
}

:deep(.phrase-item) {
  font-size: 16px !important;
  color: #511d6a !important;
  padding: 6px 12px !important;
  margin: 0 4px !important;
}

:deep(.phrase-item.active) {
  background-color: #af7dc4 !important;
  color: #fff !important;
  border-radius: 4px !important;
}
</style>
