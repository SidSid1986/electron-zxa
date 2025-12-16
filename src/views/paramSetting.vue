<!--
 * @Author: Sid Li
 * @Date: 2025-12-12 16:15:42
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-16 10:46:52
 * @FilePath: \zi-xiao-ai\src\views\paramSetting.vue
 * @Description: 
-->

<template>
  <div class="device-container">
    <div class="device-title">艾灸参数</div>
    <div class="device-item-container">
      <div class="device-item-border">
        <div class="device-item">
          <span class="param-name">除灰间隔:</span>
          <el-slider
            class="custom-slider"
            :min="0"
            :max="60"
            :step="1"
            v-model="clearValue"
            :show-tooltip="false"
          />
          <span class="param-value">{{ clearValue }}</span>
          <span class="param-value-text">分钟</span>
        </div>
        <div class="device-item">
          <span class="param-name">除灰时间:</span>
          <el-slider
            class="custom-slider"
            :min="0"
            :max="60"
            :step="1"
            v-model="clearTimeValue"
            :show-tooltip="false"
          />
          <span class="param-value">{{ clearTimeValue }}</span>
          <span class="param-value-text">s</span>
        </div>
        <div class="device-item">
          <span class="param-name">艾灸初始高度:</span>
          <el-slider
            class="custom-slider"
            :min="0"
            :max="60"
            :step="1"
            v-model="heightValue"
            :show-tooltip="false"
          />
          <span class="param-value">{{ heightValue }}</span>
          <span class="param-value-text">mm</span>
        </div>
        <div class="device-item">
          <span class="param-name">回旋灸速度:</span>
          <el-slider
            class="custom-slider"
            :min="0"
            :max="60"
            :step="1"
            v-model="speedValue"
            :show-tooltip="false"
          />
          <span class="param-value">{{ speedValue }}</span>
          <span class="param-value-text">档位</span>
          <span class="param-value-text">实际值123s/r</span>
        </div>
        <div class="device-item">
          <span class="param-name">回旋灸半径:</span>
          <el-slider
            class="custom-slider"
            :min="0"
            :max="60"
            :step="1"
            v-model="radiusValue"
            :show-tooltip="false"
          />
          <span class="param-value">{{ radiusValue }}</span>
          <span class="param-value-text">档位</span>
          <span class="param-value-text">实际值20mm</span>
        </div>

        <div class="device-item">
          <span class="param-name">雀啄灸行程:</span>
          <el-slider
            class="custom-slider"
            :min="0"
            :max="60"
            :step="1"
            v-model="rangeValue"
            :show-tooltip="false"
          />
          <span class="param-value">{{ rangeValue }}</span>
          <span class="param-value-text">档位</span>
          <span class="param-value-text">实际值20mm</span>
        </div>
        <div class="device-item">
          <span class="param-name">雀啄灸周期:</span>
          <el-slider
            class="custom-slider"
            :min="0"
            :max="60"
            :step="1"
            v-model="cycleValue"
            :show-tooltip="false"
          />
          <span class="param-value">{{ cycleValue }}</span>
          <span class="param-value-text">档位</span>
          <span class="param-value-text">实际值123s</span>
        </div>
        <div class="device-item no-border">
          <span class="param-name">往复灸周期:</span>
          <el-slider
            class="custom-slider"
            :min="0"
            :max="60"
            :step="1"
            v-model="repeatValue"
            :show-tooltip="false"
          />
          <span class="param-value">{{ repeatValue }}</span>
          <span class="param-value-text">档位</span>
          <span class="param-value-text">实际值123s</span>
        </div>
        <div class="device-item no-border">
          <span class="param-name">艾灸床高度:</span>

          <el-input-number
            class="custom-input-number"
            v-model="bedHeight"
            :min="1"
            :max="100"
            controls-position="right"
            size="large"
            @change="handleChange"
          >
            <template #increase-icon>
              <el-icon><CaretTop /></el-icon>
            </template>
            <template #decrease-icon>
              <el-icon><CaretBottom /></el-icon>
            </template>
          </el-input-number>

          <span class="param-value">{{ bedHeight }}</span>
        </div>
        <div class="device-item no-border"></div>
      </div>
    </div>
    <div class="item-btn-line">
      <el-button class="device-btn-back" type="primary" @click="backMain"
        >返回</el-button
      >
      <el-button class="device-btn-back" type="primary" @click="backMain"
        >恢复出厂设置</el-button
      >
      <el-button class="device-btn" type="primary" @click="updateFunc"
        >保存</el-button
      >
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

import { useRoute, useRouter } from "vue-router";
const router = useRouter();

const info = ref({
  activeStatus: 1,
});

const clearValue = ref(8.5); // 除灰间隔
const heightValue = ref(12.5); // 艾灸初始高度
const radiusValue = ref(12.5); // 回旋灸半径
const clearTimeValue = ref(12.5); // 除灰时间
const speedValue = ref(12.5); // 回旋灸速度
const rangeValue = ref(12.5); // 雀啄灸行程
const cycleValue = ref(12.5); // 雀啄灸周期
const repeatValue = ref(12.5); // 往复灸周期
const bedHeight = ref(1); // 艾灸床高度

const updateFunc = () => {
  console.log("更新");
};

const backMain = () => {
  router.push("/main");
};

