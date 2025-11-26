"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useHospitalCases } from "./hooks/useHospitalCases";
import { MapLocation as SharedMapLocation } from "@/shared/types"; // ใช้จาก shared
import { useAuth } from "@/shared/hooks/useAuth";
import { useNotifications } from "@/shared/hooks/useNotifications";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Button } from "@components/ui/button";
import { Search, Filter, MapPin, ChevronDown, AlertTriangle, RefreshCw } from "lucide-react";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { HospitalCaseCard } from "./components/HospitalCaseCard";
import { HospitalStatusCards } from "@/shared/components/StatsCards";
import { Skeleton } from "@components/ui/skeleton";
import { Badge } from "@components/ui/badge";
import { TransferToRescueDialog } from "./components/TransferToRescueDialog";

// โหลด RealTimeMap แบบ dynamic + ปิด SSR
const RealTimeMap = dynamic(
  () => import("./components/RealTimeMap").then(mod => ({ default: mod.RealTimeMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 lg:h-[600px] flex items-center justify-center bg-slate-50 rounded-lg border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-slate-500">กำลังโหลดแผนที่...</p>
        </div>
      </div>
    ),
  }
);

export default function HospitalCases() {
  useAuth();

  // ใช้ notifications hook เต็ม
  const {
    notifications,
    unreadCount,
    onMarkAsRead,
    onMarkAllAsRead,
  } = useNotifications();

  const {
    cases: filteredCases,
    allCases,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    handleTransferCase,
    getMapLocations: getMapLocationsFromHook,
    refetch,
  } = useHospitalCases();

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<SharedMapLocation | null>(null);

  const stats = {
    total: allCases.length,
    assigned: allCases.filter((c) => c.status === "assigned").length,
    critical: allCases.filter((c) => c.severity === 4).length,
    inProgress: allCases.filter((c) => c.status === "in-progress").length,
  };

  // Auto refresh ทุก 15 วินาที
  useEffect(() => {
    const interval = setInterval(refetch, 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Loading State
  if (loading) {
    return (
      <DashboardLayout
        role="hospital"
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
      >
        <div className="space-y-6 p-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-grow" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_i, index) => (
              <Skeleton key={index} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <DashboardLayout
        role="hospital"
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
      >
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">ไม่สามารถโหลดข้อมูลได้</h3>
          <p className="text-slate-500 mb-4 text-center max-w-md">{error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            ลองใหม่
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="hospital"
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={onMarkAsRead}
      onMarkAllAsRead={onMarkAllAsRead}
    >
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Emergency Cases
              <Button size="sm" variant="ghost" onClick={refetch}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              จัดการและติดตามเคสฉุกเฉินที่มอบหมายให้โรงพยาบาล
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="ค้นหาด้วย ID, ชื่อผู้ป่วย, หรือประเภท..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="assigned">รอมอบหมาย</SelectItem>
                <SelectItem value="in-progress">กำลังดำเนินการ</SelectItem>
                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.severity} onValueChange={(v) => setFilters({ ...filters, severity: v })}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="ความรุนแรง" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกระดับ</SelectItem>
                <SelectItem value="1">Grade 1</SelectItem>
                <SelectItem value="2">Grade 2</SelectItem>
                <SelectItem value="3">Grade 3</SelectItem>
                <SelectItem value="4">Grade 4</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  เพิ่มเติม
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>ช่วงเวลา</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["all", "today", "yesterday", "week"].map((val) => (
                  <DropdownMenuCheckboxItem
                    key={val}
                    checked={filters.date === val}
                    onCheckedChange={() => setFilters({ ...filters, date: val })}
                  >
                    {val === "all" ? "ทั้งหมด" : val === "today" ? "วันนี้" : val === "yesterday" ? "เมื่อวาน" : "สัปดาห์นี้"}
                  </DropdownMenuCheckboxItem>
                ))}
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

        {/* Stats */}
        <HospitalStatusCards stats={stats} />

        {/* List or Map View */}
        {viewMode === "list" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCases.length === 0 ? (
              <div className="col-span-full text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-500 dark:text-slate-400">ไม่พบเคสที่ตรงกับเงื่อนไข</p>
              </div>
            ) : (
              filteredCases.map((emergencyCase) => (
                <div key={emergencyCase.id} id={`case-${emergencyCase.id}`}>
                  <HospitalCaseCard
                    {...emergencyCase}
                    onTransfer={(caseId) => {
                      setSelectedCaseId(caseId);
                      setTransferDialogOpen(true);
                    }}
                  />
                </div>
              ))
            )}
          </div>
        ) : (
          <div key={`map-view-${viewMode}`} className="relative h-96 lg:h-[600px] rounded-lg overflow-hidden">
            <RealTimeMap
              cases={filteredCases}
              selectedCaseId={selectedLocation?.id || null}
              onCaseSelect={(caseId) => {
                const caseData = filteredCases.find(c => c.id === caseId);
                if (caseData) {
                  setSelectedLocation({
                    id: caseData.id,
                    title: `เคส #${caseData.id.slice(0, 8)}`,
                    severity: caseData.severity,
                    coordinates: [caseData.location.coordinates.lat, caseData.location.coordinates.lng],
                    address: caseData.location.address,
                    description: caseData.description,
                    patientName: caseData.patientName,
                    status: caseData.status,
                  });
                }
              }}
              onTransferCase={(caseId) => {
                setSelectedCaseId(caseId);
                setTransferDialogOpen(true);
              }}
              className="h-full"
              autoRefresh={true}
              refreshInterval={15000}
            />
          </div>
        )}
      </div>

      {/* Transfer to Rescue Dialog */}
      {selectedCaseId && (
        <TransferToRescueDialog
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          caseId={selectedCaseId}
          onTransfer={handleTransferCase}
        />
      )}
    </DashboardLayout>
  );
}