/*
 * @Author: Sid Li
 * @Date: 2025-11-29 10:30:04
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-06 14:02:00
 * @FilePath: \ai\src\router\index.js
 * @Description:
 */
import { createWebHashHistory, createRouter } from "vue-router";

// 路由配置
const routes = [
  {
    path: "/",
    name: "/",
    redirect: "/load",
  },
  {
    path: "/load",
    name: "Load",
    component: () => import("@/views/load.vue"),
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("@/views/home.vue"),
  },

  {
    path: "/check",
    name: "Check",
    component: () => import("@/views/check.vue"),
  },
  {
    path: "/main",
    name: "Main",
    component: () => import("@/views/main.vue"),
  },
  {
    path: "/point",
    name: "Point",
    component: () => import("@/views/point.vue"),
  },
  {
    path: "/setting",
    name: "Setting",
    component: () => import("@/views/setting.vue"),
  },

  {
    path: "/userConfirm",
    name: "userConfirm",
    component: () => import("@/views/userConfirm.vue"),
  },
  {
    path: "/treat",
    name: "Treat",
    component: () => import("@/views/treat.vue"),
  },
];

// 在router/index.js的createRouter中添加
const router = createRouter({
  history: createWebHashHistory(), // 若不想改history模式，保留hash也可
  routes,
  // 跳转时重置滚动条，避免额外重绘
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0, left: 0 };
  },
});

// 路由守卫逻辑
// router.beforeEach((to, from, next) => {

// });

export default router;
