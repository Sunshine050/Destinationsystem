"use client";

import { useState } from "react";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { useDashboardData } from "./hooks/useDashboardData";
import { TrendCharts } from "./components/TrendCharts";
import { ModernCaseCard } from "./components/ModernCaseCard";
import { CaseModal } from "./components/CaseModal";
import { StatsCards } from "@/shared/components/StatsCards";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Calendar, Activity, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";

export default function EmergencyCenterDashboard() {
  const {
    stats,
    cases: filteredCases,
    monthlyTrendData,
    selectedPeriod,
    setSelectedPeriod,
    searchQuery,
    setSearchQuery,
    notifications,
    unreadCount,
    pendingCases,
    assignedCases,
    inProgressCases,
    criticalCases,
    handleViewDetails,
    handleMarkAsRead,
    handleMarkAllAsRead,
  } = useDashboardData();

  const [open, setOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);

  const [tabValue, setTabValue] = useState("all");

  // แทน handleViewDetails เพื่อเปิด modal
  const handleViewCase = (caseData: any) => {
    setSelectedCase(caseData);
    setOpen(true);
  };

  return (
    <DashboardLayout
      role="emergency-center"
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
    >
      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Emergency Center Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Reporting Month: <span className="font-semibold">October 2025</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedPeriod === "6-months" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("6-months")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              6 Months
            </Button>
            <Button
              variant={selectedPeriod === "12-months" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("12-months")}
            >
              12 Months
            </Button>
            <Button
              variant={selectedPeriod === "24-months" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("24-months")}
            >
              24 Months
            </Button>
          </div>
        </div>

        {/* Stats + Charts */}
        <StatsCards stats={stats} criticalCases={criticalCases} />
        <TrendCharts data={monthlyTrendData} period={selectedPeriod} />

        {/* All Cases */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <CardTitle className="text-xl font-bold">All Cases</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder="Search cases..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={tabValue} onValueChange={setTabValue}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Cases</TabsTrigger>
                <TabsTrigger value="pending">
                  Pending <Badge className="ml-1">{pendingCases}</Badge>
                </TabsTrigger>
                <TabsTrigger value="assigned">
                  Assigned <Badge className="ml-1">{assignedCases}</Badge>
                </TabsTrigger>
                <TabsTrigger value="in-progress">
                  In Progress <Badge className="ml-1">{inProgressCases}</Badge>
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed <Badge className="ml-1">{stats?.completedEmergencies || 0}</Badge>
                </TabsTrigger>
              </TabsList>

              {["all", "pending", "assigned", "in-progress", "completed"].map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-4">
                  {filteredCases.filter((c) => tab === "all" || c.status === tab).length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No cases found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredCases
                        .filter((c) => tab === "all" || c.status === tab)
                        .map((emergencyCase) => (
                          <ModernCaseCard
                            key={emergencyCase.id}
                            emergencyCase={emergencyCase}
                            role="emergency-center"
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

        {/* Footer */}
        <div className="text-center text-sm text-slate-500">
          <p>A Constellation Analytics development by Emergency Response System</p>
        </div>

        {/* Case Modal */}
        <CaseModal open={open} onOpenChange={setOpen} selectedCase={selectedCase} />
      </div>
    </DashboardLayout>
  );
}
