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

// 往复灸相关状态
const isReciprocating = ref(false); // 是否正在执行往复灸
const reciprocateInterval = ref(2000); // 往复间隔（毫秒），可配置
const currentReciprocateIndex = ref(0); // 0=第一个位置，1=第二个位置
const reciprocateTimer = ref(null); // 往复灸定时器

// import {selectedCase} from "./treate.js"

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
const tableData = ref([]); //单个穴位数组
const selectedObj = ref({});
const testIndex = ref(-1);
const treatSwiperRef = ref(null);
const swiperInstance = ref(null);
const wsCommandArray = ref([]);
const newPlanPoint = ref([]);
const currentPoint = ref({}); // 当前选中的单个穴位

// 判断是否还有未完成的穴位
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

// 父组件 - flattenPlanData函数（保留分组，不平铺）
const flattenPlanData = (planList) => {
  if (!Array.isArray(planList)) return [];

  // 遍历每个plan分组，保留分组结构，增强字段
  return planList.map((groupItem, groupIndex) => {
    const {
      points = [],
      treatType,
      chooseName,
      time,
      bodyType: groupBodyType,
      plan_id,
    } = groupItem;

    // 计算分组时长（秒），保留原有时间转换逻辑
    const timeInSeconds = (parseInt(time) || 1) * 60;
    const minutes = Math.floor(timeInSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timeInSeconds % 60).toString().padStart(2, "0");
    const time1 = `00:${minutes}:${seconds}`; // 激活项显示格式
    const time2 = `${minutes}:${seconds}`; // 非激活项显示格式

    // 为分组内的每个穴位增强字段（保留原有逻辑）
    const enhancedPoints = points.map((pointItem, pointIndex) => {
      const ensuredId =
        pointItem.id ??
        pointItem._id ??
        `${plan_id ?? groupIndex}-${pointIndex}-${pointItem.name}`;
      const uniqueId = `${chooseName}-${groupIndex}-${pointIndex}-${(
        pointItem.name || ""
      ).replace(/\s+/g, "")}`;

      return {
        ...pointItem,
        id: ensuredId,
        treatType,
        chooseName,
        time: timeInSeconds, // 继承分组时长
        bodyType: pointItem.bodyType || groupBodyType,
        point: pointItem.name,
        status: 0, // 0未开始 1运行中 2已完成
        isActive: false,
        uniqueId,
        time1,
        time2,
      };
    });

    // 每个分组作为一个独立项，包含：分组信息 + 增强后的穴位列表 + 分组级状态/时间
    return {
      groupId: `group-${groupIndex}`, // 分组唯一标识
      groupIndex,
      treatType,
      chooseName,
      time: timeInSeconds,
      time1,
      time2,
      bodyType: groupBodyType,
      plan_id,
      points: enhancedPoints, // 该分组下的所有穴位
      status: 0, // 分组级状态：0未开始 1运行中 2已完成
      isActive: false, // 分组是否激活
      // 新增：标记分组内的穴位数量，方便后续处理
      pointCount: enhancedPoints.length,
    };
  });
};

