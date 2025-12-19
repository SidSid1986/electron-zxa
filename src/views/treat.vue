<template>
  <div class="container">
    <div class="point-content">
      <div class="point-content-left">
        <div class="point-content-left-border">
          <div class="content-left-nav">
            <div class="left-nav-title">灸疗方案</div>
            <!-- 治疗中：未结束 + 非暂停状态 -->
            <div v-if="!isTreatmentEnded && !isPsuse" class="left-nav-text-box">
              <span class="point-ball"></span>
              <span class="left-nav-text">治疗中 </span>
            </div>

            <!-- 暂停中：未结束 + 暂停状态 -->
            <div v-if="!isTreatmentEnded && isPsuse" class="left-nav-text-box">
              <span class="point-ball-red"></span>
              <span class="left-nav-text">暂停中 </span>
            </div>

            <!-- 可治疗结束状态 -->
            <div v-if="isTreatmentEnded" class="left-nav-text-box">
              <span class="point-ball-gray"></span>
              <span class="left-nav-text">已结束 </span>
            </div>
          </div>

          <div class="body-content">
            <component
              :is="currentComponent"
              ref="bodyRef"
              :newPlanPoint="newPlanPoint"
              :currentPoint="currentPoint"
            />
          </div>
        </div>
      </div>
      <div class="point-content-right">
        <div class="point-content-right-border">
          <div class="tool-bar">
            <el-button class="end-btn demo-btn" @click="refreshNormal" type="warning"
              >正常模式</el-button
            >
            <el-button class="end-btn demo-btn" @click="switchDemoMode" type="warning"
              >演示模式（8秒）</el-button
            >
            <!-- 温度图标 -->
            <img
              src="@/assets/pic/temperature.png"
              alt="温度"
              class="control-icon"
              @click="openTempModal"
            />

            <!-- 音量图标 -->
            <img
              src="@/assets/pic/volume.png"
              alt="音量"
              class="control-icon"
              @click="openVolumeModal"
            />

            <!-- 音乐图标 -->
            <img
              src="@/assets/pic/music.png"
              alt="音乐"
              class="control-icon music-icon"
              :class="{ rotating: isMusicPlaying }"
              @click="openMusicPlayer"
            />
            <!-- 引入三个组件 -->
            <TemperatureModal ref="tempModalRef" @update:temperature="handleTempUpdate" />

            <VolumeModal
              ref="volumeModalRef"
              :initial-volume="currentVolume"
              @update:volume="handleVolumeUpdate"
            />

            <MusicPlayer
              ref="musicPlayerRef"
              @update:playing="handlePlayingUpdate"
              @update:currentSong="handleCurrentSongUpdate"
              @update:volume="handleMusicVolumeUpdate"
            />
          </div>
          <div class="swiper-content">
            <TreatSwiper
              ref="treatSwiperRef"
              @swiperChange="handleSwiperChange"
              @updateSwiperData="handleUpdateSwiperData"
              :swiperData="tableData"
              :activeIndex="testIndex"
              :isTreating="isTreating"
              @countdownEnd="countdownEnd"
              @pauseEdit="pauseEdit"
              :isDemoMode="isDemoMode"
            />
          </div>
          <div class="btn-content">
            <!-- 暂停/继续按钮：治疗未结束时显示 -->
            <el-button
              v-if="!isPsuse && hasTreatmentStarted && !isTreatmentEnded"
              class="end-btn"
              @click="pauseTreat"
              type="primary"
              >暂停</el-button
            >
            <el-button
              v-if="isPsuse && hasTreatmentStarted && !isTreatmentEnded"
              class="end-btn"
              @click="continueTreat"
              type="primary"
              >继续</el-button
            >
            <!-- 结束按钮：仅在治疗未结束时显示  -->
            <el-button
              v-if="hasTreatmentStarted && !isTreatmentEnded"
              class="end-btn"
              @click="endTreat"
              type="primary"
              >结束</el-button
            >
            <!-- 返回定穴按钮：仅在治疗结束后显示 -->
            <el-button
              v-if="hasTreatmentStarted && isTreatmentEnded"
              class="end-btn"
              @click="backPoint"
              type="primary"
              >返回定穴</el-button
            >
            <!-- 重新启动按钮：仅在治疗结束后显示 -->
            <el-button
              v-if="hasTreatmentStarted && isTreatmentEnded"
              class="end-btn"
              @click="restartTreat"
              type="primary"
              >重新启动</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  watch,
  nextTick,
  computed,
  onUnmounted,
  shallowRef,
  markRaw,
  inject,
} from "vue";
import caseData from "@/data/caseData.json";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import BodyCom from "@/components/BodyCom.vue";
import TreatSwiper from "@/components/TreatSwiper.vue";
import TemperatureModal from "@/components/TemperatureModal.vue";
import VolumeModal from "@/components/VolumeModal.vue";
import MusicPlayer from "@/components/MusicPlayer.vue";
import BodyPic from "@/assets/pic/body/body0.png";
import LegPic from "@/assets/pic/body/body1.png";

