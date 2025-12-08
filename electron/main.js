/*
 * @Author: Sid Li
 * @Date: 2025-11-29 13:33:24
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-12-08 20:36:36
 * @FilePath: \electron-zxa\electron\main.js
 * @Description: 基于loudness库的跨平台音量控制主进程代码
 */
const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { exec } = require("child_process"); // 用于系统命令执行
const { pathToFileURL } = require("url");

// 1. 先创建日志目录
const logDir = path.join(app.getPath("userData"), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 2. 定义 log 函数
function log(message) {
  const logPath = path.join(logDir, "app.log");
  const logMessage = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(logPath, logMessage);
  console.log(logMessage.trim());
}

// ===================== ARM64 Linux 适配 =====================
// 禁用GPU和沙箱（解决ARM64 Linux段错误）
if (process.platform === "linux" && os.arch() === "arm64") {
  app.commandLine.appendSwitch("no-sandbox"); // ARM64 Linux必须
  app.commandLine.appendSwitch("disable-gpu"); // 禁用GPU避免依赖问题
  app.commandLine.appendSwitch("disable-software-rasterizer"); // 额外兼容
  log("ARM64 Linux环境检测到，已启用兼容模式");
}

// ===================== 依赖加载检查 =====================
// 安全加载loudness库，避免依赖缺失导致崩溃
let loudness = null;
try {
  loudness = require("loudness");
  log("loudness库加载成功");
} catch (error) {
  log(`loudness库加载失败: ${error.message}`);
  log("音量控制功能将不可用，请重新安装依赖：npm install loudness");
  // 提供降级方案，避免应用崩溃
  loudness = {
    getVolume: async () => 0.5,
    setVolume: async () => {},
  };
}

// 开发环境标识
const isDev = process.env.NODE_ENV === "development";
log(
  `应用启动，环境：${isDev ? "开发" : "生产"}，系统：${
    process.platform
  }，架构：${os.arch()}`
);

// 保持对窗口对象的全局引用
let mainWindow;

// ===================== 音乐文件处理函数 =====================
/**
 * 获取音乐文件列表（适配开发/生产环境）
 * @returns {Array} 音乐文件的绝对路径列表
 */
function getMusicFiles() {
  try {
    const candidates = [];

    if (app.isPackaged) {
      candidates.push(
        path.join(process.resourcesPath, "app.asar.unpacked", "public", "music")
      );
      candidates.push(path.join(process.resourcesPath, "public", "music"));
      candidates.push(path.join(__dirname, "../public/music"));
    } else {
      candidates.push(path.join(app.getAppPath(), "public/music"));
    }

    log(`getMusicFiles: 尝试候选目录: ${JSON.stringify(candidates)}`);

    let musicDir = null;
    for (const c of candidates) {
      if (fs.existsSync(c) && fs.statSync(c).isDirectory()) {
        musicDir = c;
        break;
      }
    }

    if (!musicDir) {
      log(`音乐目录未找到，候选目录均不存在`);
      return [];
    }

    log(`读取音乐目录：${musicDir}`);

    //  用 fs.readdirSync 的 withFileTypes 模式，避免编码丢失
    const files = fs
      .readdirSync(musicDir, { withFileTypes: true })
      .filter(
        (dirent) =>
          dirent.isFile() &&
          dirent.name.toLowerCase().endsWith(".mp3") &&
          !dirent.name.startsWith(".")
      )
      .map((dirent) => dirent.name); // 直接获取原始文件名

    const result = [];
    for (const fileName of files) {
      try {
        //   拼接路径，
        const fullPath = path.join(musicDir, fileName);
        //  正确处理中文文件名的 URL 转换
        const fileUrl = new URL(`file:///${fullPath.replace(/\\/g, "/")}`).href;
        //  原始 fileName
        result.push({
          name: fileName.replace(".mp3", ""), // 原始中文文件名
          url: fileUrl,
        });
      } catch (e) {
        log(`处理文件 ${fileName} 失败: ${e.message}`);
      }
    }

    log(
      `找到 ${result.length} 个音乐文件:`,
      result.map((item) => item.name)
    );
    // 包含 name 和 url 的对象
    return result;
  } catch (error) {
    log(`读取音乐文件失败: ${error.message}`);
    log(error.stack);
    return [];
  }
}

// 定期发送内存使用信息
function sendMemoryUsage() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      const memoryUsage = process.memoryUsage();
      const totalMemory = os.totalmem();
      const usedMemory = memoryUsage.heapUsed;

      const usedMemoryMB = (usedMemory / 1024 / 1024).toFixed(2);
      const totalMemoryGB = (totalMemory / 1024 / 1024 / 1024).toFixed(1);

      mainWindow.webContents.send("memory-usage", {
        used: usedMemoryMB,
        total: totalMemoryGB,
      });

      mainWindow.setTitle(`紫小艾 - 内存使用: ${usedMemoryMB}MB`);
    } catch (error) {
      log(`发送内存信息错误: ${error.message}`);
    }
  }
}