// 获取穴位数据
const getPoint = (id) => {
  // 先停止可能存在的往复灸
  stopReciprocate();
  
  selectedCase.value = JSON.parse(localStorage.getItem("selectedCase"));
  if (
    !selectedCase.value ||
    !selectedCase.value.plan ||
    selectedCase.value.plan.length === 0
  ) {
    ElMessage.error("未找到有效穴位计划");
    return;
  }

  // 1. 处理plan数据（保留分组结构，不平铺）
  const planList = selectedCase.value.plan;
  const groupedData = flattenPlanData(planList); // 现在是分组数组，而非平铺穴位数组

  console.log("分组数据:", groupedData);

  if (groupedData.length === 0) {
    ElMessage.error("未找到有效穴位计划分组");
    return;
  }

  // 2. 初始化第一个分组（而非第一个穴位）
  const firstGroup = groupedData[0];
  firstGroup.status = 1; // 分组状态设为运行中
  firstGroup.isActive = true;
  
  // 初始化第一个分组内的第一个穴位为激活状态
  let firstPoint = null;
  if (firstGroup.points.length > 0) {
    firstGroup.points[0].status = 1;
    firstGroup.points[0].isActive = true;
    selectedObj.value = firstGroup.points[0];
    currentPoint.value = firstGroup.points[0];
    chooseBody(firstGroup.points[0]);
    firstPoint = firstGroup.points[0];
  }

  // 3. 初始化newPlanPoint
  newPlanPoint.value = JSON.parse(JSON.stringify(groupedData));

  // 4. 初始化图片类型
  picType.value = firstPoint?.bodyType ?? firstGroup.bodyType;
  picUrl.value = [0, 2].includes(picType.value) ? BodyPic : LegPic;

  // 5. 赋值给tableData
  tableData.value = JSON.parse(JSON.stringify(groupedData));

  // 6. 生成WS指令数组（适配分组+往复灸）
  const flatPointsForWS = [];
  groupedData.forEach((group) => {
    group.points.forEach((point) => flatPointsForWS.push(point));
  });
  wsCommandArray.value = generateWsCommandArray(flatPointsForWS);

  // 7. 发送第一个指令（区分是否为往复灸）
  if (wsCommandArray.value.length > 0) {
    const firstWsData = wsCommandArray.value[0];
    // 判断当前穴位/分组是否为往复灸（假设treatType=2代表往复灸，可根据实际值调整）
    const isFirstReciprocate = firstGroup.treatType === 2 || (firstPoint && firstPoint.treatType === 2);
    // 往复灸需要传两个位置点（假设points里包含两个位置的坐标）
    const reciprocatePoints = isFirstReciprocate && firstGroup.points.length >= 2 
      ? firstGroup.points 
      : [];
    
    // 发送指令（往复灸/普通灸区分处理）
    sendWsMessage(firstWsData, isFirstReciprocate, reciprocatePoints);
  }

  // 8. 标记治疗状态
  hasTreatmentStarted.value = true;
  isTreating.value = true;
  isPsuse.value = false;
  isTreatmentEnded.value = false;
  testIndex.value = 0; // 注意：如果是往复灸，testIndex仍代表分组索引

  // 9. 启动倒计时
  nextTick(() => {
    if (swiperInstance.value) {
      swiperInstance.value.slideTo(Math.floor(testIndex.value / 3));
    }
    if (treatSwiperRef.value) {
      treatSwiperRef.value.startCountdown(0);
    }
  });
};

