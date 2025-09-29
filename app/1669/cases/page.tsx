"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Clock,
  Activity,
  ArrowRight,
  Plus,
  Search,
  Bell,
} from "lucide-react";
import CaseCard from "@/components/dashboard/case-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/components/websocket-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface EmergencyCase {
  id: string;
  title: string;
  status: string;
  severity: number;
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
  pending: number;
  assigned: number;
  inProgress: number;
  completed: number;
  critical: number;
  total: number;
  connectedHospitals: number;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

interface NewCaseData {
  title: string;
  patientName: string;
  contactNumber: string;
  emergencyType: string;
  locationAddress: string;
  latitude?: number;
  longitude?: number;
  description: string;
  severity: number;
}

export default function EmergencyCenterDashboard() {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    pending: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    critical: 0,
    total: 0,
    connectedHospitals: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newCaseOpen, setNewCaseOpen] = useState(false);
  const [newCaseData, setNewCaseData] = useState<NewCaseData>({
    title: "",
    patientName: "",
    contactNumber: "",
    emergencyType: "Accident",
    locationAddress: "",
    latitude: undefined,
    longitude: undefined,
    description: "",
    severity: 1,
  });
  const { toast } = useToast();
  const router = useRouter();
  const { client, connected } = useWebSocket();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          toast({
            title: "ข้อผิดพลาด",
            description: "ไม่พบโทเค็น กรุณาล็อกอินใหม่",
            variant: "destructive",
          });
          router.push("/login");
          return;
        }

        const statsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, // เพิ่ม 'dashboard'
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }
        );

        if (!statsResponse.ok) {
          if (statsResponse.status === 401) {
            toast({
              title: "ข้อผิดพลาด",
              description: "ไม่ได้รับอนุญาต กรุณาล็อกอินใหม่",
              variant: "destructive",
            });
            router.push("/login");
            return;
          }
          throw new Error("ไม่สามารถดึงข้อมูลสถิติได้");
        }
        const statsData = await statsResponse.json();

        const casesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/active-emergencies`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }
        );
        if (!casesResponse.ok) {
          if (casesResponse.status === 401) {
            toast({
              title: "ข้อผิดพลาด",
              description: "ไม่ได้รับอนุญาต กรุณาล็อกอินใหม่",
              variant: "destructive",
            });
            router.push("/login");
            return;
          }
          throw new Error("ไม่สามารถดึงข้อมูลเคสได้");
        }
        const casesData = await casesResponse.json();

        const mappedCases: EmergencyCase[] = casesData.map((c: any) => ({
          id: c.id,
          title: c.description.split(" - ")[0] || "Untitled Emergency",
          status: c.status,
          severity: (c.medicalInfo as any)?.severity || 1,
          reportedAt: c.createdAt.toISOString(),
          patientName:
            c.patient?.firstName + " " + c.patient?.lastName || "Unknown",
          contactNumber: c.patient?.phone || "N/A",
          emergencyType: (c.medicalInfo as any)?.emergencyType || "Unknown",
          location: {
            address: c.location || "Unknown",
            coordinates: {
              lat: c.latitude || 0,
              lng: c.longitude || 0,
            },
          },
          assignedTo: undefined,
          description: c.description || "",
          symptoms: [],
        }));

        setCases(mappedCases);
        setStats({
          pending: mappedCases.filter((c) => c.status === "PENDING").length,
          assigned: mappedCases.filter((c) => c.status === "ASSIGNED").length,
          inProgress: mappedCases.filter((c) => c.status === "IN_PROGRESS")
            .length,
          completed: mappedCases.filter((c) => c.status === "COMPLETED").length,
          critical: statsData.criticalCases || 0,
          total: statsData.totalEmergencies || 0,
          connectedHospitals: statsData.connectedHospitals || 0,
        });
      } catch (error) {
        console.error(
          "[EmergencyCenterDashboard] ข้อผิดพลาดในการดึงข้อมูล:",
          error
        );
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast, router]);

  useEffect(() => {
    if (!client || !connected) {
      toast({
        title: "WebSocket ตัดการเชื่อมต่อ",
        description:
          "ไม่สามารถรับการอัปเดตแบบเรียลไทม์ได้ กำลังพยายามเชื่อมต่อใหม่...",
        variant: "destructive",
      });
      return;
    }

    const handleEmergency = (data: EmergencyCase) => {
      setCases((prev) => [data, ...prev]);
      setStats((prev) => ({
        ...prev,
        pending: data.status === "PENDING" ? prev.pending + 1 : prev.pending,
        total: prev.total + 1,
        critical: data.severity === 4 ? prev.critical + 1 : prev.critical,
      }));
      toast({
        title: "เหตุฉุกเฉินใหม่",
        description: `รายงานเหตุฉุกเฉินประเภท ${data.emergencyType}`,
      });
    };

    const handleStatusUpdate = (data: any) => {
      setCases((prevCases) => {
        const updatedCases = prevCases.map((c) =>
          c.id === data.emergencyId
            ? { ...c, status: data.status, assignedTo: data.assignedTo }
            : c
        );
        setStats((prevStats) => ({
          ...prevStats,
          pending: updatedCases.filter((c) => c.status === "PENDING").length,
          assigned: updatedCases.filter((c) => c.status === "ASSIGNED").length,
          inProgress: updatedCases.filter((c) => c.status === "IN_PROGRESS")
            .length,
          completed: updatedCases.filter((c) => c.status === "COMPLETED")
            .length,
        }));
        return updatedCases;
      });
      toast({
        title: "อัปเดตสถานะ",
        description: `สถานะเหตุฉุกเฉิน ${data.emergencyId} อัปเดตเป็น ${data.status}`,
      });
    };

    const handleNotification = (data: Notification) => {
      setNotifications((prev) => {
        const updatedNotifications = [data, ...prev].slice(0, 10);
        return updatedNotifications;
      });
      toast({
        title: data.title,
        description: data.description || "ไม่มีคำอธิบาย",
      });
    };

    const handleDisconnect = () => {
      toast({
        title: "WebSocket ตัดการเชื่อมต่อ",
        description:
          "ไม่สามารถรับการอัปเดตแบบเรียลไทม์ได้ กำลังพยายามเชื่อมต่อใหม่...",
        variant: "destructive",
      });
    };

    client.on("emergency", handleEmergency);
    client.on("statusUpdate", handleStatusUpdate);
    client.on("notification", handleNotification);
    client.on("disconnect", handleDisconnect);

    return () => {
      client.off("emergency", handleEmergency);
      client.off("statusUpdate", handleStatusUpdate);
      client.off("notification", handleNotification);
      client.off("disconnect", handleDisconnect);
    };
  }, [client, connected, toast]);

  const filteredCases = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignCase = async (caseId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่พบโทเค็น กรุณาล็อกอินใหม่",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      const assignResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/assign-case`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            caseId,
            assignedToId: "thonburi-hospital-id",
          }),
        }
      );

      if (!assignResponse.ok) {
        if (assignResponse.status === 401) {
          toast({
            title: "ข้อผิดพลาด",
            description: "ไม่ได้รับอนุญาต กรุณาล็อกอินใหม่",
            variant: "destructive",
          });
          router.push("/login");
          return;
        }
        throw new Error("ไม่สามารถมอบหมายเคสได้");
      }

      toast({
        title: "มอบหมายเคสสำเร็จ",
        description: `เคส ${caseId} ถูกมอบหมายให้โรงพยาบาลธนบุรี`,
      });
    } catch (error) {
      console.error(
        "[EmergencyCenterDashboard] ข้อผิดพลาดในการมอบหมายเคส:",
        error
      );
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถมอบหมายเคสได้",
        variant: "destructive",
      });
    }
  };

  const handleCancelCase = async (caseId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่พบโทเค็น กรุณาล็อกอินใหม่",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      const cancelResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/cancel-case`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ caseId }),
        }
      );

      if (!cancelResponse.ok) {
        if (cancelResponse.status === 401) {
          toast({
            title: "ข้อผิดพลาด",
            description: "ไม่ได้รับอนุญาต กรุณาล็อกอินใหม่",
            variant: "destructive",
          });
          router.push("/login");
          return;
        }
        throw new Error("ไม่สามารถยกเลิกเคสได้");
      }

      // ✅ แก้ไข: ลบเคสออกจาก state แทน update status
      setCases((prev) => prev.filter((c) => c.id !== caseId));

      // ✅ อัปเดต stats ใหม่ให้ตรง backend
      setStats((prev) => ({
        ...prev,
        pending: Math.max(prev.pending - 1, 0), // ป้องกันติดลบ
        completed: prev.completed + 1,
      }));

      toast({
        title: "ยกเลิกเคสสำเร็จ",
        description: `เคส ${caseId} ถูกยกเลิก`,
      });
    } catch (error) {
      console.error(
        "[EmergencyCenterDashboard] ข้อผิดพลาดในการยกเลิกเคส:",
        error
      );
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถยกเลิกเคสได้",
        variant: "destructive",
      });
    }
  };

  const handleCreateNewCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่พบโทเค็น กรุณาล็อกอินใหม่",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      const createResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/create-case`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            title: newCaseData.title,
            patientName: newCaseData.patientName,
            contactNumber: newCaseData.contactNumber,
            emergencyType: newCaseData.emergencyType,
            locationAddress: newCaseData.locationAddress,
            latitude: newCaseData.latitude,
            longitude: newCaseData.longitude,
            description: newCaseData.description,
            severity: newCaseData.severity,
          }),
        }
      );

      if (!createResponse.ok) {
        if (createResponse.status === 401) {
          toast({
            title: "ข้อผิดพลาด",
            description: "ไม่ได้รับอนุญาต กรุณาล็อกอินใหม่",
            variant: "destructive",
          });
          router.push("/login");
          return;
        }
        const errorText = await createResponse.text();
        throw new Error(`ไม่สามารถสร้างเคสได้: ${errorText}`);
      }
      const newCase = await createResponse.json();

      // อัปเดต cases และ stats ตามสถานะของเคสใหม่
      setCases((prev) => [newCase, ...prev]);
      setStats((prev) => ({
        ...prev,
        pending: newCase.status === "PENDING" ? prev.pending + 1 : prev.pending,
        assigned:
          newCase.status === "ASSIGNED" ? prev.assigned + 1 : prev.assigned,
        inProgress:
          newCase.status === "IN_PROGRESS"
            ? prev.inProgress + 1
            : prev.inProgress,
        completed:
          newCase.status === "COMPLETED" ? prev.completed + 1 : prev.completed,
        total: prev.total + 1,
        critical: newCase.severity === 4 ? prev.critical + 1 : prev.critical,
      }));
      setNewCaseOpen(false);
      setNewCaseData({
        title: "",
        patientName: "",
        contactNumber: "",
        emergencyType: "Accident",
        locationAddress: "",
        latitude: undefined,
        longitude: undefined,
        description: "",
        severity: 1,
      });
      toast({
        title: "สร้างเคสสำเร็จ",
        description: "เพิ่มเหตุฉุกเฉินใหม่เรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error(
        "[EmergencyCenterDashboard] ข้อผิดพลาดในการสร้างเคส:",
        error
      );
      toast({
        title: "ข้อผิดพลาด",
        description:
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message || "ไม่สามารถสร้างเคสได้"
            : "ไม่สามารถสร้างเคสได้",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout role="emergency-center">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">แดชบอร์ดศูนย์ฉุกเฉิน</h1>
            <p className="text-slate-500 dark:text-slate-400">
              จัดการและติดตามเหตุฉุกเฉิน
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={newCaseOpen} onOpenChange={setNewCaseOpen}>
              <DialogTrigger asChild>
                <Button>
                  เพิ่มเคสใหม่ <Plus className="ml-2 h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>สร้างเหตุฉุกเฉินใหม่</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateNewCase} className="space-y-4">
                  <Input
                    placeholder="ชื่อเคส"
                    value={newCaseData.title}
                    onChange={(e) =>
                      setNewCaseData({ ...newCaseData, title: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="ชื่อผู้ป่วย"
                    value={newCaseData.patientName}
                    onChange={(e) =>
                      setNewCaseData({
                        ...newCaseData,
                        patientName: e.target.value,
                      })
                    }
                    required
                  />
                  <Input
                    placeholder="เบอร์ติดต่อ"
                    value={newCaseData.contactNumber}
                    onChange={(e) =>
                      setNewCaseData({
                        ...newCaseData,
                        contactNumber: e.target.value,
                      })
                    }
                  />
                  <select
                    value={newCaseData.emergencyType}
                    onChange={(e) =>
                      setNewCaseData({
                        ...newCaseData,
                        emergencyType: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="Accident">อุบัติเหตุ</option>
                    <option value="Medical">การแพทย์</option>
                    <option value="Fire">ไฟไหม้</option>
                  </select>
                  <Input
                    placeholder="ที่อยู่สถานที่เกิดเหตุ"
                    value={newCaseData.locationAddress}
                    onChange={(e) =>
                      setNewCaseData({
                        ...newCaseData,
                        locationAddress: e.target.value,
                      })
                    }
                    required
                  />
                  <Input
                    type="number"
                    placeholder="ละติจูด (ไม่บังคับ)"
                    value={newCaseData.latitude}
                    onChange={(e) =>
                      setNewCaseData({
                        ...newCaseData,
                        latitude: parseFloat(e.target.value) || undefined,
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="ลองจิจูด (ไม่บังคับ)"
                    value={newCaseData.longitude}
                    onChange={(e) =>
                      setNewCaseData({
                        ...newCaseData,
                        longitude: parseFloat(e.target.value) || undefined,
                      })
                    }
                  />
                  <Input
                    placeholder="คำอธิบาย"
                    value={newCaseData.description}
                    onChange={(e) =>
                      setNewCaseData({
                        ...newCaseData,
                        description: e.target.value,
                      })
                    }
                  />
                  <select
                    value={newCaseData.severity}
                    onChange={(e) =>
                      setNewCaseData({
                        ...newCaseData,
                        severity: parseInt(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="1">ต่ำ</option>
                    <option value="2">ปานกลาง</option>
                    <option value="3">เร่งด่วน</option>
                    <option value="4">วิกฤต</option>
                  </select>
                  <DialogFooter>
                    <Button type="submit">สร้างเคส</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog
              open={
                notifications.length > 0 && notifications.some((n) => !n.read)
              }
              onOpenChange={() =>
                setNotifications((prev) =>
                  prev.map((n) => ({ ...n, read: true }))
                )
              }
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>การแจ้งเตือน</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-2 rounded ${
                        notif.read ? "bg-gray-100" : "bg-blue-100"
                      }`}
                    >
                      <p className="font-semibold">{notif.title}</p>
                      <p className="text-sm text-gray-600">
                        {notif.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(notif.timestamp).toLocaleTimeString("th-TH")}
                      </p>
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button
                    onClick={() =>
                      setNotifications((prev) =>
                        prev.map((n) => ({ ...n, read: true }))
                      )
                    }
                  >
                    ล้างการแจ้งเตือนทั้งหมด
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                เคสรอการดำเนินการ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                เคสที่มอบหมายแล้ว
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.assigned}</div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-500" />
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
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Activity className="h-5 w-5 text-green-600 dark:text-green-500" />
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
                <div className="text-2xl font-bold">{stats.critical}</div>
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <h2 className="text-xl font-bold">เหตุฉุกเฉิน</h2>
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
                รอการดำเนินการ <Badge className="ml-1">{stats.pending}</Badge>
              </TabsTrigger>
              <TabsTrigger value="assigned">
                มอบหมายแล้ว <Badge className="ml-1">{stats.assigned}</Badge>
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                กำลังดำเนินการ{" "}
                <Badge className="ml-1">{stats.inProgress}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                เสร็จสิ้น <Badge className="ml-1">{stats.completed}</Badge>
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
                    <div className="text-center py-8">
                      <p className="text-slate-500 dark:text-slate-400">
                        ไม่พบเคส
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredCases
                        .filter(
                          (c) =>
                            tabValue === "all" ||
                            c.status === tabValue.toUpperCase()
                        )
                        .map((emergencyCase) => (
                          <CaseCard
                            key={emergencyCase.id}
                            {...emergencyCase}
                            severity={emergencyCase.severity as 1 | 2 | 3 | 4}
                            status={emergencyCase.status as any}
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
