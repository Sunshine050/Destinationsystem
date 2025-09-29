'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Bell, Shield, Radio, Phone, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/components/websocket-provider';

// สกีมาสำหรับการตั้งค่าแจ้งเตือน
const notificationSettingsSchema = z.object({
  emergencyAlerts: z.boolean(),
  statusUpdates: z.boolean(),
  systemNotifications: z.boolean(),
  soundEnabled: z.boolean(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
});

// สกีมาสำหรับการตั้งค่าระบบ
const systemSettingsSchema = z.object({
  language: z.string(),
  timeZone: z.string(),
  dateFormat: z.string(),
  mapProvider: z.string(),
  autoRefreshInterval: z.string(),
});

// สกีมาสำหรับการตั้งค่าการสื่อสาร
const communicationSettingsSchema = z.object({
  primaryContactNumber: z.string(),
  backupContactNumber: z.string(),
  emergencyEmail: z.string(),
  broadcastChannel: z.string(),
});

export default function EmergencyCenterSettings() {
  const router = useRouter();
  const { toast } = useToast();
  const { client, connected } = useWebSocket();
  const [isLoading, setIsLoading] = useState(true);

  // ฟอร์มสำหรับการตั้งค่า
  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emergencyAlerts: false,
      statusUpdates: false,
      systemNotifications: false,
      soundEnabled: false,
      emailNotifications: false,
      smsNotifications: false,
    },
  });

  const systemForm = useForm<z.infer<typeof systemSettingsSchema>>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      language: '',
      timeZone: '',
      dateFormat: '',
      mapProvider: '',
      autoRefreshInterval: '',
    },
  });

  const communicationForm = useForm<z.infer<typeof communicationSettingsSchema>>({
    resolver: zodResolver(communicationSettingsSchema),
    defaultValues: {
      primaryContactNumber: '',
      backupContactNumber: '',
      emergencyEmail: '',
      broadcastChannel: '',
    },
  });

  // ดึงการตั้งค่าจาก API
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast({
            title: 'ข้อผิดพลาด',
            description: 'ไม่พบโทเค็น กรุณาล็อกอินใหม่',
            variant: 'destructive',
          });
          router.push('/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: 'ข้อผิดพลาด',
              description: 'ไม่ได้รับอนุญาต กรุณาล็อกอินใหม่',
              variant: 'destructive',
            });
            router.push('/login');
            return;
          }
          throw new Error('ไม่สามารถดึงข้อมูลการตั้งค่าได้');
        }
        const data = await response.json();

        // อัปเดตฟอร์มด้วยข้อมูลจาก API
        notificationForm.reset({
          emergencyAlerts: data.notification?.emergencyAlerts ?? false,
          statusUpdates: data.notification?.statusUpdates ?? false,
          systemNotifications: data.notification?.systemNotifications ?? false,
          soundEnabled: data.notification?.soundEnabled ?? false,
          emailNotifications: data.notification?.emailNotifications ?? false,
          smsNotifications: data.notification?.smsNotifications ?? false,
        });

        systemForm.reset({
          language: data.system?.language ?? '',
          timeZone: data.system?.timeZone ?? '',
          dateFormat: data.system?.dateFormat ?? '',
          mapProvider: data.system?.mapProvider ?? '',
          autoRefreshInterval: data.system?.autoRefreshInterval ?? '',
        });

        communicationForm.reset({
          primaryContactNumber: data.communication?.primaryContactNumber ?? '',
          backupContactNumber: data.communication?.backupContactNumber ?? '',
          emergencyEmail: data.communication?.emergencyEmail ?? '',
          broadcastChannel: data.communication?.broadcastChannel ?? '',
        });
      } catch (error) {
        console.error('[EmergencyCenterSettings] ข้อผิดพลาดในการดึงข้อมูลการตั้งค่า:', error);
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่สามารถโหลดข้อมูลการตั้งค่าได้',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast, router, notificationForm, systemForm, communicationForm]);

  // WebSocket subscriptions
  useEffect(() => {
    if (!client || !connected) {
      toast({
        title: 'WebSocket ตัดการเชื่อมต่อ',
        description: 'ไม่สามารถรับการอัปเดตแบบเรียลไทม์ได้',
        variant: 'destructive',
      });
      return;
    }

    const handleSettingsUpdated = (data: any) => {
      notificationForm.reset({
        emergencyAlerts: data.notification?.emergencyAlerts ?? notificationForm.getValues().emergencyAlerts,
        statusUpdates: data.notification?.statusUpdates ?? notificationForm.getValues().statusUpdates,
        systemNotifications: data.notification?.systemNotifications ?? notificationForm.getValues().systemNotifications,
        soundEnabled: data.notification?.soundEnabled ?? notificationForm.getValues().soundEnabled,
        emailNotifications: data.notification?.emailNotifications ?? notificationForm.getValues().emailNotifications,
        smsNotifications: data.notification?.smsNotifications ?? notificationForm.getValues().smsNotifications,
      });

      systemForm.reset({
        language: data.system?.language ?? systemForm.getValues().language,
        timeZone: data.system?.timeZone ?? systemForm.getValues().timeZone,
        dateFormat: data.system?.dateFormat ?? systemForm.getValues().dateFormat,
        mapProvider: data.system?.mapProvider ?? systemForm.getValues().mapProvider,
        autoRefreshInterval: data.system?.autoRefreshInterval ?? systemForm.getValues().autoRefreshInterval,
      });

      communicationForm.reset({
        primaryContactNumber: data.communication?.primaryContactNumber ?? communicationForm.getValues().primaryContactNumber,
        backupContactNumber: data.communication?.backupContactNumber ?? communicationForm.getValues().backupContactNumber,
        emergencyEmail: data.communication?.emergencyEmail ?? communicationForm.getValues().emergencyEmail,
        broadcastChannel: data.communication?.broadcastChannel ?? communicationForm.getValues().broadcastChannel,
      });

      toast({
        title: 'การตั้งค่าถูกอัปเดต',
        description: 'การตั้งค่าระบบได้รับการอัปเดตแบบเรียลไทม์',
      });
    };

    client.on('settingsUpdated', handleSettingsUpdated);

    return () => {
      client.off('settingsUpdated', handleSettingsUpdated);
    };
  }, [client, connected, toast, notificationForm, systemForm, communicationForm]);

  // ฟังก์ชันบันทึกการตั้งค่า
  const onSubmit = async (data: any, formType: 'notification' | 'system' | 'communication') => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่พบโทเค็น กรุณาล็อกอินใหม่',
          variant: 'destructive',
        });
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ [formType]: data }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: 'ข้อผิดพลาด',
            description: 'ไม่ได้รับอนุญาต กรุณาล็อกอินใหม่',
            variant: 'destructive',
          });
          router.push('/login');
          return;
        }
        throw new Error('ไม่สามารถบันทึกการตั้งค่าได้');
      }

      toast({
        title: 'สำเร็จ',
        description: `บันทึกการตั้งค่า${formType === 'notification' ? 'แจ้งเตือน' : formType === 'system' ? 'ระบบ' : 'การสื่อสาร'}เรียบร้อยแล้ว`,
      });
    } catch (error) {
      console.error(`[EmergencyCenterSettings] ข้อผิดพลาดในการบันทึกการตั้งค่า ${formType}:`, error);
      toast({
        title: 'ข้อผิดพลาด',
        description: `ไม่สามารถบันทึกการตั้งค่า${formType === 'notification' ? 'แจ้งเตือน' : formType === 'system' ? 'ระบบ' : 'การสื่อสาร'}ได้`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout role="emergency-center">
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">การตั้งค่า</h1>
              <p className="text-slate-500 dark:text-slate-400">
                จัดการการตั้งค่าระบบและการกำหนดค่า
              </p>
            </div>

            <div className="grid gap-6">
              {/* การตั้งค่าแจ้งเตือน */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    การตั้งค่าแจ้งเตือน
                  </CardTitle>
                  <CardDescription>
                    กำหนดวิธีการรับการแจ้งเตือนและคำเตือน
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form
                      onSubmit={notificationForm.handleSubmit((data) => onSubmit(data, 'notification'))}
                      className="space-y-4"
                    >
                      <div className="grid gap-4">
                        <FormField
                          control={notificationForm.control}
                          name="emergencyAlerts"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">แจ้งเตือนฉุกเฉิน</FormLabel>
                                <FormDescription>
                                  รับการแจ้งเตือนสำหรับเหตุฉุกเฉินที่สำคัญ
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
                                <FormLabel className="text-base">อัปเดตสถานะ</FormLabel>
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
                          name="systemNotifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">การแจ้งเตือนระบบ</FormLabel>
                                <FormDescription>
                                  รับการแจ้งเตือนเกี่ยวกับการทำงานของระบบ
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
                                <FormLabel className="text-base">เสียงแจ้งเตือน</FormLabel>
                                <FormDescription>
                                  เปิดใช้งานเสียงสำหรับการแจ้งเตือนที่สำคัญ
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
                                  รับการแจ้งเตือนผ่านทางอีเมล
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
                                  รับการแจ้งเตือนผ่านทาง SMS
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
                        {isLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าแจ้งเตือน'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* การตั้งค่าระบบ */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    การตั้งค่าระบบ
                  </CardTitle>
                  <CardDescription>
                    กำหนดการตั้งค่าระดับระบบ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...systemForm}>
                    <form
                      onSubmit={systemForm.handleSubmit((data) => onSubmit(data, 'system'))}
                      className="space-y-4"
                    >
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
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={systemForm.control}
                          name="timeZone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>โซนเวลา</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="เลือกโซนเวลา" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Asia/Bangkok">กรุงเทพฯ (GMT+7)</SelectItem>
                                  <SelectItem value="Asia/Singapore">สิงคโปร์ (GMT+8)</SelectItem>
                                </SelectContent>
                              </Select>
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
                                  <SelectItem value="DD/MM/YYYY">วัน/เดือน/ปี</SelectItem>
                                  <SelectItem value="MM/DD/YYYY">เดือน/วัน/ปี</SelectItem>
                                  <SelectItem value="YYYY-MM-DD">ปี-เดือน-วัน</SelectItem>
                                </SelectContent>
                              </Select>
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
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าระบบ'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* การตั้งค่าการสื่อสาร */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Radio className="h-5 w-5" />
                    การตั้งค่าการสื่อสาร
                  </CardTitle>
                  <CardDescription>
                    กำหนดช่องทางการสื่อสารสำหรับเหตุฉุกเฉิน
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...communicationForm}>
                    <form
                      onSubmit={communicationForm.handleSubmit((data) => onSubmit(data, 'communication'))}
                      className="space-y-4"
                    >
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
                                หมายเลขติดต่อหลักสำหรับการสื่อสารในเหตุฉุกเฉิน
                              </FormDescription>
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
                                หมายเลขติดต่อสำรองสำหรับการสื่อสารเมื่อหลักไม่พร้อม
                              </FormDescription>
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
                                ที่อยู่อีเมลสำหรับการแจ้งเตือนฉุกเฉิน
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={communicationForm.control}
                          name="broadcastChannel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ช่องทางการสื่อสาร</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="เลือกช่องทางการสื่อสาร" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="primary">เครือข่ายหลัก</SelectItem>
                                  <SelectItem value="secondary">เครือข่ายสำรอง</SelectItem>
                                  <SelectItem value="both">ทั้งสองเครือข่าย</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                ช่องทางสำหรับการสื่อสารข้อความฉุกเฉิน
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าการสื่อสาร'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}