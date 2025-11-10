"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useToast } from "@/shared/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import jsPDF from "jspdf";
import { webSocketClient } from "@lib/websocket";
import { cn } from "@lib/utils";

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
  const [reportType, setReportType] = useState(
    searchParams.get("type") || "all"
  );
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
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const filteredReports = useMemo(
    () =>
      allReports.filter((report) => {
        const matchesSearch =
          report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.stats.patientName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          report.type.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = reportType === "all" || report.type === reportType;

        const matchesStatus =
          filters.status === "all" || report.stats.status === filters.status;

        const matchesSeverity =
          filters.severity === "all" ||
          report.stats.severity?.toString() === filters.severity;

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
            matchesDate =
              reportDate.toDateString() === yesterday.toDateString();
          } else if (filters.date === "week") {
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(today.getDate() - 7);
            matchesDate = reportDate >= oneWeekAgo && reportDate <= today;
          }
        }

        return (
          matchesSearch &&
          matchesType &&
          matchesStatus &&
          matchesSeverity &&
          matchesDate
        );
      }),
    [allReports, searchQuery, reportType, filters]
  );

  const filteredStats = useMemo(() => {
    const total = filteredReports.length;
    const pending = filteredReports.filter(
      (r) => r.stats.status === "pending"
    ).length;
    const critical = filteredReports.filter(
      (r) => r.stats.severity === 4
    ).length;
    const completed = filteredReports.filter(
      (r) => r.stats.status === "completed"
    ).length;
    return { total, pending, critical, completed };
  }, [filteredReports]);

  const getToken = useCallback((): string | null => {
    return localStorage.getItem("access_token");
  }, []);

  const fetchStats = useCallback(
    async (token: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error(
            `Failed to fetch stats: ${response.status} ${response.statusText}`
          );
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
    },
    [toast, API_BASE_URL]
  );

  const fetchReports = useCallback(
    async (token: string) => {
      if (!token) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/dashboard/active-emergencies`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch reports: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        const transformedReports: Report[] = data.map((emergency: any) => ({
          id: emergency.id,
          title: emergency.title || `Emergency Case ${emergency.id}`,
          type: emergency.emergencyType || emergency.type || "emergency",
          date: emergency.reportedAt || emergency.createdAt,
          stats: {
            severity:
              emergency.medicalInfo?.severity || emergency.severity || 0,
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
    },
    [toast, API_BASE_URL]
  );

  const fetchNotifications = useCallback(
    async (token: string) => {
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
    },
    [toast, API_BASE_URL]
  );

  const markNotificationAsRead = useCallback(
    async (id: string) => {
      const token = getToken();
      if (!token) throw new Error("No token available");
      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/${id}/read`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok)
          throw new Error("Failed to mark notification as read");
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id ? { ...notif, isRead: true } : notif
          )
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
    },
    [getToken, toast, API_BASE_URL]
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    const token = getToken();
    if (!token) throw new Error("No token available");
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        throw new Error("Failed to mark all notifications as read");
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
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

  const addThaiFont = useCallback((doc: jsPDF) => {
    // Replace the placeholder below with the actual base64-encoded string of a Thai font file (e.g., Sarabun-Regular.ttf).
    // To get the base64:
    // 1. Download a Thai font like Sarabun from https://fonts.google.com/specimen/Sarabun
    // 2. Use the jsPDF font converter tool: https://rawgit.com/MrRio/jsPDF/master/dist/jspdf.fontconverter.html
    // 3. Upload the .ttf file, convert, and copy the base64 string from the generated JS file.
    const thaiFontBase64 = "AAEAAAAOAIAAAwBgT1MvMjY0MTA4AA..."; // Placeholder - replace with full base64

    doc.addFileToVFS("Sarabun-Regular.ttf", thaiFontBase64);
    doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
  }, []);

  const extractLocationFromDescription = useCallback(
    (description?: string): string => {
      if (!description) return "ไม่ระบุ";
      // Extract location like "หน้าบ้านเลขที่ 99/12"
      const match = description.match(/หน้าบ้านเลขที่\s*(\d+(?:\/\d+)?)/i);
      if (match) {
        return `หน้าบ้านเลขที่ ${match[1]}`;
      }
      // Fallback: look for any address-like pattern
      const addressMatch = description.match(
        /(?:ที่|สถานที่|บ้าน|ซอย|ถนน|หมู่)\s*[^.,\s]*\s*(\d+(?:\/\d+)?(?:[^.,\s]*)?)/i
      );
      if (addressMatch) {
        return addressMatch[0];
      }
      return "ไม่ระบุ";
    },
    []
  );

  const extractSymptomsFromDescription = useCallback(
    (description?: string): string => {
      if (!description) return "ไม่ระบุ";
      // Extract symptoms before "ไม่ทราบสาเหตุ" or similar
      const symptomMatch = description.match(
        /ผู้ป่วย\s*(.*?)(?:\s*ไม่ทราบสาเหตุ|\s*$)/i
      );
      if (symptomMatch && symptomMatch[1].trim()) {
        return symptomMatch[1].trim();
      }
      // Fallback: first part after "ผู้ป่วย"
      const simpleMatch = description.match(/ผู้ป่วย\s*(.*?)(?=\.|,|$)/i);
      if (simpleMatch && simpleMatch[1].trim()) {
        return simpleMatch[1].trim();
      }
      return "ไม่ระบุ";
    },
    []
  );

  const generatePDF = useCallback(
    (report: Report) => {
      const doc = new jsPDF("p", "mm", "a4");
      addThaiFont(doc);
      doc.setFont("Sarabun", "normal");
      doc.setFontSize(18);
      doc.text(`รายงาน: ${report.title}`, 20, 20);
      doc.setFontSize(12);
      doc.text(
        `วันที่: ${new Date(report.date).toLocaleDateString("th-TH")}`,
        20,
        30
      );
      doc.text(`ประเภท: ${report.type}`, 20, 40);
      doc.text(`ความรุนแรง: ${report.stats.severity ?? "ไม่ระบุ"}`, 20, 50);
      doc.text(`ชื่อผู้ป่วย: ${report.stats.patientName ?? "ไม่ระบุ"}`, 20, 60);
      doc.text(`สถานะ: ${report.stats.status ?? "ไม่ระบุ"}`, 20, 70);
      if (report.details) {
        doc.text(`คำอธิบาย: ${report.details.description ?? "ไม่มี"}`, 20, 80);
        const locationText =
          report.details.location?.address ??
          report.details.location ??
          extractLocationFromDescription(report.details.description);
        doc.text(`สถานที่: ${locationText}`, 20, 90);
        let symptomsText = "ไม่ระบุ";
        if (Array.isArray(report.details.symptoms)) {
          symptomsText = report.details.symptoms.join(", ");
        } else if (report.details.symptoms) {
          symptomsText = report.details.symptoms;
        } else {
          symptomsText = extractSymptomsFromDescription(
            report.details.description
          );
        }
        doc.text(`อาการ: ${symptomsText}`, 20, 100);
      }
      return doc;
    },
    [
      addThaiFont,
      extractLocationFromDescription,
      extractSymptomsFromDescription,
    ]
  );

  const handleDownload = useCallback(
    (report: Report) => {
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
    },
    [generatePDF, toast]
  );

  const handleDownloadAll = useCallback(() => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      addThaiFont(doc);
      doc.setFont("Sarabun", "normal");
      doc.setFontSize(18);
      doc.text("รายงานทั้งหมด", 20, 20);
      doc.setFontSize(12);
      let y = 30;
      filteredReports.forEach((report, index) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.text(`รายงาน ${index + 1}: ${report.title}`, 20, y);
        y += 10;
        doc.text(
          `วันที่: ${new Date(report.date).toLocaleDateString("th-TH")}`,
          20,
          y
        );
        y += 10;
        doc.text(`ประเภท: ${report.type}`, 20, y);
        y += 10;
        doc.text(`ความรุนแรง: ${report.stats.severity ?? "ไม่ระบุ"}`, 20, y);
        y += 10;
        doc.text(
          `ชื่อผู้ป่วย: ${report.stats.patientName ?? "ไม่ระบุ"}`,
          20,
          y
        );
        y += 10;
        doc.text(`สถานะ: ${report.stats.status ?? "ไม่ระบุ"}`, 20, y);
        y += 15;
      });
      doc.save("all_reports.pdf");
      toast({
        title: "ดาวน์โหลดสำเร็จ",
        description: "รายงานทั้งหมดถูกดาวน์โหลดเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error("Error downloading all reports:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดาวน์โหลดรายงานทั้งหมดได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    }
  }, [filteredReports, toast, addThaiFont]);

  const handleView = useCallback((report: Report) => {
    setSelectedReport(report);
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setReportType(value);
  }, []);

  const handleFilterChange = useCallback(
    (key: keyof Filters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

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

  // Helper to get location text
  const getLocationText = useCallback(
    (details?: any): string => {
      if (details?.location?.address) return details.location.address;
      if (details?.location) return details.location;
      return extractLocationFromDescription(details?.description);
    },
    [extractLocationFromDescription]
  );

  // Helper to get symptoms text
  const getSymptomsText = useCallback(
    (details?: any): string | string[] => {
      if (Array.isArray(details?.symptoms)) return details.symptoms;
      if (details?.symptoms) return details.symptoms;
      return extractSymptomsFromDescription(details?.description);
    },
    [extractSymptomsFromDescription]
  );

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
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">รายงาน</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            จัดการและติดตามรายงานทั้งหมด
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="ค้นหารายงานด้วย ID, ชื่อผู้ป่วย, หรือประเภท..."
              className="pl-8 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={reportType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-[180px] rounded-lg">
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
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-[130px] rounded-lg">
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
              onValueChange={(value) => handleFilterChange("severity", value)}
            >
              <SelectTrigger className="w-[130px] rounded-lg">
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
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-lg"
                >
                  <Filter className="h-4 w-4" />
                  ตัวกรองเพิ่มเติม
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-lg">
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
                  onCheckedChange={() =>
                    handleFilterChange("date", "yesterday")
                  }
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

            <Button
              onClick={() => fetchReports(getToken() || "")}
              disabled={isLoading}
              className="rounded-lg"
            >
              <FileText className="mr-2 h-4 w-4" />
              {isLoading ? "กำลังโหลด..." : "รีเฟรชข้อมูล"}
            </Button>

            <Button onClick={handleDownloadAll} className="rounded-lg">
              <Download className="mr-2 h-4 w-4" />
              ดาวน์โหลดทั้งหมด
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              กำลังโหลดข้อมูล...
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-800 shadow-md rounded-xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      รวมทั้งหมด
                    </p>
                    <FileText className="h-4 w-4 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold">{filteredStats.total}</h3>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-800 shadow-md rounded-xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      รอการดำเนินการ
                    </p>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <h3 className="text-2xl font-bold">
                    {filteredStats.pending}
                  </h3>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-slate-800 shadow-md rounded-xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      วิกฤต
                    </p>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold">
                    {filteredStats.critical}
                  </h3>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-slate-800 shadow-md rounded-xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      เสร็จสิ้น
                    </p>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold">
                    {filteredStats.completed}
                  </h3>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-white dark:bg-slate-800">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent p-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5 text-primary" />
                  รายงาน ({filteredReports.length} รายการ)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-slate-500 dark:text-slate-400">
                      ไม่พบรายงานที่ตรงกับเกณฑ์การค้นหา
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                          <TableHead>รายงาน ID</TableHead>
                          <TableHead>ชื่อ</TableHead>
                          <TableHead>ประเภท</TableHead>
                          <TableHead>วันที่</TableHead>
                          <TableHead>ความรุนแรง</TableHead>
                          <TableHead>สถานะ</TableHead>
                          <TableHead className="text-right">การกระทำ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.map((report) => (
                          <TableRow
                            key={report.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <TableCell className="font-medium">
                              #{report.id.slice(-8)}
                            </TableCell>
                            <TableCell>{report.title}</TableCell>
                            <TableCell>{report.type}</TableCell>
                            <TableCell>
                              {new Date(report.date).toLocaleDateString(
                                "th-TH"
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  report.stats.severity === 4
                                    ? "text-red-600 border-red-600"
                                    : report.stats.severity === 3
                                    ? "text-orange-600 border-orange-600"
                                    : report.stats.severity === 2
                                    ? "text-yellow-600 border-yellow-600"
                                    : "text-green-600 border-green-600"
                                )}
                              >
                                ระดับ {report.stats.severity ?? "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  report.stats.status === "pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : report.stats.status === "assigned"
                                    ? "bg-blue-100 text-blue-800"
                                    : report.stats.status === "in-progress"
                                    ? "bg-purple-100 text-purple-800"
                                    : report.stats.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                )}
                              >
                                {report.stats.status?.charAt(0).toUpperCase() +
                                  report.stats.status?.slice(1) || "Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(report)}
                                  className="hover:bg-primary/10"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownload(report)}
                                  className="hover:bg-primary/10"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* View Dialog */}
        <Dialog
          open={!!selectedReport}
          onOpenChange={() => setSelectedReport(null)}
        >
          <DialogContent className="sm:max-w-[600px] rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedReport?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground font-medium">วันที่:</p>
                  <p>
                    {selectedReport &&
                      new Date(selectedReport.date).toLocaleDateString("th-TH")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">ประเภท:</p>
                  <p>{selectedReport?.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">
                    ความรุนแรง:
                  </p>
                  <p>ระดับ {selectedReport?.stats.severity ?? "ไม่ระบุ"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">
                    ชื่อผู้ป่วย:
                  </p>
                  <p>{selectedReport?.stats.patientName ?? "ไม่ระบุ"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">สถานะ:</p>
                  <p>{selectedReport?.stats.status ?? "ไม่ระบุ"}</p>
                </div>
              </div>
              {selectedReport?.details && (
                <>
                  <div>
                    <p className="text-muted-foreground font-medium mb-1">
                      คำอธิบาย:
                    </p>
                    <p className="bg-muted/50 p-3 rounded-lg">
                      {selectedReport.details.description ?? "ไม่มี"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium mb-1">
                      สถานที่:
                    </p>
                    <p className="bg-muted/50 p-3 rounded-lg">
                      {getLocationText(selectedReport.details)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium mb-1">
                      อาการ:
                    </p>
                    <p className="bg-muted/50 p-3 rounded-lg">
                      {Array.isArray(getSymptomsText(selectedReport.details))
                        ? getSymptomsText(selectedReport.details).join(", ")
                        : getSymptomsText(selectedReport.details)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
