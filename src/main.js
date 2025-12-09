/*
 * @Author: Sid Li
 * @Date: 2025-12-08 08:30:08
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-09 15:49:33
 * @FilePath: \zi-xiao-ai\src\main.js
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
import XPack_WebSocket from "@/utils/ws";

// 2. 实例化 WebSocket 并配置参数（按需调整）
const webSocketInstance = new XPack_WebSocket(
  6789, // 端口号
  {
    heartBeatEnable: false,
    messageCountEnable: true,
  }
);

// ：先执行REM适配，再挂载Vue避免重绘
// 兼容Electron/浏览器环境，确保document存在
if (typeof document !== "undefined") {
  setupRemAdaptation(); // 直接执行，无需等DOMContentLoaded
}

// 项目启动即连接WebSocket（兼容Electron/浏览器）
// 确保WebSocket在应用启动时就建立连接
if (typeof window !== "undefined") {
  // 启动WS连接
  webSocketInstance.Connect();
}

//  确保DOM完全就绪后再挂载避免挂载时DOM未渲染
function bootstrapApp() {
  const app = createApp(App);
  app.use(store);
  app.use(ElementPlus);
  app.use(router);

  // 全局注册WebSocket实例（Vue3推荐的provide/inject方式）
  app.provide("$ws", webSocketInstance);

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
