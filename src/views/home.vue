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
              <el-button
                class="connect"
                :class="['custom-btn']"
                @click="connectDevice"
                round
                :disabled="isSending"
              >
                {{ isSending ? "发送中..." : "连接设备" }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import WebSocketClient from "@/utils/ws";

import { useRoute, useRouter } from "vue-router";

const router = useRouter();

// 仅保留发送状态（防止重复点击）
const isSending = ref(false);
let wsClient = null;

// 初始化WebSocket连接
const initWebSocket = () => {
  // 创建实例
  wsClient = new WebSocketClient({
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
  });

  // 核心：只监听消息返回，不做任何判断
  wsClient.on({
    open: () => {
      console.log("WebSocket已连接，可发送指令");
    },
    // 核心功能：获取返回值（你可以在这里处理返回的消息）
    message: (data) => {
      console.log("=== 收到设备返回值 ===");
      console.log("原始返回数据:", data);
      console.log("返回数据详情：", JSON.stringify(data, null, 2));

      if (data.result.status == 0) {
        console.log("连接成功");
        router.push("/check");
      }

      // 取消发送中状态
      isSending.value = false;
    },
    error: (error) => {
      console.error("WebSocket错误:", error);
      isSending.value = false;
    },
    close: () => {
      console.log("WebSocket连接关闭");
      isSending.value = false;
    },
  });

  // 建立连接
  wsClient.connect();
};

// 发送指令（核心方法）
const sendCommand = (data) => {
  try {
    const success = wsClient.send(data);
    console.log(success);
    if (success) {
      console.log("指令发送成功:", data);
      return true;
    } else {
      console.error("指令发送失败");
      isSending.value = false;
      return false;
    }
  } catch (error) {
    console.error("发送指令异常:", error);
    isSending.value = false;
    return false;
  }
};

// 点击按钮发送指令
const connectDevice = () => {
  // 设置发送中状态
  isSending.value = true;

  // 要发送的指令
  const commandData = { req_id: "00011", command: "EnableRobot", args: "" };

  // 发送指令（发送后等待message回调获取返回值）
  sendCommand(commandData);
};

// 组件挂载时初始化WebSocket
onMounted(() => {
  initWebSocket();
});

// 组件卸载时关闭连接
onUnmounted(() => {
  if (wsClient) {
    wsClient.close();
  }
});
</script>

<style scoped lang="scss">
.container {
  height: 100vh;
  // height: 96vh;
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
