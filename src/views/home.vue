<!--
 * @Author: Sid Li
 * @Date: 2025-12-01 08:40:17
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-01 10:06:52
 * @FilePath: \ai\src\views\home.vue
 * @Description: 
-->
<template>
  <div class="container">
    <div class="home-content">
      <div class="home-left">
        <img src="@/assets/pic/product02.png" alt="" />
      </div>
      <div class="home-right">
        <div class="home-right-content">
          <img src="@/assets/pic/light.png" alt="" />
          <div class="home-right-text">
            <div class="right-text">提示:</div>
            <div class="right-text">启动完成后，先连接设备WIFI</div>
            <div class="right-text">连接成功后，点击下方【连接设备】按钮</div>

            <div class="home-right-btn">
              <!-- 使用自定义类名代替直接样式绑定 -->
              <el-button
                class="connect"
                :class="['custom-btn', { 'connected-btn': isConnected }]"
                @click="connectDevice"
                round
              >
                {{ buttonText }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";

// 连接状态
const isConnected = ref(false);

// 按钮文字
const buttonText = computed(() => {
  return isConnected.value ? "设备已连接" : "连接设备";
});

// 连接设备方法
const connectDevice = () => {
  // 模拟连接设备的逻辑
  if (!isConnected.value) {
    console.log("正在连接设备...");
    // 模拟连接成功
    setTimeout(() => {
      isConnected.value = true;
    }, 500);
  }
};

onMounted(() => {
  console.log("组件挂载了");
});
</script>

<style scoped lang="scss">
.container {
  height: 96vh;
  box-sizing: border-box;
  background: url("@/assets/pic/bg01.jpg") no-repeat;
  background-position: center center;
  background-size: 100% 100%;

  .home-content {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    height: 100%;
    width: 100%;
    box-sizing: border-box;

    .home-left {
      width: 50%;
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-end;

      img {
        width: 538px;
        height: 563px;
      }
    }

    .home-right {
      width: 50%;
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .home-right-content {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        padding-left: 100px;
        margin-top: 300px;

        img {
          width: 40px;
          height: 40px;
          margin-right: 20px;
        }

        .home-right-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;

          .right-text {
            font-size: 22px;
            color: #56236d;
            margin-bottom: 10px;
          }

          .home-right-btn {
            width: 100%;
            text-align: right;
            margin-top: 80px;

            .connect {
              width: 200px;
              height: 50px;
              font-size: 20px;
            }

            // 自定义按钮样式
            :deep(.custom-btn) {
              --el-button-text-color: #fff;
              --el-button-bg-color: #af7dc4;
              --el-button-border-color: #af7dc4;
              --el-button-hover-text-color: #fff;
              --el-button-hover-bg-color: #9a6cb8;
              --el-button-hover-border-color: #9a6cb8;
              --el-button-active-text-color: #fff;
              --el-button-active-bg-color: #8a5ca0;
              --el-button-active-border-color: #8a5ca0;
            }

            // 连接成功状态的按钮样式
            :deep(.connected-btn) {
              --el-button-bg-color: #44a649;
              --el-button-border-color: #44a649;
              --el-button-hover-bg-color: #3da043;
              --el-button-hover-border-color: #3da043;
              --el-button-active-bg-color: #368c3b;
              --el-button-active-border-color: #368c3b;
            }
          }
        }
      }
    }
  }
}
</style>
