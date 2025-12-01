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

// 优化：DOM 加载完成后再执行适配（避免 document 未定义）
document.addEventListener("DOMContentLoaded", () => {
  setupRemAdaptation(); // 执行 rem 适配
});

const app = createApp(App);
app.use(store);
app.use(ElementPlus);
app.use(router);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount("#app");