import BodyFront from "@/components/body/BodyFront.vue";
import BodyBack from "@/components/body/BodyBack.vue";
import LegFront from "@/components/body/LegFront.vue";
import LegBack from "@/components/body/LegBack.vue";
const currentComponent = shallowRef(markRaw(BodyBack));

const $ws = inject("$ws");
const isDemoMode = ref(false);

// 组件引用
const tempModalRef = ref(null);
const volumeModalRef = ref(null);
const musicPlayerRef = ref(null);

// 状态管理
const currentTemp = ref(23);
const currentVolume = ref(50); // 全局音量（同步到音乐播放器）
const isMusicPlaying = ref(false);
const currentPlayingSong = ref({ name: "暂无音乐", url: "" });

// 判断是否为Electron环境（仅在父组件做一次判断）
const isElectronEnv = ref(false);
try {
  isElectronEnv.value = !!window.process?.type === "renderer";
} catch (e) {
  isElectronEnv.value = false;
}

const router = useRouter();

// 状态
const isTreating = ref(false); // 是否正在治疗（控制倒计时启动）
const isPsuse = ref(true); // 默认暂停，确保初始能看到继续按钮
const hasTreatmentStarted = ref(false); // 标记治疗是否已开始（控制按钮显示）
const isTreatmentEnded = ref(false); // 标记治疗是否被手动结束

// 响应式变量
const picType = ref(-1);
const picUrl = ref("");
const selectedCaseId = ref("");
const selectedCase = ref({});
const tableData = ref([]); // 改为：扁平化的单个穴位数组
const selectedObj = ref({});
const testIndex = ref(-1);
const treatSwiperRef = ref(null);
const swiperInstance = ref(null);
const wsCommandArray = ref([]);
const newPlanPoint = ref([]);
const currentPoint = ref({}); // 当前选中的单个穴位

// 计算属性：判断是否还有未完成的穴位
const hasUnfinishedPoints = computed(() => {
  return tableData.value.some((item) => item.status !== 2);
});

// 选择身体组件（适配单个穴位的bodyType）
const chooseBody = (pointItem) => {
  if (!pointItem) return;
  switch (pointItem.bodyType) {
    case 0:
      currentComponent.value = markRaw(BodyFront);
      break;
    case 1:
      currentComponent.value = markRaw(LegFront);
      break;
    case 2:
      currentComponent.value = markRaw(BodyBack);
      break;
    case 3:
      currentComponent.value = markRaw(LegBack);
      break;
    default:
      break;
  }
};

// 生成WS指令数组（适配新数据结构：每个穴位生成指令）
const generateWsCommandArray = (flatPoints) => {
  if (!flatPoints || !Array.isArray(flatPoints)) {
    console.error("无效的穴位数据");
    return [];
  }

  return flatPoints.map((item, index) => {
    const { x, y, z, rx, ry, rz } = item;
    const poseStr = `pose={${x},${y},${z},${rx},${ry},${rz}}`;
    return {
      command: "MovJ_vertical",
      args: `pose='${poseStr}'`,
      pointInfo: {
        name: item.name,
        point: item.name, // 子组件用point字段显示穴位名
        index: index,
      },
    };
  });
};

