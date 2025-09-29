'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Filter, ArrowLeft, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/components/websocket-provider';

// อินเตอร์เฟซสำหรับข้อมูลรายงาน
interface Report {
  id: number;
  title: string;
  type: 'emergency' | 'dispatch' | 'hospital';
  date: string;
  stats: {
    totalCases?: number;
    avgResponseTime?: number;
    criticalCases?: number;
    successfulTransfers?: number;
    totalDispatches?: number;
    avgDispatchTime?: number;
    hospitalAcceptance?: number;
    pendingCases?: number;
    totalAdmissions?: number;
    bedUtilization?: number;
    avgTreatmentTime?: number;
    transferRate?: number;
  };
}

export default function ReportsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { client, connected } = useWebSocket();
  const [reportType, setReportType] = useState('all');
  const [timePeriod, setTimePeriod] = useState('month');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลรายงานจาก API
  useEffect(() => {
    const fetchReports = async () => {
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports`, {
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
          throw new Error('ไม่สามารถดึงข้อมูลรายงานได้');
        }
        const data = await response.json();
        // ตรวจสอบว่า data เป็นอาร์เรย์
        if (!Array.isArray(data)) {
          console.error('[ReportsPage] API response is not an array:', data);
          toast({
            title: 'ข้อผิดพลาด',
            description: 'ข้อมูลรายงานจาก API ไม่ถูกต้อง',
            variant: 'destructive',
          });
          setReports([]);
          return;
        }
        setReports(data);
      } catch (error) {
        console.error('[ReportsPage] ข้อผิดพลาดในการดึงข้อมูลรายงาน:', error);
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่สามารถโหลดข้อมูลรายงานได้',
          variant: 'destructive',
        });
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [toast, router]);

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

    const handleReportGenerated = (data: Report) => {
      setReports((prev) => {
        if (!Array.isArray(prev)) {
          console.warn('[ReportsPage] reports state is not an array:', prev);
          return [data];
        }
        return [data, ...prev];
      });
      toast({
        title: 'สร้างรายงาน',
        description: `รายงาน ${data.title} ถูกสร้าง`,
      });
    };

    client.on('reportGenerated', handleReportGenerated);

    return () => {
      client.off('reportGenerated', handleReportGenerated);
    };
  }, [client, connected, toast]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ reportType, timePeriod }),
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
        throw new Error('ไม่สามารถสร้างรายงานได้');
      }

      const newReport = await response.json();
      setReports((prev) => {
        if (!Array.isArray(prev)) {
          console.warn('[ReportsPage] reports state is not an array:', prev);
          return [newReport];
        }
        return [newReport, ...prev];
      });
      toast({
        title: 'สำเร็จ',
        description: `สร้างรายงาน ${reportType === 'all' ? 'ทั้งหมด' : reportType} สำหรับช่วง ${timePeriod} เรียบร้อยแล้ว`,
      });
    } catch (error) {
      console.error('[ReportsPage] ข้อผิดพลาดในการสร้างรายงาน:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถสร้างรายงานได้',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (reportId: number) => {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/${reportId}/download`, {
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
        throw new Error('ไม่สามารถดาวน์โหลดรายงานได้');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'ดาวน์โหลดสำเร็จ',
        description: 'รายงานถูกดาวน์โหลดเรียบร้อยแล้ว',
      });
    } catch (error) {
      console.error('[ReportsPage] ข้อผิดพลาดในการดาวน์โหลด:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถดาวน์โหลดรายงานได้',
        variant: 'destructive',
      });
    }
  };

  // กรองรายงานตามประเภท
  const filteredReports = reportType === 'all'
    ? reports
    : reports.filter((r) => r.type === reportType);

  return (
    <DashboardLayout role="emergency-center">
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">รายงาน</h1>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="ประเภทรายงาน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">รายงานทั้งหมด</SelectItem>
                  <SelectItem value="emergency">รายงานฉุกเฉิน</SelectItem>
                  <SelectItem value="dispatch">รายงานการส่งต่อ</SelectItem>
                  <SelectItem value="hospital">รายงานโรงพยาบาล</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="ช่วงเวลา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">สัปดาห์ที่แล้ว</SelectItem>
                  <SelectItem value="month">เดือนที่แล้ว</SelectItem>
                  <SelectItem value="quarter">ไตรมาสที่แล้ว</SelectItem>
                  <SelectItem value="year">ปีที่แล้ว</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                ใช้ตัวกรอง
              </Button>

              <Button onClick={handleGenerateReport} disabled={isGenerating}>
                <FileText className="mr-2 h-4 w-4" />
                {isGenerating ? 'กำลังสร้าง...' : 'สร้างรายงาน'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>เวลาในการตอบสนอง</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reports
                      .filter((r) => r.stats.avgResponseTime !== undefined)
                      .reduce((sum, r) => sum + (r.stats.avgResponseTime || 0), 0) /
                      reports.filter((r) => r.stats.avgResponseTime !== undefined).length || 0}{' '}
                    นาที
                  </div>
                  <p className="text-muted-foreground">เวลาในการตอบสนองเฉลี่ย</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>จำนวนเคสทั้งหมด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reports.reduce((sum, r) => sum + (r.stats.totalCases || 0), 0)}
                  </div>
                  <p className="text-muted-foreground">เคสในเดือนนี้</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>เคสวิกฤต</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reports.reduce((sum, r) => sum + (r.stats.criticalCases || 0), 0)}
                  </div>
                  <p className="text-muted-foreground">เคสที่มีความรุนแรงสูง</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>อัตราความสำเร็จ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reports
                      .filter((r) => r.stats.successfulTransfers !== undefined)
                      .reduce((sum, r) => sum + (r.stats.successfulTransfers || 0), 0) /
                      reports.reduce((sum, r) => sum + (r.stats.totalCases || 0), 0) * 100 || 0}%
                  </div>
                  <p className="text-muted-foreground">อัตราการแก้ไขเคส</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>รายงานที่สร้าง</CardTitle>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">ไม่พบข้อมูลรายงาน</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold">{report.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            สร้างเมื่อ {new Date(report.date).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleDownload(report.id)}>
                            <Download className="mr-2 h-4 w-4" />
                            ดาวน์โหลด
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            ดูรายงาน
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}