<template>
  <teleport to="body">
    <div v-if="visible" class="temp-modal">
      <div class="modal-mask" @click="closeModal"></div>
      <div class="modal-container">
        <!-- 头部 -->
        <div class="modal-header">
          <div class="header-title">
            <img
              src="@/assets/pic/temperature.png"
              alt="温度"
              class="header-icon"
            />
            <span class="header-text">温度调节</span>
          </div>
          <button class="close-btn" @click.stop="closeModal">×</button>
        </div>

        <!-- 主体：压缩空白，减小高度 -->
        <div class="modal-body">
          <div class="temp-display">
            <span class="temp-value">{{ temperature }}°C</span>
            <span class="temp-desc">{{ getTempDesc() }}</span>
          </div>

          <div class="slider-wrapper">
            <input
              type="range"
              min="16"
              max="30"
              v-model="temperature"
              class="temp-slider"
              @input="handleTempChange"
            />
            <div class="slider-labels">
              <span>16°C</span>
              <span>23°C</span>
              <span>30°C</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["update:temperature"]);
const visible = ref(false);
const temperature = ref(23);

const openModal = () => {
  visible.value = true;
};

const closeModal = () => {
  visible.value = false;
};

const handleTempChange = () => {
  emit("update:temperature", temperature.value);
};

const getTempDesc = () => {
  if (temperature.value < 18) return "凉爽";
  if (temperature.value < 25) return "舒适";
  return "温暖";
};

defineExpose({
  openModal,
  closeModal,
  temperature,
});
</script>

<style scoped lang="scss">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.temp-modal {
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

  //  减小弹窗宽度，压缩整体尺寸
  .modal-container {
    position: relative;
    width: 30vw; // 从320→280
    height: 30vh;
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
  padding: 12px 16px; // 从16x20→12x16，压缩头部高度
  background-color: #f8f0fc;
  border-bottom: 1px solid #f0e0f7;
  height: 8vh;

  .header-title {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: flex-start;
    gap: 6px; // 从8→6
    color: #693e9c;
    // 从16→15
    font-weight: 600;

    .header-icon {
      width: 50px; // 从20→18
      height: 50px;
      // border: 1px solid red;
      object-fit: contain;
    }
    .header-text {
      font-size: 32px;
      line-height: 1; // 新增：重置行高
    }
  }

  .close-btn {
    width: 40px; // 从28→24
    height: 40px;
    border: none;
    background: transparent;
    color: #693e9c;
    font-size: 50px; // 从20→18
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
  // border: 1px solid red;
  padding: 16px; // 从20→16，压缩主体内边距
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  .temp-display {
    text-align: center;
    margin-bottom: 12px; // 从24→12，大幅减少空白
    line-height: 1; // 新增：重置行高
    // background-color: red;
    height: 6vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    .temp-value {
      display: block;
      font-size: 28px; // 从32→28
      font-weight: 700;
      color: #693e9c;
      margin-bottom: 2px; // 从4→2
    }

    .temp-desc {
      font-size: 24px; // 从14→13
      color: #8a5ca0;
    }
  }

  .slider-wrapper {
    margin-top: 2vh;
    // background-color: yellow;
    width: 100%;
    height: 4vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    .temp-slider {
      width: 100%;
      height: 6px;
      -webkit-appearance: none;
      appearance: none;
      background: #f0e0f7;
      border-radius: 3px;
      outline: none;
      margin-bottom: 8px; // 从12→8

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px; // 从20→18
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
      font-size: 11px; // 从12→11
      color: #8a5ca0;
      font-size: 20px;
    }
  }
}
</style>
