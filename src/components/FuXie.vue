<template>
  <div class="content-left-img-border">
    <!--  0 身体 1 腿-->
    <div v-if="picType == 0" class="content-left-img">
      <img :src="picUrl" alt="" />
      <div class="point-line">
        <div class="light-ball-item">
          <div
            :class="{
              'light-ball-red': p1?.status === 1,
              'light-ball-green': p1?.status === 2,
              'light-ball-blue': p1?.status === 0 || !p1,
            }"
          ></div>
          <div
            v-if="p1?.status != 0"
            :class="{
              'light-ball-text-red': p1.status === 1,
              'light-ball-text-green': p1.status === 2,
            }"
          >
            {{ p1?.point || "" }}
          </div>
        </div>

        <div class="light-ball-item">
          <div
            :class="{
              'light-ball-red': p2?.status === 1,
              'light-ball-green': p2?.status === 2,
              'light-ball-blue': p2?.status === 0 || !p2,
            }"
          ></div>
          <div
            v-if="p2?.status != 0"
            :class="{
              'light-ball-text-red': p2.status === 1,
              'light-ball-text-green': p2.status === 2,
            }"
          >
            {{ p2?.point || "" }}
          </div>
        </div>

        <div class="light-ball-item">
          <div
            :class="{
              'light-ball-red': p3?.status === 1,
              'light-ball-green': p3?.status === 2,
              'light-ball-blue': p3?.status === 0 || !p3,
            }"
          ></div>
          <div
            v-if="p3?.status != 0"
            :class="{
              'light-ball-text-red': p3.status === 1,
              'light-ball-text-green': p3.status === 2,
            }"
          >
            {{ p3?.point || "" }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="picType == 1" class="content-left-img2">
      <img :src="picUrl" alt="" />
      <div class="point-line2">
        <div class="light-ball-item2">
          <div
            :class="{
              'light-ball-red2': p4?.status === 1,
              'light-ball-green2': p4?.status === 2,
              'light-ball-blue2': p4?.status === 0 || !p4,
            }"
          ></div>
          <div
            v-if="p4?.status != 0"
            :class="{
              'light-ball-text-red2': p4.status === 1,
              'light-ball-text-green2': p4.status === 2,
            }"
          >
            {{ p4?.point || "" }}
          </div>
        </div>

        <div class="light-ball-item2">
          <div
            :class="{
              'light-ball-red2': p5?.status === 1,
              'light-ball-green2': p5?.status === 2,
              'light-ball-blue2': p5?.status === 0 || !p5,
            }"
          ></div>
          <div
            v-if="p5?.status != 0"
            :class="{
              'light-ball-text-red2': p5.status === 1,
              'light-ball-text-green2': p5.status === 2,
            }"
          >
            {{ p5?.point || "" }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const props = defineProps({
  picType: {
    type: Number,
    default: -1,
  },
  picUrl: {
    type: String,
    default: "",
  },
  tableData: {
    type: Array,
    default: () => [],
  },
});

const p1 = ref({});
const p2 = ref({});
const p3 = ref({});
const p4 = ref({});
const p5 = ref({});
const forceUpdate = ref(0);

// 监听picType变化 强制触发响应式
watch(
  () => props.picType,
  (newType) => {
    console.log("FuXie组件：picType更新为", newType);
    // 强制更新组件
    // 通过更新一个空的响应式变量触发重新渲染
    forceUpdate.value++;
  },
  { immediate: true }
);

//  新增强制更新变量
// 兼容空数据+深度监听
watch(
  () => props.tableData,
  (newVal) => {
    console.log("FuXie组件：tableData更新", newVal);
    if (!newVal || newVal.length === 0) return;

    // 匹配穴位名称
    p1.value = newVal[0];
    p2.value = newVal[1];
    p3.value = newVal[2];
    p4.value = newVal[3];
    p5.value = newVal[4];

    console.log("穴位数据匹配结果：", {
      p1: p1.value,
      p2: p2.value,
      p3: p3.value,
      p4: p4.value,
      p5: p5.value,
    });
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  console.log("组件挂载了");
  // 初始化穴位数据
  // if (props.tableData.length > 0) {
  //   p1.value =
  //     props.tableData.filter((item) => item.point === "天枢穴(左)")[0] || {};
  //   p2.value =
  //     props.tableData.filter((item) => item.point === "神阙穴")[0] || {};
  //   p3.value =
  //     props.tableData.filter((item) => item.point === "天枢穴(右)")[0] || {};
  //   p4.value =
  //     props.tableData.filter((item) => item.point === "上巨虚穴(左)")[0] || {};
  //   p5.value =
  //     props.tableData.filter((item) => item.point === "上巨虚穴(右)")[0] || {};
  // }
});
</script>

<style scoped lang="scss">
.content-left-img-border {
  width: 100%;
  height: calc(82vh - 40px);
  background-color: #fff;
  box-sizing: border-box;
  padding: 40px;

  .content-left-img {
    position: relative;
    height: 636px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    // border: 1px solid red;
    img {
      width: 441px;
      height: 636px;
    }
  }

  .point-line {
    position: absolute;
    bottom: 160px;
    height: 5vh;
    width: 100%;
    // border: 2px solid red;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .light-ball-item {
    width: 4vh;
    height: 5vh;
    // border: 1px solid red;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .light-ball-red {
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: rgba(241, 68, 55, 0.8);
    border: 1px solid #f14437;
    transform: scale(1.2);
    animation: blink 1.5s infinite ease-in-out;
    transform-origin: center center;
  }

  .light-ball-blue {
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: rgba(182, 142, 187, 0.8);
    border: 1px solid #b68ebb;
  }

  .light-ball-green {
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: rgba(88, 192, 141, 0.8);
    border: 1px solid #58c08d;
  }

  .light-ball-text-red {
    top: 50px;
    left: -30px;
    position: absolute;
    width: 80px;
    height: 3vh;
    line-height: 3vh;
    font-size: 16px;
    color: #ffffff;
    background-color: rgba(222, 43, 31, 0.8);
    padding: 0 10px;
    border-radius: 12px;
    text-align: center;
    z-index: 999;
  }

  .light-ball-text-green {
    top: 50px;
    left: -30px;
    position: absolute;
    width: 80px;
    height: 3vh;
    line-height: 3vh;
    font-size: 16px;
    color: #ffffff;
    background-color: rgba(88, 192, 141, 0.8);
    padding: 0 10px;
    border-radius: 12px;
    text-align: center;
  }
}

.content-left-img-border {
  width: 100%;
  height: calc(82vh - 40px);
  background-color: #fff;
  box-sizing: border-box;
  padding: 40px;

  .content-left-img2 {
    position: relative;
    height: 636px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    // border: 1px solid red;
    img {
      width: 441px;
      height: 636px;
    }
  }

  .point-line2 {
    position: absolute;
    bottom: 240px;
    height: 5vh;
    width: 100%;
    // border: 2px solid red;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .light-ball-item2 {
    width: 4vh;
    height: 5vh;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 40px;
  }

  .light-ball-red2 {
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: rgba(241, 68, 55, 0.8);
    border: 1px solid #f14437;
    transform: scale(1.2);
    animation: blink 1.5s infinite ease-in-out;
    transform-origin: center center;
  }

  .light-ball-blue2 {
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: rgba(182, 142, 187, 0.8);
    border: 1px solid #b68ebb;
  }

  .light-ball-green2 {
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: rgba(88, 192, 141, 0.8);
    border: 1px solid #58c08d;
  }

  .light-ball-text-red2 {
    top: 50px;
    left: -30px;
    position: absolute;
    width: 100px;
    height: 3vh;
    line-height: 3vh;
    font-size: 16px;
    color: #ffffff;
    background-color: rgba(222, 43, 31, 0.8);
    padding: 0 10px;
    border-radius: 12px;
    text-align: center;
    z-index: 999;
  }

  .light-ball-text-green2 {
    top: 50px;
    left: -30px;
    position: absolute;
    width: 100px;
    height: 3vh;
    line-height: 3vh;
    font-size: 16px;
    color: #ffffff;
    background-color: rgba(88, 192, 141, 0.8);
    padding: 0 10px;
    border-radius: 12px;
    text-align: center;
  }
}
.blink {
  transform: scale(1.2);
  animation: blink 1.5s infinite ease-in-out;
  transform-origin: center center;
}
@keyframes blink {
  0% {
    opacity: 0.6; /* 初始透明度 */
    transform: scale(1.2); /* 初始放大比例 */
  }
  50% {
    opacity: 1; /* 最亮状态 */
    transform: scale(1.3); /* 轻微放大增强闪烁感 */
  }
  100% {
    opacity: 0.6; /* 回到初始状态 */
    transform: scale(1.2);
  }
}

.light-index {
  z-index: 9999 !important;
}
</style>
