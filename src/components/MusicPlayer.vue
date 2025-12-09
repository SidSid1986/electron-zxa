<template>
  <!-- 纯自定义音乐播放器弹窗，无el-dialog依赖 -->
  <teleport to="body">
    <div v-if="visible" class="music-player-modal">
      <!-- 遮罩层 -->
      <div class="modal-mask" @click="closePlayer"></div>

      <!-- 播放器主体容器 -->
      <div class="music-player-container">
        <!-- 头部：标题+关闭按钮 -->
        <div class="player-header">
          <div class="header-title">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 3V21L19 12L8 3Z" fill="#693e9c" />
            </svg>
            <span class="header-text">音乐播放</span>
          </div>
          <button class="close-btn" @click.stop="closePlayer">×</button>
        </div>

        <!-- 主体内容 -->
        <div class="player-body">
          <!-- 封面+播放状态（保留旋转动画） -->
          <div class="player-cover-wrapper">
            <div class="player-cover" :class="{ playing: isPlaying }">
              <!-- 统一静态图标，居中显示 -->
              <div class="cover-center-icon">
                <img src="@/assets/pic/music-logo.png" alt="" />
              </div>
            </div>
          </div>

          <!-- 歌曲信息+进度条 -->
          <div class="song-info">
            <div class="song-name">{{ currentSong.name || "暂无音乐" }}</div>
            <div class="progress-wrapper">
              <div class="progress-bar" @click.stop="handleProgressClick">
                <div
                  class="progress-track"
                  :style="{ width: `${progressPercent}%` }"
                >
                  <div class="progress-thumb"></div>
                </div>
              </div>
              <div class="time-info">
                <span>{{ formatTime(currentTime) }}</span>
                <span>{{ formatTime(duration) }}</span>
              </div>
            </div>
          </div>

          <!-- 控制按钮 + 新增音量控制滑块 -->
          <div class="control-panel">
            <div class="control-space"></div>
            <div class="play-btns">
              <button
                class="control-btn"
                @click.stop="prevSong"
                :disabled="!songList.length"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14 20L4 12L14 4V20Z" fill="#693e9c" />
                </svg>
              </button>
              <button
                class="play-btn"
                @click.stop="initAudioAndPlay"
                :class="{ playing: isPlaying }"
                :disabled="!songList.length"
              >
                <span v-if="!isPlaying">播放</span>
                <span v-else>暂停</span>
              </button>
              <button
                class="control-btn"
                @click.stop="nextSong"
                :disabled="!songList.length"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 4L20 12L10 20V4Z" fill="#693e9c" />
                </svg>
              </button>
            </div>

            <!-- 新增：音量控制滑块 -->
            <div class="volume-control-wrapper">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="volume-icon"
              >
                <path d="M3 9V15H7L12 20V4L7 9H3Z" fill="#693e9c" />
              </svg>
              <input
                type="range"
                min="0"
                max="100"
                v-model="musicVolume"
                class="volume-slider"
                @input="handleVolumeChange"
              />
            </div>
          </div>

          <!-- 歌曲列表（修复高度变形） -->
          <div class="song-list-wrapper">
            <div class="list-header">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z"
                  fill="#693e9c"
                />
              </svg>
              <span class="list-title">歌曲列表</span>
            </div>
            <div class="song-list-container">
              <div class="song-list">
                <div v-if="!songList.length" class="empty-tip">
                  暂无音乐文件
                </div>
                <div
                  v-else
                  class="song-item"
                  v-for="(song, index) in songList"
                  :key="index"
                  :class="{ active: currentSongIndex === index }"
                  @click.stop="playSong(index)"
                >
                  <span class="song-number">{{ index + 1 }}</span>
                  <span class="song-text">{{ song.name }}</span>
                  <span
                    class="song-active-icon"
                    v-if="currentSongIndex === index && isPlaying"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#693e9c"
                        stroke-width="2"
                      />
                      <path d="M9 8L15 12L9 16V8Z" fill="#693e9c" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, defineEmits } from "vue";

const emit = defineEmits([
  "update:playing",
  "update:currentSong",
  "update:volume",
]);

// 弹窗显示状态
const visible = ref(false);
const audioInitiated = ref(false);

// 音量（0-100）
const musicVolume = ref(50);

// 判断是否Electron
const isElectron = window.electronAPI ? true : false;
const isDev = import.meta.env.DEV;

// 歌曲列表（初始为空，onMounted 时加载）
const songList = reactive([]);