// 父组件 - flattenPlanData函数
const flattenPlanData = (planList) => {
  const flatPoints = [];
  planList.forEach((groupItem) => {
    const {
      points = [],
      name: groupName,
      treatType,
      chooseName,
      time,
      bodyType: groupBodyType,
    } = groupItem;
    points.forEach((pointItem, pointIndex) => {
      const timeInSeconds = (parseInt(time) || 1) * 60; // 1→60秒
      // 秒数转 分:秒
      const minutes = Math.floor(timeInSeconds / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (timeInSeconds % 60).toString().padStart(2, "0");
      const time1 = `00:${minutes}:${seconds}`;
      const time2 = `${minutes}:${seconds}`; // 非激活项显示字段
      flatPoints.push({
        ...pointItem,
        groupName: groupName,
        treatType: treatType,
        chooseName: chooseName,
        time: timeInSeconds,
        bodyType: pointItem.bodyType || groupBodyType,
        point: pointItem.name,
        status: 0,
        isActive: false,
        uniqueId: `${groupName}-${treatType}-${pointIndex}-${pointItem.name}`,
        time1: time1,
        time2: time2, // 确保初始化时存在该字段
      });
    });
  });
  return flatPoints;
};

// 获取穴位数据（适配新数据结构）
const getPoint = (id) => {
  selectedCase.value = JSON.parse(localStorage.getItem("selectedCase"));
  if (
    !selectedCase.value ||
    !selectedCase.value.plan ||
    selectedCase.value.plan.length === 0
  ) {
    ElMessage.error("未找到有效穴位计划");
    return;
  }

  // 1. 扁平化处理plan数据（拆分为单个穴位数组）
  const planList = selectedCase.value.plan;
  const flatPoints = flattenPlanData(planList);
  if (flatPoints.length === 0) {
    ElMessage.error("未找到有效穴位");
    return;
  }

  // 2. 初始化第一个穴位
  flatPoints[0].status = 1;
  flatPoints[0].isActive = true;
  selectedObj.value = flatPoints[0];
  currentPoint.value = flatPoints[0];
  //  初始化newPlanPoint为所有穴位（而非仅第一个）
  newPlanPoint.value = JSON.parse(JSON.stringify(flatPoints));
  chooseBody(flatPoints[0]);

  // 3. 初始化图片类型
  picType.value = flatPoints[0].bodyType;
  picUrl.value = [0, 2].includes(flatPoints[0].bodyType) ? BodyPic : LegPic;

  // 4. 赋值给tableData（子组件数据源）
  tableData.value = JSON.parse(JSON.stringify(flatPoints));

  // 5. 生成WS指令数组（基于单个穴位）
  wsCommandArray.value = generateWsCommandArray(flatPoints);
  // 发送第一个穴位的WS指令
  if (wsCommandArray.value.length > 0) {
    sendWsMessage(wsCommandArray.value[0]);
  }

  // 6. 标记治疗状态
  hasTreatmentStarted.value = true;
  isTreating.value = true;
  isPsuse.value = false;
  isTreatmentEnded.value = false;
  testIndex.value = 0;

  // 7. 启动倒计时
  nextTick(() => {
    if (swiperInstance.value) {
      // 初始索引0  分页索引0（第一页3个）
      swiperInstance.value.slideTo(Math.floor(testIndex.value / 3));
    }
    if (treatSwiperRef.value) {
      treatSwiperRef.value.startCountdown(0);
    }
  });
};

//  更新newPlanPoint的状态（全局生效）
const updateNewPlanPointStatus = (pointId, status) => {
  if (!newPlanPoint.value || newPlanPoint.value.length === 0) return;
  // 深拷贝+更新状态，强制触发响应式
  const newArr = JSON.parse(JSON.stringify(newPlanPoint.value));
  const targetIndex = newArr.findIndex((item) => item.id === pointId);
  if (targetIndex > -1) {
    newArr[targetIndex].status = status;
    newPlanPoint.value = newArr;
    console.log(`更新穴位${pointId}状态为${status}`, newPlanPoint.value);
  }
};

// 父组件 - 自动切换穴位
const usePoint = () => {
  const flatPoints = tableData.value;
  const pointLength = flatPoints.length;

  if (pointLength === 0) {
    ElMessage.warning("无穴位可执行");
    return;
  }

  // 标记当前穴位为已完成
  if (testIndex.value < pointLength) {
    const currentPointId = flatPoints[testIndex.value].id;
    flatPoints[testIndex.value].status = 2; // 已完成
    flatPoints[testIndex.value].isActive = false;
    // 同步更新newPlanPoint中该穴位的状态
    updateNewPlanPointStatus(currentPointId, 2);
  }

  // 计算下一个索引
  const nextIndex = testIndex.value + 1;

  // 最后一个穴位
  if (nextIndex >= pointLength) {
    isTreating.value = false;
    isPsuse.value = true;
    isTreatmentEnded.value = true;
    ElMessage.info("已执行完所有穴位，结束治疗");
    testIndex.value = -1;
    return;
  }

  //  更新下一个穴位状态为“运行中”
  flatPoints.forEach((item, idx) => {
    if (idx === nextIndex) {
      item.status = 1; // 运行中
      item.isActive = true;
      // 同步更新newPlanPoint中该穴位的状态
      updateNewPlanPointStatus(item.id, 1);
    } else if (item.status !== 2) {
      item.status = 0; // 未开始
      item.isActive = false;
      // 同步更新newPlanPoint中该穴位的状态
      updateNewPlanPointStatus(item.id, 0);
    }
  });

  // 更新选中状态和图片
  selectedObj.value = flatPoints[nextIndex];
  currentPoint.value = flatPoints[nextIndex];
  //  newPlanPoint始终保持所有穴位的最新状态
  newPlanPoint.value = JSON.parse(JSON.stringify(flatPoints));
  picType.value = flatPoints[nextIndex].bodyType;
  picUrl.value = [0, 2].includes(flatPoints[nextIndex].bodyType) ? BodyPic : LegPic;
  chooseBody(flatPoints[nextIndex]);

  // 发送WS指令
  if (wsCommandArray.value[nextIndex]) {
    sendWsMessage(wsCommandArray.value[nextIndex]);
  }

  // 切页
  nextTick(() => {
    if (swiperInstance.value) {
      const pageIndex = Math.floor(nextIndex / 3);
      swiperInstance.value.slideTo(pageIndex);
    }
  });

  testIndex.value = nextIndex;
};

// 父组件 - 处理倒计时结束事件
const countdownEnd = (item) => {
  const flatPoints = tableData.value;
  const pointLength = flatPoints.length;

  //  先更新最后一个穴位的状态为2，再标记结束
  if (testIndex.value >= pointLength - 1) {
    // 第一步：先把当前最后一个穴位的status设为2
    updateNewPlanPointStatus(item.id, 2);
    // 同步更新tableData里的状态（确保数据一致）
    const targetIndex = flatPoints.findIndex((p) => p.id === item.id);
    if (targetIndex > -1) {
      flatPoints[targetIndex].status = 2;
      flatPoints[targetIndex].isActive = false;
    }

    isTreatmentEnded.value = true;
    if (treatSwiperRef.value) {
      treatSwiperRef.value.stopCountdown();
    }

    //  弹窗前先更新newPlanPoint（确保子组件能拿到最新状态）
    newPlanPoint.value = JSON.parse(JSON.stringify(flatPoints));

    ElMessageBox.alert(
      "<strong><i style='font-size: 24px; color: #6c359d; text-align: center; display: block;font-weight: bold;font-style: normal;'>治疗结束</i></strong>",
      "提醒",
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        showClose: false,
      }
    ).then(() => {
      testIndex.value = -1;
      isTreating.value = false;
      isPsuse.value = true;

      const finalPoints = flatPoints.map((item) => ({
        ...item,
        status: 2,
        isActive: false,
      }));
      tableData.value = finalPoints;
      newPlanPoint.value = JSON.parse(JSON.stringify(finalPoints));

      console.log("治疗完全结束，所有穴位状态设为2：", newPlanPoint.value);
    });
    return;
  }

  // 非最后一个穴位：正常更新状态
  updateNewPlanPointStatus(item.id, 2);

  setTimeout(() => {
    if (!isTreatmentEnded.value) {
      usePoint();

      nextTick(() => {
        if (treatSwiperRef.value && isTreating.value && !isPsuse.value) {
          treatSwiperRef.value.startCountdown(testIndex.value);
          console.log(`启动第${testIndex.value}个穴位倒计时`);
        }
      });
    }
  }, 500);
};

