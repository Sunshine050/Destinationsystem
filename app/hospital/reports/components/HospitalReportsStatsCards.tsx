// app/hospital/reports/components/HospitalReportsStatsCards.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";

export interface HospitalReportsStats {
  totalPatients?: number;
  avgWaitTime?: number;
  criticalCases?: number;
  bedOccupancy?: number;
  bedUtilization?: number;
  staffUtilization?: number;
  equipmentUsage?: number;
  supplies?: number;
  admissions?: number;
  discharges?: number;
  transfers?: number;
  satisfaction?: number;
  totalHospitals?: number;
  totalAvailableBeds?: number;
  activeHospitals?: number;
}

interface HospitalReportsStatsCardsProps {
  stats: Partial<HospitalReportsStats>;
}

export const HospitalReportsStatsCards: React.FC<HospitalReportsStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* ค่าเฉลี่ยเวลารอ */}
      <Card>
        <CardHeader>
          <CardTitle>ED Wait Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgWaitTime ?? 0} min</div>
          <p className="text-muted-foreground">Average wait time</p>
        </CardContent>
      </Card>

      {/* การครองเตียง */}
      <Card>
        <CardHeader>
          <CardTitle>Bed Occupancy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.bedOccupancy ?? 0}%</div>
          <p className="text-muted-foreground">Current occupancy rate</p>
        </CardContent>
      </Card>

      {/* ความพึงพอใจของผู้ป่วย */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Satisfaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.satisfaction ?? 0}%</div>
          <p className="text-muted-foreground">Based on surveys</p>
        </CardContent>
      </Card>

      {/* การใช้บุคลากร */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.staffUtilization ?? 0}%</div>
          <p className="text-muted-foreground">Resource efficiency</p>
        </CardContent>
      </Card>

      {/* จำนวนโรงพยาบาล */}
      {stats.totalHospitals !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Total Hospitals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHospitals}</div>
            <p className="text-muted-foreground">Hospitals connected</p>
          </CardContent>
        </Card>
      )}

      {/* เตียงว่าง */}
      {stats.totalAvailableBeds !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Available Beds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAvailableBeds}</div>
            <p className="text-muted-foreground">Beds currently free</p>
          </CardContent>
        </Card>
      )}

      {/* โรงพยาบาลที่กำลังเปิดให้บริการ */}
      {stats.activeHospitals !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Active Hospitals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeHospitals}</div>
            <p className="text-muted-foreground">Currently operating</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
