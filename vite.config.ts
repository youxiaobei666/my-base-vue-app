import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
const defaultConfig = {
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
};

export default defineConfig(({ mode }) => {
  // 只在开发环境下进行跨域代理
  if (mode === "development") {
    // 获取环境参数, 配置跨域代理
    const { plugins, ...restConfig } = defaultConfig;
    const { VITE_PROXY_BASE_URL: target } = loadEnv(mode, process.cwd());
    return {
      server: {
        proxy: {
          "/txMap": {
            target: target,
            changeOrigin: true,
            rewrite: (path) => path.replace(/\/txMap/, ""),
          },
        },
      },
      plugins: [...plugins],
      ...restConfig,
    };
  }
  return defaultConfig;
});
