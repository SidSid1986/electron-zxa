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
import { ElMessage } from "element-plus";

const $ws = inject("$ws");
const router = useRouter();

// 响应提示消息
const msg = ref("");
// 发送状态
const isSending = ref(false);
// 设备连接状态
const isDeviceConnected = ref(false);
// 超时定时器
let timeoutTimer = null;

// 连接设备按钮点击事件（原生SendMessage，req_id从0开始）
const connectDevice = () => {
  // 1. 校验WS是否已连接（原生Status属性）
  if (!$ws.Status) {
    msg.value = "WebSocket未连接，请稍候重试";
    ElMessage.warning("WebSocket未连接，请稍候重试");
    return;
  }

  isSending.value = true;
  console.log("正在请求连接设备...");

  $ws.SendMessage("EnableRobot", "", (data) => {
    console.log(data);

    // 标记发送完成
    isSending.value = false;

    // 处理设备连接响应
    if (data && data.result.status == 0) {
      isDeviceConnected.value = true;
      ElMessage.success("设备连接成功,准备自检！");
      setTimeout(() => {
        router.push({ path: "/check" });
      }, 1000);
    } else {
      console.log("设备连接失败，请重试");

      isDeviceConnected.value = false;
    }
  });

  // 5. 超时处理：15秒未响应则标记超时
  timeoutTimer = setTimeout(() => {
    if (isSending.value) {
      msg.value = "连接请求超时，请重试";
      isSending.value = false;
      ElMessage.warning("连接请求超时，请重试");
    }
  }, 15000);
};

// 页面挂载时初始化
onMounted(() => {
  // 清除本地缓存的用例
  localStorage.removeItem("selectedCase");

  // 提示WS连接状态
  if ($ws.Status) {
    ElMessage.success("WebSocket已连接到服务器，请点击【连接设备】按钮");
  } else {
    ElMessage.error("WebSocket连接失败，请检查网络");
  }
});

// 页面卸载时清理资源
onUnmounted(() => {
  // 清除超时定时器
  if (timeoutTimer) {
    clearTimeout(timeoutTimer);
  }
  // 重置状态
  isDeviceConnected.value = false;
  isSending.value = false;
  msg.value = "";
});
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

            // 关键修复1：提升样式穿透的优先级，直接匹配 .connect.connected-btn
            :deep(.connect.custom-btn) {
              --el-button-text-color: #fff;
              --el-button-bg-color: #af7dc4;
              --el-button-border-color: #af7dc4;
              --el-button-hover-text-color: #fff;
              --el-button-hover-bg-color: #9a6cb8;
              --el-button-hover-border-color: #9a6cb8;
              --el-button-active-text-color: #fff;
              --el-button-active-bg-color: #8a5ca0;
              --el-button-active-border-color: #8a5ca0;
              // 增加disabled状态的样式继承
              &.is-disabled {
                --el-button-disabled-text-color: #fff;
                --el-button-disabled-bg-color: var(--el-button-bg-color);
                --el-button-disabled-border-color: var(
                  --el-button-border-color
                );
              }
            }

            // 关键修复2：直接匹配 .connect.connected-btn，提升优先级
            :deep(.connect.connected-btn) {
              --el-button-bg-color: #44a649 !important;
              --el-button-border-color: #44a649 !important;
              --el-button-hover-bg-color: #3da043 !important;
              --el-button-hover-border-color: #3da043 !important;
              --el-button-active-bg-color: #368c3b !important;
              --el-button-active-border-color: #368c3b !important;
              // 强制生效disabled状态的样式
              &.is-disabled {
                --el-button-disabled-bg-color: #44a649 !important;
                --el-button-disabled-border-color: #44a649 !important;
                --el-button-disabled-text-color: #fff !important;
              }
            }
          }
        }
      }
    }
  }
}
</style>
