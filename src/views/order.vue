<!--
 * @Author: Sid Li
 * @Date: 2025-12-12 16:15:42
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-19 13:54:42
 * @FilePath: \zi-xiao-ai\src\views\order.vue
 * @Description: 
-->

<template>
  <div class="device-container">
    <div class="device-title">诊断灸方</div>

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
        <div class="nav-item">
          <el-input
            v-model="searchPhone"
            placeholder="输入手机号"
            clearable
            class="search-input"
          />
        </div>
        <div class="nav-item">
          <el-select
            v-model="completionStatus"
            placeholder="选择状态"
            class="status-select"
          >
            <el-option label="全部" value="all" />
            <el-option label="已完成" value="completed" />
            <el-option label="未完成" value="incomplete" />
          </el-select>
        </div>
      </div>

      <div class="table-nav-right">
        <div class="table-nav-btn" @click="handleSearch">查询</div>
        <div
          class="table-nav-btn"
          @click="handleBatchDelete"
          :class="{ disabled: multipleSelection.length === 0 }"
        >
          批量删除
        </div>
        <div class="table-nav-btn" @click="backMain">返回</div>
      </div>
    </div>

    <div class="device-item-container">
      <el-table
        :data="currentTableData"
        @selection-change="handleSelectionChange"
        header-row-class-name="custom-header-row"
        class="order-table"
      >
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column align="center" label="订单时间" width="180">
          <template #default="scope">{{ scope.row.date }}</template>
        </el-table-column>
        <el-table-column align="center" property="name" label="顾客姓名" width="120" />
        <el-table-column align="center" property="phone" label="顾客电话" />
        <el-table-column align="center" property="time" label="方案时长" />
        <el-table-column align="center" property="detail" label="详细">
          <template #default="scope">
            <el-button type="text" @click="viewDetail(scope.row)" class="detail-btn">
              查看详情
            </el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" property="isComplete" label="是否完成">
          <template #default="scope">
            <el-tag
              :type="scope.row.isComplete === 1 ? 'success' : 'danger'"
              effect="plain"
              class="status-tag"
            >
              {{ scope.row.isComplete === 1 ? "已完成" : "未完成" }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :small="false"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredData.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="custom-pagination"
        />
      </div>
    </div>

    <el-dialog
      class="order-table-dialog"
      :show-close="false"
      v-model="dialogTableVisible"
      title=""
    >
      <template #header="{ close, titleId, titleClass }">
        <div class="my-header">
          <h4 :id="titleId" :class="titleClass">诊断灸方详情</h4>
          <el-icon @click="close" class="el-icon--left"><CloseBold /></el-icon>
          <!-- <el-icon @click="close" class="el-icon--left"
            ><CircleCloseFilled
          /></el-icon> -->
        </div>
      </template>
      <div class="detail-text">
        <div><span>订单编号:</span> {{ orderInfo.id }}</div>
        <div><span>顾客姓名:</span> {{ orderInfo.name }}</div>
        <div><span>顾客电话:</span> {{ orderInfo.phone }}</div>
        <div><span>创建时间:</span> {{ orderInfo.createTime }}</div>
        <div><span>预估时长:</span> {{ orderInfo.time }}小时</div>
        <div><span>实际时长:</span> {{ orderInfo.finalTime }}</div>
        <div>
          <span>完成状态:</span>
          {{ orderInfo.status === 0 ? "未完成" : "已完成" }}
        </div>
      </div>
      <div>
        <el-table border class="dialog-table" :data="orderInfo.plan">
          <el-table-column align="center" property="id" label="序号" width="50" />
          <el-table-column align="center" property="name" label="灸法">
            <template #default="scope">
              <span class="name-tag">
                {{ scope.row.name }}
              </span>
            </template>
          </el-table-column>

          <el-table-column width="80" align="center" property="time" label="时长" />
          <el-table-column width="180" align="center" property="point" label="穴位">
            <template #default="scope">
              <el-tag
                class="point-tag"
                round
                effect="plain"
                v-for="(item, index) in scope.row.point"
                :key="index"
              >
                {{ item }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { createTablePopper } from "element-plus/es/components/table/src/util.mjs";
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const orderInfo = ref({
  id: 1,
  name: "bob",
  phone: "13800000001",
  createTime: "2025-12-16 10:00",
  time: 4,
  finalTime: 1,
  status: 0,
  plan: [
    {
      id: 11,
      name: "回旋灸",
      time: 1,
      point: ["大椎穴"],
    },
    {
      id: 12,
      name: "回旋灸",
      time: 1,
      point: ["风门穴"],
    },
    {
      id: 13,
      name: "往复灸",
      time: 1,
      point: ["风门穴", "肺俞穴"],
    },
  ],
});

// 搜索条件
const searchPhone = ref("");
const completionStatus = ref("all");
const currentPage = ref(1);
const pageSize = ref(10);
const size = ref("large");
const timeStart = ref("");
const timeEnd = ref("");
const dialogTableVisible = ref(false);

// 模拟数据
const tableData = ref([
  {
    id: 1,
    date: "2025-12-16 10:00",
    name: "张三",
    phone: "13800000001",
    time: "3",
    isComplete: 0,
  },
  {
    id: 2,
    date: "2025-12-16 10:30",
    name: "李四",
    phone: "13800000002",
    time: "2",
    isComplete: 1,
  },
  {
    id: 3,
    date: "2025-12-16 11:00",
    name: "王五",
    phone: "13800000003",
    time: "4",
    isComplete: 0,
  },
  {
    id: 4,
    date: "2025-12-16 11:30",
    name: "赵六",
    phone: "13800000004",
    time: "1",
    isComplete: 1,
  },
  {
    id: 5,
    date: "2025-12-16 12:00",
    name: "钱七",
    phone: "13800000005",
    time: "3",
    isComplete: 0,
  },
  {
    id: 6,
    date: "2025-12-16 12:30",
    name: "孙八",
    phone: "13800000006",
    time: "2",
    isComplete: 1,
  },
  {
    id: 7,
    date: "2025-12-16 13:00",
    name: "周九",
    phone: "13800000007",
    time: "5",
    isComplete: 0,
  },
  {
    id: 8,
    date: "2025-12-16 13:30",
    name: "吴十",
    phone: "13800000008",
    time: "3",
    isComplete: 1,
  },
  {
    id: 9,
    date: "2025-12-16 14:00",
    name: "郑一",
    phone: "13800000009",
    time: "2",
    isComplete: 0,
  },
  {
    id: 10,
    date: "2025-12-16 14:30",
    name: "王二",
    phone: "13800000010",
    time: "4",
    isComplete: 1,
  },
  {
    id: 11,
    date: "2025-12-16 15:00",
    name: "张三三",
    phone: "13800000011",
    time: "3",
    isComplete: 0,
  },
  {
    id: 12,
    date: "2025-12-16 15:30",
    name: "李四四",
    phone: "13800000012",
    time: "2",
    isComplete: 1,
  },
  {
    id: 13,
    date: "2025-12-16 16:00",
    name: "王五五",
    phone: "13800000013",
    time: "4",
    isComplete: 0,
  },
  {
    id: 14,
    date: "2025-12-16 16:30",
    name: "赵六六",
    phone: "13800000014",
    time: "1",
    isComplete: 1,
  },
  {
    id: 15,
    date: "2025-12-16 17:00",
    name: "钱七七",
    phone: "13800000015",
    time: "3",
    isComplete: 0,
  },
  {
    id: 16,
    date: "2025-12-16 17:30",
    name: "孙八八",
    phone: "13800000016",
    time: "2",
    isComplete: 1,
  },
  {
    id: 17,
    date: "2025-12-16 18:00",
    name: "周九九",
    phone: "13800000017",
    time: "5",
    isComplete: 0,
  },
  {
    id: 18,
    date: "2025-12-16 18:30",
    name: "吴十十",
    phone: "13800000018",
    time: "3",
    isComplete: 1,
  },
  {
    id: 19,
    date: "2025-12-16 19:00",
    name: "郑一一",
    phone: "13800000019",
    time: "2",
    isComplete: 0,
  },
  {
    id: 20,
    date: "2025-12-16 19:30",
    name: "王二二",
    phone: "13800000020",
    time: "4",
    isComplete: 1,
  },
  {
    id: 21,
    date: "2025-12-16 20:00",
    name: "张三三三",
    phone: "13800000021",
    time: "3",
    isComplete: 0,
  },
  {
    id: 22,
    date: "2025-12-16 20:30",
    name: "李四四四",
    phone: "13800000022",
    time: "2",
    isComplete: 1,
  },
]);

// 计算属性：过滤后的数据
const filteredData = computed(() => {
  return tableData.value.filter((item) => {
    // 按手机号筛选
    if (searchPhone.value && !item.phone.includes(searchPhone.value)) {
      return false;
    }

    // 按完成状态筛选
    if (completionStatus.value === "completed") {
      return item.isComplete === 1;
    } else if (completionStatus.value === "incomplete") {
      return item.isComplete === 0;
    }

    return true;
  });
});

// 计算属性：当前页的数据
const currentTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

// 分页相关
const handleSizeChange = (val) => {
  console.log(`每页 ${val} 条`);
  currentPage.value = 1; // 重置到第一页
};

const handleCurrentChange = (val) => {
  console.log(`当前页: ${val}`);
};

// 选择处理
const multipleSelection = ref([]);

const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

// 按钮事件
const handleSearch = () => {
  console.log("搜索条件:", {
    phone: searchPhone.value,
    status: completionStatus.value,
  });
  currentPage.value = 1; // 搜索后回到第一页
};

const handleBatchDelete = () => {
  if (multipleSelection.value.length === 0) {
    return;
  }
  console.log("批量删除:", multipleSelection.value);
  //  调用删除API
};

const viewDetail = (row) => {
  console.log("查看详情:", row);
  // 可以跳转到详情页或打开弹窗
  dialogTableVisible.value = true;
};

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

  .order-table {
    width: 100%;
    box-sizing: border-box;
    height: 55vh;
  }

  .pagination-container {
    height: 5vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
    position: absolute;
    bottom: -0vh;
    right: 0;
    margin-top: 5vh;
  }
}

.name-tag {
  display: inline-block;
  font-size: 14px;
  background: #9b28ae;
  padding: 3px 8px;
  border-radius: 20px;
  color: #ffffff;
}

.point-tag {
  margin: 0 5px;
  font-size: 14px;
  font-weight: bold;
}

// 搜索输入框样式穿透
:deep(.search-input) {
  height: 50px;
  width: 10vw;

  .el-input__wrapper {
    border-color: #9033e9;

    &:hover {
      border-color: #4d1166;
    }
  }
}

// 详情按钮样式穿透
:deep(.detail-btn) {
  color: #9033e9 !important;
  font-weight: bold;
  font-size: 14px;
  height: 50px;

  &:hover {
    color: #4d1166 !important;
    text-decoration: underline;
  }
}

// 状态标签样式穿透
:deep(.status-tag) {
  font-weight: bold;
  border-radius: 4px;
  padding: 0 8px;
  height: 24px;
  line-height: 24px;
}
</style>

<style lang="scss">
/* 自定义表头样式 */
.custom-header-row th {
  // background: linear-gradient(135deg, #794fba 0%, #9033e9 100%) !important;
  background: #9033e9 !important;
  color: #ffffff !important;
  font-size: 18px !important;
  font-weight: bold !important;
  height: 5vh !important;
  text-align: center !important;
  position: relative;
  overflow: hidden;
  border: none !important;
  padding: 0 !important;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    // background: linear-gradient(90deg, #4d1166, #794fba);
    background: #9033e9 !important;
  }
}

