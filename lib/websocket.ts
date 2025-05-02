import { io, Socket } from 'socket.io-client';

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private eventCallbacks: { [event: string]: ((data: any) => void)[] } = {};
  private isConnecting = false;
  private isInitialized = false;
  private intervals: NodeJS.Timeout[] = []; // เก็บ interval เพื่อ cleanup

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
        this.initializeEvents();
        this.isInitialized = true;
      }
      console.log('[WebSocket] Connected to WebSocket server');

      // เพิ่ม event listeners ที่ค้างอยู่ใน eventCallbacks
      Object.keys(this.eventCallbacks).forEach((event) => {
        this.eventCallbacks[event].forEach((callback) => {
          this.socket?.on(event, callback);
        });
      });
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
  }

  private initializeEvents() {
    // ตรวจสอบว่า socket มีอยู่และเชื่อมต่อแล้ว
    if (!this.socket || !this.socket.connected) return;

    this.on('emergency', (data) => {
      this.eventCallbacks['emergency']?.forEach((cb) => cb(data));
    });

    this.on('status-update', (data) => {
      this.eventCallbacks['status-update']?.forEach((cb) => cb(data));
    });

    this.on('notification', (data) => {
      this.eventCallbacks['notification']?.forEach((cb) => cb(data));
    });
  }

  private async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.handleDisconnect();
      return;
    }

    if (this.isConnecting) return; // ป้องกันการ reconnect ซ้ำ

    this.reconnectAttempts++;
    console.log(`[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

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
  }

  private handleDisconnect() {
    console.error('[WebSocket] Max reconnect attempts reached. Please refresh the page.');
    if (this.onDisconnectCallback) {
      this.onDisconnectCallback();
    }
    this.disconnect();
  }

  private onDisconnectCallback: (() => void) | null = null;
  onDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback;
  }

  offDisconnect(callback: () => void) {
    if (this.onDisconnectCallback === callback) {
      this.onDisconnectCallback = null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.isInitialized = false;
    this.reconnectAttempts = 0;

    // ล้าง intervals ทั้งหมด
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];

    // ล้าง eventCallbacks
    this.eventCallbacks = {};
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.eventCallbacks[event]) {
      this.eventCallbacks[event] = [];
    }

    const alreadyAdded = this.eventCallbacks[event].includes(callback);
    if (!alreadyAdded) {
      this.eventCallbacks[event].push(callback);

      if (this.socket && this.socket.connected) {
        this.socket.on(event, callback);
      } else {
        const checkConnection = () => {
          if (this.socket && this.socket.connected) {
            this.socket.on(event, callback);
            clearInterval(interval);
            this.intervals = this.intervals.filter((i) => i !== interval);
          }
        };
        const interval = setInterval(checkConnection, 500);
        this.intervals.push(interval);
      }
    }
  }

  off(event: string, callback: (data: any) => void) {
    if (this.eventCallbacks[event]) {
      this.eventCallbacks[event] = this.eventCallbacks[event].filter((cb) => cb !== callback);
      if (this.socket && this.socket.connected) {
        this.socket.off(event, callback); // ลบ event listener ออกจาก socket
      }
    }
  }

  onEmergency(callback: (data: any) => void) {
    this.on('emergency', callback);
  }

  offEmergency(callback: (data: any) => void) {
    this.off('emergency', callback);
  }

  onStatusUpdate(callback: (data: any) => void) {
    this.on('status-update', callback);
  }

  offStatusUpdate(callback: (data: any) => void) {
    this.off('status-update', callback);
  }
}

export const webSocketClient = new WebSocketClient();