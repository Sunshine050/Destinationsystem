"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Clock,
  Hospital,
  Activity,
  Search,
  TrendingUp,
  BarChart3,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/app/shared/hooks/use-toast";
import { webSocketClient } from "@/lib/websocket";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Interfaces
interface EmergencyRequestFromApi {
  id: string;
  description: string;
  status: string;
  grade: string;
  createdAt: string;
  patient: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  type: string;
  emergencyType?: string;
  medicalInfo?: {
    grade?: string;
    symptoms?: string | string[];
    emergencyType?: string;
  };
  location?: string;
  latitude?: number;
  longitude?: number;
  responses?: Array<{
    organization?: {
      name?: string;
    };
  }>;
}

interface EmergencyCase {
  id: string;
  description: string;
  descriptionFull: string;
  status: "pending" | "assigned" | "in-progress" | "completed" | "cancelled";
  grade: "CRITICAL" | "URGENT" | "NON_URGENT";
  reportedAt: string;
  patientName: string;
  contactNumber: string;
  emergencyType: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  assignedTo?: string;
  symptoms: string[];
}

interface DashboardStats {
  totalEmergencies: number;
  activeEmergencies: number;
  completedEmergencies: number;
  cancelledEmergencies: number;
  criticalCases: number;
  connectedHospitals: number;
  averageResponseTime: number;
  availableHospitalBeds: number;
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

interface MonthlyTrendData {
  month: string;
  admissions: number;
  readmissions: number;
  inpatient: number;
  outpatient: number;
  critical: number;
  urgent: number;
  nonUrgent: number;
}

// Component สำหรับ Case Card
function ModernCaseCard({
  emergencyCase,
  role,
  onViewDetails,
}: {
  emergencyCase: EmergencyCase;
  role: string;
  onViewDetails: (caseItem: EmergencyCase) => void;
}) {
  const gradeColors = {
    CRITICAL: "bg-red-500",
    URGENT: "bg-orange-500",
    NON_URGENT: "bg-yellow-500",
  };

  const statusColors = {
    pending: "bg-gray-500",
    assigned: "bg-blue-500",
    "in-progress": "bg-purple-500",
    completed: "bg-green-500",
    cancelled: "bg-gray-400",
  };

  const statusText = {
    pending: "รอดำเนินการ",
    assigned: "มอบหมายแล้ว",
    "in-progress": "กำลังดำเนินการ",
    completed: "เสร็จสิ้น",
    cancelled: "ยกเลิก",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                gradeColors[emergencyCase.grade]
              }`}
            />
            <span className="font-semibold text-sm">
              #{emergencyCase.id.slice(0, 8)}
            </span>
          </div>
          <Badge className={`${statusColors[emergencyCase.status]} text-white`}>
            {statusText[emergencyCase.status]}
          </Badge>
        </div>

        <h3 className="font-semibold mb-2">{emergencyCase.emergencyType}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          {emergencyCase.description}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">ผู้ป่วย:</span>
            <span className="font-medium">{emergencyCase.patientName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">สถานที่:</span>
            <span className="font-medium">
              {emergencyCase.location.address}
            </span>
          </div>
          {emergencyCase.assignedTo && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">มอบหมายให้:</span>
              <span className="font-medium">{emergencyCase.assignedTo}</span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t flex justify-between items-center text-xs text-slate-500">
          <span>
            {new Date(emergencyCase.reportedAt).toLocaleString("th-TH")}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(emergencyCase)}
          >
            ดูรายละเอียด
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EmergencyCenterDashboard() {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("12-months");
  const [monthlyTrendData, setMonthlyTrendData] = useState<MonthlyTrendData[]>(
    []
  );
  const [open, setOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<EmergencyCase | null>(null);
  const { toast } = useToast();

  const handleViewDetails = (caseItem: EmergencyCase) => {
    setSelectedCase(caseItem);
    setOpen(true);
  };

  // ฟังก์ชันประมวลผลข้อมูลเคสสำหรับกราฟ
  const processCaseDataForCharts = (cases: EmergencyCase[], period: string) => {
    const months: { [key: string]: MonthlyTrendData } = {};
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(now.getMonth() - (period === "12-months" ? 11 : 23));

    cases.forEach((caseItem) => {
      const caseDate = new Date(caseItem.reportedAt);
      if (caseDate >= startDate) {
        const monthKey = caseDate.toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        });

        if (!months[monthKey]) {
          months[monthKey] = {
            month: monthKey,
            admissions: 0,
            readmissions: 0,
            inpatient: 0,
            outpatient: 0,
            critical: 0,
            urgent: 0,
            nonUrgent: 0,
          };
        }

        months[monthKey].admissions += 1;
        if (caseItem.status === "completed" && caseItem.assignedTo) {
          months[monthKey].readmissions += 1;
        }
        if (caseItem.grade === "CRITICAL") {
          months[monthKey].inpatient += 1;
          months[monthKey].critical += 1;
        } else if (caseItem.grade === "URGENT") {
          months[monthKey].outpatient += 1;
          months[monthKey].urgent += 1;
        } else {
          months[monthKey].outpatient += 1;
          months[monthKey].nonUrgent += 1;
        }
      }
    });

    // แปลงเป็น array และเรียงตามวันที่
    const trendData = Object.values(months).sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

    return trendData;
  };

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลสถิติได้",
        variant: "destructive",
      });
    }
  };

  const fetchActiveEmergencies = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/active-emergencies`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch emergencies");
      const data = await response.json();
      const formattedCases: EmergencyCase[] = data
        .map((item: EmergencyRequestFromApi) => {
          const symptomsData = item.medicalInfo?.symptoms;
          const symptoms = Array.isArray(symptomsData)
            ? symptomsData
            : symptomsData
            ? [symptomsData.toString()]
            : [];

          const validGrades = ["CRITICAL", "URGENT", "NON_URGENT"] as const;
          const gradeFromApi = (
            item.medicalInfo?.grade || item.grade
          )?.toUpperCase();
          const grade = validGrades.includes(gradeFromApi as any)
            ? gradeFromApi
            : "NON_URGENT";

          return {
            id: item.id,
            description:
              (item.description || "No description available").slice(0, 50) +
              "...",
            descriptionFull: item.description || "No description available",
            status: item.status.toLowerCase() as
              | "pending"
              | "assigned"
              | "in-progress"
              | "completed"
              | "cancelled",
            grade: grade as "CRITICAL" | "URGENT" | "NON_URGENT",
            reportedAt: item.createdAt,
            patientName:
              `${item.patient.firstName} ${item.patient.lastName}`.trim() ||
              "Unknown",
            contactNumber: item.patient.phone || "",
            emergencyType: item.emergencyType || item.type || "Unknown",
            location: {
              address: item.location || "Unknown",
              coordinates: {
                lat: item.latitude || 0,
                lng: item.longitude || 0,
              },
            },
            assignedTo: item.responses?.[0]?.organization?.name,
            symptoms,
          };
        })
        .filter((c: EmergencyCase | null): c is EmergencyCase => c !== null);
      setCases(formattedCases);
      // ประมวลผลข้อมูลสำหรับกราฟเมื่อดึงเคสสำเร็จ
      setMonthlyTrendData(
        processCaseDataForCharts(formattedCases, selectedPeriod)
      );
    } catch (error) {
      console.error("Error fetching emergencies:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลเคสฉุกเฉินได้",
        variant: "destructive",
      });
    }
  };

  const fetchNotifications = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลการแจ้งเตือนได้",
        variant: "destructive",
      });
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token available");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to mark notification as read");
      setNotifications((prev) => {
        const updated = prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        );
        return updated;
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะการแจ้งเตือนได้",
        variant: "destructive",
      });
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token available");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok)
        throw new Error("Failed to mark all notifications as read");
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะการแจ้งเตือนทั้งหมดได้",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      webSocketClient.connect(token);

      const statusUpdateHandler = (data: any) => {
        console.log("Status update received:", data);
        setCases((prevCases) => {
          const updatedCases = prevCases.map((c) =>
            c.id === data.emergencyId
              ? {
                  ...c,
                  status: data.status.toLowerCase(),
                  assignedTo: data.assignedTo || c.assignedTo,
                }
              : c
          );
          // อัปเดตกราฟเมื่อสถานะเคสเปลี่ยน
          setMonthlyTrendData(
            processCaseDataForCharts(updatedCases, selectedPeriod)
          );
          return updatedCases;
        });
        toast({
          title: "อัปเดตสถานะ",
          description: `เคส ${data.emergencyId} อัปเดตเป็น ${data.status}`,
        });
      };

      const notificationHandler = (data: any) => {
        console.log("Notification received:", data);
        setNotifications((prev) => [data, ...prev]);
        toast({
          title: data.title,
          description: data.body,
        });
      };

      const emergencyHandler = (data: any) => {
        console.log("New emergency case:", data);
        const newCase: EmergencyCase = {
          id: data.id,
          description:
            (data.description || "No description available").slice(0, 50) +
            "...",
          descriptionFull: data.description || "No description available",
          status: "pending",
          grade: data.grade.toUpperCase() as
            | "CRITICAL"
            | "URGENT"
            | "NON_URGENT",
          reportedAt: new Date().toISOString(),
          patientName: "Unknown",
          contactNumber: "",
          emergencyType: data.type || "Unknown",
          location: {
            address: data.location || "Unknown",
            coordinates: {
              lat: data.coordinates?.lat || 0,
              lng: data.coordinates?.lng || 0,
            },
          },
          assignedTo: data.assignedTo,
          symptoms: [],
        };
        setCases((prev) => {
          const updatedCases = [newCase, ...prev];
          // อัปเดตกราฟเมื่อมีเคสใหม่
          setMonthlyTrendData(
            processCaseDataForCharts(updatedCases, selectedPeriod)
          );
          return updatedCases;
        });
        toast({
          title: "เคสฉุกเฉินใหม่",
          description: `เคส ${data.id} ถูกสร้าง`,
        });
      };

      const hospitalCreatedHandler = (data: any) => {
        console.log("New hospital created:", data);
        setStats((prev) =>
          prev
            ? { ...prev, connectedHospitals: prev.connectedHospitals + 1 }
            : prev
        );
        toast({
          title: "โรงพยาบาลใหม่",
          description: `โรงพยาบาล ${data.name} ถูกสร้าง`,
        });
      };

      const statsUpdatedHandler = (data: any) => {
        console.log("Stats updated:", data);
        setStats(data);
      };

      webSocketClient.onStatusUpdate(statusUpdateHandler);
      webSocketClient.on("notification", notificationHandler);
      webSocketClient.onEmergency(emergencyHandler);
      webSocketClient.on("hospitalCreated", hospitalCreatedHandler);
      webSocketClient.on("statsUpdated", statsUpdatedHandler);

      webSocketClient.onDisconnect(() => {
        toast({
          title: "การเชื่อมต่อขาด",
          description: "WebSocket ถูกตัดการเชื่อมต่อ กรุณารีเฟรชหน้า",
          variant: "destructive",
        });
      });

      const checkConnection = setInterval(() => {
        if (webSocketClient && !webSocketClient["socket"]?.connected) {
          webSocketClient.connect(token);
        }
      }, 5000);

      fetchStats(token);
      fetchActiveEmergencies(token);
      fetchNotifications(token);

      return () => {
        clearInterval(checkConnection);
        webSocketClient.offStatusUpdate(statusUpdateHandler);
        webSocketClient.off("notification", notificationHandler);
        webSocketClient.offEmergency(emergencyHandler);
        webSocketClient.off("hospitalCreated", hospitalCreatedHandler);
        webSocketClient.off("statsUpdated", statsUpdatedHandler);
        webSocketClient.disconnect();
      };
    }
  }, [toast, selectedPeriod]);

  const filteredCases = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCases = cases.filter((c) => c.status === "pending").length;
  const assignedCases = cases.filter((c) => c.status === "assigned").length;
  const inProgressCases = cases.filter(
    (c) => c.status === "in-progress"
  ).length;
  const workingCases = assignedCases + inProgressCases;
  const criticalCases = cases.filter((c) => c.grade === "CRITICAL").length;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <DashboardLayout
      role="emergency-center"
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={markNotificationAsRead}
      onMarkAllAsRead={markAllNotificationsAsRead}
    >
      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Emergency Center Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Reporting Month:{" "}
              <span className="font-semibold">October 2025</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedPeriod === "6-months" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("6-months")}
            >
              <Calendar className="h-4 w-4 mr-2" />6 Months
            </Button>
            <Button
              variant={selectedPeriod === "12-months" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("12-months")}
            >
              12 Months
            </Button>
            <Button
              variant={selectedPeriod === "24-months" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("24-months")}
            >
              24 Months
            </Button>
          </div>
        </div>

        {/* Top Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-slate-900">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      All Admissions
                    </p>
                    <h3 className="text-3xl font-bold">
                      {stats.totalEmergencies}
                    </h3>
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Active Cases:</span>
                        <span className="font-semibold">
                          {stats.activeEmergencies}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Completed:</span>
                        <span className="font-semibold">
                          {stats.completedEmergencies}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950 dark:to-slate-900">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Critical Cases
                    </p>
                    <h3 className="text-3xl font-bold">
                      {stats.criticalCases}
                    </h3>
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">
                          Avg Response Time:
                        </span>
                        <span className="font-semibold">
                          {stats.averageResponseTime.toFixed(1)} min
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-white dark:from-red-950 dark:to-slate-900">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Inpatient
                    </p>
                    <h3 className="text-3xl font-bold">{criticalCases}</h3>
                    <div className="mt-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Cases:</span>
                        <span className="font-semibold">
                          {stats.totalEmergencies}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-slate-900">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Connected Hospitals
                    </p>
                    <h3 className="text-3xl font-bold">
                      {stats.connectedHospitals}
                    </h3>
                    <div className="mt-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Available Beds:</span>
                        <span className="font-semibold">
                          {stats.availableHospitalBeds}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Hospital className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Case Status Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={monthlyTrendData}>
                    <defs>
                      <linearGradient
                        id="colorAdmissions"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="admissions"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorAdmissions)"
                      name="Total Cases"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-500">No data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Critical Cases Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="critical"
                      stroke="#9333ea"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Critical Cases"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-500">No data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Case Severity Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={monthlyTrendData}>
                    <defs>
                      <linearGradient
                        id="colorCritical"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#dc2626"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#dc2626"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorUrgent"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f59e0b"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f59e0b"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorNonUrgent"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="critical"
                      stroke="#dc2626"
                      fillOpacity={1}
                      fill="url(#colorCritical)"
                      name="Critical"
                    />
                    <Area
                      type="monotone"
                      dataKey="urgent"
                      stroke="#f59e0b"
                      fillOpacity={1}
                      fill="url(#colorUrgent)"
                      name="Urgent"
                    />
                    <Area
                      type="monotone"
                      dataKey="nonUrgent"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorNonUrgent)"
                      name="Non-Urgent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-500">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Long term trends by Month */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">
                Long Term Trends - by Month
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={
                    selectedPeriod === "6-months" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedPeriod("6-months")}
                >
                  6 Months
                </Button>
                <Button
                  variant={
                    selectedPeriod === "12-months" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedPeriod("12-months")}
                >
                  12 Months
                </Button>
                <Button
                  variant={
                    selectedPeriod === "24-months" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedPeriod("24-months")}
                >
                  24 Months
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admissions">
              <TabsList className="mb-4">
                <TabsTrigger value="admissions">Total Admissions</TabsTrigger>
                <TabsTrigger value="severity">Case Severity</TabsTrigger>
              </TabsList>

              <TabsContent value="admissions">
                {monthlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyTrendData}>
                      <defs>
                        <linearGradient
                          id="colorAdmissions"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#06b6d4"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#06b6d4"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorReadmissions"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="admissions"
                        stroke="#06b6d4"
                        fillOpacity={1}
                        fill="url(#colorAdmissions)"
                        name="Total Admissions"
                      />
                      <Area
                        type="monotone"
                        dataKey="readmissions"
                        stroke="#3b82f6"
                        strokeDasharray="5 5"
                        fillOpacity={0.5}
                        fill="url(#colorReadmissions)"
                        name="Re-Admissions"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-500">
                    No data available
                  </p>
                )}
              </TabsContent>

              <TabsContent value="severity">
                {monthlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyTrendData}>
                      <defs>
                        <linearGradient
                          id="colorCritical"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#dc2626"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#dc2626"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorUrgent"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#f59e0b"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#f59e0b"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorNonUrgent"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="critical"
                        stroke="#dc2626"
                        fillOpacity={1}
                        fill="url(#colorCritical)"
                        name="Critical"
                      />
                      <Area
                        type="monotone"
                        dataKey="urgent"
                        stroke="#f59e0b"
                        fillOpacity={1}
                        fill="url(#colorUrgent)"
                        name="Urgent"
                      />
                      <Area
                        type="monotone"
                        dataKey="nonUrgent"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorNonUrgent)"
                        name="Non-Urgent"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-500">
                    No data available
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Emergency Cases Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <CardTitle className="text-xl font-bold">
                Emergency Cases
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder="Search cases..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Cases</TabsTrigger>
                <TabsTrigger value="pending">
                  Pending <Badge className="ml-1">{pendingCases}</Badge>
                </TabsTrigger>
                <TabsTrigger value="assigned">
                  Assigned <Badge className="ml-1">{assignedCases}</Badge>
                </TabsTrigger>
                <TabsTrigger value="in-progress">
                  In Progress <Badge className="ml-1">{inProgressCases}</Badge>
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed{" "}
                  <Badge className="ml-1">
                    {stats?.completedEmergencies || 0}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {["all", "pending", "assigned", "in-progress", "completed"].map(
                (tabValue) => (
                  <TabsContent
                    key={tabValue}
                    value={tabValue}
                    className="space-y-4"
                  >
                    {filteredCases.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No cases found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredCases
                          .filter(
                            (c) => tabValue === "all" || c.status === tabValue
                          )
                          .map((emergencyCase) => (
                            <ModernCaseCard
                              key={emergencyCase.id}
                              emergencyCase={emergencyCase}
                              role="emergency-center"
                              onViewDetails={handleViewDetails}
                            />
                          ))}
                      </div>
                    )}
                  </TabsContent>
                )
              )}
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500">
          <p>
            A Constellation Analytics development by Emergency Response System
          </p>
        </div>
      </div>

      {/* Case Details Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>รายละเอียดเคส #{selectedCase?.id}</DialogTitle>
            <div className="mt-2 space-y-4">
              {selectedCase && (
                <div className="space-y-4">
                  <div>
                    <strong>ประเภทฉุกเฉิน:</strong> {selectedCase.emergencyType}
                  </div>
                  <div>
                    <strong>คำอธิบายเต็ม:</strong>{" "}
                    {selectedCase.descriptionFull}
                  </div>
                  <div>
                    <strong>ระดับความรุนแรง:</strong> {selectedCase.grade}
                  </div>
                  <div>
                    <strong>สถานะ:</strong> {selectedCase.status}
                  </div>
                  <div>
                    <strong>ชื่อผู้ป่วย:</strong> {selectedCase.patientName}
                  </div>
                  <div>
                    <strong>เบอร์ติดต่อ:</strong> {selectedCase.contactNumber}
                  </div>
                  <div>
                    <strong>สถานที่:</strong> {selectedCase.location.address}{" "}
                    (Lat: {selectedCase.location.coordinates.lat}, Lng:{" "}
                    {selectedCase.location.coordinates.lng})
                  </div>
                  {selectedCase.assignedTo && (
                    <div>
                      <strong>มอบหมายให้:</strong> {selectedCase.assignedTo}
                    </div>
                  )}
                  <div>
                    <strong>อาการ:</strong>
                    <ul className="list-disc pl-5">
                      {selectedCase.symptoms.map((symptom, index) => (
                        <li key={index}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>รายงานเมื่อ:</strong>{" "}
                    {new Date(selectedCase.reportedAt).toLocaleString("th-TH")}
                  </div>
                </div>
              )}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
