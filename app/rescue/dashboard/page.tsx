"use client";

import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Button } from "@components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { Search, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@components/ui/card";

import RescueTrendCharts from "./components/RescueTrendCharts";
import CaseCard from "@components/dashboard/case-card";
import { useRescueDashboard } from "./hooks/useRescueDashboard";
import { useNotifications } from "../../useNotifications";
import { fetchHospitals } from "@/shared/services/hospitalService";

export default function RescueTeamDashboard() {
  const {
    filteredCases,
    searchQuery,
    setSearchQuery,
    handleCompleteCase,
    handleCancelCase,
    stats,
    setCases,
  } = useRescueDashboard();

  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <DashboardLayout
      role="rescue"
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Rescue Team Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Manage and track rescue missions
            </p>
          </div>
          <Button>Update Team Status</Button>
        </div>

        {/* Stats */}
        <RescueTrendCharts stats={stats} />

        {/* Team Status */}
        <Card>
          <CardHeader>
            <CardTitle>Team Status & Location</CardTitle>
            <CardDescription>Current team position and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-500 dark:text-slate-400">
                  Map view will be displayed here
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Current Status</h3>
                <p className="text-green-600 dark:text-green-500 font-medium">
                  Available for Missions
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Updated 5 minutes ago
                </p>
              </div>
              <div className="flex-1 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Current Location</h3>
                <p className="text-blue-600 dark:text-blue-500 font-medium">
                  Sukhumvit 24, Bangkok
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  3 km from hospital
                </p>
              </div>
              <div className="flex-1 bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Team Members</h3>
                <p className="text-purple-600 dark:text-purple-500 font-medium">
                  All members on duty
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  5/5 team members available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Missions List */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <h2 className="text-xl font-bold">Rescue Missions</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="search"
                placeholder="Search missions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Missions</TabsTrigger>
              <TabsTrigger value="in-progress">
                Active <Badge className="ml-1">{stats.inProgress}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed <Badge className="ml-1">{stats.completed}</Badge>
              </TabsTrigger>
            </TabsList>

            {["all", "in-progress", "completed"].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {filteredCases.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">
                      No missions found
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredCases
                      .filter((c) => tab === "all" || c.status === tab)
                      .map((c) => (
                        <CaseCard
                          key={c.id}
                          id={c.id}
                          description={c.description}
                          descriptionFull={c.descriptionFull}
                          status={c.status}
                          grade={c.grade}
                          severity={c.severity}
                          onCancel={() => handleCancelCase(c.id)}
                          onTransfer={() => handleCompleteCase(c.id)}
                          reportedAt={c.reportedAt}
                          patientName={c.patientName}
                          contactNumber={c.contactNumber}
                          emergencyType={c.emergencyType}
                          location={c.location}
                          assignedTo={c.assignedTo}
                          symptoms={c.symptoms}
                          role="rescue"
                          setCases={setCases} // <-- ตอนนี้ error หายแล้ว
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