//  删除bodyType关联，改为分页索引
const handleSwiperChange = (swiperPageIndex) => {
  const flatPoints = tableData.value;
  if (flatPoints.length === 0) return;

  // 分页索引→该页的第一个穴位索引
  const pageStartIndex = swiperPageIndex * 3;
  // 找到该页第一个未完成的穴位
  const currentItem = flatPoints.find(
    (item, idx) => idx >= pageStartIndex && idx < pageStartIndex + 3 && item.status === 1
  );
  if (currentItem) {
    testIndex.value = flatPoints.indexOf(currentItem);
  }
};

// 处理时长更新事件（适配扁平化数据）
const handleUpdateSwiperData = (newSwiperData) => {
  // 1. 深拷贝覆盖，确保引用更新（触发子组件watch）
  tableData.value = []; // 先清空
  nextTick(() => {
    tableData.value = JSON.parse(JSON.stringify(newSwiperData));
    // 同步更新newPlanPoint
    newPlanPoint.value = JSON.parse(JSON.stringify(newSwiperData));
  });
  // 2. 强制保持暂停状态
  isPsuse.value = true;
  // ElMessage.success("时长已更新，非激活项已同步显示新值");
};

// 暂停治疗
const pauseTreat = () => {
  isPsuse.value = true;
  if (treatSwiperRef.value) {
    treatSwiperRef.value.pauseCountdown();
  }
  ElMessage.info("治疗已暂停");
};

