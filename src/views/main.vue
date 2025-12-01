<template>
  <div class="container">
    <div class="main-top">
      <img class="logo" src="@/assets/pic/logo.png" alt="" />
      <div class="main-top-middle flex-row">
        <div class="flex-row nav-text">
          <img src="@/assets/pic/file-icon/clear_off.png" alt="" />
          <span>清灰</span>
        </div>
        <div class="flex-row nav-text">
          <img src="@/assets/pic/file-icon/change_off.png" alt="" />
          <span>艾条装卸</span>
        </div>
      </div>

      <div class="flex-row nav-text">
        <img src="@/assets/pic/file-icon/user.png" alt="" />
        <span>艾灸师</span>
      </div>
    </div>
    <div class="main-content">
      <div class="left">
        <div class="title">
          <span>方案灸</span>
          <el-button round type="primary" class="title-btn">自由灸</el-button>
        </div>

        <div class="left-table">
          <div
            @click="handleClick(item.id)"
            class="flex-row line-one"
            :class="{
              'line-one-bottom': index !== caseArr.length - 1,
              'line-one-selected': item.id === selectedCaseId,
            }"
            v-for="(item, index) in caseArr"
            :key="item.id"
          >
            <span class="title">{{ item.name }}</span>
            <div class="btn">预设</div>
          </div>
        </div>
      </div>
      <div class="right"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";

const selectedCaseId = ref(1);

const caseArr = ref([
  {
    id: 1,
    name: "腹泻针灸1",
  },
  {
    id: 2,
    name: "感冒灸2",
  },
  {
    id: 3,
    name: "更年安灸3",
  },
  {
    id: 4,
    name: "肩颈灸4",
  },
  {
    id: 5,
    name: "抗衰老灸5",
  },
  {
    id: 6,
    name: "保健灸6",
  },
  {
    id: 7,
    name: "内分泌灸7",
  },
  {
    id: 8,
    name: "回阳固肾灸8",
  },
  {
    id: 9,
    name: "风湿性/类风湿性关节炎灸",
  },
  {
    id: 10,
    name: "慢性支气管炎灸",
  },
  {
    id: 11,
    name: "感冒灸",
  },
]);

const handleClick = (id) => {
  selectedCaseId.value = id;
};

onMounted(() => {
  console.log("组件挂载了");
});
</script>

<style scoped lang="scss">
.container {
  box-sizing: border-box;
  background: url("@/assets/pic/backgroundImage.png") no-repeat;
  background-position: center center;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

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
    }

    .main-top-middle {
      justify-content: center;
    }

    .nav-text span {
      font-size: 18px;
    }

    .nav-text img {
      width: 2vw;
      height: 4vh;
    }
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
    .left {
      // border: 1px solid red;
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
          font-size: 30px;
          color: #511d6a;
          font-weight: bold;
        }

        :deep(.title-btn) {
          width: 120px;
          height: 50px;
          font-size: 24px;
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

      .left-table {
        margin-top: 10px;
        border-left: 1px solid #511d6a;
        border-right: 1px solid #511d6a;

        .line-one {
          box-sizing: border-box;
          width: 100%;
          justify-content: space-between;
          padding: 12px 5px 12px 20px;
          background-color: #fff;
          .title {
            font-size: 24px;
            color: #511d6a;
            font-weight: 500;
          }
          .btn {
            width: 50px;
            height: 25px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            background: #ff860e;
            font-size: 12px;
            color: #ffffff;
            border-radius: 8px;
          }
        }
        .line-one-bottom {
          border-bottom: 1px solid #8a5ca0;
        }
        .line-one-selected {
          background-color: #d8c7e5;
        }

        .line-one:hover {
          cursor: pointer;
        }
      }
    }
    .right {
      border: 1px solid blue;
      width: 70%;
      height: calc(90vh - 80px);
      box-sizing: border-box;
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
  }
}
</style>
