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
                :class="[
                  'custom-btn',
                  isDeviceConnected ? 'connected-btn' : '',
                ]"
                @click="connectDevice"
                round
                :disabled="isSending || isDeviceConnected"
              >
                {{
                  isSending
                    ? "发送中..."
                    : isDeviceConnected
                    ? "已连接设备"
                    : "连接设备"
                }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const $ws = inject("$ws");
const router = useRouter();

const msg = ref("");
const isSending = ref(false);

//  设备连接
const isDeviceConnected = ref(false);

//获取信息
const handleWsMessage = (data) => {
  console.log("收到服务器返回数据:", data);
  handleDeviceResponse(data);
};

const handleWsOpen = () => {
  console.log("WebSocket连接成功");
  isDeviceConnected.value = false; // WS连接≠设备连接
};

const handleWsError = (error) => {
  console.error("WebSocket错误:", error);

  isSending.value = false;
  isDeviceConnected.value = false;
};

const handleWsClose = () => {
  console.log("WebSocket连接关闭");

  isSending.value = false;
  isDeviceConnected.value = false;
};

// 处理设备连接的响应（核心：收返回值后跳转）
const handleDeviceResponse = (data) => {
  isSending.value = false;
  // 解析响应数据
  const res = typeof data === "string" ? JSON.parse(data) : data;
  // 匹配设备连接成功的响应
  if (res.result.status == 0) {
    isDeviceConnected.value = true;
    router.push({
      path: "/check",
    });
  } else {
    isDeviceConnected.value = false;
  }
};

// 连接设备按钮点击事件（核心：发送数据）
const connectDevice = () => {
  // 校验WS是否已连接
  if (!$ws.getStatus()) {
    msg.value = "WebSocket未连接，请稍候重试";
    return;
  }

  isSending.value = true;
  msg.value = "正在请求连接设备...";

  // 发送设备连接指令（根据后端约定格式）
  const sendData = { req_id: "00011", command: "EnableRobot", args: "" };
  const sendResult = $ws.send(sendData);

  // 发送失败的兜底处理
  if (!sendResult) {
    msg.value = "指令发送失败，请检查连接";
    isSending.value = false;
    return;
  }

  // 超时处理：防止一直显示「发送中」
  setTimeout(() => {
    if (isSending.value) {
      msg.value = "连接请求超时，请重试";
      isSending.value = false;
    }
  }, 15000);
};

// 页面挂载：仅注册回调（WS已在main.js启动，无需重复connect）
onMounted(() => {
  localStorage.removeItem("selectedCase");

  //判断ws连接成功提示
  if ($ws.getStatus()) {
    ElMessage.success("WebSocket已连接到服务器，请点击【连接设备】按钮");
  } else {
    ElMessage.error("WebSocket连接失败，请检查网络");
  }

  // 注册WS回调
  $ws.onMessage(handleWsMessage);
  $ws.onOpen(handleWsOpen);
  $ws.onError(handleWsError);
  $ws.onClose(handleWsClose);
});

// 页面卸载：仅移除当前页面的回调（不断开全局WS）
onUnmounted(() => {});
</script>

<style scoped lang="scss">
.container {
  height: 100vh;
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

          .response-msg {
            margin-top: 20px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 8px;
            font-size: 14px;
            color: #333;
            max-width: 400px;
            word-wrap: break-word;
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
