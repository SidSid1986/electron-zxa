/*
 * @Author: Sid Li
 * @Date: 2025-09-28 16:34:05
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-11-29 10:33:34
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
