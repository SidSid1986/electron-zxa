<!--
 * @Author: Sid Li
 * @Date: 2025-12-20 08:34:36
 * @LastEditors: Sid Li
 * @LastEditTime: 2026-01-07 11:07:25
 * @FilePath: \zi-xiao-ai\src\components\VirtualKeyboard.vue
 * @Description: 
-->
<template>
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

// 手动重新绑定键盘（动态输入框场景） 
const reBindKeyboard = () => {
  if (innerKeyboardRef.value) {
    innerKeyboardRef.value.inputBindKeyboard();
    console.log("键盘已重新绑定输入框");
  }
};

// 暴露手动绑定方法
defineExpose({
  reBindKeyboard,
});
</script>

<style scoped>
:deep(.main-keyboard) {
  width: 80% !important;
  margin-left: 10% !important;
}


:deep(.select-list) {
  /* border: 1px solid #e0dde9 !important;
  border-radius: 8px !important;
  padding: 6px !important;
  margin-bottom: 4px !important; */
}
</style>

<style></style>
