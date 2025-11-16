"use client";

import { useState, useEffect } from "react";
import { useEmergencyCases } from "./hooks/useEmergencyCases";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Button } from "@components/ui/button";
import { CaseCard } from "./components/CaseCard";

import {
  Search,
  Filter,
  MapPin,
  ChevronDown,
  AlertTriangle,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Card, CardContent } from "@components/ui/card";
import dynamic from "next/dynamic";
import { useToast } from "@/shared/hooks/use-toast";

// โหลด React-leaflet components แบบ dynamic และปิด SSR
const MapContainerDynamic = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayerDynamic = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

// import useMap hook ปกติได้เลย (เพราะใช้ใน client-only component)
import { useMap } from "react-leaflet";

// โหลด MapView แบบ client-only
const MapView = dynamic(
  () => import("./components/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => <p className="p-4 text-center">กำลังโหลดแผนที่...</p>,
  }
);

function MapController({
  mapLocations,
}: {
  mapLocations: {
    id: string;
    coordinates: [number, number];
    severity?: number;
  }[];
}) {
  const { toast } = useToast();
  const map = useMap();

  useEffect(() => {
    try {
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
          (bounds: any, loc) => bounds.extend(loc.coordinates),
          (window as any).L.latLngBounds([])
        );
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดใน MapController:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถโหลดแผนที่ได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    }
  }, [map, mapLocations, toast]);

  return null;
}

export default function EmergencyCenterCases() {
  // Inline auth check
  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      window.location.href = "/login";
    }
  }, []);

  const {
    cases: filteredCases,
    hospitals,
    mapLocations,
    loading,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    handleAssignCase,
    refetch,
  } = useEmergencyCases();

  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  if (loading) {
    return (
      <DashboardLayout
        role="emergency-center"
        notifications={[]}
        unreadCount={0}
        onMarkAsRead={() => {}}
        onMarkAllAsRead={() => {}}
      >
        <div className="p-6 text-center">กำลังโหลดเคส...</div>
      </DashboardLayout>
    );
  }

  const stats = {
    total: filteredCases.length,
    pending: filteredCases.filter((c) => c.status === "pending").length,
    critical: filteredCases.filter((c) => c.severity === 4).length,
    completed: filteredCases.filter((c) => c.status === "completed").length,
  };

  return (
    <DashboardLayout
      role="emergency-center"
      notifications={[]}
      unreadCount={0}
      onMarkAsRead={() => {}}
      onMarkAllAsRead={() => {}}
    >
      <div className="p-6 space-y-6">
        {/* ฟอร์มค้นหาและตัวกรอง */}
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

            {/* ตัวกรองเพิ่มเติมเป็น DropdownMenu (เหมือนเดิม) */}
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
            <Button onClick={refetch} disabled={loading}>
              รีเฟรช
            </Button>
          </div>
        </div>

        {/* สถิติ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-slate-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  รวมทั้งหมด
                </p>
                <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                  {stats.total}
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
                  {stats.pending}
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
                  {stats.critical}
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
                  {stats.completed}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* แสดงผลตาม viewMode */}
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
                    {...emergencyCase}
                    hospitals={hospitals}
                    onAssign={handleAssignCase}
                    role="emergency-center"
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <MapContainerDynamic
                center={[13.7563, 100.5018]}
                zoom={10}
                style={{ height: "500px", width: "100%" }}
                key={mapLocations.length} // key ขึ้นกับจำนวนข้อมูล
              >
                <TileLayerDynamic
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapController mapLocations={mapLocations} />
                {/* ลบ MapContainer ออกจาก MapView แล้วให้ MapView รับ mapLocations มาแสดง Marker */}
                <MapView
                  mapLocations={mapLocations}
                  onLocationSelect={() => {}}
                />
              </MapContainerDynamic>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              แสดง {mapLocations.length} เคสฉุกเฉินบนแผนที่
              คลิกที่จุดเพื่อดูรายละเอียด
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
