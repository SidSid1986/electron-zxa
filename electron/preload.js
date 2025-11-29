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
