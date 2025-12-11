<template>
  <div class="list-container">list</div>
</template>

<script setup>
import { ref, onMounted } from "vue";

onMounted(() => {
  console.log("组件挂载了");
});
</script>

<style scoped lang="scss">
.container {
  height: 86vh;
  width: 100%;
}
</style>
