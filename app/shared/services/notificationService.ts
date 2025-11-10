// app/shared/services/notificationService.ts
import { getAuthHeaders } from "@lib/utils";
import { Notification } from "../types";

export const fetchNotifications = async (): Promise<Notification[]> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
    headers,
  });
  if (!response.ok) throw new Error("ไม่สามารถดึงข้อมูลการแจ้งเตือน: ${response.statusText}");
  return response.json();
};

export const markAsRead = async (id: string): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
    method: "PUT",
    headers,
  });
  if (!response.ok) throw new Error("ไม่สามารถทำการแจ้งเตือน: ${response.statusText}");
};

export const markAllAsRead = async (): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
    method: "PUT",
    headers,
  });
  if (!response.ok) throw new Error("ไม่สามารถทำการแจ้งเตือนทั้งหมด: ${response.statusText}");
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
    method: "PUT",
    headers,
  });
  if (!response.ok) throw new Error("Failed to mark notification as read");
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
    method: "PUT",
    headers,
  });
  if (!response.ok) throw new Error("Failed to mark all notifications as read");
};