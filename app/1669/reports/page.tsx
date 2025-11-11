"use client";

import React, { useState, useMemo } from "react";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { useHospitals } from "../hospitals/hooks/useHospitals";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { RefreshCw, Hospital, Bed, Activity, AlertCircle } from "lucide-react";
import { Badge } from "@components/ui/badge";

const ReportsPageContent = () => {
  const { hospitals, loading, searchQuery, setSearchQuery, refetch } = useHospitals();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const query = searchQuery.toLowerCase();
      const matchesQuery =
        h.name.toLowerCase().includes(query) ||
        (h.address ?? "").toLowerCase().includes(query) ||
        (h.city ?? "").toLowerCase().includes(query) ||
        (h.contactPhone ?? "").includes(query);

      const matchesStatus =
        statusFilter === "ALL" ? true : (h.status ?? "UNKNOWN") === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [hospitals, searchQuery, statusFilter]);

  const chartData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    hospitals.forEach((h) => {
      const key = h.status ?? "UNKNOWN";
      statusCounts[key] = (statusCounts[key] || 0) + 1;
    });
    return Object.keys(statusCounts).map((key) => ({
      name: key,
      value: statusCounts[key],
    }));
  }, [hospitals]);

  const stats = useMemo(() => {
    const totalBeds = hospitals.reduce((sum, h) => sum + (h.availableBeds ?? 0), 0);
    const activeHospitals = hospitals.filter(h => h.status === "ACTIVE").length;
    const busyHospitals = hospitals.filter(h => h.status === "BUSY").length;
    const maintenanceHospitals = hospitals.filter(h => h.status === "MAINTENANCE").length;

    return { totalBeds, activeHospitals, busyHospitals, maintenanceHospitals };
  }, [hospitals]);

  const COLORS = {
    ACTIVE: "#10b981",
    MAINTENANCE: "#f59e0b",
    BUSY: "#ef4444",
    UNKNOWN: "#94a3b8"
  };

  const getStatusColor = (status: string) => {
    return COLORS[status as keyof typeof COLORS] || COLORS.UNKNOWN;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 shadow-xl">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Activity className="h-10 w-10" />
              รายงานสถานะโรงพยาบาล
            </h1>
            <p className="text-blue-100 text-sm">ภาพรวมและสถิติระบบโรงพยาบาลทั้งหมด</p>
          </div>
          <Button 
            onClick={refetch} 
            className="bg-white/90 hover:bg-white text-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <RefreshCw className="h-4 w-4" /> รีเฟรชข้อมูล
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">โรงพยาบาลพร้อมใช้</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeHospitals}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Hospital className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">โรงพยาบาลเต็ม/ยุ่ง</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.busyHospitals}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">กำลังบำรุงรักษา</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{stats.maintenanceHospitals}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <RefreshCw className="h-7 w-7 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">เตียงว่างทั้งหมด</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalBeds}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Bed className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-md border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="text-2xl">🔍</span> ตัวกรองข้อมูล
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Input
              placeholder="ค้นหาชื่อ, ที่อยู่, เมือง, เบอร์โทร..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 h-11 border-2 focus:border-blue-500 transition-colors bg-white dark:bg-slate-800"
            />
          </div>
          <Select onValueChange={setStatusFilter} value={statusFilter}>
            <SelectTrigger className="w-full sm:w-56 h-11 border-2 bg-white dark:bg-slate-800">
              <SelectValue placeholder="กรองตามสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">🏥 ทั้งหมด</SelectItem>
              <SelectItem value="ACTIVE">✅ ใช้งานได้</SelectItem>
              <SelectItem value="MAINTENANCE">🛠️ บำรุงรักษา</SelectItem>
              <SelectItem value="BUSY">🚨 เต็ม/ยุ่ง</SelectItem>
              <SelectItem value="UNKNOWN">❔ ไม่ระบุ</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="shadow-md border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardTitle className="text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="text-2xl">📊</span> สัดส่วนสถานะโรงพยาบาล
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={true}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} แห่ง`, name]}
                  contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="shadow-md border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <CardTitle className="text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="text-2xl">📈</span> จำนวนโรงพยาบาลตามสถานะ
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any) => [`${value} แห่ง`]}
                  contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="shadow-md border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="text-2xl">🏥</span> รายการโรงพยาบาลทั้งหมด 
            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              {filteredHospitals.length} แห่ง
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    ชื่อโรงพยาบาล
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    ที่อยู่
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    เมือง
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    เบอร์โทร
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    เตียงว่าง
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                        <span className="text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูล...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredHospitals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Hospital className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                        <span className="text-slate-500 dark:text-slate-400 font-medium">ไม่พบข้อมูลโรงพยาบาล</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredHospitals.map((h, index) => (
                    <tr
                      key={h.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                        index % 2 === 0 ? "" : "bg-slate-50/30 dark:bg-slate-800/30"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Hospital className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-900 dark:text-slate-100">{h.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={`font-medium ${
                            h.status === "ACTIVE"
                              ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                              : h.status === "MAINTENANCE"
                              ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400"
                              : h.status === "BUSY"
                              ? "bg-red-50 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-slate-50 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {h.status === "ACTIVE" && "✅ "}
                          {h.status === "MAINTENANCE" && "🛠️ "}
                          {h.status === "BUSY" && "🚨 "}
                          {!h.status && "❔ "}
                          {h.status ?? "ไม่ระบุ"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-sm">
                        {h.address ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-sm">
                        {h.city ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-sm">
                        {h.contactPhone ?? "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <Badge 
                            variant="secondary" 
                            className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-semibold"
                          >
                            <Bed className="h-3 w-3 mr-1" />
                            {h.availableBeds ?? 0}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ==============================
// 🧭 PAGE WRAPPER
// ==============================
const ReportsPage = () => {
  return (
    <DashboardLayout
      role="emergency-center"
      notifications={[]}
      unreadCount={0}
      onMarkAsRead={() => {}}
      onMarkAllAsRead={() => {}}
    >
      <ReportsPageContent />
    </DashboardLayout>
  );
};

export default ReportsPage;