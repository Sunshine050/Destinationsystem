// app/hospital/reports/components/HospitalMetricsChart.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";

const metrics = {
  emergencyResponseRate: 96,
  criticalCareSuccessRate: 92,
  resourceOptimization: 88,
};

export const HospitalMetricsChart = () => (
  <Card>
    <CardHeader>
      <CardTitle>Performance Metrics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Emergency Response Rate</span>
            <span className="font-medium">{metrics.emergencyResponseRate}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${metrics.emergencyResponseRate}%` }} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Critical Care Success Rate</span>
            <span className="font-medium">{metrics.criticalCareSuccessRate}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${metrics.criticalCareSuccessRate}%` }} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Resource Optimization</span>
            <span className="font-medium">{metrics.resourceOptimization}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${metrics.resourceOptimization}%` }} />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);