/* 表格行样式 -  清除所有冗余边距 */
.order-table {
  border-radius: 20px !important;
  overflow: hidden !important;

  // 清除表格容器的默认内边距
  .el-table__header,
  .el-table__body {
    padding: 0 !important;
  }

  .el-table__row {
    height: 5vh !important;
    line-height: 5vh !important;
    box-sizing: border-box;

    td {
      height: 5vh !important;
      line-height: 5vh !important;
      padding: 0 !important; // 清除单元格内边距
      vertical-align: middle !important;
      border: none !important; // 清除单元格边框（可选，看需求）
      font-size: 18px;
    }

    /* 斑马纹 */
    &:nth-child(even) {
      background-color: #f9f5fd !important;
    }

    &:hover {
      background-color: #f0e6f5 !important;
    }
  }

  /* 复选框样式 */
  .el-checkbox__inner {
    border-color: #9033e9 !important;

    &:hover {
      border-color: #4d1166 !important;
    }
  }

  .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #9033e9 !important;
    border-color: #9033e9 !important;
  }

  // 隐藏表格的默认滚动条
  .el-table__body-wrapper {
    overflow-y: auto !important;
    // 可选：隐藏滚动条
    // &::-webkit-scrollbar {
    //   display: none;
    // }
  }
}

// 时间输入框样式
.time-input {
  height: 50px !important;
  width: 12vw !important;
}

