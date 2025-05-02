"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Filter,
  MapPin,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import CaseCard from "@/components/dashboard/case-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import MapView from "@/components/dashboard/map-view";
import { webSocketClient } from "@/lib/websocket";

interface EmergencyCase {
  id: string;
  title: string;
  status: "pending" | "assigned" | "in-progress" | "completed" | "cancelled";
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

interface FilterState {
  status: string;
  severity: string;
  date: string;
}

export default function EmergencyCenterCases() {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    severity: "all",
    date: "all",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCase, setNewCase] = useState({
    description: "",
    type: "MEDICAL",
    grade: "NON_URGENT",
    location: "",
    latitude: 0,
    longitude: 0,
    medicalInfo: { severity: 1 },
    symptoms: [] as string[],
    patientId: "",
  });
  const { toast } = useToast();

  const typeTranslations: Record<string, string> = {
    ACCIDENT: "อุบัติเหตุ",
    MEDICAL: "การแพทย์",
    FIRE: "ไฟไหม้",
    CRIME: "อาชญากรรม",
    OTHER: "อื่นๆ",
  };

  const fetchActiveEmergencies = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/active-emergencies`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch emergencies: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      const formattedCases: EmergencyCase[] = data.map((item: any) => {
        console.log("Item type:", item.type, "Item status:", item.status); // Debug status
        const symptomsData = item.medicalInfo?.symptoms;
        const symptoms = Array.isArray(symptomsData)
          ? symptomsData
          : symptomsData
          ? [symptomsData.toString()]
          : [];

        const validStatus = [
          "pending",
          "assigned",
          "in-progress",
          "completed",
          "cancelled",
        ];
        // แปลง status จาก API ให้เป็นตัวพิมพ์เล็กก่อนตรวจสอบ
        const normalizedStatus = item.status ? item.status.toLowerCase() : "pending";
        const status = validStatus.includes(normalizedStatus)
          ? normalizedStatus
          : "pending";

        const gradeToSeverity: Record<string, number> = {
          CRITICAL: 4,
          URGENT: 3,
          NON_URGENT: 1,
        };
        const severity = Number(item.medicalInfo?.severity) || gradeToSeverity[item.grade] || 1;
        const validSeverity = severity >= 1 && severity <= 4 ? severity : 1;

        return {
          id: item.id || "unknown-id",
          title: item.description
            ? item.description.slice(0, 50) + "..."
            : "No Title",
          status: status as EmergencyCase["status"],
          severity: validSeverity as 1 | 2 | 3 | 4,
          reportedAt: item.createdAt || new Date().toISOString(),
          patientName:
            `${item.patient?.firstName || ""} ${item.patient?.lastName || ""}`.trim() ||
            "Unknown",
          contactNumber: item.patient?.phone || "N/A",
          emergencyType: typeTranslations[item.type] || typeTranslations["OTHER"],
          location: {
            address: item.location || "Unknown",
            coordinates: {
              lat: Number(item.latitude) || 0,
              lng: Number(item.longitude) || 0,
            },
          },
          assignedTo: item.responses?.[0]?.organization?.name || undefined,
          description: item.description || "No description available",
          symptoms,
        };
      });

      setCases(formattedCases);
    } catch (error) {
      console.error("Error fetching emergencies:", error);
      toast({
        title: "ข้อผิดพลาด",
        description:
          error instanceof Error
            ? error.message
            : "ไม่สามารถดึงข้อมูลเคสฉุกเฉินได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    }
  };

  const handleCreateCase = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found. Please log in.");
      }

      const payload = {
        ...newCase,
        medicalInfo: {
          ...newCase.medicalInfo,
          symptoms: newCase.symptoms,
        },
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to create case: ${response.statusText}`);
      }

      toast({
        title: "สร้างเคสสำเร็จ",
        description: "เคสฉุกเฉินใหม่ถูกสร้างเรียบร้อยแล้ว",
      });
      setIsCreateModalOpen(false);
      setNewCase({
        description: "",
        type: "MEDICAL",
        grade: "NON_URGENT",
        location: "",
        latitude: 0,
        longitude: 0,
        medicalInfo: { severity: 1 },
        symptoms: [],
        patientId: "",
      });
      await fetchActiveEmergencies();
    } catch (error) {
      console.error("Error creating case:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถสร้างเคสได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    }
  };

  const handleAssignCase = async (caseId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sos/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caseId,
          assignedToId: "thonburi-hospital-id",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to assign case: ${response.statusText}`);
      }

      toast({
        title: "มอบหมายเคสสำเร็จ",
        description: `เคส ${caseId} ถูกมอบหมายให้ Thonburi Hospital`,
      });
      await fetchActiveEmergencies();
    } catch (error) {
      console.error("Error assigning case:", error);
      toast({
        title: "ข้อผิดพลาด",
        description:
          error instanceof Error
            ? error.message
            : "ไม่สามารถมอบหมายเคสได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    }
  };

  const handleCancelCase = async (caseId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sos/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ caseId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel case: ${response.statusText}`);
      }

      toast({
        title: "ยกเลิกเคสสำเร็จ",
        description: `เคส ${caseId} ถูกยกเลิก`,
      });
      await fetchActiveEmergencies();
    } catch (error) {
      console.error("Error cancelling case:", error);
      toast({
        title: "ข้อผิดพลาด",
        description:
          error instanceof Error
            ? error.message
            : "ไม่สามารถยกเลิกเคสได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาเข้าสู่ระบบเพื่อใช้งาน",
        variant: "destructive",
      });
      window.location.href = "/login";
      return;
    }

    webSocketClient.connect(token);

    webSocketClient.onStatusUpdate((data) => {
      console.log("Status update received:", data);
      fetchActiveEmergencies();
    });

    webSocketClient.on("notification", (data) => {
      console.log("Notification received:", data);
      toast({
        title: data.title || "การแจ้งเตือน",
        description: data.body || "มีข้อความแจ้งเตือนใหม่",
      });
    });

    webSocketClient.onEmergency((data) => {
      console.log("New emergency case:", data);
      fetchActiveEmergencies();
    });

    fetchActiveEmergencies();

    return () => {
      webSocketClient.disconnect();
    };
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filters.status === "all" || c.status === filters.status;

    const matchesSeverity =
      filters.severity === "all" || c.severity.toString() === filters.severity;

    let matchesDate = true;
    if (filters.date !== "all") {
      const reportedDate = new Date(c.reportedAt);
      if (isNaN(reportedDate.getTime())) return false;
      const today = new Date();
      if (filters.date === "today") {
        matchesDate = reportedDate.toDateString() === today.toDateString();
      } else if (filters.date === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        matchesDate = reportedDate.toDateString() === yesterday.toDateString();
      } else if (filters.date === "week") {
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        matchesDate = reportedDate >= oneWeekAgo && reportedDate <= today;
      }
    }

    return matchesSearch && matchesStatus && matchesSeverity && matchesDate;
  });

  const getMapLocations = () => {
    return filteredCases.map((c) => ({
      id: c.id,
      title: c.title,
      severity: c.severity,
      coordinates: c.location.coordinates,
    }));
  };

  return (
    <DashboardLayout role="emergency-center">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">เคสฉุกเฉิน</h1>
            <p className="text-slate-500 dark:text-slate-400">
              จัดการและติดตามเคสฉุกเฉินทั้งหมด
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  สร้างเคสใหม่
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>สร้างเคสฉุกเฉินใหม่</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>ประเภทฉุกเฉิน</Label>
                    <Select
                      value={newCase.type}
                      onValueChange={(value) => setNewCase({ ...newCase, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACCIDENT">อุบัติเหตุ</SelectItem>
                        <SelectItem value="MEDICAL">การแพทย์</SelectItem>
                        <SelectItem value="FIRE">ไฟไหม้</SelectItem>
                        <SelectItem value="CRIME">อาชญากรรม</SelectItem>
                        <SelectItem value="OTHER">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>ระดับความรุนแรง</Label>
                    <Select
                      value={newCase.grade}
                      onValueChange={(value) => setNewCase({ ...newCase, grade: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกระดับ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CRITICAL">วิกฤต</SelectItem>
                        <SelectItem value="URGENT">เร่งด่วน</SelectItem>
                        <SelectItem value="NON_URGENT">ไม่เร่งด่วน</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>คำอธิบาย</Label>
                    <Textarea
                      value={newCase.description}
                      onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                      placeholder="อธิบายรายละเอียดเคส..."
                    />
                  </div>
                  <div>
                    <Label>สถานที่</Label>
                    <Input
                      value={newCase.location}
                      onChange={(e) => setNewCase({ ...newCase, location: e.target.value })}
                      placeholder="ที่อยู่"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <Label>ละติจูด</Label>
                      <Input
                        type="number"
                        value={newCase.latitude}
                        onChange={(e) =>
                          setNewCase({ ...newCase, latitude: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="ละติจูด"
                      />
                    </div>
                    <div>
                      <Label>ลองจิจูด</Label>
                      <Input
                        type="number"
                        value={newCase.longitude}
                        onChange={(e) =>
                          setNewCase({ ...newCase, longitude: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="ลองจิจูด"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>อาการ</Label>
                    <Input
                      value={newCase.symptoms.join(", ")}
                      onChange={(e) =>
                        setNewCase({ ...newCase, symptoms: e.target.value.split(", ").filter(Boolean) })
                      }
                      placeholder="ระบุอาการ (คั่นด้วย comma เช่น หมดสติ, หายใจลำบาก)"
                    />
                  </div>
                  <div>
                    <Label>ผู้ป่วย</Label>
                    <Input
                      value={newCase.patientId || ""}
                      onChange={(e) => setNewCase({ ...newCase, patientId: e.target.value })}
                      placeholder="ID ผู้ป่วย (ถ้ามี)"
                    />
                  </div>
                  <Button onClick={handleCreateCase}>สร้างเคส</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="ค้นหาด้วย ID, ชื่อ, หรือประเภท..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
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
              onValueChange={(value) =>
                setFilters({ ...filters, severity: value })
              }
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
                  onCheckedChange={() => setFilters({ ...filters, date: "all" })}
                >
                  ทุกวันที่
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === "today"}
                  onCheckedChange={() =>
                    setFilters({ ...filters, date: "today" })
                  }
                >
                  วันนี้
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === "yesterday"}
                  onCheckedChange={() =>
                    setFilters({ ...filters, date: "yesterday" })
                  }
                >
                  เมื่อวาน
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === "week"}
                  onCheckedChange={() =>
                    setFilters({ ...filters, date: "week" })
                  }
                >
                  สัปดาห์นี้
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode("list")}
              >
                รายการ
              </Button>
              <Button
                variant={viewMode === "map" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode("map")}
              >
                <MapPin className="h-4 w-4 mr-1" />
                แผนที่
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                รวมทั้งหมด
              </p>
              <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                {filteredCases.length}
              </Badge>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                รอการดำเนินการ
              </p>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                {filteredCases.filter((c) => c.status === "pending").length}
              </Badge>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                วิกฤต
              </p>
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">
                {filteredCases.filter((c) => c.severity === 4).length}
              </Badge>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                เสร็จสิ้น
              </p>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                {filteredCases.filter((c) => c.status === "completed").length}
              </Badge>
            </div>
          </div>
        </div>

        {viewMode === "list" ? (
          <div className="space-y-4">
            {filteredCases.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-500 dark:text-slate-400">
                  ไม่พบเคสที่ตรงกับเกณฑ์การค้นหา
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCases.map((emergencyCase) => (
                  <CaseCard
                    key={emergencyCase.id}
                    id={emergencyCase.id}
                    title={emergencyCase.title}
                    status={emergencyCase.status}
                    severity={emergencyCase.severity}
                    reportedAt={emergencyCase.reportedAt}
                    patientName={emergencyCase.patientName}
                    contactNumber={emergencyCase.contactNumber}
                    emergencyType={emergencyCase.emergencyType}
                    location={emergencyCase.location}
                    assignedTo={emergencyCase.assignedTo}
                    description={emergencyCase.description}
                    symptoms={emergencyCase.symptoms}
                    onAssign={() => handleAssignCase(emergencyCase.id)}
                    onCancel={() => handleCancelCase(emergencyCase.id)}
                    role="emergency-center"
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <MapView locations={getMapLocations()} height="500px" />
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              แสดง {filteredCases.length} เคสฉุกเฉินบนแผนที่ วางเมาส์เหนือจุดเพื่อดูรายละเอียด
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}