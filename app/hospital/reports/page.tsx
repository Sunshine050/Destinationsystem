// app/hospital/reports/page.tsx
"use client";

import { useHospitalReports } from "./hooks/useHospitalReports";
import { useAuth } from "@/shared/hooks/useAuth";
import { useNotifications } from "@/shared/hooks/useNotifications";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Button } from "@components/ui/button";
import { Filter, FileText, Download, Calendar, BarChart3, PieChart, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { HospitalReportsStatsCards } from "./components/HospitalReportsStatsCards";
import { HospitalMetricsChart } from "./components/HospitalMetricsChart";
import { HospitalReportList } from "./components/HospitalReportList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { motion } from "framer-motion";

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <DashboardLayout
      role="hospital"
      notifications={notifications}
      unreadCount={0}
      onMarkAsRead={() => {}}
      onMarkAllAsRead={() => {}}
    >
      <motion.div 
        className="space-y-8 max-w-[1600px] mx-auto pb-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Analytics & Reports
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Comprehensive insights into hospital performance and resource utilization
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
            <Button onClick={handleGenerateReport} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
              <FileText className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate New Report"}
            </Button>
          </div>
        </motion.div>

        {/* Filters Toolbar */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 sticky top-20 z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </div>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />

          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[200px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-blue-500/20">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <BarChart3 className="h-4 w-4" />
                <span className="text-slate-900 dark:text-slate-100"><SelectValue placeholder="Report Type" /></span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="emergency">Emergency Cases</SelectItem>
              <SelectItem value="resources">Resource Utilization</SelectItem>
              <SelectItem value="patients">Patient Demographics</SelectItem>
              <SelectItem value="performance">Staff Performance</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-blue-500/20">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                <span className="text-slate-900 dark:text-slate-100"><SelectValue placeholder="Time Period" /></span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-500 animate-pulse">Loading analytics data...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <motion.div variants={itemVariants}>
              <HospitalReportsStatsCards stats={stats} />
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Charts Section - Takes up 2 columns */}
              <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Performance Metrics</CardTitle>
                        <CardDescription>Visual analysis of key performance indicators over time</CardDescription>
                      </div>
                      <Tabs defaultValue="overview" className="w-[200px]">
                        <TabsList className="grid w-full grid-cols-2 h-8">
                          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                          <TabsTrigger value="detailed" className="text-xs">Detailed</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <HospitalMetricsChart />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Reports List - Takes up 1 column */}
              <motion.div variants={itemVariants} className="lg:col-span-1">
                 <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recent Reports</CardTitle>
                        <CardDescription>Generated reports history</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4 text-slate-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <HospitalReportList reports={filteredReports} onDownload={handleDownload} />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}