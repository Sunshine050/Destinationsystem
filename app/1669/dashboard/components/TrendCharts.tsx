// app/1669/dashboard/components/TrendCharts.tsx
// Charts components (reduce duplicate defs)
import { ResponsiveContainer, AreaChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, Line } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { TrendingUp, Activity, BarChart3 } from "lucide-react";
import { MonthlyTrendData } from "@/shared/types";

interface TrendChartsProps {
  data: MonthlyTrendData[];
  period: string;
}

const GradientDefs = () => (
  <defs>
    <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="colorUrgent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="colorNonUrgent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
    </linearGradient>
  </defs>
);

export const TrendCharts: React.FC<TrendChartsProps> = ({ data, period }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <Card className="lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Case Status Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <GradientDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="admissions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAdmissions)" name="Total Cases" />
            </AreaChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-slate-500">No data available</p>}
      </CardContent>
    </Card>

    <Card className="lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600" />
          Critical Cases Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="critical" stroke="#9333ea" strokeWidth={2} dot={{ r: 3 }} name="Critical Cases" />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-slate-500">No data available</p>}
      </CardContent>
    </Card>

    <Card className="lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          Case Severity Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <GradientDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="critical" stroke="#dc2626" fillOpacity={1} fill="url(#colorCritical)" name="Critical" />
              <Area type="monotone" dataKey="urgent" stroke="#f59e0b" fillOpacity={1} fill="url(#colorUrgent)" name="Urgent" />
              <Area type="monotone" dataKey="nonUrgent" stroke="#10b981" fillOpacity={1} fill="url(#colorNonUrgent)" name="Non-Urgent" />
            </AreaChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-slate-500">No data available</p>}
      </CardContent>
    </Card>
  </div>
);