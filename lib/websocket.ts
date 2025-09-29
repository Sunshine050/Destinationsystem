import { io, Socket } from 'socket.io-client';

class WebSocketClient {
  public socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private eventCallbacks: { [event: string]: ((data: any) => void)[] } = {};
  private isConnecting = false;
  private isInitialized = false;
  private intervals: NodeJS.Timeout[] = [];
  private onDisconnectCallback: (() => void) | null = null;

  async connect(token?: string) {
    if (this.isConnecting || (this.socket && this.socket.connected)) return;

    this.disconnect();
    this.isConnecting = true;
    console.log('[WebSocket] Connecting to WebSocket server...');

    // ดึง token ล่าสุดจาก localStorage ถ้าไม่ได้ส่งเข้ามา
    if (!token) token = localStorage.getItem('access_token') || '';
    if (!token) {
      console.error('[WebSocket] ❌ No token found. Aborting connection.');
      this.handleDisconnect();
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: false,
      path: '/socket.io',
    });

    // Connect event
    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.isConnecting = false;

      if (!this.isInitialized) {
        this.initializeEvents();
        this.isInitialized = true;
      }

      console.log('[WebSocket] ✅ Connected to WebSocket server');

      Object.keys(this.eventCallbacks).forEach((event) => {
        this.eventCallbacks[event].forEach((callback) => this.socket?.on(event, callback));
      });
    });

    // Disconnect event
    this.socket.on('disconnect', (reason) => {
      console.log(`[WebSocket] 🔌 Disconnected (${reason})`);
      this.isConnecting = false;
      if (reason !== 'io client disconnect') this.handleReconnect();
    });

    // Connect error event
    this.socket.on('connect_error', (error: any) => {
      console.error('[WebSocket] ❌ Connection error:', error.message);
      this.isConnecting = false;
      this.handleReconnect();
    });

    // Authentication error event
    this.socket.on('error', (error: any) => {
      console.error('[WebSocket] Error:', error);
      if (error?.message === 'Authentication failed') {
        console.error('[WebSocket] ❌ Invalid token. Please login again.');
        this.handleDisconnect();
      }
    });
  }

  private initializeEvents() {
    if (!this.socket || !this.socket.connected) return;

    ['emergency', 'statusUpdate', 'notification', 'message'].forEach((event) => {
      this.on(event, (data) => {
        this.eventCallbacks[event]?.forEach((cb) => cb(data));
      });
    });
  }

  private async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.handleDisconnect();
      return;
    }
    if (this.isConnecting) return;

    this.reconnectAttempts++;
    console.log(`[WebSocket] 🔁 Attempting reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    const token = localStorage.getItem('access_token');
    if (!token) return this.handleDisconnect();

    try {
      // ตรวจสอบ token ก่อน connect ใหม่
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        // delay นิดหน่อยก่อน connect ใหม่
        setTimeout(() => this.connect(token), 1000);
      } else {
        this.handleDisconnect();
      }
    } catch (err) {
      console.error('[WebSocket] Error verifying token:', err);
      this.handleDisconnect();
    }
  }

  private handleDisconnect() {
    console.error('[WebSocket] ⚠️ Max reconnect attempts reached or invalid token.');
    this.onDisconnectCallback?.();
    this.disconnect();
  }

  onDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback;
  }

  offDisconnect(callback: () => void) {
    if (this.onDisconnectCallback === callback) this.onDisconnectCallback = null;
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
    this.socket = null;
    this.isConnecting = false;
    this.isInitialized = false;
    this.reconnectAttempts = 0;

    this.intervals.forEach((i) => clearInterval(i));
    this.intervals = [];
    this.eventCallbacks = {};
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.eventCallbacks[event]) this.eventCallbacks[event] = [];

    if (!this.eventCallbacks[event].includes(callback)) {
      this.eventCallbacks[event].push(callback);

      if (this.socket && this.socket.connected) {
        this.socket.on(event, callback);
      } else {
        const interval = setInterval(() => {
          if (this.socket && this.socket.connected) {
            this.socket.on(event, callback);
            clearInterval(interval);
            this.intervals = this.intervals.filter((i) => i !== interval);
          }
        }, 500);
        this.intervals.push(interval);
      }
    }
  }

  off(event: string, callback: (data: any) => void) {
    if (!this.eventCallbacks[event]) return;
    this.eventCallbacks[event] = this.eventCallbacks[event].filter((cb) => cb !== callback);
    if (this.socket && this.socket.connected) this.socket.off(event, callback);
  }
}

export const webSocketClient = new WebSocketClient();
