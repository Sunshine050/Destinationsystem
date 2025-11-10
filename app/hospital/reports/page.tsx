// app/hospital/reports/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useHospitalReports } from "./hooks/useHospitalReports";
import { useAuth } from "@/shared/hooks/useAuth"; // Fixed: correct path
import { useNotifications } from "@/shared/hooks/useNotifications"; // Add for layout props
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Button } from "@components/ui/button";
import { ArrowLeft, Filter, FileText } from "lucide-react"; // Fixed: lucide-react
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { useToast } from "@/shared/hooks/use-toast";
import { HospitalReportsStatsCards } from "../reports/components/HospitalReportsStatsCards";
import { HospitalMetricsChart } from "./components/HospitalMetricsChart";
import { HospitalReportList } from "./components/HospitalReportList";

export default function HospitalReportsPage() {
  useAuth();

  const router = useRouter();
  const { toast } = useToast();
  const { notifications, unreadCount, onMarkAsRead, onMarkAllAsRead } = useNotifications(); // Add for layout

  const {
    reports: filteredReports,
    reportType,
    setReportType,
    timePeriod,
    setTimePeriod,
    isGenerating,
    handleGenerateReport,
    handleDownload,
  } = useHospitalReports();

  // Sample stats for cards (from hook or API future)
  const sampleStats = {
    avgWaitTime: 22,
    bedOccupancy: 85,
    satisfaction: 94,
    staffUtilization: 92,
  };

  return (
    <DashboardLayout role="hospital" notifications={notifications} unreadCount={unreadCount} onMarkAsRead={onMarkAsRead} onMarkAllAsRead={onMarkAllAsRead}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Hospital Reports</h1>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="emergency">ED Reports</SelectItem>
              <SelectItem value="resources">Resource Reports</SelectItem>
              <SelectItem value="patients">Patient Reports</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>

          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            <FileText className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>
        </div>

        <HospitalReportsStatsCards stats={sampleStats} />

        <HospitalMetricsChart />

        <HospitalReportList reports={filteredReports} onDownload={handleDownload} />
      </div>
    </DashboardLayout>
  );
};