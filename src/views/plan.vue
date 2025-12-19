<!--
 * @Author: Sid Li
 * @Date: 2025-12-12 11:26:16
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-19 10:06:53
 * @FilePath: \zi-xiao-ai\src\views\plan.vue
 * @Description: 
-->
<template>
  <div class="plan-container">
    <Top @openMenu="openMenu" />

    <div class="main-content">
      <div class="left">
        <div class="title">
          <span>方案灸</span>
        </div>

        <!-- 替换为封装的左侧滚动组件 -->
        <LeftScrollList
          :listData="caseArr"
          :selectedId="selectedCaseId"
          :containerHeight="'70vh'"
          :containerWidth="'100%'"
          @item-click="handleClick"
        />

        <div class="edit-group">
          <el-button @click="openDialog" class="edit-btn" type="primary"
            >新增灸方</el-button
          >
          <el-button class="edit-btn" type="primary">编辑</el-button>
          <el-button class="edit-btn" type="primary">删除</el-button>
        </div>
      </div>
      <div class="right">
        <!-- 替换为封装的右侧表格组件 -->
        <MainTable
          :tableData="selectedPlan"
          :minBodyHeight="'5vh'"
          :maxBodyHeight="'55vh'"
          :tableWidth="'65vw'"
        />
      </div>
    </div>

    <!-- 新建灸方的Dialog -->
    <el-dialog v-model="dialogVisible" width="500">
      <div class="dialog-content">
        <div class="dialog-title">新建灸方</div>
        <div class="dialog-text">请输入方案名称:</div>
        <div class="dialog-text">
          <el-input
            class="plan-input"
            v-model="planName"
            placeholder="请输入方案名称"
            @focus="() => keyboardRef.open(null, 'input-planName')"
            @click.stop
          />
        </div>
        <div class="dialog-text">创建完成后可在下一个页面配置灸法详情</div>

        <div class="dialog-btn-content">
          <el-button
            round
            type="primary"
            @click="cancelDialog"
            class="title-btn"
            >取消</el-button
          >
          <el-button
            round
            type="primary"
            @click="confirmDialog"
            class="title-btn"
            >确定</el-button
          >
        </div>
      </div>
    </el-dialog>

    <!-- 抽屉组件 -->
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

    <!-- 键盘组件 -->
    <Keyboard
      ref="keyboardRef"
      v-model="planName"
      inputId="input-planName"
      :isNumber="false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";

// 引入组件（和参考页面保持一致）
import Top from "@/components/Top.vue";
import DrawerList from "@/components/DrawerList.vue";
import MainTable from "@/components/Main/MainTable.vue";
import LeftScrollList from "@/components/Main/LeftScrollList.vue";
import Keyboard from "@/components/Keyboard.vue";

// 引入数据（替换原getCaseData逻辑）
import caseData from "@/data/caseData.json";
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
const keyboardRef = ref(null);
const planName = ref("");
const newPlan = ref({});

const getCaseList = () => {
  caseArr.value = JSON.parse(JSON.stringify(caseData));
  selectedPlan.value = caseArr.value[0].plan;
};

const openMenu = () => {
  drawerVisible.value = true;
};

// 列表项点击事件
const handleClick = (id) => {
  selectedCaseId.value = id;
  const selectedItem = caseArr.value.find((item) => item.id === id);
  selectedPlan.value = selectedItem?.plan || [];
};

// 新建灸方Dialog相关
const openDialog = () => {
  dialogVisible.value = true;
};

const cancelDialog = () => {
  dialogVisible.value = false;
};

const confirmDialog = () => {
  newPlan.value.name = planName.value;
  localStorage.setItem("newPlan", JSON.stringify(newPlan.value));
  router.push(`/newPlan`);
};

// 生命周期
onMounted(() => {
  const arr = JSON.parse(JSON.stringify(pointData));
  localStorage.setItem("pointData", JSON.stringify(arr));
  getCaseList();
  watchUserInfo();
});

onUnmounted(() => {
  window.removeEventListener("storage", watchUserInfo);
});
</script>

<style scoped lang="scss">
.plan-container {
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
    padding: 0px 20px 10px 20px;

    .title {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      height: 4vh;
      span {
        height: 50px;
        line-height: 50px;
        font-size: 24px;
        color: #511d6a;
        font-weight: bold;
      }
    }

    .edit-group {
      margin-top: 20px;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      .edit-btn {
        width: 120px;
        height: 50px;
        font-size: 18px;
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

  .right {
    width: 70%;
    height: calc(90vh - 80px);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    margin-top: 4vh;
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
  height: 28vh;
  .dialog-title {
    font-size: 32px;
    font-weight: bold;
    color: #511d6a;
    margin-bottom: 20px;
  }
  .dialog-text {
    font-size: 20px;
    font-weight: 500;
    color: #4c1c64;
    margin-bottom: 10px;
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
  width: 150px;
  height: 40px;
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

.plan-input {
  --el-input-border-radius: 10px;
  --el-input-text-color: #511d6a;
  --el-input-placeholder-color: #9262a8;
  --el-input-border-color: #c1a6d5;
  --el-input-hover-border-color: #722a8f;
  --el-input-focus-border-color: #511d6a;
  --el-input-bg-color: #f9f5fc;
  width: 320px;
  height: 60px;
  line-height: 60px;
  font-size: 20px;
}

// 隐藏滚动条
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

.plan-container .el-overlay {
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
