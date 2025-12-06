/**
 * Vue3 专用 WebSocket 封装
 * 内置URL和端口配置，外部使用无需传入
 */
class WebSocketClient {
  /**
   * 构造函数
   * @param {object} options - 配置项（无需传入host/port/path）
   */
  constructor(options = {}) {
    this.host = "192.168.3.29"; // 服务器地址
    this.port = "6789"; // 端口号
    this.path = "/ws"; // 接口路径
    this.url = this._buildUrl();

    // 重连配置
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.reconnectAttempts = 0;

    // 状态管理（适配Vue3响应式）
    this.ws = null;
    this.isConnected = false;
    this.reconnectTimer = null;
    this.messageQueue = []; // 离线消息队列

    // 回调函数
    this.callbacks = {
      message: null,
      error: null,
      close: null,
      open: null,
    };
  }

  /**
   * 构建连接URL
   * @private
   */
  _buildUrl() {
    const portStr = this.port ? `:${this.port}` : "";
    return `ws://${this.host}${portStr}${this.path}`;
  }

  /**
   * 建立连接
   */
  connect() {
    if (this.ws) {
      this.ws.close();
    }

    try {
      this.ws = new WebSocket(this.url);

      // 连接成功
      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log("[WebSocket] 连接成功");

        // 发送离线消息队列中的消息
        this._flushMessageQueue();

        if (this.callbacks.open) {
          this.callbacks.open();
        }
      };

      // 接收消息
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.callbacks.message) {
            this.callbacks.message(data);
          }
        } catch (e) {
          if (this.callbacks.message) {
            this.callbacks.message(event.data);
          }
        }
      };

      // 连接错误
      this.ws.onerror = (error) => {
        console.error("[WebSocket] 错误:", error);
        this.isConnected = false;
        if (this.callbacks.error) {
          this.callbacks.error(error);
        }
        this._scheduleReconnect();
      };

      // 连接关闭
      this.ws.onclose = (event) => {
        console.log("[WebSocket] 连接关闭:", event.code, event.reason);
        this.isConnected = false;
        if (this.callbacks.close) {
          this.callbacks.close(event);
        }
        if (
          event.code !== 1000 &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this._scheduleReconnect();
        }
      };
    } catch (error) {
      console.error("[WebSocket] 创建连接失败:", error);
      this._scheduleReconnect();
    }
  }

  /**
   * 调度重连
   * @private
   */
  _scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[WebSocket] 达到最大重连次数");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `[WebSocket] ${this.reconnectInterval}ms后进行第${this.reconnectAttempts}次重连`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * 发送消息（支持离线队列）
   * @param {any} data - 要发送的数据
   * @returns {boolean}
   */
  send(data) {
    // 未连接时加入消息队列
    if (!this.isConnected || !this.ws) {
      console.warn("[WebSocket] 未连接，消息已加入队列");
      this.messageQueue.push(data);
      return false;
    }

    try {
      const sendData =
        typeof data === "object" ? JSON.stringify(data) : String(data);
      this.ws.send(sendData);
      console.log("[WebSocket] 发送消息:", sendData);
      return true;
    } catch (error) {
      console.error("[WebSocket] 发送失败:", error);
      this.messageQueue.push(data);
      return false;
    }
  }

  /**
   * 刷新消息队列
   * @private
   */
  _flushMessageQueue() {
    if (this.messageQueue.length === 0) return;

    console.log(`[WebSocket] 发送队列中的${this.messageQueue.length}条消息`);
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      this.send(msg);
    }
  }

  /**
   * 关闭连接
   * @param {number} code - 关闭码
   * @param {string} reason - 关闭原因
   */
  close(code = 1000, reason = "手动关闭") {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.ws) {
      this.ws.close(code, reason);
    }

    this.isConnected = false;
    this.messageQueue = [];
  }

  /**
   * 注册回调
   * @param {object} handlers - 回调函数集合
   */
  on(handlers) {
    Object.keys(handlers).forEach((key) => {
      if (this.callbacks.hasOwnProperty(key)) {
        this.callbacks[key] = handlers[key];
      }
    });
  }

  /**
   * 获取连接状态
   * @returns {boolean}
   */
  getStatus() {
    return this.isConnected;
  }
}

// 创建全局实例（可选，方便整个项目使用同一连接）
let globalWsClient = null;

/**
 * 初始化全局WebSocket实例（无需传入URL/端口）
 * @param {object} options - 配置项（仅重连相关）
 * @returns {WebSocketClient}
 */
export function initWebSocket(options = {}) {
  if (!globalWsClient) {
    globalWsClient = new WebSocketClient(options);
  }
  return globalWsClient;
}

/**
 * 获取全局WebSocket实例
 * @returns {WebSocketClient|null}
 */
export function getWebSocketInstance() {
  return globalWsClient;
}

export default WebSocketClient;
