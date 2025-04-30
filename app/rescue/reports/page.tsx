"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Filter, ArrowLeft, Download, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Sample rescue team report data
const reports = [
  {
    id: 1,
    title: "Mission Performance Report",
    type: "missions",
    date: "2025-03-15",
    stats: {
      totalMissions: 45,
      avgResponseTime: 8.5,
      criticalCases: 12,
      successRate: 96
    }
  },
  {
    id: 2,
    title: "Team Activity Analysis",
    type: "team",
    date: "2025-03-14",
    stats: {
      activeHours: 180,
      missionTime: 145,
      standbyTime: 35,
      teamUtilization: 92
    }
  },
  {
    id: 3,
    title: "Equipment Usage Report",
    type: "equipment",
    date: "2025-03-13",
    stats: {
      vehicleUsage: 85,
      equipmentCondition: 95,
      maintenanceNeeded: 2,
      fuelConsumption: 180
    }
  }
];

export default function RescueReportsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [reportType, setReportType] = useState("all");
  const [timePeriod, setTimePeriod] = useState("month");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Report Generated",
        description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report for the last ${timePeriod} has been generated.`,
      });
    }, 2000);
  };

  const handleDownload = (reportId: number) => {
    toast({
      title: "Download Started",
      description: "Your report is being downloaded...",
    });
  };

  const filteredReports = reportType === "all" 
    ? reports 
    : reports.filter(r => r.type === reportType);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Rescue Team Reports</h1>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="missions">Mission Reports</SelectItem>
            <SelectItem value="team">Team Reports</SelectItem>
            <SelectItem value="equipment">Equipment Reports</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Apply Filters
        </Button>

        <Button onClick={handleGenerateReport} disabled={isGenerating}>
          <FileText className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Report"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5 min</div>
            <p className="text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96%</div>
            <p className="text-muted-foreground">Mission completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">180h</div>
            <p className="text-muted-foreground">Total active time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-muted-foreground">Equipment readiness</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Performance Metrics</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Mission Success Rate</span>
                <span className="font-medium">96%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "96%" }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Team Utilization</span>
                <span className="font-medium">92%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "92%" }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Equipment Readiness</span>
                <span className="font-medium">95%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: "95%" }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">{report.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Generated on {new Date(report.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(report.id)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}