// 状态选择器样式
.status-select {
  .el-input__wrapper {
    border-color: #9033e9;

    &:hover {
      border-color: #4d1166;
    }
  }

  width: 7vw;
  height: 50px !important;

  .el-select__wrapper {
    height: 50px !important;
  }
}

.order-table-dialog {
  width: 35vw;
  height: 55vh;
  padding: 0;
  border-radius: 20px !important;
  overflow: hidden;
  .el-dialog__header {
    height: 3vh !important;
    line-height: 3vh !important;
    font-size: 18px !important;
    font-weight: bold !important;
    color: #ffffff !important;
    background: #9033e9 !important;
  }
  .el-dialog__body {
    // border: 1px solid red;
    padding: 2vh;
    height: 50vh;
    box-sizing: border-box;

    .detail-text {
      background-color: #f6f9f6;
      padding: 1vh;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      span {
        color: #999999;
        margin-right: 10px;
      }
    }
  }
}
.my-header {
  padding: 0 20px;
  height: 4vh !important;
  line-height: 4vh !important;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  .el-dialog__title {
    color: #ffffff;
  }
  .el-icon--left {
    cursor: pointer;
    font-size: 14px;
    height: 2vh;
    width: 2vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #9e80dc;
    border-radius: 50%;
  }
}