// 暂停当前倒计时（修改时长时）
const pauseEdit = () => {
  isPsuse.value = true;
  if (treatSwiperRef.value) {
    treatSwiperRef.value.pauseCountdown();
  }
};

// 继续治疗（适配扁平化数据）
const continueTreat = () => {
  if (!hasUnfinishedPoints.value) {
    ElMessage.info("所有穴位已治疗完成，无法继续");
    return;
  }

  isPsuse.value = false;
  isTreating.value = true;
  const flatPoints = tableData.value;
  const pointLength = flatPoints.length;

  if (testIndex.value >= pointLength) {
    const firstUnfinished = flatPoints.findIndex((item) => item.status !== 2);
    if (firstUnfinished > -1) {
      testIndex.value = firstUnfinished;
      flatPoints[firstUnfinished].status = 1;
      flatPoints[firstUnfinished].isActive = true;
      // 同步更新newPlanPoint
      updateNewPlanPointStatus(flatPoints[firstUnfinished].id, 1);
      if (treatSwiperRef.value) {
        treatSwiperRef.value.startCountdown(firstUnfinished);
      }
    }
    return;
  }

  //  调用子组件的 resumeCountdown 恢复暂停的倒计时
  if (treatSwiperRef.value) {
    treatSwiperRef.value.resumeCountdown();
  }
};

// 结束当前治疗（适配扁平化数据）
const endTreat = () => {
  isPsuse.value = true;
  ElMessageBox.confirm("确定要结束当前治疗吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    customClass: "treat-confirm",
    type: "warning",
  })
    .then(() => {
      isTreating.value = false;
      isTreatmentEnded.value = true;

      // 标记所有激活穴位为已结束
      if (treatSwiperRef.value) {
        treatSwiperRef.value.stopCountdown();
        treatSwiperRef.value.treatData.forEach((page) => {
          page.forEach((item) => {
            if (item.isActive) {
              item.status = 2;
              updateNewPlanPointStatus(item.id, 2);
            } else {
              item.status = 0;
              item.isActive = false;
              updateNewPlanPointStatus(item.id, 0);
            }
          });
        });
      }

      // 重置所有穴位状态
      const flatPoints = tableData.value;
      flatPoints.forEach((item) => {
        if (item.status !== 2) {
          item.status = 0;
          item.isActive = false;
          updateNewPlanPointStatus(item.id, 0);
        }
      });
      // 最终更新newPlanPoint
      newPlanPoint.value = JSON.parse(JSON.stringify(flatPoints));
      testIndex.value = -1;

      ElMessage.success("治疗已结束");
    })
    .catch(() => {
      isPsuse.value = false;
      ElMessage.info("已取消结束操作");
    });
};

