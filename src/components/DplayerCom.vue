<template>
  <!-- 播放器容器 -->
  <div ref="playerRef" class="dplayer-container" :style="containerStyle"></div>
</template>

<script setup>
import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  defineProps,
  defineEmits,
  defineExpose,
  computed,
} from "vue";
import DPlayer from "dplayer";

// 定义 Props 
const props = defineProps({
  // 基础配置
  containerStyle: {
    type: Object,
    default: () => ({ width: "100%", height: "auto" }),
  },
  live: {
    type: Boolean,
    default: false,
  },
  autoplay: {
    type: Boolean,
    default: false,
  },
  theme: {
    type: String,
    default: "#9033e9", // 适配你的主题色
  },
  loop: {
    type: Boolean,
    default: false,
  },
  lang: {
    type: String,
    default: () => navigator.language.toLowerCase(),
  },
  screenshot: {
    type: Boolean,
    default: false,
  },
  hotkey: {
    type: Boolean,
    default: true,
  },
  airplay: {
    type: Boolean,
    default: false,
  },
  chromecast: {
    type: Boolean,
    default: false,
  },
  preload: {
    type: String,
    default: "auto",
    validator: (v) => ["none", "metadata", "auto"].includes(v),
  },
  volume: {
    type: Number,
    default: 0.7,
    validator: (v) => v >= 0 && v <= 1,
  },
  playbackSpeed: {
    type: Array,
    default: () => [0.5, 0.75, 1, 1.25, 1.5, 2],
  },
  logo: {
    type: String,
    default: "",
  },
  apiBackend: {
    type: Object,
    default: () => ({}),
  },
  preventClickToggle: {
    type: Boolean,
    default: false,
  },
  mutex: {
    type: Boolean,
    default: true,
  },

  // 视频配置 
  video: {
    type: Object,
    required: true,
    default: () => ({
      url: "",
      pic: "",
      thumbnails: "",
      type: "auto",
      quality: [],
      defaultQuality: 0,
      customType: {},
    }),
  },

  // 字幕配置
  subtitle: {
    type: Object,
    default: () => ({}),
  },

  // 弹幕配置
  danmaku: {
    type: Object,
    default: () => ({
      enabled: false,
      id: "",
      api: "",
      token: "",
      maximum: undefined,
      addition: [],
      user: "DIYgod",
      bottom: "15%",
      unlimited: false,
      speedRate: 1,
    }),
  },

  // 右键菜单
  contextmenu: {
    type: Array,
    default: () => [],
  },

  // 进度条提示点
  highlight: {
    type: Array,
    default: () => [],
  },

  // 插件配置（MSE/流媒体）
  pluginOptions: {
    type: Object,
    default: () => ({}),
  },
});

// 定义事件（对齐官方事件）
const emit = defineEmits([
  // 原生视频事件
  "abort",
  "canplay",
  "canplaythrough",
  "durationchange",
  "emptied",
  "ended",
  "error",
  "loadeddata",
  "loadedmetadata",
  "loadstart",
  "mozaudioavailable",
  "pause",
  "play",
  "playing",
  "progress",
  "ratechange",
  "seeked",
  "seeking",
  "stalled",
  "suspend",
  "timeupdate",
  "volumechange",
  "waiting",

  // 播放器自定义事件
  "screenshot",
  "thumbnails_show",
  "thumbnails_hide",
  "danmaku_show",
  "danmaku_hide",
  "danmaku_clear",
  "danmaku_loaded",
  "danmaku_send",
  "danmaku_opacity",
  "contextmenu_show",
  "contextmenu_hide",
  "notice_show",
  "notice_hide",
  "quality_start",
  "quality_end",
  "destroy",
  "resize",
  "fullscreen",
  "fullscreen_cancel",
  "subtitle_show",
  "subtitle_hide",
  "subtitle_change",
]);

// 播放器实例
const playerRef = ref(null);
let dp = null;

