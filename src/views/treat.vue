<template>
  <div class="container">
    <div class="point-nav">
      <span>定穴</span>
    </div>
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

            <!-- 可选补充：治疗结束状态（如果需要） -->
            <div v-if="isTreatmentEnded" class="left-nav-text-box">
              <span class="point-ball-gray"></span>
              <span class="left-nav-text">已结束 </span>
            </div>
          </div>
          <FuXie :picType="picType" :picUrl="picUrl" :tableData="tableData" />
        </div>
      </div>
      <div class="point-content-right">
        <div class="point-content-right-border">
          <div class="tool-bar">
            <el-button
              class="end-btn demo-btn"
              @click="refreshNormal"
              type="warning"
              >正常模式</el-button
            >
            <el-button
              class="end-btn demo-btn"
              @click="switchDemoMode"
              type="warning"
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
            <TemperatureModal
              ref="tempModalRef"
              @update:temperature="handleTempUpdate"
            />

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
            <!-- 结束按钮：仅在治疗未结束时显示（核心修改） -->
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
import { ref, onMounted, watch, nextTick, computed, onUnmounted } from "vue";
import caseData from "@/data/caseData.json";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import FuXie from "@/components/FuXie.vue";
import TreatSwiper from "@/components/TreatSwiper.vue";
import TemperatureModal from "@/components/TemperatureModal.vue";
import VolumeModal from "@/components/VolumeModal.vue";
import MusicPlayer from "@/components/MusicPlayer.vue";
import BodyPic from "@/assets/pic/5.png";
import LegPic from "@/assets/pic/3.png";

const $ws = inject("$ws");

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

// 核心状态
const isTreating = ref(false); // 是否正在治疗（控制倒计时启动）
const isPsuse = ref(true); // 默认暂停，确保初始能看到继续按钮
const hasTreatmentStarted = ref(false); // 标记治疗是否已开始（控制按钮显示）
const isTreatmentEnded = ref(false); // 标记治疗是否被手动结束

// 响应式变量
const picType = ref(-1);
const picUrl = ref("");
const selectedCaseId = ref("");
const selectedCase = ref({});
const tableData = ref([]);
const selectedObj = ref({});
const testIndex = ref(-1);
const treatSwiperRef = ref(null);
const swiperInstance = ref(null);
const wsCommandArray = ref([]);

// 计算属性：判断是否还有未完成的穴位
const hasUnfinishedPoints = computed(() => {
  const planList = selectedCase.value.plan || [];
  return planList.some((item) => item.status !== 2);
});

const generateWsCommandArray = (data) => {
  // 校验入参
  if (!data || !Array.isArray(data.plan) || data.plan.length === 0) {
    console.error("无效的plan数据");
    return [];
  }

  // 遍历plan，组装每个穴位的WS指令
  const wsCommandArray = data.plan.map((item, index) => {
    // 提取坐标值
    const { x, y, z, rx, ry, rz } = item;
    // 拼接args中的pose字符串
    const poseStr = `pose={${x},${y},${z},${rx},${ry},${rz}}`;
    // 组装完整的WS指令
    return {
      // req_id: `0001${index + 1}`, // 每个指令的req_id区分（也可固定为00011，根据你的需求调整）
      command: "MovJ_vertical",
      args: `pose='${poseStr}'`,
      //  穴位信息
      // pointInfo: {
      //   name: item.name,
      //   point: item.point,
      //   index: index,
      // },
    };
  });

  return wsCommandArray;
};

const getPoint = (id) => {
  // const caseDataCopy = JSON.parse(JSON.stringify(caseData));
  // selectedCase.value = caseDataCopy.find((item) => item.id * 1 === id * 1);

  // console.log(selectedCase.value);

  selectedCase.value = JSON.parse(localStorage.getItem("selectedCase"));
  console.log(selectedCase.value);

  wsCommandArray.value = generateWsCommandArray(selectedCase.value);

  console.log(wsCommandArray.value[0]);

  sendWsMessage(wsCommandArray.value[0]);
  // let data = {"req_id":"00011","command": "MovJ_vertical","args": "pose='pose={500,-100,500,180,0,90}'"};
  // sendWsMessage(data);

  if (
    !selectedCase.value ||
    !selectedCase.value.plan ||
    selectedCase.value.plan.length === 0
  ) {
    ElMessage.error("未找到有效穴位计划");
    return;
  }

  // 初始化第一个穴位 + 修复默认时长为1分钟（核心！）
  const planList = selectedCase.value.plan;

  planList.forEach((item) => {
    // 如果time未定义/为0/为1，强制设为1分钟（60秒）
    if (!item.time || item.time === 0 || item.time === 1) {
      item.time = 60; // 1分钟 = 60秒（匹配子组件的秒级计算）
    }
  });

  planList[0].status = 1;
  planList[0].isActive = true;

  selectedObj.value = planList[0];
  picType.value = planList[0].type;
  picUrl.value = planList[0].type === 0 ? BodyPic : LegPic;

  tableData.value = JSON.parse(JSON.stringify(planList));

  // 标记治疗已开始
  hasTreatmentStarted.value = true;
  isTreating.value = true;
  isPsuse.value = false; // 初始为未暂停
  isTreatmentEnded.value = false; // 重置结束标记
  testIndex.value = 0;

  // 初始化Swiper
  nextTick(() => {
    if (swiperInstance.value) {
      swiperInstance.value.slideTo(planList[0].type);
    }
    if (treatSwiperRef.value) {
      treatSwiperRef.value.startCountdown(0);
    }
  });
};

