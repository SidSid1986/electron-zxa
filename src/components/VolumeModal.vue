<template>
  <teleport to="body">
    <div v-if="visible" class="volume-modal">
      <div class="modal-mask" @click="closeModal"></div>
      <div class="modal-container">
        <!-- 头部 -->
        <div class="modal-header">
          <div class="header-title">
            <img src="@/assets/pic/volume.png" alt="音量" class="header-icon" />
            <span>音量调节</span>
          </div>
          <button class="close-btn" @click.stop="closeModal">×</button>
        </div>
        
        <!-- 主体：音量调节滑块 -->
        <div class="modal-body">
          <div class="volume-display">
            <span class="volume-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </div>
  </teleport>
</template>

<script setup>
import { ref, defineEmits, watch, onMounted } from "vue";

// 定义事件
const emit = defineEmits(['update:volume', 'volume-changed']);
// 接收音频元素引用
const props = defineProps({
  audioElement: {
    type: Object,
    default: null
  }
});

// 状态管理
const visible = ref(false);
const volume = ref(50);
const isElectron = ref(false);

// 检查是否在Electron环境
onMounted(() => {
  // 检查Electron环境
  isElectron.value = window && window.process && window.process.type;
  
  // 初始化音量
  if (props.audioElement) {
    // 从音频元素获取初始音量
    volume.value = Math.round(props.audioElement.volume * 100);
  } else if (isElectron.value) {
    // 在Electron环境获取系统音量
    getElectronSystemVolume();
  }
});

// 打开弹窗
const openModal = () => {
  visible.value = true;
};

// 关闭弹窗
const closeModal = () => {
  visible.value = false;
};

// 处理音量变化
const handleVolumeChange = () => {
  const volumeValue = volume.value / 100;
  
  // 触发事件
  emit('update:volume', volume.value);
  emit('volume-changed', volumeValue);
  
  // 控制音频元素音量
  if (props.audioElement) {
    props.audioElement.volume = volumeValue;
    props.audioElement.muted = volumeValue === 0;
  }
  
  // 如果是Electron环境，控制系统音量
  if (isElectron.value) {
    setElectronSystemVolume(volume.value);
  }
};

// Electron: 获取系统音量
const getElectronSystemVolume = () => {
  try {
    // Electron主进程通信
    const { ipcRenderer } = require('electron');
    ipcRenderer.invoke('get-system-volume').then(value => {
      volume.value = Math.round(value * 100);
    });
  } catch (error) {
    console.error('获取系统音量失败:', error);
  }
};

// Electron: 设置系统音量
const setElectronSystemVolume = (value) => {
  try {
    const { ipcRenderer } = require('electron');
    ipcRenderer.invoke('set-system-volume', value / 100);
  } catch (error) {
    console.error('设置系统音量失败:', error);
  }
};

// 监听音量变化
watch(volume, (newVal) => {
  handleVolumeChange();
});

// 暴露方法
defineExpose({
  openModal,
  closeModal,
  volume
});
</script>

<style scoped lang="scss">
/* 保持与温度组件完全一致的CSS样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.volume-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;

  .modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(3px);
    cursor: pointer;
  }

  .modal-container {
    position: relative;
    width: 20vw;
    height: 20vh;
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(105, 62, 156, 0.25);
    overflow: hidden;
    border: 1px solid #f0e0f7;
    animation: fadeIn 0.2s ease-out;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #f8f0fc;
  border-bottom: 1px solid #f0e0f7;

  .header-title {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #693e9c;
    font-size: 15px;
    font-weight: 600;

    .header-icon {
      width: 18px;
      height: 18px;
      object-fit: contain;
    }
  }

  .close-btn {
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: #693e9c;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;

    &:hover {
      background-color: #e8d5f2;
      transform: scale(1.1);
    }
  }
}

.modal-body {
  height: 20vh;
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
    height: 4vh;
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
      font-size: 20px;
      color: #8a5ca0;
    }
  }
}
</style>