<!--
 * @Author: Sid Li
 * @Date: 2025-12-13 14:06:46
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-13 14:22:24
 * @FilePath: \zi-xiao-ai\src\components\body\LegBack.vue
 * @Description: 身体正面图片组件
-->
<template>
  <div class="body-img">
    <img src="@/assets/pic/body/body3.png" alt="" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

onMounted(() => {
  console.log("组件挂载了");
});
</script>

<style scoped lang="scss">
.body-img {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 12px;
  border: 1px solid green;

  img {
    width: 480px;
    height: 800px;
    border: 1px solid red;
  }
}
</style>
