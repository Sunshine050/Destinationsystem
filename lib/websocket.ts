import { io, Socket } from 'socket.io-client';

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  connect(token: string) {
    if (this.socket && this.socket.connected) {
      return;
    }

    if (this.socket) {
      this.disconnect();
    }

    console.log('Socket กำลังทำงานอยู่...');

    this.socket = io(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/notifications`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: false,
    });

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      if (typeof window !== 'undefined') {
        console.log('[WebSocket] Connected to WebSocket server');
      }
    });

    this.socket.on('disconnect', () => {
      if (typeof window !== 'undefined') {
        console.log('[WebSocket] Disconnected from WebSocket server');
      }
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      if (typeof window !== 'undefined') {
        console.error('[WebSocket] Connection error:', error);
      }
      this.handleReconnect();
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      if (typeof window !== 'undefined') {
        console.log(`[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      }
      setTimeout(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-token`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => {
              if (res.ok) {
                this.connect(token);
              } else {
                if (typeof window !== 'undefined') {
                  console.error('[WebSocket] Invalid token. Please login again.');
                }
              }
            })
            .catch((err) => {
              if (typeof window !== 'undefined') {
                console.error('[WebSocket] Error verifying token:', err);
              }
            });
        }
      }, this.reconnectInterval);
    } else {
      if (typeof window !== 'undefined') {
        console.error('[WebSocket] Max reconnect attempts reached. Please refresh the page.');
      }
      if (this.onDisconnectCallback) {
        this.onDisconnectCallback();
      }
    }
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
  }

  onEmergency(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('emergency', (data) => {
        if (typeof window !== 'undefined') {
          console.log('[WebSocket] Received emergency event:', data);
        }
        callback(data);
      });
    }
  }

  onStatusUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('status-update', (data) => {
        if (typeof window !== 'undefined') {
          console.log('[WebSocket] Received status-update event:', data);
        }
        callback(data);
      });
    }
  }
}

export const webSocketClient = new WebSocketClient();