"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Clock,
  Hospital,
  Activity,
  Search,
} from "lucide-react";
import CaseCard from "@/components/dashboard/case-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { webSocketClient } from "@/lib/websocket";
import NotificationPanel from "@/components/dashboard/NotificationPanel";

// Interface สำหรับโครงสร้างข้อมูลจาก API
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

export default function EmergencyCenterDashboard() {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        description: "ไม่สามารถดึงข้อมูลสถิติได้ กรุณาลองใหม่",
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
      console.log("Raw API Data:", data);
      const formattedCases: EmergencyCase[] = data.map((item: EmergencyRequestFromApi) => {
        const symptomsData = item.medicalInfo?.symptoms;
        const symptoms = Array.isArray(symptomsData)
          ? symptomsData
          : symptomsData
          ? [symptomsData.toString()]
          : [];

        const validGrades = ["CRITICAL", "URGENT", "NON_URGENT"] as const;
        const gradeFromApi = (item.medicalInfo?.grade || item.grade)?.toUpperCase();
        const grade = validGrades.includes(gradeFromApi as any)
          ? gradeFromApi
          : null;

        if (!grade) {
          console.warn(`Missing or invalid grade for case ${item.id}, skipping...`);
          return null;
        }

        return {
          id: item.id,
          description: (item.description || "No description available").slice(0, 50) + "...",
          descriptionFull: item.description || "No description available",
          status: item.status.toLowerCase() as "pending" | "assigned" | "in-progress" | "completed" | "cancelled",
          grade: grade as "CRITICAL" | "URGENT" | "NON_URGENT",
          reportedAt: item.createdAt,
          patientName: `${item.patient.firstName} ${item.patient.lastName}`.trim() || "Unknown",
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
      }).filter((c: EmergencyCase | null): c is EmergencyCase => c !== null);
      setCases(formattedCases);
    } catch (error) {
      console.error("Error fetching emergencies:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลเคสฉุกเฉินได้ กรุณาลองใหม่",
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
      setHasUnreadNotifications(data.some((n: Notification) => !n.isRead));
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
        setHasUnreadNotifications(updated.some((n) => !n.isRead));
        return updated;
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to mark all notifications as read");
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setHasUnreadNotifications(false);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถทำเครื่องหมายว่าอ่านทั้งหมดแล้วได้ กรุณาลองใหม่",
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
        setCases((prevCases) =>
          prevCases.map((c) =>
            c.id === data.emergencyId
              ? { ...c, status: data.status.toLowerCase(), assignedTo: data.assignedTo || c.assignedTo }
              : c
          )
        );
        toast({
          title: "อัปเดตสถานะ",
          description: `เคส ${data.emergencyId} อัปเดตเป็น ${data.status}`,
        });
      };

      const notificationHandler = (data: any) => {
        console.log("Notification received:", data);
        setNotifications((prev) => [data, ...prev]);
        setHasUnreadNotifications(true);
        toast({
          title: data.title,
          description: data.body,
        });
      };

      const emergencyHandler = (data: any) => {
        console.log("New emergency case:", data);
        const newCase: EmergencyCase = {
          id: data.id,
          description: (data.description || "No description available").slice(0, 50) + "...",
          descriptionFull: data.description || "No description available",
          status: "pending",
          grade: data.grade.toUpperCase() as "CRITICAL" | "URGENT" | "NON_URGENT",
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
        setCases((prev) => [newCase, ...prev]);
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
        if (webSocketClient && !webSocketClient['socket']?.connected) {
          webSocketClient.connect(token);
        }
      }, 5000);

      // โหลดข้อมูลเริ่มต้น
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
  }, []);

  const filteredCases = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 👇 คำนวณจำนวนเคสตามสถานะ
  const pendingCases = cases.filter((c) => c.status === "pending").length;
  const assignedCases = cases.filter((c) => c.status === "assigned").length;
  const inProgressCases = cases.filter((c) => c.status === "in-progress").length;
  const workingCases = assignedCases + inProgressCases; // กำลังดำเนินการ
  const criticalCases = cases.filter((c) => c.grade === "CRITICAL").length;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout 
      role="emergency-center"
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={markNotificationAsRead}
      onMarkAllAsRead={markAllNotificationsAsRead}
    >
      <div className="relative space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">แดชบอร์ดศูนย์ฉุกเฉิน</h1>
            <p className="text-slate-500 dark:text-slate-400">
              จัดการและติดตามเคสฉุกเฉิน
            </p>
          </div>
          <div className="flex gap-2">
            {isMounted && (
              <Button
                variant="outline"
                className="relative flex items-center gap-2 p-2 bg-yellow-200 hover:bg-yellow-300 text-gray-800 rounded-full shadow-md transition-all duration-200"
                onClick={() => setIsNotificationPanelOpen(true)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {hasUnreadNotifications && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                    !
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  เคสรอการดำเนินการ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{pendingCases}</div>
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  เคสที่กำลังดำเนินการ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{workingCases}</div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  เคสวิกฤต
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{criticalCases}</div>
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  โรงพยาบาลที่เชื่อมต่อ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats?.connectedHospitals || 0}</div>
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <Hospital className="h-5 w-5 text-green-600 dark:text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <h2 className="text-xl font-bold">เคสฉุกเฉิน</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="search"
                placeholder="ค้นหาเคส..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">ทุกเคส</TabsTrigger>
              <TabsTrigger value="pending">
                รอการดำเนินการ{" "}
                <Badge className="ml-1">
                  {pendingCases}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="assigned">
                มอบหมายแล้ว{" "}
                <Badge className="ml-1">
                  {cases.filter((c) => c.status === "assigned").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                กำลังดำเนินการ{" "}
                <Badge className="ml-1">
                  {cases.filter((c) => c.status === "in-progress").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                เสร็จสิ้น{" "}
                <Badge className="ml-1">{stats?.completedEmergencies || 0}</Badge>
              </TabsTrigger>
            </TabsList>

            {["all", "pending", "assigned", "in-progress", "completed"].map(
              (tabValue) => (
                <TabsContent key={tabValue} value={tabValue} className="space-y-4">
                  {filteredCases.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500 dark:text-slate-400">
                        ไม่พบเคส
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredCases
                        .filter(
                          (c) => tabValue === "all" || c.status === tabValue
                        )
                        .map((emergencyCase) => (
                          <CaseCard
                            key={emergencyCase.id}
                            id={emergencyCase.id}
                            description={emergencyCase.description}
                            descriptionFull={emergencyCase.descriptionFull}
                            status={emergencyCase.status}
                            grade={emergencyCase.grade}
                            reportedAt={emergencyCase.reportedAt}
                            patientName={emergencyCase.patientName}
                            contactNumber={emergencyCase.contactNumber}
                            emergencyType={emergencyCase.emergencyType}
                            location={emergencyCase.location}
                            assignedTo={emergencyCase.assignedTo}
                            symptoms={emergencyCase.symptoms}
                            role="emergency-center"
                          />
                        ))}
                    </div>
                  )}
                </TabsContent>
              )
            )}
          </Tabs>
        </div>

        {isMounted && (
          <NotificationPanel
            isOpen={isNotificationPanelOpen}
            onClose={() => setIsNotificationPanelOpen(false)}
            notifications={notifications}
            onMarkAsRead={markNotificationAsRead}
            onMarkAllAsRead={markAllNotificationsAsRead}
          />
        )}
      </div>
    </DashboardLayout>
  );
}