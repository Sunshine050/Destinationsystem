"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Bell, Volume2, Phone, MapPin, Globe, Shield, Clock, Radio } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { webSocketClient } from "@/lib/websocket";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

const notificationSettingsSchema = z.object({
  emergencyAlerts: z.boolean(),
  statusUpdates: z.boolean(),
  systemNotifications: z.boolean(),
  soundEnabled: z.boolean(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
});

const systemSettingsSchema = z.object({
  language: z.string(),
  timeZone: z.string(),
  dateFormat: z.string(),
  mapProvider: z.string(),
  autoRefreshInterval: z.string(),
});

const communicationSettingsSchema = z.object({
  primaryContactNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  backupContactNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  emergencyEmail: z.string().email("Invalid email address"),
  broadcastChannel: z.string(),
});

export default function EmergencyCenterSettings() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emergencyAlerts: true,
      statusUpdates: true,
      systemNotifications: true,
      soundEnabled: true,
      emailNotifications: true,
      smsNotifications: true,
    },
  });

  const systemForm = useForm<z.infer<typeof systemSettingsSchema>>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      language: "th",
      timeZone: "Asia/Bangkok",
      dateFormat: "DD/MM/YYYY",
      mapProvider: "google",
      autoRefreshInterval: "30",
    },
  });

  const communicationForm = useForm<z.infer<typeof communicationSettingsSchema>>({
    resolver: zodResolver(communicationSettingsSchema),
    defaultValues: {
      primaryContactNumber: "+6621234567",
      backupContactNumber: "+6622345678",
      emergencyEmail: "emergency@1669.th",
      broadcastChannel: "primary",
    },
  });

  const fetchNotifications = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลการแจ้งเตือนได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token available");
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
      );
      setUnreadCount(notifications.filter((n) => !n.isRead).length - 1);
      toast({
        title: "แจ้งเตือนถูกทำเครื่องหมายว่าอ่านแล้ว",
        description: "แจ้งเตือนนี้ถูกทำเครื่องหมายว่าอ่านแล้ว",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถทำเครื่องหมายว่าอ่านแล้วได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token available");
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to mark all notifications as read");
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      toast({
        title: "ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว",
        description: "แจ้งเตือนทั้งหมดถูกทำเครื่องหมายว่าอ่านแล้ว",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถทำเครื่องหมายทั้งหมดว่าอ่านแล้วได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    }
  };

  const onSubmitNotification = async (data: z.infer<typeof notificationSettingsSchema>) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token available");
      const response = await fetch(`${API_BASE_URL}/settings/notifications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save notification settings");
      toast({
        title: "บันทึกสำเร็จ",
        description: "ตั้งค่าการแจ้งเตือนถูกบันทึกเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าการแจ้งเตือนได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitSystem = async (data: z.infer<typeof systemSettingsSchema>) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token available");
      const response = await fetch(`${API_BASE_URL}/settings/system`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save system settings");
      toast({
        title: "บันทึกสำเร็จ",
        description: "ตั้งค่าระบบถูกบันทึกเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error("Error saving system settings:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าระบบได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitCommunication = async (data: z.infer<typeof communicationSettingsSchema>) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token available");
      const response = await fetch(`${API_BASE_URL}/settings/communication`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save communication settings");
      toast({
        title: "บันทึกสำเร็จ",
        description: "ตั้งค่าการสื่อสารถูกบันทึกเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error("Error saving communication settings:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าการสื่อสารได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      webSocketClient.connect(token);

      const notificationHandler = (data: Notification) => {
        console.log("Notification received:", data);
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + (data.isRead ? 0 : 1));
        toast({
          title: data.title,
          description: data.body,
        });
      };

      webSocketClient.on("notification", notificationHandler);
      fetchNotifications(token);

      return () => {
        webSocketClient.off("notification", notificationHandler);
        webSocketClient.disconnect();
      };
    } else {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่พบโทเค็นการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่",
        variant: "destructive",
      });
      router.push("/login");
    }
  }, [router]);

  return (
    <DashboardLayout
      role="emergency-center"
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={markNotificationAsRead}
      onMarkAllAsRead={markAllNotificationsAsRead}
    >
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ตั้งค่า</h1>
          <p className="text-slate-500 dark:text-slate-400">
            จัดการการตั้งค่าระบบและการกำหนดค่า
          </p>
        </div>

        <div className="grid gap-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                การตั้งค่าการแจ้งเตือน
              </CardTitle>
              <CardDescription>
                กำหนดวิธีการรับการแจ้งเตือนและการเตือน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onSubmitNotification)} className="space-y-4">
                  <div className="grid gap-4">
                    <FormField
                      control={notificationForm.control}
                      name="emergencyAlerts"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">การแจ้งเตือนฉุกเฉิน</FormLabel>
                            <FormDescription>
                              รับการแจ้งเตือนเหตุฉุกเฉินที่สำคัญ
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="statusUpdates"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">การอัปเดตสถานะ</FormLabel>
                            <FormDescription>
                              รับการอัปเดตเมื่อสถานะเคสเปลี่ยนแปลง
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="soundEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">การแจ้งเตือนด้วยเสียง</FormLabel>
                            <FormDescription>
                              เล่นเสียงสำหรับการแจ้งเตือนที่สำคัญ
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">การแจ้งเตือนทางอีเมล</FormLabel>
                            <FormDescription>
                              รับการแจ้งเตือนผ่านอีเมล
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="smsNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">การแจ้งเตือนทาง SMS</FormLabel>
                            <FormDescription>
                              รับการแจ้งเตือนผ่าน SMS
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "กำลังบันทึก..." : "บันทึกการตั้งค่าการแจ้งเตือน"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                การตั้งค่าระบบ
              </CardTitle>
              <CardDescription>
                กำหนดการตั้งค่าระบบทั่วไป
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...systemForm}>
                <form onSubmit={systemForm.handleSubmit(onSubmitSystem)} className="space-y-4">
                  <div className="grid gap-4">
                    <FormField
                      control={systemForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ภาษาของระบบ</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกภาษา" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="th">ภาษาไทย</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={systemForm.control}
                      name="timeZone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>เขตเวลา</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกเขตเวลา" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Asia/Bangkok">กรุงเทพ (GMT+7)</SelectItem>
                              <SelectItem value="Asia/Singapore">สิงคโปร์ (GMT+8)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={systemForm.control}
                      name="dateFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>รูปแบบวันที่</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกรูปแบบวันที่" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={systemForm.control}
                      name="mapProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ผู้ให้บริการแผนที่</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกผู้ให้บริการแผนที่" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="google">Google Maps</SelectItem>
                              <SelectItem value="here">HERE Maps</SelectItem>
                              <SelectItem value="osm">OpenStreetMap</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={systemForm.control}
                      name="autoRefreshInterval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ช่วงเวลาการรีเฟรชอัตโนมัติ (วินาที)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกช่วงเวลาการรีเฟรช" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="15">15 วินาที</SelectItem>
                              <SelectItem value="30">30 วินาที</SelectItem>
                              <SelectItem value="60">1 นาที</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "กำลังบันทึก..." : "บันทึกการตั้งค่าระบบ"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Communication Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5" />
                การตั้งค่าการสื่อสาร
              </CardTitle>
              <CardDescription>
                กำหนดช่องทางการสื่อสารฉุกเฉิน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...communicationForm}>
                <form onSubmit={communicationForm.handleSubmit(onSubmitCommunication)} className="space-y-4">
                  <div className="grid gap-4">
                    <FormField
                      control={communicationForm.control}
                      name="primaryContactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>หมายเลขติดต่อหลัก</FormLabel>
                          <FormControl>
                            <Input placeholder="+66 2 XXX XXXX" {...field} />
                          </FormControl>
                          <FormDescription>
                            หมายเลขติดต่อหลักสำหรับการสื่อสารฉุกเฉิน
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={communicationForm.control}
                      name="backupContactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>หมายเลขติดต่อสำรอง</FormLabel>
                          <FormControl>
                            <Input placeholder="+66 2 XXX XXXX" {...field} />
                          </FormControl>
                          <FormDescription>
                            หมายเลขติดต่อสำรองสำหรับการสื่อสาร
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={communicationForm.control}
                      name="emergencyEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>อีเมลฉุกเฉิน</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="emergency@example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            อีเมลสำหรับการแจ้งเตือนฉุกเฉิน
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={communicationForm.control}
                      name="broadcastChannel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ช่องทางการกระจายเสียง</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกช่องทางการกระจายเสียง" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="primary">เครือข่ายหลัก</SelectItem>
                              <SelectItem value="secondary">เครือข่ายรอง</SelectItem>
                              <SelectItem value="both">ทั้งสองเครือข่าย</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "กำลังบันทึก..." : "บันทึกการตั้งค่าการสื่อสาร"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}