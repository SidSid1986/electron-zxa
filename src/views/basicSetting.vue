<!--
 * @Author: Sid Li
 * @Date: 2025-12-12 16:15:42
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-15 17:18:51
 * @FilePath: \zi-xiao-ai\src\views\basicSetting.vue
 * @Description: 基础参数页面（整合设备音量控制）
-->

<template>
  <div class="device-container">
    <div class="device-title">基础参数</div>
    <!-- 音量控制区域（原弹窗核心内容） -->
    <div class="volume-control-wrapper">
      <div class="volume-header">
        <div class="header-title">
          <img src="@/assets/pic/volume.png" alt="音量" class="header-icon" />
          <span class="header-text">音量调节</span>
        </div>
      </div>

      <div class="volume-body">
        <div class="volume-display">
          <span class="volume-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11 5L6 9H2V15H6L11 19V5ZM15.54 8.46C16.4774 9.39758 17 10.6893 17 12C17 13.3107 16.4774 14.6024 15.54 15.54C14.6024 16.4774 13.3107 17 12 17C10.6893 17 9.39758 16.4774 8.46 15.54C7.52243 14.6024 7 13.3107 7 12C7 10.6893 7.52243 9.39758 8.46 8.46C9.39758 7.52243 10.6893 7 12 7C13.3107 7 14.6024 7.52243 15.54 8.46Z"
                :fill="volume === 0 ? '#ccc' : '#693e9c'"
              />
            </svg>
          </span>
          <span class="volume-value">{{ volume }}%</span>
        </div>

        <div class="slider-wrapper">
          <input
            type="range"
            min="0"
            max="100"
            v-model="volume"
            class="volume-slider"
            @input="handleVolumeChange"
          />
          <div class="slider-labels">
            <span>静音</span>
            <span>50%</span>
            <span>最大</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 原有按钮区域 -->
    <div class="btn-group">
      <el-button class="device-btn-back" @click="backMain">返回 </el-button>
      <el-button class="device-btn-back" @click="backMain"
        >恢复出厂设置
      </el-button>

      <el-button class="device-btn" @click="updateFunc">保存设置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus"; // 引入提示组件
const router = useRouter();

// 基础参数信息
const info = ref({
  activeStatus: 1,
});

// ========== 核心改造：音量控制逻辑 ==========
const volume = ref(50); // 默认音量50%
const isElectronEnv = ref(false); // 判断是否为Electron环境

// 初始化环境判断
try {
  isElectronEnv.value = !!window.process?.type === "renderer";
} catch (e) {
  isElectronEnv.value = false;
}

// 初始化：读取设备当前音量（而非本地存储）
onMounted(async () => {
  console.log("组件挂载了");
  // 1. Electron环境：优先读取设备真实音量
  if (isElectronEnv.value) {
    try {
      const { getVol } = await import("@/utils/volume");
      const deviceVolume = await getVol(); // 获取设备当前音量（0-100）
      volume.value = deviceVolume;
      console.log("读取设备当前音量：", deviceVolume + "%");
    } catch (err) {
      console.warn("读取设备音量失败，使用本地存储/默认值:", err);
      // 降级：读取本地存储
      const storedVolume = localStorage.getItem("systemVolume");
      if (storedVolume) {
        volume.value = Number(storedVolume);
      }
    }
  } else {
    // 2. 非Electron环境：读取本地存储
    const storedVolume = localStorage.getItem("systemVolume");
    if (storedVolume) {
      volume.value = Number(storedVolume);
    }
  }
});

// 音量变化处理：同步到设备+本地存储
const handleVolumeChange = async () => {
  console.log("当前音量：", volume.value + "%");
  // 1. 同步到本地存储（保底）
  localStorage.setItem("systemVolume", volume.value);

  // 2. Electron环境：调用设备API控制实际音量
  if (isElectronEnv.value) {
    try {
      const { setVol } = await import("@/utils/volume");
      await setVol(volume.value); // 核心：控制系统音量
      // ElMessage.success(`设备音量已设置为 ${volume.value}%`);
    } catch (err) {
      console.error("控制设备音量失败:", err);
      // ElMessage.warning("设备音量控制失败，请检查Electron主进程配置");
    }
  } else {
    // 非Electron环境：仅提示
    // ElMessage.info(`已保存音量设置为 ${volume.value}%（非设备环境）`);
  }
};

