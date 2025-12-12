<template>
  <div class="main-top">
    <img
      @click="openMenuTop"
      draggable="false"
      class="logo"
      src="@/assets/pic/logo.png"
      alt=""
    />
    <div class="main-top-middle">
      <div class="nav-text">
        <img
          draggable="false"
          src="@/assets/pic/file-icon/clear_off.png"
          alt=""
        />
        <span>清灰</span>
      </div>
      <div class="nav-text">
        <img
          draggable="false"
          src="@/assets/pic/file-icon/change_off.png"
          alt=""
        />
        <span>艾条装卸</span>
      </div>
    </div>

    <!-- 显示当前登录用户的昵称 -->
    <div @click="handleClickUser" class="nav-user">
      <img draggable="false" src="@/assets/pic/file-icon/user.png" alt="" />
      <span>{{ currentUser.nickName || "未登录" }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const currentUser = ref(
  JSON.parse(localStorage.getItem("userInfo") || '{"nickName":"未登录"}')
);
const emit = defineEmits(["openMenu"]);

const openMenuTop = () => {
  emit("openMenu");
};
// 点击用户头像：强制跳转到login页（无限制）
const handleClickUser = () => {
  router.push("/login");
};

onMounted(() => {
  console.log("组件挂载了");
});
</script>

<style scoped lang="scss">
.main-top {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 6vh;
  width: 100%;
  border-bottom: 1px solid #c293d5;
  padding: 0 30px;

  .logo {
    width: 6vw;
    height: 4vh;
    cursor: pointer;
  }

  .main-top-middle {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    .nav-text {
      margin: 0 20px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      span {
        margin-left: 8px;
        font-size: 18px;
      }

      img {
        width: 3vh;
        height: 3vh;
        object-fit: contain;
      }
    }
  }

  .nav-user {
    margin: 0 20px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    span {
      margin-left: 8px;
      font-size: 18px;
    }

    img {
      width: 3vh;
      height: 3vh;
      object-fit: contain;
    }
  }
}
</style>

<style lang="scss">
.drawer-content {
  // border: 3px solid blue;
  max-height: 90vh !important;
  box-sizing: border-box;
  margin-top: 10vh;
  width: 280px !important;
  .el-drawer__body {
    padding: 0 !important;
  }
}

.main-container .el-overlay {
  background: transparent !important;
  backdrop-filter: none !important;
}

.drawer-user {
  height: 60vh !important;
}

.drawer-admin {
  height: 70vh !important;
}

.drawer-super {
  height: 88vh !important;
}
</style>