// 更新newPlanPoint的状态（适配分组结构）
const updateNewPlanPointStatus = (pointId, status) => {
  if (!newPlanPoint.value || newPlanPoint.value.length === 0) return;

  // 深拷贝+遍历分组更新穴位状态
  const newArr = JSON.parse(JSON.stringify(newPlanPoint.value));
  newArr.forEach((group) => {
    group.points.forEach((point) => {
      if (point.id === pointId) {
        point.status = status;
        point.isActive = status === 1; // 运行中则激活
      }
    });
    // 同步更新分组状态：只要有一个穴位运行中，分组就运行中；全部完成则分组完成
    const hasRunning = group.points.some((p) => p.status === 1);
    const allFinished = group.points.every((p) => p.status === 2);
    group.status = hasRunning ? 1 : allFinished ? 2 : 0;
    group.isActive = hasRunning;
  });

  newPlanPoint.value = newArr;
  console.log(`更新穴位${pointId}状态为${status}`, newPlanPoint.value);
};
// 父组件 - 自动切换穴位
const usePoint = () => {
  // 平铺所有穴位（用于切换逻辑）
  const flatPoints = [];
  tableData.value.forEach((group) => {
    group.points.forEach((point) => {
      flatPoints.push({ ...point, groupId: group.groupId });
    });
  });
  const pointLength = flatPoints.length;

  if (pointLength === 0) {
    ElMessage.warning("无穴位可执行");
    return;
  }

  // 标记当前穴位为已完成
  if (testIndex.value < pointLength) {
    const currentPointItem = flatPoints[testIndex.value];
    updateNewPlanPointStatus(currentPointItem.id, 2);

    // 同步更新tableData
    tableData.value.forEach((group) => {
      group.points.forEach((point) => {
        if (point.id === currentPointItem.id) {
          point.status = 2;
          point.isActive = false;
        }
      });
    });
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

  // 更新下一个穴位状态为“运行中”
  const nextPointItem = flatPoints[nextIndex];
  updateNewPlanPointStatus(nextPointItem.id, 1);

  // 同步更新tableData
  tableData.value.forEach((group) => {
    group.points.forEach((point) => {
      if (point.id === nextPointItem.id) {
        point.status = 1;
        point.isActive = true;
      } else if (point.status !== 2) {
        point.status = 0;
        point.isActive = false;
      }
    });
  });

  // 更新选中状态和图片
  selectedObj.value = nextPointItem;
  currentPoint.value = nextPointItem;
  newPlanPoint.value = JSON.parse(JSON.stringify(tableData.value));
  picType.value = nextPointItem.bodyType;
  picUrl.value = [0, 2].includes(nextPointItem.bodyType) ? BodyPic : LegPic;
  chooseBody(nextPointItem);

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
    // 同步更新tableData里的状态
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

//  分页索引
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
  // 1. 触发子组件watch
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
  // 暂停时停止往复灸
  stopReciprocate();
  if (treatSwiperRef.value) {
    treatSwiperRef.value.pauseCountdown();
  }
  ElMessage.info("治疗已暂停");
};

// 暂停当前倒计时
const pauseEdit = () => {
  isPsuse.value = true;
  if (treatSwiperRef.value) {
    treatSwiperRef.value.pauseCountdown();
  }
};

// 继续治疗
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
      updateNewPlanPointStatus(flatPoints[firstUnfinished].id, 1);
      
      // 继续时重新启动往复灸（如果当前是往复灸类型）
      const currentGroup = newPlanPoint.value.find(g => 
        g.points.some(p => p.id === flatPoints[firstUnfinished].id)
      );
      if (currentGroup?.treatType === 2 && currentGroup.points.length >= 2) {
        const wsData = wsCommandArray.value[firstUnfinished];
        sendWsMessage(wsData, true, currentGroup.points);
      }

      if (treatSwiperRef.value) {
        treatSwiperRef.value.startCountdown(firstUnfinished);
      }
    }
    return;
  }

  // 恢复倒计时
  if (treatSwiperRef.value) {
    treatSwiperRef.value.resumeCountdown();
  }

  // 恢复往复灸（如果当前是往复灸）
  const currentPointItem = flatPoints[testIndex.value];
  const currentGroup = newPlanPoint.value.find(g => 
    g.points.some(p => p.id === currentPointItem.id)
  );
  if (currentGroup?.treatType === 2 && currentGroup.points.length >= 2) {
    const wsData = wsCommandArray.value[testIndex.value];
    sendWsMessage(wsData, true, currentGroup.points);
  }
};