// ========== 原有方法改造 ==========
const updateFunc = () => {
  console.log("保存设置，当前音量：", volume.value + "%");
  // 主动触发一次音量同步（确保保存时生效）
  handleVolumeChange();
  ElMessage.success("基础参数（音量）已保存");
};

const backMain = () => {
  router.push("/main");
};
</script>

<style scoped lang="scss">
.device-container {
  width: 100%;
  height: 100vh;
  background-color: #e0ddec;
  box-sizing: border-box;
  padding: 20px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.device-title {
  font-size: 36px;
  font-weight: bold;
  color: #4d1166;
  height: 8vh;
  line-height: 8vh;
  margin-top: 4vh;
  text-align: center;
}

// 音量控制区域样式
.volume-control-wrapper {
  width: 50vw;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(105, 62, 156, 0.25);
  overflow: hidden;
  border: 1px solid #f0e0f7;
  margin: 4vh 0;

  .volume-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 12px 16px;
    background-color: #f8f0fc;
    border-bottom: 1px solid #f0e0f7;

    .header-title {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #693e9c;
      font-weight: 600;

      .header-icon {
        width: 50px;
        height: 50px;
        object-fit: contain;
      }

      .header-text {
        font-size: 32px;
        line-height: 1;
      }
    }
  }

  .volume-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    .volume-display {
      text-align: center;
      margin-bottom: 12px;
      line-height: 1;
      height: 6vh;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;

      .volume-icon {
        display: flex;
        align-items: center;
      }

      .volume-value {
        display: block;
        font-size: 28px;
        font-weight: 700;
        color: #693e9c;
        margin-bottom: 2px;
      }
    }

    .slider-wrapper {
      margin-top: 2vh;
      width: 100%;
      height: auto;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;

      .volume-slider {
        width: 100%;
        height: 6px;
        -webkit-appearance: none;
        appearance: none;
        background: #f0e0f7;
        border-radius: 3px;
        outline: none;
        margin-bottom: 8px;

        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #693e9c;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(105, 62, 156, 0.3);
          transition: all 0.2s;

          &:hover {
            transform: scale(1.1);
            background: #8a5ca0;
          }
        }
      }

      .slider-labels {
        width: 100%;
        display: flex;
        justify-content: space-between;
        font-size: 24px;
        color: #8a5ca0;
      }
    }
  }
}

// 按钮组样式
.btn-group {
  margin-top: 4vh;
  display: flex;
  gap: 40px;
}

// 原有按钮样式
:deep(.device-btn) {
  width: 120px;
  height: 60px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 10px;
  margin: 0 100px;
  box-shadow: 0 4px 6px rgba(97, 31, 137, 0.2);
  transition: all 0.3s ease;

  --el-button-text-color: #fff;
  --el-button-bg-color: #611f89;
  --el-button-border-color: #611f89;
  --el-button-hover-text-color: #fff;
  --el-button-hover-bg-color: #511770; /* 稍深的颜色 */
  --el-button-hover-border-color: #511770;
  --el-button-active-text-color: #fff;
  --el-button-active-bg-color: #411058; /* 更深的颜色 */
  --el-button-active-border-color: #411058;
}
:deep(.device-btn-back) {
  width: 120px;
  height: 60px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 10px;
  margin: 0 100px;
  box-shadow: 0 4px 6px rgba(218, 205, 231, 0.2);
  transition: all 0.3s ease;

  --el-button-text-color: #411058; /* 深色文字，对比度高 */
  --el-button-bg-color: #dacde7;
  --el-button-border-color: #dacde7;
  --el-button-hover-text-color: #333;
  --el-button-hover-bg-color: #cabbd7; /* 稍深的颜色 */
  --el-button-hover-border-color: #cabbd7;
  --el-button-active-text-color: #333;
  --el-button-active-bg-color: #baa9c7; /* 更深的颜色 */
  --el-button-active-border-color: #baa9c7;
}
</style>