// 自动切换穴位
const usePoint = () => {
  const planList = selectedCase.value.plan || [];
  const planLength = planList.length;

  if (planLength === 0) {
    ElMessage.warning("无穴位计划可执行");
    return;
  }

  // 1. 标记当前穴位为已完成
  if (testIndex.value < planLength) {
    planList[testIndex.value].status = 2;
    planList[testIndex.value].isActive = false;
  }

  // 2. 计算下一个索引
  const nextIndex = testIndex.value + 1;

  // 3. 最后一个穴位
  if (nextIndex >= planLength) {
    tableData.value = JSON.parse(JSON.stringify(planList));
    isTreating.value = false;
    isPsuse.value = true; // 标记为暂停状态，显示继续按钮
    isTreatmentEnded.value = true; // 标记为治疗完成
    ElMessage.info("已执行完所有穴位，结束治疗");
    testIndex.value = -1;
    return;
  }

  // 4. 更新状态
  planList.forEach((item, idx) => {
    if (idx === nextIndex) {
      item.status = 1;
      item.isActive = true;
    } else if (item.status !== 2) {
      item.status = 0;
      item.isActive = false;
    }
  });

  selectedObj.value = planList[nextIndex];
  picType.value = planList[nextIndex].type;
  picUrl.value = planList[nextIndex].type === 0 ? BodyPic : LegPic;

  // 5. 同步Swiper
  nextTick(() => {
    if (swiperInstance.value) {
      swiperInstance.value.slideTo(planList[nextIndex].type);
    }
  });

  // 6. 更新数据源
  testIndex.value = nextIndex;
  tableData.value = JSON.parse(JSON.stringify(planList));

  console.log(`自动切换到索引${nextIndex}，type=${planList[nextIndex].type}`);
};

// 处理倒计时结束事件
const countdownEnd = (item) => {
  const planList = selectedCase.value.plan || [];
  const planLength = planList.length;

  console.log("数据顺序");
  console.log(testIndex.value);

  if (testIndex.value + 1 >= planLength) {
    return;
  }

  sendWsMessage(wsCommandArray.value[testIndex.value + 1]);

  // 前置判断：已结束所有治疗
  if (testIndex.value >= planLength || !isTreating.value) {
    if (treatSwiperRef.value) {
      treatSwiperRef.value.stopCountdown();
    }
    ElMessageBox.alert(
      "<strong><i style='font-size: 24px; color: #6c359d; text-align: center; display: block;font-weight: bold;font-style: normal;'>治疗结束</i></strong>",
      "提醒",
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
      }
    ).then(() => {
      testIndex.value = -1;
      isTreating.value = false;
      isPsuse.value = true; // 保持暂停状态，显示继续按钮
      isTreatmentEnded.value = true; // 标记为治疗完成
      planList.forEach((item) => {
        item.isActive = false;
      });
      tableData.value = JSON.parse(JSON.stringify(planList));
    });
    return;
  }

  // 调用切换逻辑
  usePoint();

  // 再次判断：最后一个穴位
  if (testIndex.value >= planLength) {
    if (treatSwiperRef.value) {
      treatSwiperRef.value.stopCountdown();
    }
    isTreating.value = false;
    isPsuse.value = true; // 保持暂停状态
    isTreatmentEnded.value = true; // 标记为治疗完成
    ElMessageBox.alert(
      "<strong><i style='font-size: 24px; color: #6c359d; text-align: center; display: block;font-weight: bold;font-style: normal;'>治疗结束</i></strong>",
      "提醒",
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
      }
    );
    return;
  }

  // 非最后一个穴位，正常启动
  setTimeout(() => {
    if (treatSwiperRef.value && isTreating.value) {
      treatSwiperRef.value.startCountdown(testIndex.value);
      console.log(`自动启动第${testIndex.value}个穴位的倒计时`);
    }
  }, 50);
};

