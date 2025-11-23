// app/hospital/reports/page.tsx
"use client";

import { useHospitalReports } from "./hooks/useHospitalReports";
import { useAuth } from "@/shared/hooks/useAuth";
import { useNotifications } from "@/shared/hooks/useNotifications";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Button } from "@components/ui/button";
import { Filter, FileText, Download, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { HospitalReportsStatsCards } from "./components/HospitalReportsStatsCards";
import { HospitalMetricsChart } from "./components/HospitalMetricsChart";
import { HospitalReportList } from "./components/HospitalReportList";
import { Card, CardContent } from "@components/ui/card";

export default function HospitalReportsPage() {
  useAuth();

  const { notifications } = useNotifications();

  const {
    reports: filteredReports,
    stats,
    reportType,
    setReportType,
    timePeriod,
    setTimePeriod,
    isGenerating,
    isLoading,
    handleGenerateReport,
    handleDownload,
  } = useHospitalReports();

  return (
    <DashboardLayout
      role="hospital"
      notifications={notifications}
      unreadCount={0}
      onMarkAsRead={() => {}}
      onMarkAllAsRead={() => {}}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Hospital Reports</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Generate and analyze hospital performance reports
            </p>
          </div>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filters:</span>
              </div>

              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="resources">Resources</SelectItem>
                  <SelectItem value="patients">Patients</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
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

              <div className="flex-1" />

              <Button onClick={handleGenerateReport} disabled={isGenerating}>
                <FileText className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <HospitalReportsStatsCards stats={stats} />

            {/* Charts */}
            <HospitalMetricsChart />

            {/* Report List */}
            <HospitalReportList reports={filteredReports} onDownload={handleDownload} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}