<template>
  <div class="container">
    <div class="message-content">
      <div class="message-title">艾条装卸</div>
      <div class="message-text">机械臂运动到艾条装卸处后,请装入</div>
      <div class="message-text">点燃的艾条后,点击[确认]按钮,开始</div>
      <div class="message-text">艾灸疗程</div>
      <div class="message-button">
        <el-button class="setting-confirm" type="primary" @click="confirmClick"
          >确认</el-button
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
    path: "/userConfirm",
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
  height: 96vh;
  margin: 0;
  padding: 0;
}

.message-content {
  width: 30vw;
  height: 25vh;
  background-color: rgba(255, 255, 255, 0.8);
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
  color: #fdb300;
  height: 5vh;
  line-height: 5vh;
}
.message-text {
  font-size: 16px;
  color: #fdb300;
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
  height: 50px;
  font-size: 20px;

  --el-button-text-color: #ffffff;
  --el-button-bg-color: #fdb300;
  --el-button-border-color: #e6a000;

  --el-button-hover-text-color: #ffffff;
  --el-button-hover-bg-color: #e6a000;
  --el-button-hover-border-color: #d39000;

  --el-button-active-text-color: #ffffff;
  --el-button-active-bg-color: #d39000;
  --el-button-active-border-color: #c08000;
}
</style>
