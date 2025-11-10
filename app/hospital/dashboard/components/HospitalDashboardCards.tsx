// app/hospital/dashboard/components/HospitalDashboardCards.tsx
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Clock, Activity, AlertTriangle, Heart, Ambulance, Users } from "lucide-react";

interface HospitalDashboardStats {
  assigned: number;
  inProgress: number;
  completed: number;
  critical: number;
  total: number;
  beds: {
    total: number;
    occupied: number;
    available: number;
    icu: {
      total: number;
      occupied: number;
      available: number;
    };
  };
}

interface HospitalDashboardCardsProps {
  stats: HospitalDashboardStats;
}

export const HospitalDashboardCards: React.FC<HospitalDashboardCardsProps> = ({ stats }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Stats Cards */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Assigned Cases</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{stats.assigned}</div>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">In Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{stats.inProgress}</div>
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
            <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Critical Cases</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{stats.critical}</div>
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Available Beds</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{stats.beds.available}</div>
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
            <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Resource Overview */}
    <Card>
      <CardHeader>
        <CardTitle>Hospital Resources</CardTitle>
        <CardDescription>Current capacity and availability</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">General Beds</span>
              <span className="text-sm text-slate-500">{stats.beds.occupied - stats.beds.icu.occupied}/{stats.beds.total - stats.beds.icu.total}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${((stats.beds.occupied - stats.beds.icu.occupied) / (stats.beds.total - stats.beds.icu.total)) * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">ICU Beds</span>
              <span className="text-sm text-slate-500">{stats.beds.icu.occupied}/{stats.beds.icu.total}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${(stats.beds.icu.occupied / stats.beds.icu.total) * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Emergency Staff</span>
              <span className="text-sm text-slate-500">15/20</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${(15 / 20) * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Ambulances</span>
              <span className="text-sm text-slate-500">3/8</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(3 / 8) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Rescue Teams */}
    <Card>
      <CardHeader>
        <CardTitle>Rescue Teams</CardTitle>
        <CardDescription>Active teams and availability</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Ambulance className="h-5 w-5 text-green-600 dark:text-green-500" />
              </div>
              <div>
                <p className="font-medium">Team Alpha</p>
                <p className="text-sm text-slate-500">Ambulance A-1</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-500">Available</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                <Ambulance className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              </div>
              <div>
                <p className="font-medium">Team Bravo</p>
                <p className="text-sm text-slate-500">Ambulance B-2</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500">On Standby</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                <Ambulance className="h-5 w-5 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <p className="font-medium">Team Charlie</p>
                <p className="text-sm text-slate-500">Ambulance C-3</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500">On Mission</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="font-medium">Emergency Staff</p>
                <p className="text-sm text-slate-500">On-call personnel</p>
              </div>
            </div>
            <div className="text-sm font-medium">15 available</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);