"use client";

import { useState } from "react";
import { useHospitalDashboard } from "./hooks/useHospitalDashboard";
import { useAuth } from "@/shared/hooks/useAuth";
import { useNotifications } from "@/shared/hooks/useNotifications";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Button } from "@components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import CaseCard from "@components/dashboard/case-card";
import { HospitalDashboardCards } from "./components/HospitalDashboardCards";

export default function HospitalDashboard() {
  useAuth();
  const { notifications } = useNotifications();

  const {
    cases: filteredCases,
    stats,
    searchQuery,
    setSearchQuery,
    handleTransferCase,
    handleCancelCase,
    setCases,
    fetchHospitals,
    rescueTeams,
    error,
  } = useHospitalDashboard();

  const [tabValue, setTabValue] = useState("all");

  return (
    <DashboardLayout
      role="hospital"
      notifications={notifications}
      unreadCount={0}
      onMarkAsRead={() => {}}
      onMarkAllAsRead={() => {}}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Hospital Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">Monitor emergency cases and hospital resources</p>
          </div>
          <div className="flex gap-2">
            <Button>Hospital Status Update</Button>
          </div>
        </div>

        <HospitalDashboardCards stats={stats} rescueTeams={rescueTeams} error={error} />

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <h2 className="text-xl font-bold">Emergency Cases</h2>
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

          <Tabs value={tabValue} onValueChange={setTabValue}>
            <TabsList>
              <TabsTrigger value="all">All Cases</TabsTrigger>
              <TabsTrigger value="assigned">
                Assigned <Badge className="ml-1">{stats.assigned}</Badge>
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress <Badge className="ml-1">{stats.inProgress}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed <Badge className="ml-1">{stats.completed}</Badge>
              </TabsTrigger>
            </TabsList>

            {["all", "assigned", "in-progress", "completed"].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {filteredCases.filter((c) => tab === "all" || c.status === tab).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">No cases found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredCases
                      .filter((c) => tab === "all" || c.status === tab)
                      .map((emergencyCase) => (
                        <CaseCard
                          key={emergencyCase.id}
                          {...emergencyCase}
                          severity={emergencyCase.severity as 1 | 2 | 3 | 4}
                          status={emergencyCase.status as
                            | "pending"
                            | "assigned"
                            | "in-progress"
                            | "completed"
                            | "cancelled"}
                          onTransfer={() => handleTransferCase(emergencyCase.id)}
                          onCancel={() => handleCancelCase(emergencyCase.id)}
                          role="hospital"
                          setCases={setCases}
                          fetchHospitals={fetchHospitals}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
