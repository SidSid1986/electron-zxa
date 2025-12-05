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
            <span>音乐播放</span>
          </div>
          <button class="close-btn" @click.stop="closePlayer">×</button>
        </div>

        <!-- 主体内容 -->
        <div class="player-body">
          <!-- 封面+播放状态（保留旋转动画） -->
          <div class="player-cover-wrapper">
            <div class="player-cover" :class="{ playing: isPlaying }">
              <div class="cover-bg"></div>
              <!-- 统一静态图标，居中显示 -->
              <div class="cover-center-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 3V21L19 15H16V9H19L12 3Z" fill="#ffffff" />
                </svg>
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

          <!-- 控制按钮 -->
          <div class="control-panel">
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
              <span>歌曲列表</span>
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

//  定义要传递给父组件的事件
const emit = defineEmits(["update:playing", "update:currentSong"]);

// 弹窗显示状态
const visible = ref(false);
const audioInitiated = ref(false);

//  动态获取assets/music下的所有MP3文件
const getMusicList = () => {
  try {
    const musicFiles = import.meta.glob("@/assets/music/*.mp3", {
      eager: true,
    });
    return Object.keys(musicFiles).map((filePath) => {
      const fileName = filePath.split("/").pop();
      const songName = fileName.replace(".mp3", "");
      const songUrl = new URL(filePath, import.meta.url).href;
      return {
        name: songName,
        url: songUrl,
      };
    });
  } catch (e) {
    console.error("获取音乐列表失败:", e);
    return [];
  }
};

// 动态生成歌曲列表
const songList = reactive(getMusicList());

// 当前播放状态
const currentSongIndex = ref(0);
const currentSong = ref(songList[0] || { name: "暂无音乐", url: "" });
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const progressPercent = ref(0);

// 音频实例（延迟初始化）
let audio = null;

// 初始化音频实例
const initAudioInstance = () => {
  if (audio || !songList.length) return;

  audio = new Audio();
  audio.src = currentSong.value.url;
  audio.autoplay = false;
  audio.preload = "metadata";

  // 绑定音频事件
  audio.addEventListener("loadedmetadata", () => {
    duration.value = audio.duration;
  });

  audio.addEventListener("timeupdate", () => {
    currentTime.value = audio.currentTime;
    progressPercent.value = (audio.currentTime / audio.duration) * 100 || 0;
  });

  audio.addEventListener("ended", () => {
    nextSong();
  });

  audio.addEventListener("error", (e) => {
    console.error("音频播放错误:", e);
  });

  audioInitiated.value = true;
};

// 初始化音频并播放
const initAudioAndPlay = () => {
  if (!songList.length) return;

  if (!audioInitiated.value) {
    initAudioInstance();
  }

  if (isPlaying.value) {
    audio.pause();
  } else {
    audio
      .play()
      .then(() => {})
      .catch((err) => {
        console.error("播放失败:", err);
        alert("播放失败：请刷新页面后重试，或检查音频文件路径是否正确");
      });
  }
  isPlaying.value = !isPlaying.value;

  //  向父组件发送播放状态更新
  emit("update:playing", isPlaying.value);
  emit("update:currentSong", currentSong.value);
};

// 播放指定歌曲
const playSong = (index) => {
  if (!songList.length) return;

  if (!audioInitiated.value) {
    initAudioInstance();
  }

  currentSongIndex.value = index;
  currentSong.value = songList[index];

  if (audio) {
    audio.src = currentSong.value.url;
    audio.currentTime = 0;

    if (isPlaying.value) {
      audio.play().catch((err) => {
        console.error("播放失败:", err);
      });
    }
  }

  //  ：向父组件发送当前歌曲更新
  emit("update:currentSong", currentSong.value);
};

// 上一曲
const prevSong = () => {
  if (!songList.length) return;

  const newIndex =
    (currentSongIndex.value - 1 + songList.length) % songList.length;
  playSong(newIndex);
};

// 下一曲
const nextSong = () => {
  if (!songList.length) return;

  const newIndex = (currentSongIndex.value + 1) % songList.length;
  playSong(newIndex);
};

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min.toString().padStart(2, "0")}:${sec
    .toString()
    .padStart(2, "0")}`;
};

// 点击进度条调整播放位置
const handleProgressClick = (e) => {
  if (!audio || !songList.length) return;

  const rect = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const percent = clickX / rect.width;
  audio.currentTime = percent * audio.duration;
};

// 打开播放器
const openPlayer = () => {
  visible.value = true;
  //  打开时同步状态给父组件
  emit("update:playing", isPlaying.value);
  emit("update:currentSong", currentSong.value);
};

//  关闭播放器时不暂停音乐（后台播放）
const closePlayer = () => {
  visible.value = false;
  // 移除暂停逻辑，保留播放状态
  // 同步最新状态给父组件
  emit("update:playing", isPlaying.value);
};

// 监听播放状态变化，实时同步给父组件
watch(isPlaying, (newVal) => {
  emit("update:playing", newVal);
});

// 组件卸载时清理资源（页面关闭才暂停）
onUnmounted(() => {
  if (audio) {
    audio.pause();
    isPlaying.value = false;
    emit("update:playing", false);
    audio.removeEventListener("loadedmetadata", () => {});
    audio.removeEventListener("timeupdate", () => {});
    audio.removeEventListener("ended", () => {});
  }
  audioInitiated.value = false;
});

// 监听弹窗关闭状态（仅隐藏，不暂停）
watch(visible, (newVal) => {
  if (!newVal && audio) {
    // 关闭弹窗时不暂停音乐
    emit("update:playing", isPlaying.value);
  }
});

// 暴露方法给父组件
defineExpose({
  openPlayer,
  closePlayer,
  playSong,
  prevSong,
  nextSong,
  // 🔥 暴露播放状态，方便父组件获取
  isPlaying,
});
</script>

<style scoped lang="scss">
/* 样式部分保持不变，无需修改 */
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
    width: 360px;
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

  .close-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: #693e9c;
    font-size: 20px;
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
      background: linear-gradient(135deg, #e8d5f2 0%, #d4bfe1 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-shadow: 0 4px 16px rgba(105, 62, 156, 0.15);

      &.playing {
        animation: rotate 10s linear infinite;
      }

      .cover-bg {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: radial-gradient(
          circle at 30% 30%,
          #af7dc4 0%,
          transparent 60%
        );
        opacity: 0.2;
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
      }
    }
  }

  .song-info {
    margin-bottom: 20px;
    width: 100%;

    .song-name {
      text-align: center;
      font-size: 18px;
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
        height: 4px;
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
        font-size: 12px;
        color: #8a5ca0;
        margin-top: 6px;
      }
    }
  }

  .control-panel {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    margin-bottom: 20px;
    width: 100%;

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
      min-width: 80px;
      height: 40px;
      border-radius: 20px;
      border: none;
      background: linear-gradient(90deg, #693e9c 0%, #af7dc4 100%);
      color: #ffffff;
      font-size: 14px;
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
      gap: 6px;
      color: #693e9c;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .song-list-container {
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
            font-size: 12px;
            color: #8a5ca0;
            flex-shrink: 0;
          }

          .song-text {
            flex: 1;
            margin: 0 8px;
            font-size: 14px;
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
    top: -1px;
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
