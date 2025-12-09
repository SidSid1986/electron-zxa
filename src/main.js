/*
 * @Author: Sid Li
 * @Date: 2025-12-08 08:30:08
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-09 11:04:36
 * @FilePath: \ai\src\main.js
 * @Description:
 */
import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "@/styles/main.scss";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "@/styles/free-icons/iconfont.css";
import router from "@/router/index.js";
import store from "@/store";
import { setupRemAdaptation } from "@/utils/rem";

// 引入改造后的WebSocket单例实例
import wsClient from "@/utils/ws";

// ：先执行REM适配，再挂载Vue避免重绘
// 兼容Electron/浏览器环境，确保document存在
if (typeof document !== "undefined") {
  setupRemAdaptation(); // 直接执行，无需等DOMContentLoaded
}

// 项目启动即连接WebSocket（兼容Electron/浏览器）
// 确保WebSocket在应用启动时就建立连接
if (typeof window !== "undefined") {
  // 启动WS连接
  wsClient.connect();

  // // 页面关闭/刷新时断开WS（避免无效连接）
  // window.addEventListener("beforeunload", () => {
  //   wsClient.disconnect();
  // });
}

//  确保DOM完全就绪后再挂载避免挂载时DOM未渲染
function bootstrapApp() {
  const app = createApp(App);
  app.use(store);
  app.use(ElementPlus);
  app.use(router);

  // 全局注册WebSocket实例（Vue3推荐的provide/inject方式）
  app.provide("$ws", wsClient);

  // 注册图标组件
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
  // app.use(XPack_WebSocketDefault);
  // 挂载前确认#app存在，避免挂载失败
  const appDom = document.getElementById("app");
  if (appDom) {
    app.mount(appDom);
  } else {
    //  DOM未加载时延迟挂载
    setTimeout(bootstrapApp, 100);
  }
}

// 启动应用
bootstrapApp();
