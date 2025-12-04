<template>
  <div class="container">
    <div class="message-content">
      <div class="message-title">提示</div>
      <div class="message-text">等待用户按设备上的确认键</div>
      <div class="message-button">
        <el-button class="setting-confirm" type="primary" @click="confirmClick"
          >知道了</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

import { useRoute, useRouter } from "vue-router";
const router = useRouter();
const confirmClick = () => {
  router.push({
    path: "/treat",
  });
};

onMounted(() => {
  console.log("组件挂载了");
});
</script>

<style scoped lang="scss">
.container {
  box-sizing: border-box;
  background: url("@/assets/pic/backgroundImage.png") no-repeat;
  background-position: center center;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  // height: 96vh;
  height: 100vh;
  margin: 0;
  padding: 0;
  padding-top: 4vh;
}

.message-content {
  width: 30vw;
  height: 25vh;
  background-color: #d5c0e3;
  border-radius: 12px;
  padding: 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.5);
}

.message-title {
  font-size: 24px;
  font-weight: bold;
  color: #540e72;
  height: 5vh;
  line-height: 5vh;
}
.message-text {
  font-size: 16px;
  color: #540e72;
  height: 3vh;
  line-height: 3vh;

  width: 15vw;
  text-align: center;
}
.message-button {
  height: 5vh;
  line-height: 5vh;
}

:deep(.setting-confirm) {
  width: 200px;
  height: 60px;
  font-size: 24px;
  font-weight: bold;
  border-radius: 40px;
  margin: 0 160px;
  /* 主色：淡紫色 #C69CD7，文字白色 */
  --el-button-text-color: #fff; /* 文字白色，与紫色对比鲜明 */
  --el-button-bg-color: #c69cd7; /* 基准淡紫色 */
  --el-button-border-color: #b585c9; /* 边框比基准色深一点，增加轮廓感 */
  /* hover 状态：比基准色深15%，反馈明显且协调 */
  --el-button-hover-text-color: #fff;
  --el-button-hover-bg-color: #b585c9;
  --el-button-hover-border-color: #a470bb;
  /* active 状态：比 hover 色再深15%，强化按压反馈 */
  --el-button-active-text-color: #fff;
  --el-button-active-bg-color: #a470bb;
  --el-button-active-border-color: #935bb2;
}
</style>