.dialog-table {
  max-height: 27vh;
  width: 100%;
  border-radius: 20px !important;
  border: 1px solid #e0ddec !important;

  .el-table__row {
    height: 4vh !important;
    line-height: 4vh !important;
    box-sizing: border-box;
    td {
      height: 4vh !important;
      line-height: 4vh !important;
      padding: 0 !important; // 清除单元格内边距
      vertical-align: middle !important;
    }
  }
}

/* 自定义分页器样式 */
// .custom-pagination {
//   .el-pagination__total {
//     color: #4d1166;
//     font-weight: 500;
//   }

//   .el-pagination__sizes {
//     .el-input__wrapper {
//       border-color: #9033e9;

//       &:hover {
//         border-color: #4d1166;
//       }
//     }
//   }

//   .el-pager {
//     .number {
//       color: #4d1166;
//       border: 1px solid #e0d4e8;
//       border-radius: 4px;
//       margin: 0 4px;

//       &:hover {
//         color: #9033e9;
//         border-color: #9033e9;
//       }
//     }
//     .is-active {
//       background-color: #9033e9 !important;
//       color: white;
//       border-color: #9033e9 !important;
//     }
//   }

//   .btn-prev,
//   .btn-next {
//     color: #4d1166;
//     border: 1px solid #e0d4e8;
//     border-radius: 4px;

//     &:hover:not(.disabled) {
//       color: #9033e9;
//       border-color: #9033e9;
//     }

//     &.disabled {
//       color: #b8a6c5;
//       cursor: not-allowed;
//     }
//   }

//   .el-pagination__jump {
//     color: #4d1166;

//     .el-pagination__editor {
//       border-color: #9033e9;

//       &:focus {
//         border-color: #4d1166;
//       }
//     }
//   }
// }
</style>
