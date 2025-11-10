// app/shared/components/StatsCards.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Activity, Clock, AlertTriangle, Hospital, Building2, Bed, Users } from "lucide-react";
import { DashboardStats } from "@/shared/types";

// ==============================
// 📊 DASHBOARD STATS CARDS
// ==============================
interface StatsCardsProps {
  stats: DashboardStats | null;
  criticalCases?: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, criticalCases = 0 }) => {
  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Admissions */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-slate-900">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">All Admissions</p>
              <h3 className="text-3xl font-bold">{stats.totalEmergencies}</h3>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Cases:</span>
                  <span className="font-semibold">{stats.activeEmergencies}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Completed:</span>
                  <span className="font-semibold">{stats.completedEmergencies}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Cases */}
      <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950 dark:to-slate-900">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Critical Cases</p>
              <h3 className="text-3xl font-bold">{stats.criticalCases}</h3>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Avg Response Time:</span>
                  <span className="font-semibold">{stats.averageResponseTime.toFixed(1)} min</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inpatient (critical cases display) */}
      <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-white dark:from-red-950 dark:to-slate-900">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Inpatient</p>
              <h3 className="text-3xl font-bold">{criticalCases}</h3>
              <div className="mt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Cases:</span>
                  <span className="font-semibold">{stats.totalEmergencies}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Hospitals */}
      <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-slate-900">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Connected Hospitals</p>
              <h3 className="text-3xl font-bold">{stats.connectedHospitals}</h3>
              <div className="mt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Available Beds:</span>
                  <span className="font-semibold">{stats.availableHospitalBeds}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Hospital className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ==============================
// 🏥 HOSPITAL STATS CARDS
// ==============================
export interface HospitalStats {
  totalHospitals: number;
  totalAvailableBeds: number;
  activeHospitals: number;
}

export const HospitalStatsCards: React.FC<{ stats: HospitalStats }> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Total Hospitals */}
    <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-600" />
          โรงพยาบาลทั้งหมด
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalHospitals}</div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">หน่วยที่เชื่อมต่อ</p>
      </CardContent>
    </Card>

    {/* Available Beds */}
    <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
          <Bed className="h-4 w-4 text-green-600" />
          เตียงว่างทั้งหมด
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAvailableBeds}</div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">เตียงพร้อมใช้งาน</p>
      </CardContent>
    </Card>

    {/* Active Hospitals */}
    <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-600" />
          สถานะพร้อมรับ
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeHospitals}</div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">โรงพยาบาลใช้งานได้</p>
      </CardContent>
    </Card>
  </div>
);
