<template>
  <div class="main-container">
    <Top @openMenu="openMenu" />
    <div class="main-content">
      <div class="left">
        <div class="title">
          <span>方案灸</span>
          <el-button round type="primary" class="title-btn">自由灸</el-button>
        </div>

        <!-- 替换为新封装的左侧滚动组件 -->
        <LeftScrollList
          :listData="caseArr"
          :selectedId="selectedCaseId"
          :containerHeight="'70vh'"
          :containerWidth="'100%'"
          @item-click="handleClick"
        />
      </div>
      <div class="right">
        <DragScrollWrapper>
          <MainTable
            :tableData="selectedPlan"
            :minBodyHeight="'5vh'"
            :maxBodyHeight="'20vh'"
            :tableWidth="'70vw'"
          />
        </DragScrollWrapper>
        <!-- 开始按钮容器 -->
        <div class="start-content">
          <el-button round type="primary" class="start-btn" @click="handleStartClick"
            >开始</el-button
          >
        </div>
      </div>
    </div>

    <!-- dialog -->
    <el-dialog v-model="dialogVisible" width="500">
      <div class="dialog-content">
        <div class="dialog-title">预备定穴</div>
        <div class="dialog-text">客户在艾灸床上躺好后，点击</div>
        <div class="dialog-text">下方【开始定穴】按钮，进行定穴</div>
        <div class="dialog-btn-content">
          <el-button round type="primary" @click="cancelDialog" class="title-btn"
            >取消</el-button
          >
          <el-button round type="primary" @click="confirmDialog" class="title-btn"
            >开始定穴</el-button
          >
        </div>
      </div>
    </el-dialog>

    <!-- 抽屉 -->
    <el-drawer
      class="drawer-content"
      :class="[
        { 'drawer-user': currentUser.role.includes('user') },
        { 'drawer-admin': currentUser.role.includes('admin') },
        { 'drawer-super': currentUser.role.includes('super_admin') },
      ]"
      v-model="drawerVisible"
      direction="ltr"
      :with-header="false"
    >
      <DrawerList />
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import caseData from "@/data/caseData.json";
import DrawerList from "@/components/DrawerList.vue";
import DragScrollWrapper from "@/components/DragScrollWrapper.vue";
import MainTable from "@/components/Main/MainTable.vue";
import LeftScrollList from "@/components/Main/LeftScrollList.vue"; // 引入新组件
import Top from "@/components/Top.vue";
import pointData from "@/data/pointData.json";

const router = useRouter();

// 获取当前登录用户信息
const currentUser = ref(
  JSON.parse(localStorage.getItem("userInfo") || '{"nickName":"未登录"}')
);

// 监听localStorage变化（登录新用户时刷新用户信息）
const watchUserInfo = () => {
  window.addEventListener("storage", (e) => {
    if (e.key === "userInfo") {
      currentUser.value = JSON.parse(e.newValue || '{"nickName":"未登录"}');
    }
  });
};

const dialogVisible = ref(false);
const selectedCaseId = ref(1);
const selectedPlan = ref([]);
const caseArr = ref([]);
const drawerVisible = ref(false);

const getCaseList = () => {
  caseArr.value = JSON.parse(JSON.stringify(caseData));
  selectedPlan.value = caseArr.value[0].plan;
};

const openMenu = () => {
  drawerVisible.value = true;
};

const handleStartClick = () => {
  console.log("start");
  dialogVisible.value = true;
};

// 列表项点击事件
const handleClick = (id) => {
  selectedCaseId.value = id;
  const selectedItem = caseArr.value.find((item) => item.id === id);
  console.log(selectedItem);
  selectedPlan.value = selectedItem?.plan || [];
};

const confirmDialog = () => {
  localStorage.setItem("selectedCaseId", selectedCaseId.value);
  router.push(`/point?id=${selectedCaseId.value}`);
};

const cancelDialog = () => {
  dialogVisible.value = false;
};

onMounted(() => {
  const arr = JSON.parse(JSON.stringify(pointData));
  console.log(arr);
  localStorage.setItem("pointData", JSON.stringify(arr));
  getCaseList();

  watchUserInfo();
});

onUnmounted(() => {
  window.removeEventListener("storage", watchUserInfo);
});
</script>

<style scoped lang="scss">
.main-container {
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
}

.main-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  box-sizing: border-box;
  height: 90vh;
  width: 100%;
  padding: 50px 30px 30px 20px;
  gap: 20px;

  .left {
    width: 30%;
    height: calc(90vh - 80px);
    box-sizing: border-box;
    padding: 10px 20px;

    .title {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      span {
        height: 50px;
        line-height: 50px;
        font-size: 24px;
        color: #511d6a;
        font-weight: bold;
      }

      :deep(.title-btn) {
        width: 100px;
        height: 40px;
        font-size: 20px;
        border-radius: 40px;
        margin-left: 20px;
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
    }
  }

  .right {
    padding-top: 4vh;
    width: 70vw;
    height: calc(90vh - 80px);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    .start-content {
      height: 5vh;
      line-height: 5vh;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      margin-top: 20px;
      :deep(.start-btn) {
        width: 180px;
        height: 60px;
        font-size: 18px;
        font-weight: bold;
        border-radius: 40px;
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
    }
  }
}

.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;

  img {
    width: 60px;
    height: 60px;
    margin-right: 10px;
  }

  span {
    font-size: 30px;
    margin-right: 40px;
    color: #511d6a;
  }
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
  height: 25vh;
  .dialog-title {
    font-size: 30px;
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
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

:deep(.el-dialog .title-btn) {
  width: 120px;
  height: 50px;
  border-radius: 40px;
  margin: 0 60px;
  font-size: 18px;
  font-weight: bold;
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

:deep(.el-dialog) {
  --el-dialog-bg-color: #d4bfe1 !important;
  border-radius: 20px;
}

:deep(.el-dialog__close) {
  color: #ffffff;
}

:deep(.el-dialog__headerbtn):hover .el-dialog__close {
  color: #ffffff !important;
}

// 隐藏滚动条保留
::-webkit-scrollbar {
  display: none;
}
* {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  touch-action: pan-y;
  margin: 0;
  padding: 0;
  font-family: "Microsoft YaHei", sans-serif;
}
</style>

<style lang="scss">
.drawer-content {
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
