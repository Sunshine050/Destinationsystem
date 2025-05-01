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

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    this.socket = io(`${wsUrl}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: false,
    });

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      console.log('[WebSocket] Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected from WebSocket server');
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error.message);
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

  private async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.handleDisconnect();
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(async () => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      if (!token) {
        console.error('[WebSocket] No token available. Please login again.');
        this.handleDisconnect();
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/auth/verify-token`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          this.connect(token);
        } else if (res.status === 401 && refreshToken) {
          // Token หมดอายุ พยายาม refresh
          try {
            const refreshRes = await fetch(`${apiUrl}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            });

            const data = await refreshRes.json();
            if (refreshRes.ok && data.access_token && data.refresh_token) {
              localStorage.setItem('access_token', data.access_token);
              localStorage.setItem('refresh_token', data.refresh_token);
              this.connect(data.access_token);
            } else {
              console.error('[WebSocket] Failed to refresh token:', data);
              this.handleDisconnect();
            }
          } catch (err) {
            console.error('[WebSocket] Error refreshing token:', err);
            this.handleDisconnect();
          }
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
        console.log('[WebSocket] Received emergency event:', data);
        callback(data);
      });
    }
  }

  onStatusUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('status-update', (data) => {
        console.log('[WebSocket] Received status-update event:', data);
        callback(data);
      });
    }
  }
}

export const webSocketClient = new WebSocketClient();