// 重新启动治疗（适配扁平化数据）
const restartTreat = () => {
  ElMessageBox.confirm("确定要重新启动整个灸疗方案吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    customClass: "treat-confirm",
    type: "warning",
  })
    .then(() => {
      // 重置状态
      isTreatmentEnded.value = false;
      isPsuse.value = false;
      isTreating.value = true;

      // 重置所有穴位状态
      const flatPoints = tableData.value;
      flatPoints.forEach((item, idx) => {
        item.status = idx === 0 ? 1 : 0;
        item.isActive = idx === 0;
        // 同步更新每个穴位的状态
        updateNewPlanPointStatus(item.id, idx === 0 ? 1 : 0);
      });

      // 重置选中状态
      selectedObj.value = flatPoints[0];
      currentPoint.value = flatPoints[0];
      // 重置newPlanPoint
      newPlanPoint.value = JSON.parse(JSON.stringify(flatPoints));
      picType.value = flatPoints[0].bodyType;
      picUrl.value = [0, 2].includes(flatPoints[0].bodyType) ? BodyPic : LegPic;
      chooseBody(flatPoints[0]);

      // 重置索引
      testIndex.value = 0;

      //  切到分页索引0（第一页），而非bodyType
      nextTick(() => {
        if (swiperInstance.value) {
          swiperInstance.value.slideTo(0); // 强制切回第一页
        }
        if (treatSwiperRef.value) {
          treatSwiperRef.value.startCountdown(0);
        }
      });

      ElMessage.success("灸疗方案已重新启动");
    })
    .catch(() => {
      ElMessage.info("已取消重新启动操作");
    });
};

// 返回定穴
const backPoint = () => {
  localStorage.removeItem("selectedCase");
  router.push(`/point?id=${localStorage.getItem("selectedCaseId")}`);
};

// 打开温度弹窗
const openTempModal = () => {
  if (tempModalRef.value) {
    tempModalRef.value.openModal();
  }
};

// 打开音量弹窗
const openVolumeModal = () => {
  const initVol = musicPlayerRef.value?.musicVolume || currentVolume.value;
  if (volumeModalRef.value) {
    volumeModalRef.value.openModal(initVol);
  }
};

// 打开音乐播放器
const openMusicPlayer = () => {
  if (musicPlayerRef.value) {
    musicPlayerRef.value.openPlayer();
  }
};

// 温度更新处理
const handleTempUpdate = (temp) => {
  currentTemp.value = temp;
  console.log("当前温度:", temp + "°C");
};

// 音量更新处理
const handleVolumeUpdate = (volume) => {
  currentVolume.value = volume * 1;

  // 1. Electron环境：控制系统音量
  if (isElectronEnv.value) {
    import("@/utils/volume")
      .then(({ setVol }) => {
        setVol(volume);
      })
      .catch((err) => {
        console.warn("Electron系统音量控制失败:", err);
      });
  }

  // 2. 同步到音乐播放器
  if (musicPlayerRef.value) {
    musicPlayerRef.value.setMusicVolume(volume);
  }
};

// 同步音乐播放器音量到全局
const handleMusicVolumeUpdate = (volume) => {
  currentVolume.value = volume * 1;
  if (volumeModalRef.value?.visible) {
    volumeModalRef.value.volume = volume;
  }
};

// 接收音乐播放状态更新
const handlePlayingUpdate = (playingState) => {
  isMusicPlaying.value = playingState;
};

// 当前歌曲更新
const handleCurrentSongUpdate = (song) => {
  currentPlayingSong.value = song;
};

