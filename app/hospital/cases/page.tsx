"use client";

import { useState } from "react";
import { useHospitalCases } from "./hooks/useHospitalCases";
import { useAuth } from "@/shared/hooks/useAuth";
import { useNotifications } from "@/shared/hooks/useNotifications";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Button } from "@components/ui/button";
import { Search, Filter, MapPin, ChevronDown, AlertTriangle } from "lucide-react";
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
import { HospitalCaseCard } from "./components/HospitalCaseCard";
import { HospitalStatusCards } from "@/shared/components/StatsCards"; // import ให้ตรงกับ export
import MapView from "@components/dashboard/map-view"; // Shared

export default function HospitalCases() {
  useAuth();
  const { notifications } = useNotifications();

  const {
    cases: filteredCases,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    handleTransferCase,
    handleCancelCase,
    getMapLocations, // สมมติว่าเป็น array จริงๆ
  } = useHospitalCases();

  const stats = {
    total: filteredCases.length,
    assigned: filteredCases.filter((c) => c.status === "assigned").length,
    critical: filteredCases.filter((c) => c.severity === 4).length,
    inProgress: filteredCases.filter((c) => c.status === "in-progress").length,
  };

  if (filteredCases.length === 0) {
    return (
      <DashboardLayout
        role="hospital"
        notifications={notifications}
        unreadCount={0}
        onMarkAsRead={() => {}}
        onMarkAllAsRead={() => {}}
      >
        <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400">No cases found matching your criteria</p>
        </div>
      </DashboardLayout>
    );
  }

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
            <h1 className="text-2xl font-bold">Emergency Cases</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage and monitor assigned emergency cases</p>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search by ID, name, or type..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.severity} onValueChange={(value) => setFilters({ ...filters, severity: value })}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="1">Grade 1 (Mild)</SelectItem>
                <SelectItem value="2">Grade 2 (Moderate)</SelectItem>
                <SelectItem value="3">Grade 3 (Severe)</SelectItem>
                <SelectItem value="4">Grade 4 (Critical)</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  More Filters
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Date Range</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.date === "all"}
                  onCheckedChange={() => setFilters({ ...filters, date: "all" })}
                >
                  All Dates
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === "today"}
                  onCheckedChange={() => setFilters({ ...filters, date: "today" })}
                >
                  Today
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === "yesterday"}
                  onCheckedChange={() => setFilters({ ...filters, date: "yesterday" })}
                >
                  Yesterday
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === "week"}
                  onCheckedChange={() => setFilters({ ...filters, date: "week" })}
                >
                  This Week
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
              <Button
                variant={viewMode === "map" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode("map")}
              >
                <MapPin className="h-4 w-4 mr-1" />
                Map
              </Button>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <HospitalStatusCards stats={stats} />

        {/* Case list or map */}
        {viewMode === "list" ? (
          <div className="space-y-4">
            {filteredCases.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-500 dark:text-slate-400">No cases found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCases.map((emergencyCase) => (
                  <HospitalCaseCard
                    key={emergencyCase.id}
                    {...emergencyCase}
                    onTransfer={handleTransferCase}
                    onCancel={handleCancelCase}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Showing {filteredCases.length} emergency cases on the map. Hover over markers for details.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
