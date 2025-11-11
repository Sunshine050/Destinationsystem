// app/shared/services/notificationService.ts
// API for notifications (fetch/mark/delete)

import { getAuthHeaders } from "@lib/utils";
import { Notification } from "../types";  // สมมติมี type Notification ใน ../types

// Define DTO types ที่ match กับ backend DTO (จาก notification.dto.ts)
interface CreateNotificationDto {
  type: string;
  title: string;
  body: string;
  userId: string;
  metadata?: Record<string, any>;  // optional
}

interface MarkAsReadDto {
  notificationId: string;
}

export const fetchNotifications = async (): Promise<Notification[]> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
    headers,
  });
  if (!response.ok) throw new Error(`ไม่สามารถดึงข้อมูลการแจ้งเตือน: ${response.statusText}`);
  return response.json();
};

export const markAsRead = async (id: string): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
    method: "PUT",
    headers,
  });
  if (!response.ok) throw new Error(`ไม่สามารถทำการแจ้งเตือน: ${response.statusText}`);
};

export const markAllAsRead = async (): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
    method: "PUT",
    headers,
  });
  if (!response.ok) throw new Error(`ไม่สามารถทำการแจ้งเตือนทั้งหมด: ${response.statusText}`);
};

// เพิ่มสำหรับ DELETE (match backend)
export const deleteNotification = async (id: string): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) throw new Error(`ไม่สามารถลบการแจ้งเตือน: ${response.statusText}`);
};

export { markAsRead as markNotificationAsRead };
export { markAllAsRead as markAllNotificationsAsRead };