// 父组件 - switchDemoMode函数
// 父组件中：修复演示模式切换逻辑
const switchDemoMode = () => {
  isPsuse.value = true;
  if (treatSwiperRef.value) {
    treatSwiperRef.value.pauseCountdown(); // 先暂停倒计时
  }

  ElMessageBox.confirm(
    "演示模式：所有穴位时长临时改为8秒（点击正常模式恢复1分钟）！",
    "演示模式",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      customClass: "treat-confirm",
      type: "warning",
    }
  )
    .then(() => {
      // 1. 标记演示模式（先赋值，确保子组件能拿到）
      isDemoMode.value = true;

      // 2. 深度修改tableData：替换数组（触发子组件watch）
      const newTableData = JSON.parse(JSON.stringify(tableData.value)).map((item) => ({
        ...item,
        time: 8, // 演示模式：时长设为8秒
        time1: "00:00:08", // 激活项显示格式：00:分:秒
        time2: "00:08", // 非激活项显示格式：分:秒
        totalSeconds: 8, // 子组件依赖的总秒数
        remainingSeconds: 8, // 剩余秒数重置为8
      }));
      tableData.value = newTableData; // 替换数组，触发子组件watch

      // 3. 同步更新newPlanPoint（确保身体部位组件拿到最新数据）
      newPlanPoint.value = JSON.parse(JSON.stringify(newTableData));

      // 4. 重启治疗，确保倒计时按8秒运行
      nextTick(() => {
        // 重置索引和状态
        testIndex.value = 0;
        isTreating.value = true;
        isPsuse.value = false;
        isTreatmentEnded.value = false;

        // 切回第一页
        if (swiperInstance.value) {
          swiperInstance.value.slideTo(0);
        }

        // 重启子组件倒计时（ 重新启动8秒倒计时）
        if (treatSwiperRef.value) {
          treatSwiperRef.value.stopCountdown(); // 先停止旧的
          treatSwiperRef.value.startCountdown(0); // 启动第0个穴位的8秒倒计时
        }
      });

      ElMessage.success("已切换到演示模式（所有穴位时长改为8秒）");
    })
    .catch(() => {
      isDemoMode.value = false; // 取消则回到正常模式
      ElMessage.info("已取消演示模式切换");
    });
};

// 发送WS消息
const sendWsMessage = (data) => {
  if (!$ws) return;
  $ws.SendMessage(`${data.command}`, `${data.args}`, (res) => {
    console.log("WS响应:", res);
  });
};

// 恢复正常模式（刷新页面）
const refreshNormal = () => {
  isDemoMode.value = false;
  window.location.reload();
};

// 监听Swiper实例
watch(
  () => treatSwiperRef.value,
  (swiperComp) => {
    if (swiperComp) {
      swiperInstance.value = swiperComp.swiperInstance;
    }
  },
  { immediate: true }
);

//  确保newPlanPoint变化时触发子组件更新
watch(
  () => newPlanPoint.value,
  (newVal) => {
    console.log("newPlanPoint更新：", newVal);
  },
  { deep: true, immediate: true }
);

// 初始化
onMounted(() => {
  selectedCaseId.value = localStorage.getItem("selectedCaseId") || 1;
  getPoint(selectedCaseId.value);
});

onUnmounted(() => {});
</script>
>

