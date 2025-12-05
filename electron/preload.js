const { contextBridge, ipcRenderer } = require("electron");

// 安全检查 - 确保只暴露需要的API
try {
  contextBridge.exposeInMainWorld("electronAPI", {
    // 窗口控制方法
    minimizeWindow: () => {
      try {
        ipcRenderer.send("window-minimize");
      } catch (error) {
        console.error("Minimize window error:", error);
      }
    },
    maximizeWindow: () => {
      try {
        ipcRenderer.send("window-maximize");
      } catch (error) {
        console.error("Maximize window error:", error);
      }
    },
    closeWindow: () => {
      try {
        ipcRenderer.send("window-close");
      } catch (error) {
        console.error("Close window error:", error);
      }
    },

    // ===================== 新增：通用invoke方法（核心） =====================
    // 用于调用主进程的ipcMain.handle处理函数（兼容音量/音乐文件等）
    invoke: (channel, ...args) => {
      try {
        // 安全白名单 - 只允许指定的通道，防止恶意调用
        const validChannels = [
          'get-system-volume',   // 原有音量相关
          'set-system-volume',   // 原有音量相关
          'get-music-files'      // 新增音乐文件相关
        ];
        
        if (validChannels.includes(channel)) {
          // 调用ipcRenderer.invoke并返回Promise
          return ipcRenderer.invoke(channel, ...args);
        } else {
          console.error(`Invalid channel: ${channel} (not in whitelist)`);
          return Promise.reject(new Error(`Invalid channel: ${channel}`));
        }
      } catch (error) {
        console.error(`Invoke error for channel ${channel}:`, error);
        return Promise.reject(error);
      }
    },
    // ===================== 新增：快捷方法（可选，简化调用） =====================
    // 音乐文件获取快捷方法（可直接调用，无需传通道名）
    getMusicFiles: () => {
      try {
        return ipcRenderer.invoke('get-music-files');
      } catch (error) {
        console.error("Get music files error:", error);
        return Promise.reject(error);
      }
    },
    // ===================== 新增结束 =====================

    // 内存使用监听
    onMemoryUsage: (callback) => {
      if (typeof callback === "function") {
        const listener = (_, data) => {
          try {
            // 确保数据有默认值
            const safeData = data || { used: "0", total: "0" };
            callback(safeData);
          } catch (error) {
            console.error("Memory usage listener error:", error);
          }
        };
        ipcRenderer.on("memory-usage", listener);
        // 返回移除监听的方法
        return () => ipcRenderer.off("memory-usage", listener);
      }
    },

    // 全屏状态监听
    onFullScreenStatus: (callback) => {
      if (typeof callback === "function") {
        const listener = (_, data) => {
          try {
            const safeData = data || { isFullScreen: false };
            callback(safeData);
          } catch (error) {
            console.error("Fullscreen status listener error:", error);
          }
        };
        ipcRenderer.on("fullscreen-status", listener);
        return () => ipcRenderer.off("fullscreen-status", listener);
      }
    },

    // 移除所有监听
    removeAllListeners: () => {
      try {
        ipcRenderer.removeAllListeners("memory-usage");
        ipcRenderer.removeAllListeners("fullscreen-status");
      } catch (error) {
        console.error("Remove listeners error:", error);
      }
    },
  });

  console.log("Electron API exposed successfully");
} catch (error) {
  console.error("Failed to expose Electron API:", error);
}