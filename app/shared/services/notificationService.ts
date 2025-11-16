// app/shared/services/notificationService.ts
// API for notifications (fetch/mark/delete/create)

import { getAuthHeaders } from "@lib/utils";
import { Notification } from "../types";  // สมมติมี type Notification ใน ../types

// Define DTO types ที่ match กับ backend DTO (จาก notification.dto.ts)
export interface CreateNotificationDto {
  type: string;
  title: string;
  body: string;
  userId: string;
  metadata?: Record<string, any>;  // optional
}

interface MarkAsReadDto {
  notificationId: string;
}

// ดึง notifications ทั้งหมดของ user
export const fetchNotifications = async (): Promise<Notification[]> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
    headers,
  });
  if (!response.ok) throw new Error(`ไม่สามารถดึงข้อมูลการแจ้งเตือน: ${response.statusText}`);
  return response.json();
};

// สร้าง notification ใหม่ (POST)
export const createNotification = async (data: CreateNotificationDto): Promise<Notification> => {
  const headers = {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  };
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`ไม่สามารถสร้างการแจ้งเตือน: ${response.statusText}`);
  return response.json();
};

// ทำเครื่องหมาย notification ว่าอ่านแล้ว (PUT)
export const markAsRead = async (id: string): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
    method: "PUT",
    headers,
  });
  if (!response.ok) throw new Error(`ไม่สามารถทำการแจ้งเตือน: ${response.statusText}`);
};

// ทำเครื่องหมาย notification ทั้งหมดว่าอ่านแล้ว (PUT)
export const markAllAsRead = async (): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
    method: "PUT",
    headers,
  });
  if (!response.ok) throw new Error(`ไม่สามารถทำการแจ้งเตือนทั้งหมด: ${response.statusText}`);
};

// ลบ notification (DELETE)
export const deleteNotification = async (id: string): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) throw new Error(`ไม่สามารถลบการแจ้งเตือน: ${response.statusText}`);
};

// Export alias
export { markAsRead as markNotificationAsRead };
export { markAllAsRead as markAllNotificationsAsRead };
