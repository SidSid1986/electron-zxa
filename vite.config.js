import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import viteImagemin from "vite-plugin-imagemin";
import AutoImport from "unplugin-auto-import/vite"; // 启用自动导入
import Components from "unplugin-vue-components/vite"; // 启用组件自动导入
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import postCssPxToRem from "postcss-pxtorem";
import { resolve } from "path";
import ElementPlus from "unplugin-element-plus/vite";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return defineConfig({
    resolve: {
      alias: [
        {
          find: "@",
          replacement: resolve(__dirname, "./src"),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
          javascriptEnabled: true,
          additionalData: `@use "@/styles/element/index.scss" as *;`,
        },
      },
      postcss: {
        plugins: [
          postCssPxToRem({
            rootValue: 192,
            propList: ["*", "!border"],
            selectorBlackList: ["norem"],
            unitPrecision: 5,
            replace: true,
            mediaQuery: true,
            minPixelValue: 0,
          }),
        ],
      },
    },

    optimizeDeps: {
      include: ["element-plus", "@element-plus/icons-vue"],
    },
    plugins: [
      vue(),
      viteImagemin({
        optipng: { optimizationLevel: 7 }, // 提升图片压缩级别
        gifsicle: { optimizationLevel: 3 },
        pngquant: { quality: [0.6, 0.8] },
      }),
      ElementPlus({
        useSource: true,
      }),
      // 自动导入Element Plus API，减少代码体积
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: ["vue", "vue-router", "pinia"],
        dts: false, // 关闭类型生成，减小体积
      }),
      // 自动导入组件，实现按需加载
      Components({
        resolvers: [ElementPlusResolver({ importStyle: "sass" })],
        dts: false,
      }),
    ],

    base: mode === "production" ? "./" : "/",
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target: env.VITE_APP_API_HOST,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "api"),
        },
      },
    },

    build: {
      assetsInlineLimit: 4096,
      assetsDir: "assets",
      outDir: "dist",
      minify: "terser", // 使用terser压缩，效果更好
      terserOptions: {
        // 新增：代码压缩配置
        compress: {
          drop_console: true, // 移除console
          drop_debugger: true, // 移除debugger
          pure_funcs: ["console.log", "console.debug"],
        },
      },
      rollupOptions: {
        output: {
          assetFileNames: "assets/[name].[hash].[ext]",
          chunkFileNames: "assets/[name].[hash].js",
          entryFileNames: "assets/[name].[hash].js",
          // 新增：代码分割，减小首屏加载体积
          manualChunks: {
            vue: ["vue", "vue-router", "pinia"],
            elementPlus: ["element-plus"],
            utils: ["axios", "crypto-js"],
          },
        },
      },
      sourcemap: false, // 关闭sourcemap，大幅减小体积
    },
    assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif"],
  });
};