// 系统音量控制函数 - 基于loudness库的跨平台实现
async function getSystemVolume() {
  try {
    if (process.platform === "win32" || process.platform === "linux") {
      // 使用loudness库获取音量（返回0-100之间的数值）
      const volume = await loudness.getVolume();
      return volume / 100; // 转换为0-1范围
    }
    return 0.5; // 默认值
  } catch (error) {
    log(`获取系统音量失败: ${error.message}`);
    // 失败时尝试检查Linux系统依赖
    if (process.platform === "linux") {
      checkLinuxDependencies();
    }
    return 0.5;
  }
}

async function setSystemVolume(value) {
  try {
    if (process.platform === "win32" || process.platform === "linux") {
      // 将0-1范围转换为0-100
      const volume = Math.round(value * 100);
      // 确保音量在有效范围内
      const clampedVolume = Math.max(0, Math.min(100, volume));
      await loudness.setVolume(clampedVolume);
    }
  } catch (error) {
    log(`设置系统音量失败: ${error.message}`);
    // 失败时尝试检查Linux系统依赖
    if (process.platform === "linux") {
      checkLinuxDependencies();
    }
  }
}

// 检查Linux系统依赖
function checkLinuxDependencies() {
  exec("which pactl", (error) => {
    if (error) {
      log("警告: Linux系统未检测到pactl工具，音量控制可能无法正常工作");
      log(
        "请安装pulseaudio-utils: sudo apt-get install pulseaudio-utils (Ubuntu/Debian)"
      );
      log("或: sudo dnf install pulseaudio-utils (Fedora/RHEL)");
      log("或: sudo pacman -S pulseaudio-utils (Arch Linux)");
    }
  });

  // 检查human-signals依赖
  try {
    require.resolve("human-signals");
    log("human-signals依赖检查通过");
  } catch (err) {
    log("错误: human-signals模块缺失，这是loudness的核心依赖");
    log("请执行: npm install human-signals --save 修复");
  }
}

