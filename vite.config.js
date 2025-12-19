import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from '@vitejs/plugin-vue-jsx'
import viteImagemin from "vite-plugin-imagemin";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import postCssPxToRem from "postcss-pxtorem";
import { resolve } from "path";
import ElementPlus from "unplugin-element-plus/vite";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return defineConfig({
    resolve: {
      alias: [{ find: "@", replacement: resolve(__dirname, "./src") }],
    },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
          javascriptEnabled: true,
        },
      },
      postcss: {
        plugins: [
          postCssPxToRem({
            rootValue: 10,

            propList: ["*", "!border"],

            selectorBlackList: ["norem"],
            unitPrecision: 5,
            replace: true,
            mediaQuery: true,
            minPixelValue: 2,
          }),
        ],
      },
    },

    optimizeDeps: {
      include: ["element-plus", "@element-plus/icons-vue"],
    },
    plugins: [
      vue(),
      vueJsx(),
      viteImagemin({
        optipng: { optimizationLevel: 7 },
        gifsicle: { optimizationLevel: 3 },
        pngquant: { quality: [0.6, 0.8] },
      }),
      //  Element Plus 插件强制使用源码，关闭自动样式注入
      ElementPlus({
        useSource: true,
        // 关闭自动导入样式，交给 main.js 全局引入
        importStyle: false,
      }),
      //  自动导入仅导入 API，不导入样式
      AutoImport({
        resolvers: [ElementPlusResolver({ importStyle: false })],
        imports: ["vue", "vue-router", "pinia"],
        dts: false,
      }),
      //  组件自动导入仅注册组件，不导入样式
      Components({
        resolvers: [ElementPlusResolver({ importStyle: false })],
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
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ["console.log", "console.debug"],
        },
      },
      rollupOptions: {
        output: {
          assetFileNames: "assets/[name].[hash].[ext]",
          chunkFileNames: "assets/[name].[hash].js",
          entryFileNames: "assets/[name].[hash].js",
          manualChunks: {
            vue: ["vue", "vue-router", "pinia"],
            elementPlus: ["element-plus"],
            utils: ["axios", "crypto-js"],
          },
        },
      },
      sourcemap: false,
    },
    assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif"],
  });
};
