class WebSocketClient {
  /**
   * 构造函数（改为单例模式，确保全局只有一个WS实例）
   * @param {object} options - 配置项
   */
  constructor(options = {}) {
    // 单例判断：如果已有实例，直接返回
    if (WebSocketClient.instance) {
      return WebSocketClient.instance;
    }

    // ========== 基础配置 ==========
    // this.baseUrl = "192.168.1.100"; // 你的服务器IP
    // this.port = 8080; // 你的服务器端口
    // this.fullUrl = `ws://${this.baseUrl}:${this.port}`;

    this.baseUrl = "ws.postman-echo.com/raw";
    this.port = ""; // 空字符串即可
    this.fullUrl = `wss://${this.baseUrl}`;

    // ========== 重连配置 ==========
    this.reconnectInterval = options.reconnectInterval || 3000; // 重连间隔
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10; // 最大重连次数
    this.reconnectAttempts = 0; // 当前重连次数
    this.reconnectTimer = null; // 重连定时器

    // ========== 状态管理 ==========
    this.socket = null;
    this.isConnected = false; // 连接状态
    this.isReconnecting = false; // 是否正在重连

    // ========== 回调存储 ==========
    this.messageCallbacks = []; // 改为数组，支持多页面注册回调
    this.errorCallbacks = [];
    this.openCallbacks = [];
    this.closeCallbacks = [];

    // 保存单例
    WebSocketClient.instance = this;
  }

  /**
   * 初始化WS连接（核心：增强自动重连逻辑）
   */
  connect() {
    // 关闭已有连接
    if (this.socket) {
      this.socket.close();
    }

    try {
      this.socket = new WebSocket(this.fullUrl);

      // 连接成功
      this.socket.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0; // 重置重连次数
        this.isReconnecting = false;
        console.log(`WebSocket已连接到: ${this.fullUrl}`);
        // 触发所有连接成功回调
        this.openCallbacks.forEach((callback) => callback());
      };

      // 接收消息
      this.socket.onmessage = (event) => {
        let data = event.data;
        // 自动解析JSON
        try {
          if (
            typeof data === "string" &&
            (data.startsWith("{") || data.startsWith("["))
          ) {
            data = JSON.parse(data);
          }
        } catch (e) {}
        // 触发所有消息回调
        this.messageCallbacks.forEach((callback) => callback(data));
      };

      // 连接错误
      this.socket.onerror = (error) => {
        this.isConnected = false;
        console.error("WebSocket错误:", error);
        this.errorCallbacks.forEach((callback) => callback(error));
        // 自动重连
        this.attemptReconnect();
      };

      // 连接关闭
      this.socket.onclose = (event) => {
        this.isConnected = false;
        console.log(`WebSocket已关闭: ${event.code} - ${event.reason}`);
        this.closeCallbacks.forEach((callback) => callback(event));
        // 非手动关闭（event.code !== 1000）且未达最大重连次数，自动重连
        if (
          event.code !== 1000 &&
          !this.isReconnecting &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.attemptReconnect();
        }
      };
    } catch (error) {
      console.error("创建WebSocket连接失败:", error);
      this.attemptReconnect();
    }
  }

  /**
   * 尝试重连（增强版）
   */
  attemptReconnect() {
    // 已达最大重连次数，停止重连
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("已达到最大重连次数，停止重连");
      this.isReconnecting = false;
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;
    console.log(
      `尝试重连(${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    // 清除原有定时器，避免重复重连
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * 发送数据（新增：发送前校验连接状态）
   * @param {any} data - 要发送的数据
   * @returns {boolean} - 发送是否成功
   */
  send(data) {
    // 发送前校验：未连接则直接返回失败
    if (!this.isConnected || !this.socket) {
      console.error("WebSocket未连接，无法发送数据");
      return false;
    }

    try {
      let sendData;
      switch (typeof data) {
        case "object":
          sendData = data === null ? "null" : JSON.stringify(data);
          break;
        case "string":
          sendData = data;
          break;
        case "number":
        case "boolean":
          sendData = String(data);
          break;
        case "undefined":
          sendData = "undefined";
          break;
        default:
          sendData = String(data);
          break;
      }

      this.socket.send(sendData);
      console.log("发送数据:", data);
      return true;
    } catch (error) {
      console.error("发送数据失败:", error);
      return false;
    }
  }

  /**
   * 手动关闭连接（标记为手动关闭，避免重连）
   */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.socket) {
      this.socket.close(1000, "手动关闭连接"); // 1000表示正常关闭
      this.socket = null;
    }
    this.isConnected = false;
    this.isReconnecting = false;
  }

  /**
   * 注册回调（支持多页面注册）
   */
  onMessage(callback) {
    if (
      typeof callback === "function" &&
      !this.messageCallbacks.includes(callback)
    ) {
      this.messageCallbacks.push(callback);
    }
  }

  onOpen(callback) {
    if (
      typeof callback === "function" &&
      !this.openCallbacks.includes(callback)
    ) {
      this.openCallbacks.push(callback);
    }
  }

  onError(callback) {
    if (
      typeof callback === "function" &&
      !this.errorCallbacks.includes(callback)
    ) {
      this.errorCallbacks.push(callback);
    }
  }

  onClose(callback) {
    if (
      typeof callback === "function" &&
      !this.closeCallbacks.includes(callback)
    ) {
      this.closeCallbacks.push(callback);
    }
  }

  /**
   * 移除回调（页面卸载时调用，避免内存泄漏）
   */
  offMessage(callback) {
    this.messageCallbacks = this.messageCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  offOpen(callback) {
    this.openCallbacks = this.openCallbacks.filter((cb) => cb !== callback);
  }

  offError(callback) {
    this.errorCallbacks = this.errorCallbacks.filter((cb) => cb !== callback);
  }

  offClose(callback) {
    this.closeCallbacks = this.closeCallbacks.filter((cb) => cb !== callback);
  }

  /**
   * 获取当前连接状态
   */
  getStatus() {
    return this.isConnected;
  }
}

// 创建全局单例实例
const wsClient = new WebSocketClient({
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
});

export default wsClient;
