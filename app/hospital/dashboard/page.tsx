"use client";

import { useState } from "react";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { useHospitalDashboard } from "./hooks/useHospitalDashboard";
import { HospitalDashboardCards } from "./components/HospitalDashboardCards";
import { HospitalTrendCharts } from "./components/HospitalTrendCharts";
import { ModernCaseCard } from "@/1669/dashboard/components/ModernCaseCard";
import { CaseModal } from "@/1669/dashboard/components/CaseModal";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Calendar, Activity, Search, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function HospitalDashboard() {
  const { stats, cases, rescueTeams, loading, error, refetch } = useHospitalDashboard();
  const [open, setOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [tabValue, setTabValue] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleViewCase = (caseData: any) => {
    setSelectedCase(caseData);
    setOpen(true);
  };

  // Filter cases based on search and tab
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = tabValue === "all" || c.status === tabValue;
    return matchesSearch && matchesTab;
  });

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

  if (loading) {
    return (
      <DashboardLayout
        role="hospital"
        notifications={[]}
        unreadCount={0}
        onMarkAsRead={() => {}}
        onMarkAllAsRead={() => {}}
      >
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600 dark:text-slate-400">กำลังโหลดข้อมูลแดชบอร์ด...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="hospital"
      notifications={[]}
      unreadCount={0}
      onMarkAsRead={() => {}}
      onMarkAllAsRead={() => {}}
    >
      <motion.div 
        className="space-y-8 max-w-[1800px] mx-auto pb-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Hospital Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Real-time Hospital Management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <HospitalDashboardCards stats={stats} rescueTeams={rescueTeams} error={error} />
        </motion.div>

        {/* Charts Section */}
        <motion.div variants={itemVariants}>
          <HospitalTrendCharts cases={cases} />
        </motion.div>

        {/* Cases Section */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 dark:border-slate-800 shadow-md">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Assigned Cases
                  </CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Cases assigned to this hospital
                  </p>
                </div>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search by ID, patient, or description..."
                    className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <Tabs value={tabValue} onValueChange={setTabValue}>
                <TabsList className="mb-6 bg-slate-100 dark:bg-slate-800 p-1">
                  <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                    All Cases
                  </TabsTrigger>
                  <TabsTrigger value="assigned" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                    Assigned <Badge variant="secondary" className="ml-1.5">{stats.assigned}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="in-progress" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                    In Progress <Badge variant="secondary" className="ml-1.5">{stats.inProgress}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                    Completed <Badge variant="secondary" className="ml-1.5">{stats.completed}</Badge>
                  </TabsTrigger>
                </TabsList>

                {["all", "assigned", "in-progress", "completed"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="space-y-4 mt-0">
                    {filteredCases.filter((c) => tab === "all" || c.status === tab).length === 0 ? (
                      <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <Activity className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No cases found</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                          {tab === "all" ? "All cases will appear here" : `No ${tab} cases at the moment`}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredCases
                          .filter((c) => tab === "all" || c.status === tab)
                          .map((emergencyCase) => (
                            <ModernCaseCard
                              key={emergencyCase.id}
                              emergencyCase={emergencyCase}
                              role="hospital"
                              onViewDetails={() => handleViewCase(emergencyCase)}
                            />
                          ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="text-center text-sm text-slate-400 dark:text-slate-500 pt-4">
          <p>Hospital Management System © 2025 • Real-time Analytics Dashboard</p>
        </motion.div>

        {/* Case Modal */}
        <CaseModal open={open} onOpenChange={setOpen} selectedCase={selectedCase} />
      </motion.div>
    </DashboardLayout>
  );
}
