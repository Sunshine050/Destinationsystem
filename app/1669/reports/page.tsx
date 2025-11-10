"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Button } from "@components/ui/button";
import { Search, Filter, Download, ChevronDown, AlertTriangle, FileText } from "lucide-react";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { useReports } from "./hooks/useReports";
import { ReportTable } from "./components/ReportTable";
import { ReportModal } from "./components/ReportModal";
import { ReportsStatsCards } from "@/shared/components/StatsCards";
import { useAuth } from "@/shared/hooks/useAuth";

export default function ReportsPage() {
  useAuth(); // Auto-redirect if not authenticated

  const {
    stats,
    reports: filteredReports,
    filteredStats,
    filters,
    reportType,
    searchQuery,
    setSearchQuery,
    notifications,
    unreadCount,
    isLoading,
    selectedReport,
    setSelectedReport,
    handleView,
    handleDownload,
    handleDownloadAll,
    handleTypeChange,
    handleFilterChange,
    onMarkAsRead,
    onMarkAllAsRead,
    refetch,
  } = useReports();

  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <DashboardLayout
        role="emergency-center"
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
      >
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูล...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="emergency-center"
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={onMarkAsRead}
      onMarkAllAsRead={onMarkAllAsRead}
    >
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">รายงาน</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">จัดการและติดตามรายงานทั้งหมด</p>
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

            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
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

            <Select value={filters.severity} onValueChange={(value) => handleFilterChange("severity", value)}>
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
                <Button variant="outline" className="flex items-center gap-2 rounded-lg">
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

            <Button onClick={() => refetch()} disabled={isLoading} className="rounded-lg">
              <FileText className="mr-2 h-4 w-4" />
              {isLoading ? "กำลังโหลด..." : "รีเฟรชข้อมูล"}
            </Button>

            <Button onClick={handleDownloadAll} className="rounded-lg">
              <Download className="mr-2 h-4 w-4" />
              ดาวน์โหลดทั้งหมด
            </Button>
          </div>
        </div>

        <ReportsStatsCards stats={filteredStats} />

        <div className="border-0 shadow-lg rounded-xl overflow-hidden bg-white dark:bg-slate-800">
          <div className="bg-gradient-to-r from-primary/5 to-transparent p-6">
            <h2 className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              รายงาน ({filteredReports.length} รายการ)
            </h2>
          </div>
          <div className="p-0">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-500 dark:text-slate-400">ไม่พบรายงานที่ตรงกับเกณฑ์การค้นหา</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <ReportTable reports={filteredReports} onView={handleView} onDownload={handleDownload} />
              </div>
            )}
          </div>
        </div>

        <ReportModal open={!!selectedReport} onOpenChange={() => setSelectedReport(null)} selectedReport={selectedReport} />
      </div>
    </DashboardLayout>
  );
}