<style scoped lang="scss">
.container {
  box-sizing: border-box;
  background: url("@/assets/pic/backgroundImage.png") no-repeat;
  background-position: center center;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  padding-top: 4vh;

  .point-nav {
    box-sizing: border-box;
    width: 100%;
    height: 6vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #c293d5;

    span {
      font-size: 30px;
      font-weight: bold;
      color: #fff;
    }
  }

  .point-content {
    box-sizing: border-box;
    width: 100%;
    height: 90vh;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4vh;

    .point-content-left {
      box-sizing: border-box;
      width: 35%;

      height: 86vh;

      .point-content-left-border {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        border-radius: 20px;
        overflow: hidden;
        border: 1px solid #ffffff;

        .content-left-nav {
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #c293d5;
          height: 8vh;
          padding: 0 20px;

          .left-nav-title {
            font-size: 26px;
            font-weight: bold;
            color: #fff;
            height: 8vh;
            line-height: 8vh;
          }

          .left-nav-text-box {
            height: 8vh;
            min-width: 25%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: row;

            .point-ball {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background-color: #58c08d;
              margin-right: 10px;
            }

            .point-ball-red {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background-color: #e53935;
              margin-right: 10px;
            }
            .point-ball-gray {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background-color: #c0c4cc;
              margin-right: 10px;
            }

            .left-nav-text {
              height: 3vh;
              line-height: 3vh;
              font-size: 18px;
              font-weight: bold;
              color: #fff;
            }
          }
        }

        .body-content {
          box-sizing: border-box;
          width: 100%;
          height: 80vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }
      }
    }

    .point-content-right {
      box-sizing: border-box;
      width: 63%;

      height: 86vh;

      .point-content-right-border {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        border-radius: 20px;
        overflow: hidden;
        background-color: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 40px;

        .tool-bar {
          box-sizing: border-box;
          width: 100%;
          height: 10vh;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-direction: row;

          img {
            cursor: pointer;
            margin-left: 20px;
          }
        }

        .swiper-content {
          box-sizing: border-box;
          width: 100%;
          height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-content {
          box-sizing: border-box;
          width: 100%;
          height: 8vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: row;
          gap: 20px;
        }
      }
    }
  }
}

/* 音乐图标样式 + 旋转动画 */
.music-icon {
  cursor: pointer;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.music-icon.rotating {
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.status-blue {
  width: 150px;
  height: 50px;
  line-height: 50px;
  background-color: #bdbdba;
  border-radius: 40px;
  color: #111;
}

.status-red {
  color: #ffffff;
  width: 150px;
  height: 50px;
  line-height: 50px;
  border-radius: 40px;
}

.status-green {
  color: #ffffff;
  width: 150px;
  height: 50px;
  line-height: 50px;
  background-color: #6c359d;
  border-radius: 40px;
}

:deep(.el-dialog__body) {
  text-align: center;
  padding: 30px 20px !important;
  background-color: #d4bfe1;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 15vh;

  .dialog-title {
    font-size: 36px;
    font-weight: bold;
    color: #511d6a;
    margin-bottom: 40px;
  }

  .dialog-text {
    font-size: 20px;
    font-weight: 500;
    color: #4c1c64;
    margin-bottom: 20px;
  }
}

.dialog-btn-content {
  margin-top: 40px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

:deep(.el-dialog) {
  --el-dialog-bg-color: #d4bfe1 !important;
}

:deep(.el-dialog__close) {
  color: #ffffff;
}

:deep(.el-dialog__headerbtn):hover .el-dialog__close {
  color: #ffffff !important;
}

::-webkit-scrollbar {
  display: none;
}

* {
  scrollbar-width: none;
  -ms-overflow-style: none;
  touch-action: pan-y;
  margin: 0;
  padding: 0;
  font-family: "Microsoft YaHei", sans-serif;
  box-sizing: border-box !important;
}

:deep(.end-btn) {
  width: 150px;
  height: 60px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 20px;
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

.demo-btn {
  width: 15vw;
  --el-button-bg-color: #f59e0b !important;
  --el-button-border-color: #f59e0b !important;
  --el-button-hover-bg-color: #d97706 !important;
  --el-button-hover-border-color: #d97706 !important;
  --el-button-active-bg-color: #b45309 !important;
  --el-button-active-border-color: #b45309 !important;
}
</style>

<style>
.treat-confirm {
  font-size: 20px !important;

  .el-message-box__container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    height: 10vh;
  }

  .el-message-box__title {
    font-size: 24px !important;
    font-weight: bold;
    margin-bottom: 15px !important;
  }

  .el-message-box__message {
    font-size: 22px !important;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .el-message-box__btns {
    margin-top: 10px !important;
  }

  .el-message-box__btns .el-button {
    padding: 18px 36px !important;
    font-size: 20px !important;
    border-radius: 8px !important;
    min-width: 120px !important;
    height: auto !important;
  }

  .el-message-box__btns .el-button--primary {
    background-color: #9a6cb8 !important;
    border-color: #9a6cb8 !important;
    color: #fff !important;
  }

  .el-message-box__btns .el-button--primary:hover {
    background-color: #885ca8 !important;
    border-color: #885ca8 !important;
  }

  .el-message-box__btns .el-button--default {
    font-size: 20px !important;
    border-color: #ddd !important;
  }
}
</style>
