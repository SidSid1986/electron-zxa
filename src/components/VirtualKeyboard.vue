<!--
 * @Author: Sid Li
 * @Date: 2026-01-19 09:25:17
 * @LastEditors: Sid Li
 * @LastEditTime: 2026-01-20 13:45:01
 * @FilePath: \ZiXiaoAi-build\src\components\VirtualKeyboard.vue
 * @Description: 
-->
<template>
  <keyboard
    ref="innerKeyboardRef"
    :singleDict="dictBasePath"
    :manyDict="dictChowderPath"
    :maxQuantify="10"
    :transitionTime="'0.3s'"
    @initResult="handleDictInitResult"
  ></keyboard>
</template>

<script setup>
import { ref, computed } from "vue";
import keyboard from "vue3-virtual-keyboard-cn/keyboardIndex.vue";
// 直接导入词库文件（Vite 会处理路径）
import baseDict from "@/assets/dict/baseDict.json?url";
import chowderDict from "@/assets/dict/chowder.json?url";

const innerKeyboardRef = ref(null);

// 无需复杂路径计算，Vite 会自动处理开发/打包环境
const dictBasePath = computed(() => baseDict);
const dictChowderPath = computed(() => chowderDict);

// 词库加载结果回调
const handleDictInitResult = (result) => {
  if (result === "success") {
    console.log("词库加载成功，路径：", dictBasePath.value);
  } else {
    console.error("词库加载失败，检查 src/assets/dict 下是否有 JSON 文件");
  }
};

const reBindKeyboard = () => {
  innerKeyboardRef.value?.inputBindKeyboard();
};

defineExpose({ reBindKeyboard });
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