// 当前播放
const currentSongIndex = ref(0);
const currentSong = ref({ name: "暂无音乐", url: "" });
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const progressPercent = ref(0);

// audio 实例（延迟创建）
let audio = null;

// 异步加载歌单（开发/生产/ electron 三种情况）
async function loadMusicList() {
  try {
    if (isDev) {
      // 开发模式逻辑不变（原本就正常）
      const musicFiles = import.meta.glob("/public/music/*.mp3", {
        eager: true,
      });
      console.debug("import.meta.glob result keys:", Object.keys(musicFiles));
      const arr = Object.entries(musicFiles).map(([filePath, mod]) => {
        const fileName = filePath.split("/").pop();
        const songName = fileName.replace(".mp3", "");
        const songUrl = `/music/${fileName}`;
        return { name: songName, url: songUrl };
      });
      songList.splice(0, songList.length, ...arr);
    } else if (isElectron) {
      // 关键修复：直接使用主进程返回的 name 和 url
      try {
        const musicItems = await window.electronAPI.getMusicFiles();
        console.debug("electronAPI.getMusicFiles ->", musicItems);
        if (Array.isArray(musicItems) && musicItems.length) {
          // 无需解析 URL，直接使用主进程处理好的 name
          songList.splice(0, songList.length, ...musicItems);
        } else {
          songList.splice(0, songList.length);
        }
      } catch (e) {
        console.error("调用 electronAPI.getMusicFiles 失败:", e);
        songList.splice(0, songList.length);
      }
    } else {
      // 纯 Web 环境逻辑不变
      const musicFiles = import.meta.glob("/public/music/*.mp3", {
        eager: true,
      });
      const arr = Object.entries(musicFiles).map(([filePath, mod]) => {
        const fileName = filePath.split("/").pop();
        const songName = fileName.replace(".mp3", "");
        const songUrl = `/music/${fileName}`;
        return { name: songName, url: songUrl };
      });
      songList.splice(0, songList.length, ...arr);
    }

    if (songList.length) {
      currentSongIndex.value = 0;
      currentSong.value = songList[0];
      console.debug("已加载歌单，当前歌曲:", currentSong.value);
    } else {
      currentSongIndex.value = -1;
      currentSong.value = { name: "暂无音乐", url: "" };
      console.debug("未找到音乐文件，songList 为空");
    }
  } catch (err) {
    console.error("加载音乐列表出错:", err);
    songList.splice(0, songList.length);
    currentSongIndex.value = -1;
    currentSong.value = { name: "暂无音乐", url: "" };
  }
}
// 初始化 audio 实例（只在有有效 URL 时创建/设置 src）
const initAudioInstance = () => {
  if (audio || !songList.length) return;
  if (!currentSong.value || !currentSong.value.url) {
    console.debug("initAudioInstance: 当前歌曲没有有效 url，跳过创建 audio");
    return;
  }

  audio = new Audio();
  audio.src = currentSong.value.url;
  console.debug("audio created with src:", audio.src);
  audio.autoplay = false;
  audio.preload = "metadata";
  audio.volume = musicVolume.value / 100;

  // 绑定事件
  audio.addEventListener("loadedmetadata", () => {
    duration.value = audio.duration || 0;
  });

  audio.addEventListener("timeupdate", () => {
    currentTime.value = audio.currentTime;
    progressPercent.value =
      (audio.currentTime / (audio.duration || 1)) * 100 || 0;
  });

  audio.addEventListener("ended", () => {
    nextSong();
  });

  audio.addEventListener("error", (e) => {
    console.error("音频播放错误:", e);
    console.error("当前音频路径:", audio && audio.src);
  });

  audioInitiated.value = true;
};

// 初始化并播放（谨慎处理 src）
const initAudioAndPlay = async () => {
  if (!songList.length) return;

  // 若未初始化且 currentSong 有 URL，则创建 audio
  if (!audioInitiated.value) {
    initAudioInstance();
  } else {
    // 如果 audio 已存在但 src 与 currentSong 不一致，更新 src
    if (
      audio &&
      currentSong.value &&
      currentSong.value.url &&
      audio.src !== currentSong.value.url
    ) {
      audio.src = currentSong.value.url;
    }
  }

  if (!audio) {
    // 如果仍然没有 audio（例如 currentSong.url 为空），提示并返回
    console.error(
      "initAudioAndPlay: audio 未被创建，请检查 currentSong.url:",
      currentSong.value
    );
    alert("无法播放：当前没有可用的音频源。");
    return;
  }

  if (isPlaying.value) {
    audio.pause();
    isPlaying.value = false;
  } else {
    try {
      await audio.play();
      isPlaying.value = true;
    } catch (err) {
      console.error("播放失败:", err, "audio.src=", audio.src);
      alert("播放失败：请检查音频文件是否有效或浏览器是否支持该音频格式。");
      isPlaying.value = false;
    }
  }

  emit("update:playing", isPlaying.value);
  emit("update:currentSong", currentSong.value);
};