// 处理手动切换Swiper
const handleSwiperChange = (swiperIndex) => {
  const planList = selectedCase.value.plan || [];
  if (planList.length === 0) return;

  const targetType = swiperIndex;
  picType.value = targetType;
  picUrl.value = targetType === 0 ? BodyPic : LegPic;
  console.log(`手动切换Swiper到索引${swiperIndex}，同步picType=${targetType}`);

  // 同步testIndex
  const currentItem = planList.find(
    (item) => item.type === targetType && item.status === 1
  );
  if (currentItem) {
    testIndex.value = planList.indexOf(currentItem);
  }
};

// 处理时长更新事件
const handleUpdateSwiperData = (newSwiperData) => {
  tableData.value = JSON.parse(JSON.stringify(newSwiperData));
  if (selectedCase.value.plan) {
    selectedCase.value.plan = JSON.parse(JSON.stringify(newSwiperData));
  }

  const updatedItem = newSwiperData.find(
    (item) =>
      item.name === selectedObj.value.name &&
      item.point === selectedObj.value.point
  );
  if (updatedItem) {
    const timeNum = parseInt(updatedItem.time) || 0;
    selectedObj.value.time = updatedItem.time;
    selectedObj.value.time1 = `00:${timeNum.toString().padStart(2, "0")}:00`;
    selectedObj.value.time2 = `${timeNum.toString().padStart(2, "0")}:00`;
  }

  ElMessage.success("时长已更新");
};

const pauseTreat = () => {
  // 1. 标记全局暂停
  isPsuse.value = true;
  // 2. 暂停子组件倒计时
  if (treatSwiperRef.value) {
    treatSwiperRef.value.pauseCountdown();
  }
  ElMessage.info("治疗已暂停");
};

// 暂停当前倒计时
const pauseEdit = () => {
  // 1. 标记全局暂停
  isPsuse.value = true;
  // 2. 暂停子组件倒计时（原逻辑保留）
  if (treatSwiperRef.value) {
    treatSwiperRef.value.pauseCountdown();
  }
};

// 恢复继续当前倒计时
const continueTreat = () => {
  // 如果所有穴位都已完成，提示用户
  if (!hasUnfinishedPoints.value) {
    ElMessage.info("所有穴位已治疗完成，无法继续");
    return;
  }

  isPsuse.value = false;
  isTreating.value = true; // 重新开启治疗状态
  const planList = selectedCase.value.plan || [];
  const planLength = planList.length;

  if (testIndex.value >= planLength) {
    // 找到第一个未完成的穴位重新启动
    const firstUnfinished = planList.findIndex((item) => item.status !== 2);
    if (firstUnfinished > -1) {
      testIndex.value = firstUnfinished;
      planList[firstUnfinished].status = 1;
      planList[firstUnfinished].isActive = true;
      tableData.value = JSON.parse(JSON.stringify(planList));

      if (treatSwiperRef.value) {
        treatSwiperRef.value.startCountdown(firstUnfinished);
      }
    }
    return;
  }

  if (treatSwiperRef.value) {
    treatSwiperRef.value.resumeCountdown();
    ElMessage.info("治疗已继续");
  }
};

// 结束当前治疗
// 父组件 point.vue 的 endTreat 方法
const endTreat = () => {
  isPsuse.value = true;
  ElMessageBox.confirm("确定要结束当前治疗吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    customClass: "treat-confirm",
    type: "warning",
  })
    .then(() => {
      // 1. 原有逻辑
      isTreating.value = false;
      isTreatmentEnded.value = true;

      // 2.  标记当前激活穴位为 ended 并保留 isActive
      if (treatSwiperRef.value) {
        treatSwiperRef.value.stopCountdown();
        treatSwiperRef.value.treatData.forEach((page) => {
          page.forEach((item) => {
            if (item.isActive) {
              item.status = "ended"; // 设为已结束
              // 保留 isActive = true，确保红色边框显示
            } else {
              item.status = "idle";
              item.isActive = false;
            }
          });
        });
      }

      // 3. 原有逻辑
      const planList = selectedCase.value.plan || [];
      planList.forEach((item) => {
        if (item.status !== 2) {
          item.status = 0;
          item.isActive = false;
        }
      });
      testIndex.value = -1;
      tableData.value = JSON.parse(JSON.stringify(planList));

      ElMessage.success("治疗已结束");
    })
    .catch(() => {
      isPsuse.value = false;
      ElMessage.info("已取消结束操作");
    });
};

