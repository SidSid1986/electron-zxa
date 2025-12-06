/*
 * @Author: Sid Li
 * @Date: 2025-11-29 10:30:03
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-06 17:01:40
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
import XPack_WebSocketDefault from "@/utils/ws.js";

//  ：先执行REM适配，再挂载Vue避免重绘
// 兼容Electron/浏览器环境，确保document存在
if (typeof document !== "undefined") {
  setupRemAdaptation(); // 直接执行，无需等DOMContentLoaded
}

//  确保DOM完全就绪后再挂载避免挂载时DOM未渲染
function bootstrapApp() {
  const app = createApp(App);
  app.use(store);
  app.use(ElementPlus);
  app.use(router);

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
