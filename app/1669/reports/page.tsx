"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Filter, Download, Eye, ChevronDown, AlertTriangle, Search, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import { webSocketClient } from "@/lib/websocket";
import { cn } from "@/lib/utils";

interface Report {
  id: string;
  title: string;
  type: string;
  date: string;
  stats: {
    severity?: number;
    patientName?: string;
    status?: string;
  };
  details?: any;
}

interface DashboardStats {
  totalEmergencies: number;
  activeEmergencies: number;
  completedEmergencies: number;
  cancelledEmergencies: number;
  averageResponseTime: number;
  activeTeams: number;
  availableHospitalBeds: number;
  connectedHospitals: number;
  criticalCases: number;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface Filters {
  status: string;
  severity: string;
  date: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [reportType, setReportType] = useState(searchParams.get("type") || "all");
  const [filters, setFilters] = useState<Filters>({
    status: searchParams.get("status") || "all",
    severity: searchParams.get("severity") || "all",
    date: searchParams.get("date") || "all",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const getToken = useCallback((): string | null => {
    return localStorage.getItem("access_token");
  }, []);

  const fetchStats = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลสถิติได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    }
  }, [toast, API_BASE_URL]);

  const fetchReports = useCallback(async (token: string) => {
    if (!token) return;
    setIsLoading(true);
    try {
      // Fetch all reports without filter params for client-side filtering
      const response = await fetch(`${API_BASE_URL}/dashboard/active-emergencies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const transformedReports: Report[] = data.map((emergency: any) => ({
        id: emergency.id,
        title: emergency.title || `Emergency Case ${emergency.id}`,
        type: emergency.emergencyType || emergency.type || "emergency",
        date: emergency.reportedAt || emergency.createdAt,
        stats: {
          severity: emergency.medicalInfo?.severity || emergency.severity || 0,
          patientName: emergency.patient
            ? `${emergency.patient.firstName} ${emergency.patient.lastName}`.trim()
            : "Unknown",
          status: emergency.status?.toLowerCase() || "pending",
        },
        details: emergency,
      }));
      setAllReports(transformedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลรายงานได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, API_BASE_URL]);

  const fetchNotifications = useCallback(async (token: string) => {
    if (!token) return;
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
  }, [toast, API_BASE_URL]);

  const markNotificationAsRead = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) throw new Error("No token available");
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
      );
      setUnreadCount((prev) => prev - 1);
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
  }, [getToken, toast, API_BASE_URL]);

  const markAllNotificationsAsRead = useCallback(async () => {
    const token = getToken();
    if (!token) throw new Error("No token available");
    try {
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
  }, [getToken, toast, API_BASE_URL]);

  const generatePDF = useCallback((report: Report) => {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.text(`รายงาน: ${report.title}`, 10, 10);
    doc.text(`วันที่: ${new Date(report.date).toLocaleDateString("th-TH")}`, 10, 20);
    doc.text(`ประเภท: ${report.type}`, 10, 30);
    doc.text(`ความรุนแรง: ${report.stats.severity ?? "ไม่ระบุ"}`, 10, 40);
    doc.text(`ชื่อผู้ป่วย: ${report.stats.patientName ?? "ไม่ระบุ"}`, 10, 50);
    doc.text(`สถานะ: ${report.stats.status ?? "ไม่ระบุ"}`, 10, 60);
    if (report.details) {
      doc.text(`คำอธิบาย: ${report.details.description ?? "ไม่มี"}`, 10, 70);
      if (report.details.location) {
        doc.text(`สถานที่: ${report.details.location.address ?? "ไม่ระบุ"}`, 10, 80);
      }
      if (report.details.symptoms) {
        doc.text(`อาการ: ${Array.isArray(report.details.symptoms) ? report.details.symptoms.join(", ") : "ไม่ระบุ"}`, 10, 90);
      }
    }
    return doc;
  }, []);

  const handleDownload = useCallback((report: Report) => {
    try {
      const doc = generatePDF(report);
      doc.save(`${report.title}.pdf`);
      toast({
        title: "ดาวน์โหลดสำเร็จ",
        description: "รายงานถูกดาวน์โหลดเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดาวน์โหลดรายงานได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    }
  }, [generatePDF, toast]);

  const handleView = useCallback((report: Report) => {
    setSelectedReport(report);
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setReportType(value);
  }, []);

  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่พบโทเค็นการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    webSocketClient.connect(token);

    const statsUpdatedHandler = (data: any) => {
      console.log("Stats updated:", data);
      setStats(data);
    };

    const notificationHandler = (data: Notification) => {
      console.log("Notification received:", data);
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + (data.isRead ? 0 : 1));
      toast({
        title: data.title,
        description: data.body,
      });
    };

    webSocketClient.on("statsUpdated", statsUpdatedHandler);
    webSocketClient.on("notification", notificationHandler);
    fetchStats(token);
    fetchReports(token);
    fetchNotifications(token);

    return () => {
      webSocketClient.off("statsUpdated", statsUpdatedHandler);
      webSocketClient.off("notification", notificationHandler);
      webSocketClient.disconnect();
    };
  }, [getToken, fetchStats, fetchReports, fetchNotifications, toast, router]);

  // Client-side filtering like the example
  const filteredReports = useMemo(() => allReports.filter((report) => {
    const matchesSearch =
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.stats.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = reportType === "all" || report.type === reportType;

    const matchesStatus = filters.status === "all" || report.stats.status === filters.status;

    const matchesSeverity = filters.severity === "all" || report.stats.severity?.toString() === filters.severity;

    let matchesDate = true;
    if (filters.date !== "all") {
      const reportDate = new Date(report.date);
      if (isNaN(reportDate.getTime())) return false;
      const today = new Date();
      if (filters.date === "today") {
        matchesDate = reportDate.toDateString() === today.toDateString();
      } else if (filters.date === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        matchesDate = reportDate.toDateString() === yesterday.toDateString();
      } else if (filters.date === "week") {
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        matchesDate = reportDate >= oneWeekAgo && reportDate <= today;
      }
    }

    return matchesSearch && matchesType && matchesStatus && matchesSeverity && matchesDate;
  }), [allReports, searchQuery, reportType, filters]);

  // Filtered stats from filteredReports
  const filteredStats = useMemo(() => {
    const total = filteredReports.length;
    const pending = filteredReports.filter(r => r.stats.status === 'pending').length;
    const critical = filteredReports.filter(r => r.stats.severity === 4).length;
    const completed = filteredReports.filter(r => r.stats.status === 'completed').length;
    return { total, pending, critical, completed };
  }, [filteredReports]);

  return (
    <DashboardLayout
      role="emergency-center"
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={markNotificationAsRead}
      onMarkAllAsRead={markAllNotificationsAsRead}
    >
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <FileSearch className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">รายงาน</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">จัดการและติดตามรายงานทั้งหมด</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="ค้นหารายงานด้วย ID, ชื่อผู้ป่วย, หรือประเภท..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={reportType} onValueChange={handleTypeChange}>
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

            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="pending">รอการดำเนินการ</SelectItem>
                <SelectItem value="assigned">มอบหมายแล้ว</SelectItem>
                <SelectItem value="in-progress">กำลังดำเนินการ</SelectItem>
                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.severity}
              onValueChange={(value) => handleFilterChange('severity', value)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="ระดับความรุนแรง" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกระดับ</SelectItem>
                <SelectItem value="1">ระดับ 1 (เล็กน้อย)</SelectItem>
                <SelectItem value="2">ระดับ 2 (ปานกลาง)</SelectItem>
                <SelectItem value="3">ระดับ 3 (รุนแรง)</SelectItem>
                <SelectItem value="4">ระดับ 4 (วิกฤต)</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  ตัวกรองเพิ่มเติม
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>ช่วงวันที่</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.date === "all"}
                  onCheckedChange={() => handleFilterChange("date", "all")}
                >
                  ทุกวันที่
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === "today"}
                  onCheckedChange={() => handleFilterChange("date", "today")}
                >
                  วันนี้
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === "yesterday"}
                  onCheckedChange={() => handleFilterChange("date", "yesterday")}
                >
                  เมื่อวาน
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === "week"}
                  onCheckedChange={() => handleFilterChange("date", "week")}
                >
                  สัปดาห์นี้
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => fetchReports(getToken() || "")} disabled={isLoading}>
              <FileText className="mr-2 h-4 w-4" />
              {isLoading ? "กำลังโหลด..." : "รีเฟรชข้อมูล"}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    รวมทั้งหมด
                  </p>
                  <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                    {filteredStats.total}
                  </Badge>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    รอการดำเนินการ
                  </p>
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                    {filteredStats.pending}
                  </Badge>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    วิกฤต
                  </p>
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">
                    {filteredStats.critical}
                  </Badge>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    เสร็จสิ้น
                  </p>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                    {filteredStats.completed}
                  </Badge>
                </div>
              </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-500" />
                  รายงาน ({filteredReports.length} รายการ)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports.length === 0 ? (
                    <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-slate-500 dark:text-slate-400">ไม่พบรายงานที่ตรงกับเกณฑ์การกรอง</p>
                    </div>
                  ) : (
                    filteredReports.map((report) => (
                      <Card key={report.id} className="border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between p-6">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{report.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              สร้างเมื่อ {new Date(report.date).toLocaleDateString("th-TH")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleDownload(report)}>
                              <Download className="mr-2 h-4 w-4" />
                              ดาวน์โหลด
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => handleView(report)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  ดู
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                  <DialogTitle>{report.title}</DialogTitle>
                                </DialogHeader>
                                <div className="py-4 space-y-3">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="text-muted-foreground">วันที่:</p>
                                      <p className="font-medium">{new Date(report.date).toLocaleDateString("th-TH")}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">ประเภท:</p>
                                      <p className="font-medium">{report.type}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">ความรุนแรง:</p>
                                      <p className="font-medium">{report.stats.severity ?? "ไม่ระบุ"}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">ชื่อผู้ป่วย:</p>
                                      <p className="font-medium">{report.stats.patientName ?? "ไม่ระบุ"}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">สถานะ:</p>
                                      <p className="font-medium">{report.stats.status ?? "ไม่ระบุ"}</p>
                                    </div>
                                    {report.details && (
                                      <>
                                        <div className="col-span-2">
                                          <p className="text-muted-foreground">คำอธิบาย:</p>
                                          <p className="font-medium">{report.details.description ?? "ไม่มี"}</p>
                                        </div>
                                        <div className="col-span-2">
                                          <p className="text-muted-foreground">สถานที่:</p>
                                          <p className="font-medium">{report.details.location?.address ?? "ไม่ระบุ"}</p>
                                        </div>
                                        <div className="col-span-2">
                                          <p className="text-muted-foreground">อาการ:</p>
                                          <p className="font-medium">
                                            {Array.isArray(report.details.symptoms)
                                              ? report.details.symptoms.join(", ")
                                              : "ไม่ระบุ"}
                                          </p>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}