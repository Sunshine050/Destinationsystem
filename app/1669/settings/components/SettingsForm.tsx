// app/1669/settings/components/SettingsForm.tsx
"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@components/ui/form";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Switch } from "@components/ui/switch";
import { User, Phone, Bell, Shield, Radio, AlertTriangle } from "lucide-react";

interface SettingsFormProps {
  category: "profile" | "notification" | "system" | "communication" | "emergency";
  onSubmit: (data: any) => void | Promise<void>;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ category, onSubmit }) => {
  const form = useFormContext();

  if (!form) {
    // ป้องกันกรณีไม่มี Context (ควรมี FormProvider ครอบก่อน)
    return <div>เกิดข้อผิดพลาด: ไม่พบฟอร์มคอนเท็กซ์</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {category === "profile" && (
          <>
            <FormField control={form.control} name="firstName" render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อจริง</FormLabel>
                <FormControl>
                  <Input placeholder="ชื่อจริง" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="lastName" render={({ field }) => (
              <FormItem>
                <FormLabel>นามสกุล</FormLabel>
                <FormControl>
                  <Input placeholder="นามสกุล" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>เบอร์โทรศัพท์</FormLabel>
                <FormControl>
                  <Input placeholder="+66XXXXXXXXX" {...field} />
                </FormControl>
                <FormDescription>เบอร์โทรศัพท์สำหรับติดต่อ</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </>
        )}
        {category === "notification" && (
          <>
            <FormField control={form.control} name="emergencyAlerts" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">การแจ้งเตือนฉุกเฉิน</FormLabel>
                  <FormDescription>รับการแจ้งเตือนเหตุฉุกเฉินที่สำคัญ</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="statusUpdates" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">การอัปเดตสถานะ</FormLabel>
                  <FormDescription>รับการอัปเดตเมื่อสถานะเคสเปลี่ยนแปลง</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="soundEnabled" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">การแจ้งเตือนด้วยเสียง</FormLabel>
                  <FormDescription>เล่นเสียงสำหรับการแจ้งเตือนที่สำคัญ</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="emailNotifications" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">การแจ้งเตือนทางอีเมล</FormLabel>
                  <FormDescription>รับการแจ้งเตือนผ่านอีเมล</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="smsNotifications" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">การแจ้งเตือนทาง SMS</FormLabel>
                  <FormDescription>รับการแจ้งเตือนผ่าน SMS</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />
          </>
        )}
        {category === "system" && (
          <>
            <FormField control={form.control} name="language" render={({ field }) => (
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
            )} />
            <FormField control={form.control} name="timeZone" render={({ field }) => (
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
            )} />
            <FormField control={form.control} name="dateFormat" render={({ field }) => (
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
            )} />
            <FormField control={form.control} name="mapProvider" render={({ field }) => (
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
            )} />
            <FormField control={form.control} name="autoRefreshInterval" render={({ field }) => (
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
            )} />
          </>
        )}
        {category === "communication" && (
          <>
            <FormField control={form.control} name="primaryContactNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>หมายเลขติดต่อหลัก</FormLabel>
                <FormControl>
                  <Input placeholder="+66 2 XXX XXXX" {...field} />
                </FormControl>
                <FormDescription>หมายเลขติดต่อหลักสำหรับการสื่อสารฉุกเฉิน</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="backupContactNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>หมายเลขติดต่อสำรอง</FormLabel>
                <FormControl>
                  <Input placeholder="+66 2 XXX XXXX" {...field} />
                </FormControl>
                <FormDescription>หมายเลขติดต่อสำรองสำหรับการสื่อสาร</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="emergencyEmail" render={({ field }) => (
              <FormItem>
                <FormLabel>อีเมลฉุกเฉิน</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="emergency@example.com" {...field} />
                </FormControl>
                <FormDescription>อีเมลสำหรับการแจ้งเตือนฉุกเฉิน</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="broadcastChannel" render={({ field }) => (
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
            )} />
          </>
        )}
        {category === "emergency" && (
          <>
            <FormField control={form.control} name="defaultRadius" render={({ field }) => (
              <FormItem>
                <FormLabel>รัศมีการค้นหาเริ่มต้น (กิโลเมตร)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} onChange={(e) => field.onChange(+e.target.value)} />
                </FormControl>
                <FormDescription>รัศมีการสำหรับค้นหาโรงพยาบาลหรือทีมกู้ภัยใกล้เคียง</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="minUrgencyLevel" render={({ field }) => (
              <FormItem>
                <FormLabel>ระดับความเร่งด่วนขั้นต่ำสำหรับแจ้งเตือน</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกระดับความเร่งด่วน" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CRITICAL">วิกฤติ</SelectItem>
                    <SelectItem value="URGENT">เร่งด่วน</SelectItem>
                    <SelectItem value="NON_URGENT">ไม่เร่งด่วน</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </>
        )}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "กำลังบันทึก..." : `บันทึกการตั้งค่า ${category}`}
        </Button>
      </form>
    </Form>
  );
};