function createWindow() {
  log("开始创建窗口");

  try {
    // 创建浏览器窗口
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      frame: false,
      icon: app.isPackaged
        ? path.join(process.resourcesPath, "public/home.ico") // 生产环境
        : path.join(__dirname, "../public/home.ico"), // 开发环境
      trafficLightPosition: { x: 10, y: 10 },
      show: false, // 先隐藏，加载完成后再显示
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
        preload: path.join(__dirname, "preload.js"),
        // 安全配置
        webSecurity: true,
        allowRunningInsecureContent: false,
        devTools: true, // 开发环境下开启
        contextIsolation: true,
        nodeIntegrationInWorker: false,
        nodeIntegrationInSubFrames: false,
      },
    });

    // 设置Content-Security-Policy
    if (!isDev) {
      mainWindow.webContents.session.webRequest.onHeadersReceived(
        (details, callback) => {
          callback({
            responseHeaders: {
              ...details.responseHeaders,
              "Content-Security-Policy": [
                "default-src 'self';",
                "script-src 'self' 'unsafe-inline';",
                "style-src 'self' 'unsafe-inline';",
                "img-src 'self' data: file:;",
                "font-src 'self' data:;",
                "connect-src 'self' http://localhost:* ws://192.168.3.29:6789 ws://localhost:*;",
              ].join(" "),
            },
          });
        }
      );
    }

    // 隐藏默认菜单
    Menu.setApplicationMenu(null);

    // 加载应用
    if (isDev) {
      log("加载开发环境: http://localhost:5173");
      mainWindow.loadURL("http://localhost:5173");
      mainWindow.webContents.openDevTools();
    } else {
      const indexPath = path.join(__dirname, "../dist/index.html");
      log(`加载生产环境: ${indexPath}`);

      // 检查文件是否存在
      if (!fs.existsSync(indexPath)) {
        log(`错误: index.html 文件不存在 - ${indexPath}`);
        app.quit();
        return;
      }

      mainWindow.loadFile(indexPath);

      setTimeout(() => {
        try {
          // detach 模式：调试窗口独立显示，不影响主窗口
          mainWindow.webContents.openDevTools({ mode: "detach" });
          log("打包模式：强制打开开发者工具成功");
        } catch (error) {
          log(`打包模式打开开发者工具失败: ${error.message}`);
        }
      }, 1500);
    }

    // 窗口加载完成后显示
    mainWindow.on("ready-to-show", () => {
      log("窗口加载完成，显示窗口");
      mainWindow.show();
    });

    // 设置窗口标题
    mainWindow.setTitle("紫小艾");

    // 全屏功能
    mainWindow.webContents.on("before-input-event", (event, input) => {
      if (input.key === "F11" && !input.isAutoRepeat) {
        mainWindow.webContents.executeJavaScript(`
          document.documentElement.style.overflow = 'hidden';
          document.body.style.overflow = 'hidden';
        `);

        setTimeout(() => {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
          mainWindow.webContents.send("fullscreen-status", {
            isFullScreen: mainWindow.isFullScreen(),
          });
        }, 50);

        event.preventDefault();
      }
    });

    // 监听全屏状态变化
    mainWindow.on("enter-full-screen", () => {
      mainWindow.webContents.send("fullscreen-status", { isFullScreen: true });
    });

    mainWindow.on("leave-full-screen", () => {
      mainWindow.webContents.send("fullscreen-status", { isFullScreen: false });
    });

    // 定期发送内存使用信息
    setInterval(sendMemoryUsage, 1000);

    // 窗口控制IPC监听
    ipcMain.on("window-minimize", () => {
      mainWindow.minimize();
    });

    ipcMain.on("window-maximize", () => {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    });

    ipcMain.on("window-close", () => {
      mainWindow.close();
    });

    // 音量控制IPC监听
    ipcMain.handle("get-system-volume", async () => {
      const volume = await getSystemVolume();
      log(`获取系统音量: ${Math.round(volume * 100)}%`);
      return volume;
    });

    ipcMain.handle("set-system-volume", async (event, value) => {
      log(`设置系统音量: ${Math.round(value * 100)}%`);
      await setSystemVolume(value);
    });

    // 音乐文件IPC监听
    ipcMain.handle("get-music-files", () => {
      log("接收到获取音乐文件请求");
      return getMusicFiles();
    });

    // 窗口关闭时触发
    mainWindow.on("closed", () => {
      log("窗口关闭");
      mainWindow = null;
    });

    // 捕获窗口加载错误
    mainWindow.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription) => {
        log(`窗口加载失败: ${errorCode} - ${errorDescription}`);
      }
    );

    log("窗口创建成功");
  } catch (error) {
    log(`创建窗口错误: ${error.message}`);
    log(`错误堆栈: ${error.stack}`);
    app.quit();
  }
}

// 检查系统依赖
function checkSystemDependencies() {
  if (process.platform === "linux") {
    checkLinuxDependencies();
  }
}

// Electron 初始化完成后创建窗口
app
  .whenReady()
  .then(() => {
    log("Electron 准备就绪");
    checkSystemDependencies(); // 检查系统依赖
    createWindow();
  })
  .catch((error) => {
    log(`App ready 错误: ${error.message}`);
  });

// 所有窗口关闭时退出应用
app.on("window-all-closed", () => {
  log("所有窗口关闭");
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  log("应用激活");
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 错误处理
process.on("uncaughtException", (error) => {
  log(`未捕获异常: ${error.message}`);
  log(`异常堆栈: ${error.stack}`);
  // 新增：避免因未捕获异常直接崩溃
  if (error.message.includes("Cannot find module 'human-signals'")) {
    log("检测到human-signals模块缺失，建议执行：npm install human-signals");
  }
});

process.on("unhandledRejection", (reason, promise) => {
  log(`未处理的Promise拒绝: ${reason}`);
});

// 设置应用图标（macOS Dock图标）- 不影响Windows/Linux
if (process.platform === "darwin") {
  try {
    app.dock.setIcon(path.join(__dirname, "../public/home.png"));
  } catch (error) {
    log(`设置Dock图标错误: ${error.message}`);
  }
}

log("主进程初始化完成");
