<!--
 * @Author: Sid Li
 * @Date: 2025-12-11 17:24:46
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-12 16:18:16
 * @FilePath: \zi-xiao-ai\src\components\DrawerList.vue
 * @Description: 
-->
<template>
  <div class="list-container">
    <div
      v-for="(item, index) in menuList"
      :key="index"
      :class="[
        'list-item',
        { 'border-left': index == selectedIndex },
        { 'border-item': item.hasBorder },
        { 'item-display': !item.role.includes(userInfo.role) },
      ]"
      @click="handleClickItem(item, index)"
    >
      <div class="item-text">
        <i
          :class="[
            'iconfont',
            item.icon,
            { 'selected-color': index == selectedIndex },
          ]"
        ></i>
        <span
          :class="index == selectedIndex ? 'selected-color' : ''"
          class="item-name"
          >{{ item.name }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

const menuList = ref([
  {
    name: "主页",
    hasBorder: false,
    role: ["admin", "user", "super_admin"],
    icon: "icon-home1",
    path: "/main",
  },
  {
    name: "灸方管理",
    hasBorder: false,
    role: ["admin", "super_admin"],
    icon: "icon-rukufangan",
    path: "/plan",
  },
  {
    name: "耗材管理",
    hasBorder: true,
    role: ["admin", "user", "super_admin"],
    icon: "icon-shezhi",
    path: "/material",
  },
  {
    name: "剩余时间查询",
    hasBorder: false,
    role: ["admin", "user", "super_admin"],
    icon: "icon-shezhi",
    path: "/time",
  },
  {
    name: "设备信息",
    hasBorder: false,
    role: ["super_admin"],
    icon: "icon-shezhi",
    path: "/main",
  },
  {
    name: "基础参数",
    hasBorder: false,
    role: ["admin", "user", "super_admin"],
    icon: "icon-shezhi",
    path: "/main",
  },
  {
    name: "艾灸参数",
    hasBorder: false,
    role: ["admin", "user", "super_admin"],
    icon: "icon-shezhi",
    path: "/main",
  },
  {
    name: "设备校准",
    hasBorder: false,
    role: ["super_admin"],
    icon: "icon-shezhi",
    path: "/main",
  },
  {
    name: "订单统计",
    hasBorder: true,
    role: ["admin", "user", "super_admin"],
    icon: "icon-shezhi",
    path: "/main",
  },
  {
    name: "诊断灸方",
    hasBorder: false,
    role: ["admin", "user", "super_admin"],
    icon: "icon-shezhi",
    path: "/main",
  },
  {
    name: "操作演示",
    hasBorder: false,
    role: ["admin", "user", "super_admin"],
    icon: "icon-shezhi",
    path: "/main",
  },
  {
    name: "回打包位",
    hasBorder: false,
    role: ["admin", "super_admin"],
    icon: "icon-shezhi",
    path: "/main",
  },
  {
    name: "运行日志",
    hasBorder: false,
    role: ["super_admin"],
    icon: "icon-shezhi",
    path: "/main",
  },
  {
    name: userInfo.nickName,
    hasBorder: true,
    role: ["admin", "user", "super_admin"],
    icon: "icon-yonghu",
    path: "/main",
  },
]);

const selectedIndex = ref(0);

const handleClickItem = (item, index) => {
  selectedIndex.value = index;
  router.push(item.path);
};

onMounted(() => {
  console.log("组件挂载了");
});
</script>

<style scoped lang="scss">
.list-container {
  // border: 3px solid yellow;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 1vh 0;
}

.list-item {
  box-sizing: border-box;
  width: 100%;
  height: 6vh;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  border-left: 5px solid transparent;
}

.item-text {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 0 1vw;
}

.item-name {
  font-size: 26px;
  font-weight: bold;
}

.iconfont {
  font-size: 26px;
  margin-right: 10px;
}
.border-left {
  border-left: 5px solid #c293d5;
}
.selected-color {
  color: #c293d5;
}

.border-item {
  border-top: 1px solid #cccccc;
}

.list-item:hover {
  background-color: #f5f5f5;
}

.item-display {
  display: none;
}
</style>
