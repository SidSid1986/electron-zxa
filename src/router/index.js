/*
 * @Author: Sid Li
 * @Date: 2025-09-28 16:34:05
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-01 14:56:41
 * @FilePath: \ai\src\router\index.js
 * @Description:
 */
import { createWebHashHistory, createRouter } from "vue-router";
import { encrypt, decrypt } from "@/utils/crypto";

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
];

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 路由守卫逻辑
// router.beforeEach((to, from, next) => {

// });

export default router;
