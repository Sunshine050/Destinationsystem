// app/hospital/settings/page.tsx
"use client";

import { useHospitalSettings } from "./hooks/useHospitalSettings";
import { useAuth } from "@/shared/hooks/useAuth";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@components/ui/card";
import { HospitalSettingsForm } from "./components/HospitalSettingsForm";
import { Building2 } from "lucide-react";

export default function HospitalSettings() {
  useAuth();

  const {
    hospitalForm,
    isLoading,
    onSubmit,
  } = useHospitalSettings();

  // ฟังก์ชันว่าง placeholder สำหรับ onMarkAsRead/onMarkAllAsRead
  const noop = () => {};

  return (
    <DashboardLayout
      role="hospital"
      notifications={[]}            // ส่ง array ว่างถ้าไม่มีแจ้งเตือน
      unreadCount={0}               // จำนวนแจ้งเตือนที่ยังไม่ได้อ่าน
      onMarkAsRead={noop}           // ฟังก์ชันทำเครื่องหมายว่าอ่านแล้ว
      onMarkAllAsRead={noop}        // ฟังก์ชันทำเครื่องหมายว่าอ่านทั้งหมดแล้ว
    >
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hospital Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your hospital settings and preferences</p>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Hospital Settings
              </CardTitle>
              <CardDescription>Configure your hospital information and capacity</CardDescription>
            </CardHeader>
            <CardContent>
              <HospitalSettingsForm />
            </CardContent>
          </Card>

          {/* สามารถเพิ่มฟอร์มหรือองค์ประกอบอื่น ๆ ได้ที่นี่ */}
        </div>
      </div>
    </DashboardLayout>
  );
}
