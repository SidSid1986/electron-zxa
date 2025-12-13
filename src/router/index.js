/*
 * @Author: Sid Li
 * @Date: 2025-11-29 10:30:04
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-13 13:35:58
 * @FilePath: \zi-xiao-ai\src\router\index.js
 * @Description:
 */
import { createWebHashHistory, createRouter } from "vue-router";
import { ElMessage } from "element-plus";

const routes = [
  // 原有路由配置不变，仅修改login页的meta和守卫逻辑
  {
    path: "/",
    redirect: { name: "Load" },
  },
  {
    path: "/load",
    name: "Load",
    component: () => import("@/views/load.vue"),
    meta: {
      requiresAuth: false,
      roles: ["admin", "user", "super_admin"],
    },
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("@/views/home.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "user", "super_admin"],
    },
  },
  {
    path: "/check",
    name: "Check",
    component: () => import("@/views/check.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "user", "super_admin"],
    },
  },
  {
    path: "/main",
    name: "Main",
    component: () => import("@/views/main.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "user", "super_admin"],
    },
  },
  {
    path: "/point",
    name: "Point",
    component: () => import("@/views/point.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "user", "super_admin"],
    },
  },
  {
    path: "/setting",
    name: "Setting",
    component: () => import("@/views/setting.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "user", "super_admin"],
    },
  },
  {
    path: "/userConfirm",
    name: "userConfirm",
    component: () => import("@/views/userConfirm.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "user", "super_admin"],
    },
  },
  {
    path: "/treat",
    name: "Treat",
    component: () => import("@/views/treat.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "user", "super_admin"],
    },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login.vue"),
    meta: {
      requiresAuth: false, // 始终允许访问（无论是否登录）
      roles: ["admin", "user", "super_admin"],
    },
  },
  {
    path: "/plan",
    name: "Plan",
    component: () => import("@/views/plan.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "super_admin"],
    },
  },
  {
    path: "/newplan",
    name: "NewPlan",
    component: () => import("@/views/newPlan.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "super_admin"],
    },
  },
  {
    path: "/material",
    name: "Material",
    component: () => import("@/views/material.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "super_admin"],
    },
  },
  {
    path: "/time",
    name: "Time",
    component: () => import("@/views/time.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "super_admin"],
    },
  },
  {
    path: "/chooseType",
    name: "ChooseType",
    component: () => import("@/views/chooseType.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "super_admin"],
    },
  },
  {
    path: "/chosePoint",
    name: "ChosePoint",
    component: () => import("@/views/chosePoint.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "super_admin"],
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0, left: 0 };
  },
});

// 路由守卫逻辑（核心修改：取消login页的已登录跳转限制）
router.beforeEach((to, from, next) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userRole = userInfo.role || "";

  if (to.meta.requiresAuth) {
    // 需要登录的页面：未登录跳login，已登录放行
    if (!userInfo.username) {
      ElMessage.warning("请先登录后再访问");
      return next({ name: "Login" });
    }
    if (to.meta.roles.includes(userRole)) {
      next();
    } else {
      next(); // 暂时放行
    }
  } else {
    // 无需登录的页面（含login）：直接放行（取消login页的已登录跳转）
    next();
  }
});

export default router;
