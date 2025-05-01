import { io, Socket } from 'socket.io-client';

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private eventCallbacks: { [event: string]: ((data: any) => void)[] } = {};
  private isConnecting = false; // ป้องกันการ connect ซ้ำ
  private isInitialized = false; // ป้องกันการ subscribe ซ้ำ

  connect(token: string) {
    if (this.isConnecting || (this.socket && this.socket.connected)) {
      return;
    }

    if (this.socket) {
      this.disconnect();
    }

    this.isConnecting = true;
    console.log('Socket กำลังทำงานอยู่...');

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    this.socket = io(`${wsUrl}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: false,
    });

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      if (!this.isInitialized) {
        this.initializeEvents(); // เรียก subscribe event เพียงครั้งเดียว
        this.isInitialized = true;
      }
      console.log('[WebSocket] Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected from WebSocket server');
      this.isConnecting = false;
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error.message);
      this.isConnecting = false;
      this.handleReconnect();
    });

    this.socket.on('error', (error) => {
      console.error('[WebSocket] Error:', error);
      if (error === 'Invalid token') {
        console.error('[WebSocket] Invalid token. Please login again.');
        this.handleDisconnect();
      }
    });

    this.socket.onAny(() => {
      // ไม่ log event data เพื่อลดการแสดงผล
    });
  }

  private initializeEvents() {
    // ฟังก์ชันนี้จะถูกเรียกเพียงครั้งเดียวเมื่อ connect ครั้งแรก
    this.on('emergency', (data) => {
      if (this.eventCallbacks['emergency']) {
        this.eventCallbacks['emergency'].forEach((callback) => callback(data));
      }
    });

    this.on('status-update', (data) => {
      if (this.eventCallbacks['status-update']) {
        this.eventCallbacks['status-update'].forEach((callback) => callback(data));
      }
    });

    this.on('notification', (data) => {
      if (this.eventCallbacks['notification']) {
        this.eventCallbacks['notification'].forEach((callback) => callback(data));
      }
    });
  }

  private async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.handleDisconnect();
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('[WebSocket] No token available. Please login again.');
        this.handleDisconnect();
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/verify-token`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          this.connect(token);
        } else {
          console.error('[WebSocket] Invalid token. Please login again.');
          this.handleDisconnect();
        }
      } catch (err) {
        console.error('[WebSocket] Error verifying token:', err);
        this.handleDisconnect();
      }
    }, this.reconnectInterval);
  }

  private handleDisconnect() {
    console.error('[WebSocket] Max reconnect attempts reached. Please refresh the page.');
    if (this.onDisconnectCallback) {
      this.onDisconnectCallback();
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.isInitialized = false; // รีเซ็ตเพื่อให้สามารถ initialize ใหม่ได้เมื่อ reconnect
  }

  private onDisconnectCallback: (() => void) | null = null;
  onDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.isInitialized = false;
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.eventCallbacks[event]) {
      this.eventCallbacks[event] = [];
    }
    this.eventCallbacks[event].push(callback);

    if (this.socket && this.socket.connected) {
      this.socket.on(event, callback);
    } else {
      const checkConnection = () => {
        if (this.socket && this.socket.connected) {
          this.socket.on(event, callback);
          clearInterval(interval);
        }
      };
      const interval = setInterval(checkConnection, 500);
    }
  }

  onEmergency(callback: (data: any) => void) {
    this.on('emergency', callback);
  }

  onStatusUpdate(callback: (data: any) => void) {
    this.on('status-update', callback);
  }
}

export const webSocketClient = new WebSocketClient();