// 播放指定歌曲（index）
const playSong = (index) => {
  if (!songList.length) return;
  if (index < 0 || index >= songList.length) return;

  currentSongIndex.value = index;
  currentSong.value = songList[index];

  // 如果 audio 不存在但 currentSong 有 url，则创建
  if (!audioInitiated.value && currentSong.value.url) {
    initAudioInstance();
  }

  if (audio) {
    audio.src = currentSong.value.url || "";
    audio.currentTime = 0;
    // 保证切歌后维持之前音量
    audio.volume = musicVolume.value / 100;

    if (isPlaying.value) {
      audio.play().catch((err) => {
        console.error("播放失败:", err, "audio.src=", audio.src);
        alert("播放失败：请检查音频文件路径是否正确，路径：" + audio.src);
      });
    }
  }

  emit("update:currentSong", currentSong.value);
};

// 上一曲 / 下一曲
const prevSong = () => {
  if (!songList.length) return;
  const newIndex =
    (currentSongIndex.value - 1 + songList.length) % songList.length;
  playSong(newIndex);
};
const nextSong = () => {
  if (!songList.length) return;
  const newIndex = (currentSongIndex.value + 1) % songList.length;
  playSong(newIndex);
};

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds === Infinity) return "00:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

// 进度条点击
const handleProgressClick = (e) => {
  if (!audio || !songList.length) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const percent = clickX / rect.width;
  audio.currentTime = percent * (audio.duration || 0);
};

// 音量相关
const handleVolumeChange = () => {
  if (audio) audio.volume = musicVolume.value / 100;
  emit("update:volume", musicVolume.value);
};

const setMusicVolume = (volume) => {
  if (volume < 0) volume = 0;
  if (volume > 100) volume = 100;
  musicVolume.value = volume;
  if (audio) audio.volume = volume / 100;
  emit("update:volume", volume);
};

// open / close 不暂停播放（后台播放）
const openPlayer = () => {
  visible.value = true;
  emit("update:playing", isPlaying.value);
  emit("update:currentSong", currentSong.value);
  emit("update:volume", musicVolume.value);
};
const closePlayer = () => {
  visible.value = false;
  emit("update:playing", isPlaying.value);
  emit("update:volume", musicVolume.value);
};

// 监听变化
watch(isPlaying, (nv) => emit("update:playing", nv));
watch(musicVolume, (nv) => emit("update:volume", nv));

onUnmounted(() => {
  if (audio) {
    try {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("loadedmetadata", () => {});
      audio.removeEventListener("timeupdate", () => {});
      audio.removeEventListener("ended", () => {});
    } catch (e) {
      console.error("cleanup audio error:", e);
    }
    audio = null;
  }
  audioInitiated.value = false;
});

watch(visible, (newVal) => {
  if (!newVal) {
    emit("update:playing", isPlaying.value);
    emit("update:volume", musicVolume.value);
  }
});

// 暴露方法给父组件
defineExpose({
  openPlayer,
  closePlayer,
  playSong,
  prevSong,
  nextSong,
  setMusicVolume,
  isPlaying,
  musicVolume,
  currentSong,
});

// 在组件挂载时加载歌单
onMounted(() => {
  loadMusicList();
});
</script>