//艾灸床高度
const handleChange = (val) => {
  console.log(val);
};

onMounted(() => {
  console.log("组件挂载了");
});
</script>

<style scoped lang="scss">
.device-container {
  width: 100%;
  height: 100vh;
  background-color: #e0ddec;
  box-sizing: border-box;
  padding: 20px 60px;
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

.device-item-container {
  width: 100%;
  height: 70vh;
  background-color: #fff;
  box-sizing: border-box;
  padding: 5vh;
  border-radius: 12px;

  .device-item-border {
    height: 60vh;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    .device-item {
      padding-left: 1vw;
      box-sizing: border-box;
      border-bottom: 1px solid #e0e0e0;
      width: 50%;
      height: 12vh;
      font-size: 18px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      font-size: 20px;
      color: #4d1166;
      .param-name {
        width: 20%;
        // border: 1px solid red;
        margin-right: 1vw;
      }
      .param-value {
        color: #9033e9;
        // border: 1px solid red;
        margin-right: 3px;
      }
      .param-value-text {
        color: #7c7c79;
        // border: 1px solid red;
      }

      .active {
        color: #008000;
      }
      .inactive {
        color: #ff0000;
      }
    }
    .device-item:nth-child(2n) {
      border-left: 1px solid #e0e0e0;
    }
    .no-border {
      border-bottom: none;
    }
  }
}

.item-btn-line {
  width: 100%;
  height: 10vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

:deep(.device-btn) {
  width: 120px;
  height: 60px;
  font-size: 20px;
  font-weight: bold;
  border-radius: 10px;
  margin: 0 200px;
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
  width: 150px;
  height: 60px;
  font-size: 20px;
  font-weight: bold;
  border-radius: 10px;
  margin: 0 200px;
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

<style lang="scss">
.custom-slider {
  width: 40%;
  // border: 1px solid red;
  margin-right: 1vw;

  // 滑块轨道样式
  .el-slider__runway {
    background-color: #e0d4e8 !important; // 轨道背景色
    height: 1.5vh !important; // 轨道高度
    border-radius: 12px !important;

    // 禁用状态
    &.disabled {
      background-color: #f0e8f5 !important;
    }
  }

  // 滑块轨道激活部分
  .el-slider__bar {
    background-color: #9033e9 !important; // 激活部分颜色
    height: 1.5vh !important;
    border-radius: 12px !important;
  }

  // 滑块按钮
  .el-slider__button-wrapper {
    // top: 50% !important;
    // transform: translateY(-50%) !important;

    .el-slider__button {
      width: 2.5vh !important; // 滑块宽度
      height: 2.5vh !important; // 滑块高度
      border: 2px solid #ffffff !important; // 边框颜色
      background-color: #ffffff !important; // 滑块背景色（白色）
      box-shadow: 0 2px 6px rgba(77, 17, 102, 0.3) !important; // 添加阴影
      margin-top: 0.7vh !important;
      // 悬停效果
      &:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 8px rgba(77, 17, 102, 0.4) !important;
      }

      // 禁用状态
      .disabled & {
        border-color: #b8a6c5 !important;
        background-color: #f5f2f7 !important;
      }
    }
  }

  // 刻度标记
  .el-slider__stop {
    background-color: #b8a6c5 !important; // 刻度颜色
    height: 6px !important;
    width: 2px !important;

    // 激活的刻度
    &.el-slider__marks-stop {
      background-color: #4d1166 !important;
    }
  }

  // 刻度标签
  .el-slider__marks-text {
    color: #7a5c8c !important;
    font-size: 12px;
    margin-top: 8px;

    &.active {
      color: #4d1166 !important;
      font-weight: bold;
    }
  }

  // 垂直滑块特定样式
  &.el-slider--vertical {
    .el-slider__runway {
      width: 6px !important;
    }

    .el-slider__bar {
      width: 6px !important;
    }

    .el-slider__stop {
      width: 6px !important;
      height: 2px !important;
    }
  }
}

/* 自定义 InputNumber 样式 */
.custom-input-number {
  width: 40%;
  margin-right: 1vw;
  height: 4.3vh;
  .el-input__wrapper {
    background-color: #f8f5fa !important;
    border: 2px solid #9033e9 !important;
    border-radius: 8px !important;
    box-shadow: none !important;

    &:hover,
    &.is-focus {
      border-color: #9033e9 !important;
      box-shadow: 0 0 0 2px rgba(144, 51, 233, 0.1) !important;
    }
  }

  .el-input__inner {
    color: #4d1166 !important;
    font-size: 16px;
    font-weight: 500;
    text-align: center;
  }

  .el-input-number__increase,
  .el-input-number__decrease {
    background-color: #9033e9 !important;
    border: none !important;
    color: #ffffff !important;
    width: 30px !important;

    &:hover {
      background-color: #611f89 !important;
    }

    &:active {
      background-color: #3a0d4d !important;
    }
  }

  .el-input-number__increase {
    height: 2vh !important;
    border-top-right-radius: 8px !important;
    border-bottom-right-radius: 0px !important;
    .el-icon {
      font-size: 40px !important;
    }
  }

  .el-input-number__decrease {
    height: 2vh !important;
    border-top-left-radius: 0px !important;
    border-bottom-right-radius: 8px !important;
    .el-icon {
      font-size: 40px !important;
    }
  }
}
</style>
