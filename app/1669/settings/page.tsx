"use client";

import { FormProvider } from "react-hook-form";
import { useSettings } from "@/shared/hooks/useSettings";
import { useAuth } from "@/shared/hooks/useAuth";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { SettingsForm } from "./components/SettingsForm";
import { User, Bell, Shield, Radio, AlertTriangle } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function EmergencyCenterSettings() {
  useAuth();

  const {
    notificationForm,
    systemForm,
    communicationForm,
    profileForm,
    emergencyForm,
    isLoading,
    notifications,
    unreadCount,
    onSubmitNotification,
    onSubmitSystem,
    onSubmitCommunication,
    onSubmitProfile,
    onSubmitEmergency,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useSettings();

  if (isLoading) {
    return (
      <DashboardLayout
        role="emergency-center"
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllNotificationsAsRead}
      >
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          กำลังโหลดการตั้งค่า...
        </div>
      </DashboardLayout>
    );
  }

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
            จัดการการตั้งค่าระบบและการกำหนดค่าต่างๆ สำหรับศูนย์ฉุกเฉิน
          </p>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                การตั้งค่าโปรไฟล์ส่วนตัว
              </CardTitle>
              <CardDescription>แก้ไขข้อมูลส่วนตัวของคุณ</CardDescription>
            </CardHeader>
            <CardContent>
              <FormProvider {...profileForm}>
                <SettingsForm
                  category="profile"
                  onSubmit={(data) => onSubmitProfile(data)}
                />
              </FormProvider>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                การตั้งค่าการแจ้งเตือน
              </CardTitle>
              <CardDescription>กำหนดวิธีการรับการแจ้งเตือนและการเตือน</CardDescription>
            </CardHeader>
            <CardContent>
              <FormProvider {...notificationForm}>
                <SettingsForm
                  category="notification"
                  onSubmit={(data) => onSubmitNotification(data)}
                />
              </FormProvider>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                การตั้งค่าระบบ
              </CardTitle>
              <CardDescription>กำหนดการตั้งค่าระบบทั่วไป</CardDescription>
            </CardHeader>
            <CardContent>
              <FormProvider {...systemForm}>
                <SettingsForm
                  category="system"
                  onSubmit={(data) => onSubmitSystem(data)}
                />
              </FormProvider>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5" />
                การตั้งค่าการสื่อสาร
              </CardTitle>
              <CardDescription>กำหนดช่องทางการสื่อสารฉุกเฉิน</CardDescription>
            </CardHeader>
            <CardContent>
              <FormProvider {...communicationForm}>
                <SettingsForm
                  category="communication"
                  onSubmit={(data) => onSubmitCommunication(data)}
                />
              </FormProvider>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                การตั้งค่าฉุกเฉินเฉพาะ
              </CardTitle>
              <CardDescription>กำหนดค่าพิเศษสำหรับการจัดการเหตุฉุกเฉิน</CardDescription>
            </CardHeader>
            <CardContent>
              <FormProvider {...emergencyForm}>
                <SettingsForm
                  category="emergency"
                  onSubmit={(data) => onSubmitEmergency(data)}
                />
              </FormProvider>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