<style scoped lang="scss">
/* 样式部分保持不变，和原代码一致 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.music-player-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;

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

  .music-player-container {
    position: relative;
    width: 30vw;
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(105, 62, 156, 0.25);
    overflow: hidden;
    border: 1px solid #f0e0f7;
    pointer-events: auto;
    transform: scale(1);
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

.player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background-color: #f8f0fc;
  border-bottom: 1px solid #f0e0f7;
  width: 100%;

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #693e9c;
    font-size: 16px;
    font-weight: 600;
  }

  .header-text {
    font-size: 32px;
    line-height: 1;
  }

  .close-btn {
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    color: #693e9c;
    font-size: 40px;
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

.player-body {
  padding: 20px;
  width: 100%;

  .player-cover-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
    width: 100%;

    .player-cover {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      // background: linear-gradient(135deg, #e8d5f2 0%, #d4bfe1 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-shadow: 0 4px 16px rgba(105, 62, 156, 0.15);

      &.playing {
        animation: rotate 10s linear infinite;
      }

      .cover-center-icon {
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .song-info {
    margin-bottom: 20px;
    width: 100%;

    .song-name {
      text-align: center;
      font-size: 24px;
      font-weight: 600;
      color: #693e9c;
      margin-bottom: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .progress-wrapper {
      width: 100%;

      .progress-bar {
        width: 100%;
        height: 6px;

        background-color: #f0e0f7;
        border-radius: 2px;
        cursor: pointer;
        position: relative;

        .progress-track {
          height: 100%;
          background: linear-gradient(90deg, #693e9c 0%, #af7dc4 100%);
          border-radius: 2px;
          position: relative;
          transition: width 0.1s ease;

          .progress-thumb {
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 12px;
            height: 12px;
            background-color: #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 0 2px #693e9c;
          }
        }
      }

      .time-info {
        display: flex;
        justify-content: space-between;
        font-size: 24px;
        color: #8a5ca0;
        margin-top: 6px;
      }
    }
  }

  .control-panel {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    width: 100%;

    .control-space {
      width: 15%;
    }

    .play-btns {
      width: 60%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    // 新增：音量控制容器样式
    .volume-control-wrapper {
      display: flex;
      flex-direction: row;
      align-items: center;

      width: 20%;

      .volume-icon {
        flex-shrink: 0;
      }

      .volume-slider {
        width: 100%;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background-color: #f0e0f7;
        border-radius: 2px;
        outline: none;

        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #693e9c;
          cursor: pointer;
          box-shadow: 0 0 0 1px #ffffff;
        }
      }
    }

    .control-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background-color: #f8f0fc;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background-color: #e8d5f2;
        transform: scale(1.05);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
    }

    .play-btn {
      min-width: 100px;
      height: 50px;
      border-radius: 20px;
      border: none;
      background: linear-gradient(90deg, #693e9c 0%, #af7dc4 100%);
      color: #ffffff;
      font-size: 24px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0 16px;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(105, 62, 156, 0.2);
      }

      &.playing {
        background: linear-gradient(90deg, #8a5ca0 0%, #c293d5 100%);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
    }
  }

  .song-list-wrapper {
    width: 100%;

    .list-header {
      display: flex;
      align-items: center;
      flex-direction: row;
      justify-content: flex-start;
      gap: 6px;
      color: #693e9c;
      svg {
        width: 30px;
        height: 30px;
      }
    }

    .list-title {
      font-size: 24px;
      font-weight: 600;
      color: #693e9c;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .song-list-container {
      margin-top: 10px;
      width: 100%;
      height: 120px;
      overflow: hidden;
      border-radius: 8px;
      background-color: #fefbff;
      border: 1px solid #f0e0f7;

      .song-list {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        padding: 0 4px;

        .empty-tip {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 14px;
        }

        .song-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 2px;
          transition: all 0.2s;
          width: 100%;
          height: 36px;
          line-height: 1;
          white-space: nowrap;

          &.active {
            background-color: #f0e0f7;
            color: #693e9c;
            font-weight: 500;
            transform: none;
            margin-bottom: 2px;
            height: 36px;
          }

          &:hover {
            background-color: #f8f0fc;
            transform: none;
          }

          .song-number {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: #8a5ca0;
            flex-shrink: 0;
          }

          .song-text {
            flex: 1;
            margin: 0 8px;
            font-size: 20px;
            overflow: hidden;
            text-overflow: ellipsis;
            height: 100%;
            display: flex;
            align-items: center;
          }

          .song-active-icon {
            opacity: 0.8;
            flex-shrink: 0;
            width: 14px;
            height: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.song-list {
  &::-webkit-scrollbar {
    width: 3px;
    height: 0;
  }

  &::-webkit-scrollbar-track {
    background: #f8f0fc;
    border-radius: 1.5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #af7dc4;
    border-radius: 1.5px;
  }
}

.progress-bar {
  &:hover .progress-track {
    height: 6px;
  }

  &:hover .progress-thumb {
    transform: translateY(-50%) scale(1.1);
  }
}

button {
  outline: none;

  &:focus {
    outline: none;
  }
}
</style>
