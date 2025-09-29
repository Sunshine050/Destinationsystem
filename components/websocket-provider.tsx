'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { webSocketClient } from '@/lib/websocket';

// กำหนด type สำหรับ WebSocketContext
interface WebSocketContextType {
  connected: boolean;
  client: typeof webSocketClient | null;
}

// สร้าง context
const WebSocketContext = createContext<WebSocketContextType | null>(null);

// สร้าง hook สำหรับใช้งาน context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
  role?: string; // Optional prop สำหรับ role เช่น 'emergency-center'
}

export default function WebSocketProvider({ children, role }: WebSocketProviderProps) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      console.log('[WebSocketProvider] Connecting...');
      webSocketClient.connect(token);

      webSocketClient.on('connect', () => {
        console.log('[WebSocketProvider] Connected');
        setConnected(true);
      });

      webSocketClient.on('disconnect', () => {
        console.log('[WebSocketProvider] Disconnected');
        setConnected(false);
      });

      // ถ้ามี role-specific logic สามารถเพิ่มได้ที่นี่
      if (role) {
        console.log(`[WebSocketProvider] Role: ${role}`);
        // ตัวอย่าง: สามารถใช้ role เพื่อ filter events ใน webSocketClient ได้
      }
    }

    return () => {
      console.log('[WebSocketProvider] Disconnecting...');
      webSocketClient.disconnect();
    };
  }, [role]); // เพิ่ม role ใน dependency array ถ้าต้องการ reconnect เมื่อ role เปลี่ยน

  return (
    <WebSocketContext.Provider value={{ connected, client: webSocketClient }}>
      {children}
    </WebSocketContext.Provider>
  );
}