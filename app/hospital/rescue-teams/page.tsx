"use client";

import React from "react";
import { useRescueTeams } from "./hooks/useRescueTeams";
import { useAuth } from "@/shared/hooks/useAuth";
import { useNotifications } from "@/shared/hooks/useNotifications";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Input } from "@components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@components/ui/button";
import { RescueTeamCard } from "./components/RescueTeamCard";
import { RescueTeamsStatsCards } from "./components/RescueTeamsStatsCards";

export default function RescueTeamsPage() {
  useAuth(); // ตรวจสอบสิทธิ์ก่อนใช้งาน
  const { notifications } = useNotifications();

  const {
    teams: filteredTeams,
    stats,
    searchQuery,
    setSearchQuery,
  } = useRescueTeams();

  // ถ้าจะเพิ่มฟังก์ชัน Contact All Teams
  const handleContactAll = () => {
    // TODO: implement contact all teams logic here
    alert("Contact all teams feature coming soon!");
  };

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
            <h1 className="text-2xl font-bold">Rescue Teams</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Monitor and coordinate with rescue teams
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleContactAll}>Contact All Teams</Button>
          </div>
        </div>

        <RescueTeamsStatsCards stats={stats} />

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search teams..."
              className="pl-8"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTeams.map((team) => (
            <RescueTeamCard key={team.id} team={team} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
