<!--
 * @Author: Sid Li
 * @Date: 2025-12-12 16:15:42
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-19 13:45:25
 * @FilePath: \zi-xiao-ai\src\views\log.vue
 * @Description: 
-->

<template>
  <div class="device-container">
    <div class="device-title">设备运行日志</div>

    <div class="table-nav">
      <div class="table-nav-left">
        <div class="nav-item">
          <el-date-picker
            v-model="timeStart"
            type="date"
            placeholder="选择开始时间"
            :size="size"
            class="time-input"
          />
          <span>-</span>
          <el-date-picker
            v-model="timeEnd"
            type="date"
            placeholder="选择结束时间"
            :size="size"
            class="time-input"
          />
        </div>
      </div>

      <div class="table-nav-right">
        <div class="table-nav-btn" @click="handleSearch">查询</div>
        <div class="table-nav-btn-white text-green" @click="handleRefresh">刷新</div>
        <div class="table-nav-btn-white text-red" @click="clearLog">清空日志</div>
      </div>
    </div>

    <div class="device-item-container">
      <LogTable
        :tableData="tableData"
        :minBodyHeight="'8vh'"
        :maxBodyHeight="'40vh'"
        :tableWidth="'80vw'"
      />
    </div>
    <div class="back-btn">
      <el-button class="back-btn" type="primary" @click="backMain">返回</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import LogTable from "@/components/log/LogTable.vue";

const router = useRouter();

const size = ref("large");

// 搜索条件
const timeStart = ref("");
const timeEnd = ref("");

// 模拟数据
const tableData = ref([
  {
    id: 1,
    date: "2025-12-16 10:00",
    typeErro: 0,
    typeText: "未知异常",
    content: "激活从1到0",
    position: 0,
  },
  {
    id: 2,
    date: "2025-12-16 10:00",
    typeErro: 1,
    typeText: "未知异常",
    content: "锁定从1到0",
    position: 1,
  },
  {
    id: 3,
    date: "2025-12-16 10:00",
    typeErro: 0,
    typeText: "未知异常",
    content: "激活从0到1",
    position: 0,
  },
  {
    id: 4,
    date: "2025-12-16 10:00",
    typeErro: 1,
    typeText: "未知异常",
    content: "解锁从0到1",
    position: 1,
  },
  {
    id: 5,
    date: "2025-12-16 10:00",
    typeErro: 0,
    typeText: "未知异常",
    content: "激活从1到0",
    position: 0,
  },
  {
    id: 6,
    date: "2025-12-16 10:00",
    typeErro: 1,
    typeText: "未知异常",
    content: "锁定从1到0",
    position: 1,
  },
  {
    id: 7,
    date: "2025-12-16 10:00",
    typeErro: 0,
    typeText: "未知异常",
    content: "激活从0到1",
    position: 0,
  },
]);

// 按钮事件
const handleSearch = () => {
  //按时间筛选
};

const handleRefresh = () => {
  // 刷新当前页数据
};

const clearLog = () => {};

const backMain = () => {
  router.push("/main");
};

onMounted(() => {
  console.log("组件挂载了");
});
</script>

<style scoped lang="scss">
.device-container {
  width: 100%;
  height: 100vh;
  background-color: #e0ddec;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.device-title {
  font-size: 30px;
  font-weight: bold;
  color: #4d1166;
  height: 8vh;
  line-height: 8vh;
  margin-top: 4vh;
  text-align: center;
}

.table-nav {
  width: 80%;
  box-sizing: border-box;
  height: 6vh;
  font-size: 16px;
  color: #4d1166;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0px;
  // border: 1px solid red;
  padding: 0 40px;

  .table-nav-left {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;

    .nav-item {
      display: flex;
      align-items: center;
    }
  }

  .table-nav-right {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 15px;
  }

  .table-nav-btn {
    background: #9033e9;
    color: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 16px;
    font-weight: 500;
    text-align: center;
    min-width: 100px;
    height: 50px;
    line-height: 50px;

    &:hover {
      background: #7a2bc5;
    }

    &.disabled {
      background: #b8a6c5;
      cursor: not-allowed;

      &:hover {
        background: #b8a6c5;
        transform: none;
      }
    }
  }

  .table-nav-btn-white {
    background: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 16px;
    font-weight: 500;
    text-align: center;
    min-width: 100px;
    height: 50px;
    line-height: 50px;

    &:hover {
      background: #f0f0f0;
    }
  }
  .text-red {
    color: #ff4d4f;
  }

  .text-green {
    color: #4caf50;
  }
}

.device-item-container {
  width: 80%;
  height: 65vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  // background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  // box-shadow: 0 2px 8px rgba(77, 17, 102, 0.1);
  // border: 2px solid green;
  box-sizing: border-box;
  position: relative;
}

:deep(.back-btn) {
  width: 100px;
  height: 50px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 12px;
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
</style>
