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
  Bell,
  Hospital,
  Activity,
  Search,
  ArrowRight,
} from "lucide-react";
import CaseCard from "@/components/dashboard/case-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { webSocketClient } from "@/lib/websocket";

interface EmergencyCase {
  id: string;
  title: string;
  status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  severity: 1 | 2 | 3 | 4;
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
  description: string;
  symptoms: string[];
}

interface DashboardStats {
  totalEmergencies: number;
  activeEmergencies: number;
  completedEmergencies: number;
  cancelledEmergencies: number;
  criticalCases: number;
  connectedHospitals: number;
}

export default function EmergencyCenterDashboard() {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // คำนวณ activeEmergencies จาก cases
  const computedActiveEmergencies = cases.filter((c) => c.status === "PENDING").length;

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      // อัปเดต stats โดยคำนวณ activeEmergencies จาก cases
      setStats({
        ...data,
        activeEmergencies: computedActiveEmergencies,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลสถิติได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    }
  };

  const fetchActiveEmergencies = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/active-emergencies`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch emergencies");
      const data = await response.json();
      console.log("API Response:", data); // Debug API response

      const formattedCases: EmergencyCase[] = data.map((item: any) => {
        const symptomsData = item.medicalInfo?.symptoms;
        const symptoms = Array.isArray(symptomsData)
          ? symptomsData
          : symptomsData
          ? [symptomsData.toString()]
          : [];

        const severity = Number(item.medicalInfo?.severity) || (item.grade === "URGENT" ? 4 : 1);

        // กำหนดสถานะที่เข้มงวดโดยใช้รายการที่กำหนดไว้
        const validStatuses = ["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
        const statusFromApi = item.status?.toUpperCase() || "PENDING";
        const status = validStatuses.includes(statusFromApi as any)
          ? statusFromApi
          : "PENDING"; // Fallback เป็น PENDING ถ้าไม่รู้จัก

        return {
          id: item.id,
          title: item.description.slice(0, 50) + "...",
          status: status,
          severity: severity,
          reportedAt: item.createdAt || new Date().toISOString(),
          patientName: `${item.patient?.firstName || ""} ${item.patient?.lastName || ""}`.trim() || "Unknown",
          contactNumber: item.patient?.phone || "",
          emergencyType: item.type || item.medicalInfo?.emergencyType || "Unknown",
          location: {
            address: item.location || "Unknown",
            coordinates: {
              lat: item.latitude || 0,
              lng: item.longitude || 0,
            },
          },
          assignedTo: item.responses?.[0]?.organization?.name,
          description: item.description || "No description available",
          symptoms,
        };
      });
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

  const handleAssignCase = async (caseId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sos/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            caseId,
            assignedToId: "thonburi-hospital-id",
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to assign case");
      toast({
        title: "มอบหมายเคสสำเร็จ",
        description: `เคส ${caseId} ถูกมอบหมายให้ Thonburi Hospital`,
      });
      await fetchActiveEmergencies();
      await fetchStats(); // อัปเดต stats หลังจาก assign
    } catch (error) {
      console.error("Error assigning case:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถมอบหมายเคสได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    }
  };

  const handleCancelCase = async (caseId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sos/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ caseId }),
        }
      );
      if (!response.ok) throw new Error("Failed to cancel case");
      toast({
        title: "ยกเลิกเคสสำเร็จ",
        description: `เคส ${caseId} ถูกยกเลิก`,
      });
      await fetchActiveEmergencies();
      await fetchStats(); // อัปเดต stats หลังจาก cancel
    } catch (error) {
      console.error("Error cancelling case:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถยกเลิกเคสได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      webSocketClient.connect(token);

      webSocketClient.onStatusUpdate((data) => {
        console.log("Status update received:", data);
        fetchActiveEmergencies();
        fetchStats(); // อัปเดต stats เมื่อสถานะเปลี่ยน
        toast({
          title: "อัปเดตสถานะ",
          description: `เคส ${data.caseId} อัปเดตเป็น ${data.status}`,
        });
      });

      webSocketClient.on("notification", (data) => {
        console.log("Notification received:", data);
        toast({
          title: data.title,
          description: data.body,
        });
      });

      webSocketClient.onEmergency((data) => {
        console.log("New emergency case:", data);
        fetchActiveEmergencies();
        fetchStats(); // อัปเดต stats เมื่อมีเคสใหม่
        toast({
          title: "เคสฉุกเฉินใหม่",
          description: `เคส ${data.id} ถูกสร้าง`,
        });
      });
    }

    fetchStats();
    fetchActiveEmergencies();

    return () => {
      webSocketClient.disconnect();
    };
  }, []);

  // อัปเดต stats.activeEmergencies เมื่อ cases เปลี่ยนแปลง
  useEffect(() => {
    if (stats) {
      setStats({
        ...stats,
        activeEmergencies: computedActiveEmergencies,
      });
    }
  }, [cases]);

  const filteredCases = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="emergency-center">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">แดชบอร์ดศูนย์ฉุกเฉิน</h1>
            <p className="text-slate-500 dark:text-slate-400">
              จัดการและติดตามเคสฉุกเฉิน
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              การแจ้งเตือน
            </Button>
            <Button>
              สร้างเคสใหม่
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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
                  <div className="text-2xl font-bold">
                    {stats.activeEmergencies}
                  </div>
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
                  <div className="text-2xl font-bold">
                    {cases.filter((c) => c.status === "IN_PROGRESS").length}
                  </div>
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
                  <div className="text-2xl font-bold">{stats.criticalCases}</div>
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
                  <div className="text-2xl font-bold">
                    {stats.connectedHospitals}
                  </div>
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
              <TabsTrigger value="PENDING">
                รอการดำเนินการ{" "}
                <Badge className="ml-1">
                  {cases.filter((c) => c.status === "PENDING").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="ASSIGNED">
                มอบหมายแล้ว{" "}
                <Badge className="ml-1">
                  {cases.filter((c) => c.status === "ASSIGNED").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="IN_PROGRESS">
                กำลังดำเนินการ{" "}
                <Badge className="ml-1">
                  {cases.filter((c) => c.status === "IN_PROGRESS").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="COMPLETED">
                เสร็จสิ้น{" "}
                <Badge className="ml-1">{stats?.completedEmergencies || 0}</Badge>
              </TabsTrigger>
            </TabsList>

            {["all", "PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED"].map(
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
                            {...emergencyCase}
                            severity={emergencyCase.severity as 1 | 2 | 3 | 4}
                            status={emergencyCase.status.toLowerCase().replace(/_/g, "-") as "pending" | "assigned" | "in-progress" | "completed" | "cancelled"}
                            onAssign={() => handleAssignCase(emergencyCase.id)}
                            onCancel={() => handleCancelCase(emergencyCase.id)}
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
      </div>
    </DashboardLayout>
  );
}