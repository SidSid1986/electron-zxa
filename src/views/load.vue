<template>
  <div class="container">
    <div class="loading-wrapper">
      <div class="loading-bg">
        <img src="@/assets/pic/device.png" alt="" />
      </div>
      <svg class="progress-ring" width="320" height="320">
        <circle
          cx="160"
          cy="160"
          r="155"
          stroke="#c293d5"
          stroke-width="10"
          fill="none"
          stroke-linecap="round"
          class="progress-circle"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  width: 100%;
  height: 100vh;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;

  .loading-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;

    position: relative;

    .loading-bg {
      width: 400px;
      height: 400px;
      background: url("@/assets/pic/backgroundImage.png");
      border-radius: 50%;
      overflow: hidden;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      display: flex;
      position: relative;
      z-index: 2;

      img {
        width: 300px;
        height: 300px;
      }
    }

    .progress-ring {
      position: absolute;
      .progress-circle {
        stroke-dasharray: 1288; /* 2 * π * 205 */
        stroke-dashoffset: 1288;
        animation: progressAnimation 3s linear forwards;
        transform-origin: center;
        transform: rotate(-90deg);
      }
    }
  }
}

@keyframes progressAnimation {
  0% {
    stroke-dashoffset: 1288;
  }
  100% {
    stroke-dashoffset: 0;
  }
}
</style>
