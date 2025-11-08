"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  MapPin,
  ChevronDown,
  AlertTriangle,
  User,
  Phone,
  Map,
  Clock,
} from "lucide-react";
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
import { useToast } from "@/app/shared/hooks/use-toast";
import { webSocketClient } from "@/lib/websocket";
import dynamic from "next/dynamic";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// โหลด Leaflet แบบ dynamic เพื่อป้องกัน SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => ({ default: mod.MapContainer })),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => ({ default: mod.TileLayer })),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => ({ default: mod.Marker })),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => ({ default: mod.Popup })),
  { ssr: false }
);
const FeatureGroup = dynamic(
  () => import("react-leaflet").then((mod) => ({ default: mod.FeatureGroup })),
  { ssr: false }
);

import "leaflet/dist/leaflet.css";

// แก้ไขไอคอนเริ่มต้นของ Leaflet
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  });
}

// สร้างไอคอน Marker พร้อมแอนิเมชัน
const getMarkerIcon = (severity: number) => {
  const colors: Record<number, string> = {
    1: "#10b981", // เขียว
    2: "#f59e0b", // เหลือง/ส้ม
    3: "#f97316", // ส้ม
    4: "#ef4444", // แดง
  };
  const color = colors[severity] || "#3b82f6"; // ค่าเริ่มต้นสีน้ำเงิน

  const html = `
    <div class="custom-marker" style="--marker-color: ${color};">
      <div class="pulse-ring"></div>
      <div class="inner-marker"></div>
      <div class="marker-tip"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-div-icon",
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [0, -40],
  });
};

interface EmergencyCase {
  id: string;
  description: string;
  descriptionFull: string;
  status: "pending" | "assigned" | "in-progress" | "completed" | "cancelled";
  severity: 1 | 2 | 3 | 4;
  grade: "CRITICAL" | "URGENT" | "NON_URGENT" | "UNKNOWN";
  reportedAt: string;
  patientName: string;
  contactNumber: string;
  emergencyType: string;
  location: { address: string; coordinates: { lat: number; lng: number } };
  assignedTo?: string;
  symptoms: string[];
}

interface Hospital {
  id: string;
  name: string;
}

interface FilterState {
  status: string;
  severity: string;
  date: string;
}

interface MapLocation {
  id: string;
  title: string;
  severity: number;
  coordinates: [number, number];
  address: string;
  description: string;
  patientName: string;
  status: EmergencyCase["status"];
}

// คอมโพเนนต์ MapView พร้อมการจัดการ cleanup และ error handling
const MapView = ({
  mapLocations,
  onLocationSelect,
}: {
  mapLocations: MapLocation[];
  onLocationSelect: (loc: MapLocation | null) => void;
}) => {
  const map = useMap();
  const mapRef = useRef<L.Map | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      mapRef.current = map;
      map.invalidateSize();

      if (mapLocations.length === 0) {
        toast({
          title: "ไม่มีข้อมูล",
          description: "ไม่มีเคสฉุกเฉินที่มีพิกัดถูกต้อง",
        });
        return;
      }

      const validLocations = mapLocations.filter(
        (loc) =>
          loc.coordinates[0] !== 0 &&
          loc.coordinates[1] !== 0 &&
          !isNaN(loc.coordinates[0]) &&
          !isNaN(loc.coordinates[1])
      );

      if (validLocations.length === 0) {
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่มีพิกัดที่ถูกต้องสำหรับแสดงบนแผนที่",
        });
        return;
      }

      if (validLocations.length === 1) {
        map.setView(validLocations[0].coordinates, 13);
      } else {
        const bounds = validLocations.reduce(
          (bounds, loc) => bounds.extend(L.latLng(loc.coordinates)),
          L.latLngBounds([])
        );
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดใน MapView:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถโหลดแผนที่ได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
          mapRef.current = null;
        } catch (error) {
          console.warn("เกิดข้อผิดพลาดขณะทำความสะอาดแผนที่:", error);
        }
      }
    };
  }, [map, mapLocations, toast]);

  return (
    <FeatureGroup>
      {mapLocations.map((loc) => (
        <Marker
          key={loc.id}
          position={loc.coordinates}
          icon={getMarkerIcon(loc.severity)}
          eventHandlers={{ click: () => onLocationSelect(loc) }}
        >
          <Popup>
            <div className="space-y-1">
              <h3 className="font-bold text-sm">{loc.title}</h3>
              <p className="text-xs text-gray-600">{loc.address}</p>
              <p className="text-xs text-gray-600">
                ผู้ป่วย: {loc.patientName}
              </p>
              <p className="text-xs text-gray-600">สถานะ: {loc.status}</p>
              <p className="text-xs text-gray-600 mt-1">{loc.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </FeatureGroup>
  );
};

// คอมโพเนนต์ CaseCard ที่แก้ไข hydration error และเพิ่ม dropdown โรงพยาบาล
const CaseCard = ({
  id,
  description,
  descriptionFull,
  status,
  severity,
  grade,
  reportedAt,
  patientName,
  contactNumber,
  emergencyType,
  location,
  assignedTo,
  symptoms,
  role,
}: EmergencyCase & { role: string }) => {
  const { toast } = useToast();
  const [selectedHospital, setSelectedHospital] = useState<string>("");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  // ดึงข้อมูลโรงพยาบาล
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("ไม่พบ access token");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/hospitals`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok)
          throw new Error(
            `ไม่สามารถดึงข้อมูลโรงพยาบาล: ${response.statusText}`
          );
        const data = await response.json();
        setHospitals(
          data.map((h: any) => ({
            id: h.id,
            name: h.name || "โรงพยาบาลไม่มีชื่อ",
          }))
        );
      } catch (error) {
        console.error("เกิดข้อผิดพลาดขณะดึงข้อมูลโรงพยาบาล:", error);
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลโรงพยาบาลได้",
          variant: "destructive",
        });
      }
    };
    fetchHospitals();
  }, [toast]);

  // ฟังก์ชันมอบหมายเคส
  const handleAssign = async () => {
    if (!selectedHospital) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาเลือกโรงพยาบาล",
        variant: "destructive",
      });
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("ไม่พบ access token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sos/${id}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ hospitalId: selectedHospital }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `ไม่สามารถมอบหมายเคส: ${response.statusText} (${response.status}) - ${errorText}`
        );
      }

      const data = await response.json();
      toast({
        title: "มอบหมายเคสสำเร็จ",
        description: `เคส ${id.slice(-8)} ถูกมอบหมายให้ ${
          hospitals.find((h) => h.id === selectedHospital)?.name
        }`,
      });

      // รีเฟรชข้อมูลหลังมอบหมาย
      const fetchData = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const emergenciesRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/active-emergencies`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (emergenciesRes.ok) {
          const emergenciesData = await emergenciesRes.json();
          setCases(
            emergenciesData.map((item: any) => ({
              id: item.id,
              description:
                (item.description || "ไม่มีรายละเอียด").slice(0, 50) + "...",
              descriptionFull: item.description || "ไม่มีรายละเอียด",
              status: item.status.toLowerCase(),
              severity: Number(item.medicalInfo?.severity) || 1,
              grade: item.medicalInfo?.grade || "NON_URGENT",
              reportedAt: item.createdAt || new Date().toISOString(),
              patientName:
                `${item.patient?.firstName || ""} ${
                  item.patient?.lastName || ""
                }`.trim() || "ไม่ทราบชื่อ",
              contactNumber: item.patient?.phone || "N/A",
              emergencyType: item.type,
              location: {
                address: item.location || "ไม่ทราบสถานที่",
                coordinates: {
                  lat: item.latitude || 0,
                  lng: item.longitude || 0,
                },
              },
              assignedTo: item.responses?.[0]?.organization?.name,
              symptoms: Array.isArray(item.medicalInfo?.symptoms)
                ? item.medicalInfo.symptoms
                : [],
            }))
          );
        }
      };
      await fetchData();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดขณะมอบหมายเคส:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: `ไม่สามารถมอบหมายเคสได้: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const statusColors: Record<string, string> = {
    pending:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    assigned:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    "in-progress":
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    completed:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const severityColors: Record<number, string> = {
    1: "bg-green-500 hover:bg-green-500/80",
    2: "bg-yellow-500 hover:bg-yellow-500/80",
    3: "bg-orange-500 hover:bg-orange-500/80",
    4: "bg-red-500 hover:bg-red-500/80",
  };

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            เคส #{id.slice(-8)}
          </CardTitle>
          <Badge className={cn("text-sm font-medium", statusColors[status])}>
            {status === "pending"
              ? "รอการดำเนินการ"
              : status === "assigned"
              ? "มอบหมายแล้ว"
              : status === "in-progress"
              ? "กำลังดำเนินการ"
              : status === "completed"
              ? "เสร็จสิ้น"
              : "ยกเลิก"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">ผู้ป่วย:</span> {patientName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">ติดต่อ:</span> {contactNumber}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Map className="h-4 w-4 text-slate-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">สถานที่:</span> {location.address}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">เวลา:</span>{" "}
                {new Date(reportedAt).toLocaleString("th-TH")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">ประเภท:</span> {emergencyType}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                ระดับความรุนแรง:
              </span>
              <Badge className={cn("ml-2", severityColors[severity])}>
                ระดับ {severity} (
                {grade === "CRITICAL"
                  ? "วิกฤต"
                  : grade === "URGENT"
                  ? "เร่งด่วน"
                  : "ไม่เร่งด่วน"}
                )
              </Badge>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            รายละเอียด:
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-3">
            {descriptionFull}
          </p>
        </div>
        {symptoms.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              อาการ:
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {symptoms.map((symptom, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {assignedTo && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium">มอบหมายให้:</span> {assignedTo}
          </p>
        )}
        {!assignedTo && status !== "completed" && status !== "cancelled" && (
          <div className="flex gap-2 items-center">
            <Select
              value={selectedHospital}
              onValueChange={setSelectedHospital}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="เลือกโรงพยาบาล" />
              </SelectTrigger>
              <SelectContent>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleAssign}
              disabled={!selectedHospital}
            >
              มอบหมาย
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function EmergencyCenterCases() {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    severity: "all",
    date: "all",
  });
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    null
  );
  const { toast } = useToast();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const typeTranslations: Record<string, string> = {
    ACCIDENT: "อุบัติเหตุ",
    MEDICAL: "การแพทย์",
    FIRE: "ไฟไหม้",
    CRIME: "อาชญากรรม",
    OTHER: "อื่นๆ",
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("ไม่พบ access token กรุณาเข้าสู่ระบบ");

      const [emergenciesRes, hospitalsRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/active-emergencies`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!emergenciesRes.ok)
        throw new Error(
          `ไม่สามารถดึงข้อมูลเคสฉุกเฉิน: ${emergenciesRes.statusText}`
        );
      if (!hospitalsRes.ok)
        throw new Error(
          `ไม่สามารถดึงข้อมูลโรงพยาบาล: ${hospitalsRes.statusText}`
        );

      const emergenciesData = await emergenciesRes.json();
      const hospitalsData = await hospitalsRes.json();

      const formattedCases: EmergencyCase[] = emergenciesData.map(
        (item: any) => {
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
          const normalizedStatus = item.status
            ? item.status.toLowerCase()
            : "pending";
          const status = validStatus.includes(normalizedStatus)
            ? normalizedStatus
            : "pending";
          const gradeToSeverity: Record<string, number> = {
            CRITICAL: 4,
            URGENT: 3,
            NON_URGENT: 1,
          };
          let severity =
            Number(item.medicalInfo?.severity) ||
            gradeToSeverity[item.grade] ||
            1;
          let grade = (
            item.medicalInfo?.grade ||
            item.grade ||
            "NON_URGENT"
          ).toUpperCase();
          if (grade === "UNKNOWN" || !grade || grade === "") {
            grade = "NON_URGENT";
            severity = 1;
            console.log(
              `ปรับ grade เป็น NON_URGENT และ severity เป็น 1 สำหรับเคส ${item.id}`
            );
          }
          const validSeverity = severity >= 1 && severity <= 4 ? severity : 1;
          const validGrade = ["CRITICAL", "URGENT", "NON_URGENT"].includes(
            grade
          )
            ? grade
            : "NON_URGENT";

          return {
            id: item.id || "unknown-id",
            description:
              (item.description || "ไม่มีรายละเอียด").slice(0, 50) + "...",
            descriptionFull: item.description || "ไม่มีรายละเอียด",
            status: status as EmergencyCase["status"],
            severity: validSeverity as 1 | 2 | 3 | 4,
            grade: validGrade as "CRITICAL" | "URGENT" | "NON_URGENT",
            reportedAt: item.createdAt || new Date().toISOString(),
            patientName:
              `${item.patient?.firstName || ""} ${
                item.patient?.lastName || ""
              }`.trim() || "ไม่ทราบชื่อ",
            contactNumber: item.patient?.phone || "N/A",
            emergencyType:
              typeTranslations[item.type] || typeTranslations["OTHER"],
            location: {
              address: item.location || "ไม่ทราบสถานที่",
              coordinates: {
                lat: item.latitude || 0,
                lng: item.longitude || 0,
              },
            },
            assignedTo: item.responses?.[0]?.organization?.name || undefined,
            symptoms,
          };
        }
      );

      setCases(formattedCases);
      setHospitals(
        hospitalsData.map((h: any) => ({
          id: h.id,
          name: h.name || "โรงพยาบาลไม่มีชื่อ",
        }))
      );
    } catch (error) {
      console.error("เกิดข้อผิดพลาดขณะดึงข้อมูล:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่",
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

    const connectWebSocket = () => {
      webSocketClient.connect(token);
      webSocketClient.onStatusUpdate((data) => {
        console.log("ได้รับการอัปเดตสถานะ:", data);
        fetchData();
      });
      webSocketClient.on("notification", (data) => {
        console.log("ได้รับการแจ้งเตือน:", data);
        toast({
          title: data.title || "การแจ้งเตือน",
          description: data.body || "มีข้อความแจ้งเตือนใหม่",
        });
      });
      webSocketClient.onEmergency((data) => {
        console.log("ได้รับเคสฉุกเฉินใหม่:", data);
        fetchData();
      });
    };

    fetchData();
    connectWebSocket();

    return () => {
      webSocketClient.disconnect();
    };
  }, [toast]);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filters.status === "all" || c.status === filters.status;
      const matchesSeverity =
        filters.severity === "all" ||
        c.severity.toString() === filters.severity;
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
          matchesDate =
            reportedDate.toDateString() === yesterday.toDateString();
        } else if (filters.date === "week") {
          const oneWeekAgo = new Date(today);
          oneWeekAgo.setDate(today.getDate() - 7);
          matchesDate = reportedDate >= oneWeekAgo && reportedDate <= today;
        }
      }
      return matchesSearch && matchesStatus && matchesSeverity && matchesDate;
    });
  }, [cases, searchQuery, filters]);

  const mapLocations = useMemo(
    () =>
      filteredCases
        .filter(
          (c) =>
            c.location.coordinates.lat !== 0 &&
            c.location.coordinates.lng !== 0 &&
            !isNaN(c.location.coordinates.lat) &&
            !isNaN(c.location.coordinates.lng)
        )
        .map((c) => ({
          id: c.id,
          title: c.description,
          severity: c.severity,
          coordinates: [
            c.location.coordinates.lat,
            c.location.coordinates.lng,
          ] as [number, number],
          address: c.location.address,
          description: c.descriptionFull,
          patientName: c.patientName,
          status: c.status,
        })),
    [filteredCases]
  );

  return (
    <>
      <style jsx global>{`
        .custom-div-icon {
          background: transparent;
          border: none;
          margin: 0;
        }
        .custom-marker {
          position: relative;
          width: 30px;
          height: 30px;
          margin-left: -15px;
          margin-top: -30px;
        }
        .pulse-ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 2px solid var(--marker-color);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          animation: pulse 2s infinite ease-out;
          opacity: 0;
        }
        .inner-marker {
          position: absolute;
          top: 5px;
          left: 5px;
          width: 20px;
          height: 20px;
          background: var(--marker-color);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .marker-tip {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid var(--marker-color);
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
        }
        @keyframes pulse {
          0% {
            transform: rotate(-45deg) scale(0.95);
            opacity: 1;
          }
          70% {
            transform: rotate(-45deg) scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: rotate(-45deg) scale(1.4);
            opacity: 0;
          }
        }
      `}</style>
      <DashboardLayout
        role="emergency-center"
        notifications={[]}
        unreadCount={0}
        onMarkAsRead={() => {}}
        onMarkAllAsRead={() => {}}
      >
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">เคสฉุกเฉิน</h1>
              <p className="text-slate-500 dark:text-slate-400">
                จัดการและติดตามเคสฉุกเฉินทั้งหมด
              </p>
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
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
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
                    onCheckedChange={() =>
                      setFilters({ ...filters, date: "all" })
                    }
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-slate-800 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    รวมทั้งหมด
                  </p>
                  <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                    {filteredCases.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-800 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    รอการดำเนินการ
                  </p>
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                    {filteredCases.filter((c) => c.status === "pending").length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-800 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    วิกฤต
                  </p>
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">
                    {filteredCases.filter((c) => c.severity === 4).length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-800 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    เสร็จสิ้น
                  </p>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                    {
                      filteredCases.filter((c) => c.status === "completed")
                        .length
                    }
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {viewMode === "list" ? (
            <div className="space-y-4">
              {filteredCases.length === 0 ? (
                <Card className="text-center py-8 bg-white dark:bg-slate-800 shadow-sm">
                  <CardContent>
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-slate-500 dark:text-slate-400">
                      ไม่พบเคสที่ตรงกับเกณฑ์การค้นหา
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredCases.map((emergencyCase) => (
                    <CaseCard
                      key={emergencyCase.id}
                      id={emergencyCase.id}
                      description={emergencyCase.description}
                      descriptionFull={emergencyCase.descriptionFull}
                      status={emergencyCase.status}
                      severity={emergencyCase.severity}
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
            </div>
          ) : (
            <div className="space-y-4">
              <div ref={mapContainerRef} className="relative">
                <MapContainer
                  center={[13.7563, 100.5018]}
                  zoom={10}
                  style={{ height: "500px", width: "100%" }}
                  key="emergency-map"
                  whenCreated={(map) => {
                    if (mapContainerRef.current) {
                      const existingMap =
                        mapContainerRef.current.querySelector(
                          ".leaflet-container"
                        );
                      if (existingMap) existingMap.remove();
                    }
                  }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <MapView
                    mapLocations={mapLocations}
                    onLocationSelect={setSelectedLocation}
                  />
                </MapContainer>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                แสดง {mapLocations.length} เคสฉุกเฉินบนแผนที่
                คลิกที่จุดเพื่อดูรายละเอียด
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
