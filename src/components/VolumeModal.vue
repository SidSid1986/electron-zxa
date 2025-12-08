<template>
  <teleport to="body">
    <div v-if="visible" class="volume-modal">
      <div class="modal-mask" @click="closeModal"></div>
      <div class="modal-container">
        <div class="modal-header">
          <div class="header-title">
            <img src="@/assets/pic/volume.png" alt="音量" class="header-icon" />
            <span>音量调节</span>
          </div>
          <button class="close-btn" @click.stop="closeModal">×</button>
        </div>

        <div class="modal-body">
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
    </div>
  </teleport>
</template>

<script setup>
import { ref, defineEmits, watch } from "vue";

// 仅定义必要事件：传递音量数值
const emit = defineEmits(["update:volume"]);

// 接收外部传入的初始音量（父组件传递）
const props = defineProps({
  initialVolume: {
    type: Number,
    default: 50,
  },
});

//维护音量数值
const visible = ref(false);
const volume = ref(props.initialVolume);

// 打开弹窗（接收父组件传入的初始音量）
const openModal = (initVol = 50) => {
  volume.value = initVol;
  visible.value = true;
};

// 关闭弹窗
const closeModal = () => {
  visible.value = false;
};

// 音量变化时仅传递数值，不做任何控制逻辑
const handleVolumeChange = () => {
  emit("update:volume", volume.value);
};

// 监听外部音量变化（父组件主动更新时同步）
watch(
  () => props.initialVolume,
  (newVal) => {
    volume.value = newVal;
  },
  { immediate: true }
);

// 仅暴露基础方法
defineExpose({
  openModal,
  closeModal,
  volume,
});
</script>

<style scoped lang="scss">
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
    min-width: 300px;
    height: auto;
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
    gap: 8px;
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
  height: auto;
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
      font-size: 14px;
      color: #8a5ca0;
    }
  }
}
</style>