// 构建播放器配置
// 构建播放器配置
const buildPlayerConfig = computed(() => ({
  container: playerRef.value,
  live: props.live,
  autoplay: props.autoplay,
  theme: props.theme,
  loop: props.loop,
  lang: props.lang,
  screenshot: props.screenshot,
  hotkey: props.hotkey,
  airplay: props.airplay,
  chromecast: props.chromecast,
  preload: props.preload,
  volume: props.volume,
  playbackSpeed: props.playbackSpeed,
  logo: props.logo,
  apiBackend: props.apiBackend,
  preventClickToggle: props.preventClickToggle,
  mutex: props.mutex,
  video: {
    ...props.video,
   
  },
  subtitle: props.subtitle.enabled ? props.subtitle : undefined,
  danmaku: props.danmaku.enabled ? props.danmaku : undefined,
  contextmenu: props.contextmenu,
  highlight: props.highlight,
  pluginOptions: props.pluginOptions,
}));

// 初始化播放器
const initPlayer = () => {
  // 销毁旧实例
  if (dp) {
    dp.destroy();
    dp = null;
  }

  // 容器不存在则返回
  if (!playerRef.value) return;

  // 创建新实例
  dp = new DPlayer(buildPlayerConfig.value);

  // 绑定所有事件
  bindAllEvents();
};

// 绑定事件（覆盖官方所有事件）
const bindAllEvents = () => {
  if (!dp) return;

  // 原生视频事件
  const videoEvents = [
    "abort",
    "canplay",
    "canplaythrough",
    "durationchange",
    "emptied",
    "ended",
    "error",
    "loadeddata",
    "loadedmetadata",
    "loadstart",
    "mozaudioavailable",
    "pause",
    "play",
    "playing",
    "progress",
    "ratechange",
    "seeked",
    "seeking",
    "stalled",
    "suspend",
    "timeupdate",
    "volumechange",
    "waiting",
  ];
  videoEvents.forEach((event) => {
    dp.on(event, (...args) => emit(event, ...args));
  });

  // 播放器自定义事件
  const playerEvents = [
    "screenshot",
    "thumbnails_show",
    "thumbnails_hide",
    "danmaku_show",
    "danmaku_hide",
    "danmaku_clear",
    "danmaku_loaded",
    "danmaku_send",
    "danmaku_opacity",
    "contextmenu_show",
    "contextmenu_hide",
    "notice_show",
    "notice_hide",
    "quality_start",
    "quality_end",
    "destroy",
    "resize",
    "fullscreen",
    "fullscreen_cancel",
    "subtitle_show",
    "subtitle_hide",
    "subtitle_change",
  ];
  playerEvents.forEach((event) => {
    dp.on(event, (...args) => emit(event, ...args));
  });
};

// 监听 配置变化，重新初始化
watch(
  [() => props.video, () => props.danmaku, () => props.theme],
  () => initPlayer(),
  { deep: true, immediate: false }
);

// 组件挂载初始化
onMounted(() => {
  initPlayer();
});

// 组件卸载销毁实例
onUnmounted(() => {
  if (dp) {
    dp.destroy();
    dp = null;
  }
});

// 暴露官方所有 API（对齐文档）
defineExpose({
  // 基础控制
  play: () => dp?.play(),
  pause: () => dp?.pause(),
  seek: (time) => dp?.seek(time),
  toggle: () => dp?.toggle(),
  destroy: () => dp?.destroy(),
  speed: (rate) => dp?.speed(rate),
  volume: (percentage, nostorage, nonotice) =>
    dp?.volume(percentage, nostorage, nonotice),

  // 视频切换
  switchVideo: (video, danmaku) => dp?.switchVideo(video, danmaku),

  // 通知
  notice: (text, time) => dp?.notice(text, time),

  // 清晰度切换
  switchQuality: (index) => dp?.switchQuality(index),

  // 弹幕控制
  danmaku: {
    send: (danmaku, callback) => dp?.danmaku.send(danmaku, callback),
    draw: (danmaku) => dp?.danmaku.draw(danmaku),
    opacity: (percentage) => dp?.danmaku.opacity(percentage),
    clear: () => dp?.danmaku.clear(),
    hide: () => dp?.danmaku.hide(),
    show: () => dp?.danmaku.show(),
  },

  // 全屏控制
  fullScreen: {
    request: (type = "browser") => dp?.fullScreen.request(type),
    cancel: (type = "browser") => dp?.fullScreen.cancel(type),
  },

  // 原生 video 对象
  get video() {
    return dp?.video;
  },

  // 获取播放器实例
  get instance() {
    return dp;
  },
});
</script>

<style scoped lang="scss">
/* 播放器容器基础样式 */
.dplayer-container {
  height:100%;
  border-radius: 12px;
  overflow: hidden;
  background-color: #000;
}
</style>