// 重新启动治疗
const restartTreat = () => {
  ElMessageBox.confirm("确定要重新启动整个灸疗方案吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    customClass: "treat-confirm",
    type: "warning",
  })
    .then(() => {
      // 1. 重置所有治疗状态
      isTreatmentEnded.value = false;
      isPsuse.value = false;
      isTreating.value = true;

      // 2. 重置所有穴位状态
      const planList = selectedCase.value.plan || [];
      planList.forEach((item, idx) => {
        item.status = idx === 0 ? 1 : 0; // 第一个穴位设为治疗中，其余为未开始
        item.isActive = idx === 0;
      });

      // 3. 重置选中的穴位和图片
      selectedObj.value = planList[0];
      picType.value = planList[0].type;
      picUrl.value = planList[0].type === 0 ? BodyPic : LegPic;

      // 4. 重置索引并更新数据
      testIndex.value = 0;
      tableData.value = JSON.parse(JSON.stringify(planList));

      // 5. 重启Swiper和倒计时
      nextTick(() => {
        if (swiperInstance.value) {
          swiperInstance.value.slideTo(planList[0].type);
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

// 打开音量弹窗（传递音乐播放器当前音量）
const openVolumeModal = () => {
  // 优先获取音乐播放器的当前音量，没有则用全局音量
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

// 音量更新处理（ 同步到音乐播放器+Electron系统音量）
const handleVolumeUpdate = (volume) => {
  currentVolume.value = volume * 1;

  // console.log("当前音量:", volume + "%");

  // 1. Electron环境：控制系统音量（loudness）
  if (isElectronEnv.value) {
    import("@/utils/volume")
      .then(({ setVol }) => {
        setVol(volume);
      })
      .catch((err) => {
        console.warn("Electron系统音量控制失败:", err);
      });
  }

  // 2. 同步音量到音乐播放器（无论什么环境）
  if (musicPlayerRef.value) {
    musicPlayerRef.value.setMusicVolume(volume);
  }
};

// 同步音乐播放器的音量变化到全局
const handleMusicVolumeUpdate = (volume) => {
  currentVolume.value = volume * 1;
  // 同步到音量弹窗（如果弹窗打开）
  if (volumeModalRef.value?.visible) {
    volumeModalRef.value.volume = volume;
  }
};

// 接收子组件的播放状态更新
const handlePlayingUpdate = (playingState) => {
  isMusicPlaying.value = playingState;
};

// 当前歌曲更新
const handleCurrentSongUpdate = (song) => {
  currentPlayingSong.value = song;
};

// 演示模式
const switchDemoMode = () => {
  isPsuse.value = true;
  if (treatSwiperRef.value) {
    treatSwiperRef.value.pauseCountdown();
  }
  // 1. 提示用户演示模式是临时的
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
      // 2. 直接修改tableData为8秒（临时生效）
      tableData.value.forEach((item) => {
        item.time = 8; // 8秒（子组件按秒计算）
        item.time1 = "00:8:00";
        item.time2 = "00:8";
      });

      // 3. 同步更新selectedCase（运行时数据）
      if (selectedCase.value.plan) {
        selectedCase.value.plan.forEach((item) => {
          item.time = 8;
        });
      }

      // 4. 强制更新当前选中穴位的显示
      if (selectedObj.value) {
        selectedObj.value.time = 8;
        selectedObj.value.time1 = "00:8:00";
        selectedObj.value.time2 = "00:8";
      }

      // 5. 强制启动/重启倒计时
      nextTick(() => {
        if (isPsuse.value) {
          // continueTreat();
          restartTreat();
        }
        if (treatSwiperRef.value) {
          treatSwiperRef.value.stopCountdown();
          treatSwiperRef.value.startCountdown(testIndex.value);
        }
      });

      ElMessage.success("已切换到演示模式（8秒），刷新页面恢复1分钟！");
    })
    .catch(() => {
      ElMessage.info("已取消演示模式切换");
    });
};

const sendWsMessage = (data) => {
  $ws.SendMessage(`${data.command}`, `${data.args}`, (data) => {
    console.log(data);
  });
};

const refreshNormal = () => {
  //刷新页面
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

// 初始化
onMounted(() => {
  selectedCaseId.value = localStorage.getItem("selectedCaseId") || 1;
  getPoint(selectedCaseId.value);
});

onUnmounted(() => {});
</script>

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
      font-size: 36px;
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
    justify-content: center;

    .point-content-left {
      box-sizing: border-box;
      width: 35%;
      height: 100%;
      padding: 20px 10px 20px 20px;

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
            font-size: 36px;
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
              font-size: 24px;
              font-weight: bold;
              color: #fff;
            }
          }
        }
      }
    }

    .point-content-right {
      box-sizing: border-box;
      width: 65%;
      height: 100%;
      padding: 20px 20px 20px 10px;

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
  /* 保持图标比例 */
  object-fit: contain;
  /* 初始状态不旋转 */
  transition: transform 0.3s ease;
}

/*   播放中时旋转 */
.music-icon.rotating {
  animation: rotate 3s linear infinite;
}

/* 旋转动画 */
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
    font-size: 40px;
    font-weight: bold;
    color: #511d6a;
    margin-bottom: 40px;
  }

  .dialog-text {
    font-size: 24px;
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
  font-size: 24px;
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
    /* border: 1px solid red; */
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
