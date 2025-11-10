// app/1669/settings/hooks/useSettings.ts
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/shared/hooks/use-toast";
import { fetchUserProfile, saveUserSettings } from "@/shared/services/authService";
import { fetchNotifications } from "@/shared/services/notificationService";
import { notificationSettingsSchema, systemSettingsSchema, communicationSettingsSchema, profileSettingsSchema, emergencySettingsSchema, DEFAULT_NOTIFICATION_SETTINGS, DEFAULT_SYSTEM_SETTINGS, DEFAULT_COMMUNICATION_SETTINGS, DEFAULT_PROFILE_SETTINGS, DEFAULT_EMERGENCY_SETTINGS } from "@/shared/utils/settingsUtils";
import { webSocketClient } from "@lib/websocket";
import {
  NotificationSettings,
  SystemSettings,
  CommunicationSettings,
  ProfileSettings,
  EmergencySettings,
  Notification,
} from "@/shared/types";


export const useSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  const notificationForm = useForm({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: DEFAULT_NOTIFICATION_SETTINGS,
  });

  const systemForm = useForm({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: DEFAULT_SYSTEM_SETTINGS,
  });

  const communicationForm = useForm({
    resolver: zodResolver(communicationSettingsSchema),
    defaultValues: DEFAULT_COMMUNICATION_SETTINGS,
  });

  const profileForm = useForm({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: DEFAULT_PROFILE_SETTINGS,
  });

  const emergencyForm = useForm({
    resolver: zodResolver(emergencySettingsSchema),
    defaultValues: DEFAULT_EMERGENCY_SETTINGS,
  });

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await fetchUserProfile();
      notificationForm.reset(data.notificationSettings || DEFAULT_NOTIFICATION_SETTINGS);
      systemForm.reset(data.systemSettings || DEFAULT_SYSTEM_SETTINGS);
      communicationForm.reset(data.communicationSettings || DEFAULT_COMMUNICATION_SETTINGS);
      profileForm.reset({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
      });
      emergencyForm.reset(data.emergencySettings || DEFAULT_EMERGENCY_SETTINGS);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถดึงข้อมูลโปรไฟล์และการตั้งค่าได้ กรุณาลองใหม่", variant: "destructive" });
      notificationForm.reset(DEFAULT_NOTIFICATION_SETTINGS);
      systemForm.reset(DEFAULT_SYSTEM_SETTINGS);
      communicationForm.reset(DEFAULT_COMMUNICATION_SETTINGS);
      profileForm.reset(DEFAULT_PROFILE_SETTINGS);
      emergencyForm.reset(DEFAULT_EMERGENCY_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotificationsData = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถดึงข้อมูลการแจ้งเตือนได้ กรุณาลองใหม่", variant: "destructive" });
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      toast({ title: "แจ้งเตือนถูกทำเครื่องหมายว่าอ่านแล้ว", description: "แจ้งเตือนนี้ถูกทำเครื่องหมายว่าอ่านแล้ว" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถทำเครื่องหมายว่าอ่านแล้วได้ กรุณาลองใหม่", variant: "destructive" });
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      toast({ title: "ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว", description: "แจ้งเตือนทั้งหมดถูกทำเครื่องหมายว่าอ่านแล้ว" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถทำเครื่องหมายทั้งหมดว่าอ่านแล้วได้ กรุณาลองใหม่", variant: "destructive" });
    }
  };

  const saveSetting = async (category: string, data: any) => {
    try {
      setIsLoading(true);
      await saveUserSettings({ [category]: data });
      toast({ title: "บันทึกสำเร็จ", description: `ตั้งค่า ${category} ถูกบันทึกเรียบร้อยแล้ว` });
    } catch (error) {
      console.error(`Error saving ${category} settings:`, error);
      toast({ title: "ข้อผิดพลาด", description: `ไม่สามารถบันทึกการตั้งค่า ${category} ได้ กรุณาลองใหม่`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    webSocketClient.connect(token);
    const notificationHandler = (data: Notification) => {
      console.log("Notification received:", data);
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + (data.isRead ? 0 : 1));
      toast({ title: data.title, description: data.body });
    };
    webSocketClient.on("notification", notificationHandler);
    fetchNotificationsData();
    fetchProfile();

    return () => {
      webSocketClient.off("notification", notificationHandler);
      webSocketClient.disconnect();
    };
  }, []);

  return {
    notificationForm,
    systemForm,
    communicationForm,
    profileForm,
    emergencyForm,
    isLoading,
    notifications,
    unreadCount,
    onSubmitNotification: (data: NotificationSettings) => saveSetting("notificationSettings", data),
    onSubmitSystem: (data: SystemSettings) => saveSetting("systemSettings", data),
    onSubmitCommunication: (data: CommunicationSettings) => saveSetting("communicationSettings", data),
    onSubmitProfile: (data: ProfileSettings) => saveSetting("profile", data),
    onSubmitEmergency: (data: EmergencySettings) => saveSetting("emergencySettings", data),
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
};