// 结束当前治疗
const endTreat = () => {
  isPsuse.value = true;
  // 结束时停止往复灸
  stopReciprocate();
  ElMessageBox.confirm("确定要结束当前治疗吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    customClass: "treat-confirm",
    type: "warning",
  })
    .then(() => {
      // 原有逻辑不变...
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


// 重新启动治疗
// 重新启动治疗
const restartTreat = () => {
  ElMessageBox.confirm("确定要重新启动整个灸疗方案吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    customClass: "treat-confirm",
    type: "warning",
  })
    .then(() => {
      // 1. 重置基础状态
      isTreatmentEnded.value = false;
      isPsuse.value = false;
      isTreating.value = true;

      // 2. 重新获取原始分组数据（关键：避免复用已修改的状态）
      const originalPlan = selectedCase.value.plan || [];
      const resetGroupedData = flattenPlanData(originalPlan);

      // 3. 重置分组和穴位状态
      if (resetGroupedData.length > 0) {
        // 激活第一个分组
        resetGroupedData[0].status = 1;
        resetGroupedData[0].isActive = true;

        // 激活第一个分组的第一个穴位
        if (resetGroupedData[0].points.length > 0) {
          resetGroupedData[0].points.forEach((point, idx) => {
            point.status = idx === 0 ? 1 : 0;
            point.isActive = idx === 0;
          });

          // 更新当前选中穴位
          selectedObj.value = resetGroupedData[0].points[0];
          currentPoint.value = resetGroupedData[0].points[0];
          chooseBody(resetGroupedData[0].points[0]);

          // 更新图片类型
          picType.value = resetGroupedData[0].points[0].bodyType;
          picUrl.value = [0, 2].includes(picType.value) ? BodyPic : LegPic;
        }
      }

      // 4. 重置核心数据（关键：同步更新tableData和newPlanPoint）
      tableData.value = JSON.parse(JSON.stringify(resetGroupedData));
      newPlanPoint.value = JSON.parse(JSON.stringify(resetGroupedData));

      // 5. 重置索引
      testIndex.value = 0;

      // 6. 重新生成WS指令并发送第一个穴位指令
      wsCommandArray.value = generateWsCommandArray(resetGroupedData);
      if (wsCommandArray.value.length > 0) {
        sendWsMessage(wsCommandArray.value[0]);
        console.log("重新启动治疗，发送第一个穴位WS指令");
      }

      // 7. 强制刷新子组件（关键：解决穴位消失）
      nextTick(() => {
        // 切回第一页
        if (swiperInstance.value) {
          swiperInstance.value.slideTo(0);
        }
        // 重启倒计时
        if (treatSwiperRef.value) {
          treatSwiperRef.value.stopCountdown();
          treatSwiperRef.value.startCountdown(0);
        }
        // 强制更新身体组件（可选：如果子组件有刷新方法）
        if (bodyRef.value) {
          console.log("强制刷新身体组件");
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
      // 1. 标记演示模式（子组件）
      isDemoMode.value = true;

      // 2. 深度修改tableData：触发子组件watch
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
const sendWsMessage = (data, isReciprocateType = false, reciprocatePoints = []) => {
  // 非往复灸：直接发送
  if (!isReciprocateType || reciprocatePoints.length < 2) {
    if (!$ws) return;
    $ws.SendMessage(`${data.command}`, `${data.args}`, (res) => {
      console.log("WS响应:", res);
    });
    return;
  }

  // 往复灸：先停止已有定时器，再启动新的循环
  if (reciprocateTimer.value) {
    clearInterval(reciprocateTimer.value);
    reciprocateTimer.value = null;
  }

  isReciprocating.value = true;
  currentReciprocateIndex.value = 0;

  // 定义单次发送逻辑
  const sendSingleReciprocate = () => {
    const currentPointData = reciprocatePoints[currentReciprocateIndex.value];
    const { x, y, z, rx, ry, rz } = currentPointData;
    const poseStr = `pose={${x},${y},${z},${rx},${ry},${rz}}`;
    const wsData = {
      command: "MovJ_vertical",
      args: `pose='${poseStr}'`,
      pointInfo: {
        name: currentPointData.name,
        point: currentPointData.name,
        index: currentReciprocateIndex.value,
      },
    };

    // 发送当前位置指令
    if ($ws) {
      $ws.SendMessage(`${wsData.command}`, `${wsData.args}`, (res) => {
        console.log(
          `往复灸-${currentReciprocateIndex.value === 0 ? "位置1" : "位置2"}-WS响应:`,
          res
        );
      });
    }

    // 切换下一个位置索引
    currentReciprocateIndex.value = currentReciprocateIndex.value === 0 ? 1 : 0;
  };

  // 立即发送第一个位置，然后按间隔循环
  sendSingleReciprocate();
  reciprocateTimer.value = setInterval(sendSingleReciprocate, reciprocateInterval.value);
};

// 新增：停止往复灸
const stopReciprocate = () => {
  if (reciprocateTimer.value) {
    clearInterval(reciprocateTimer.value);
    reciprocateTimer.value = null;
  }
  isReciprocating.value = false;
  currentReciprocateIndex.value = 0;
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
  //  localStorage.setItem("selectedCase", JSON.stringify(selectedCase));
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
