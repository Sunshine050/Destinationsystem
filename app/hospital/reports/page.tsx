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

// Sample hospital report data
const reports = [
  {
    id: 1,
    title: "Emergency Department Performance",
    type: "emergency",
    date: "2025-03-15",
    stats: {
      totalPatients: 156,
      avgWaitTime: 22,
      criticalCases: 34,
      bedOccupancy: 85
    }
  },
  {
    id: 2,
    title: "Resource Utilization Report",
    type: "resources",
    date: "2025-03-14",
    stats: {
      bedUtilization: 78,
      staffUtilization: 92,
      equipmentUsage: 65,
      supplies: 88
    }
  },
  {
    id: 3,
    title: "Patient Care Analysis",
    type: "patients",
    date: "2025-03-13",
    stats: {
      admissions: 89,
      discharges: 76,
      transfers: 12,
      satisfaction: 94
    }
  }
];

export default function HospitalReportsPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Hospital Reports</h1>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="emergency">ED Reports</SelectItem>
            <SelectItem value="resources">Resource Reports</SelectItem>
            <SelectItem value="patients">Patient Reports</SelectItem>
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
            <CardTitle>ED Wait Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">22 min</div>
            <p className="text-muted-foreground">Average wait time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bed Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-muted-foreground">Current occupancy rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-muted-foreground">Based on surveys</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-muted-foreground">Resource efficiency</p>
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
                <span>Emergency Response Rate</span>
                <span className="font-medium">96%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "96%" }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Critical Care Success Rate</span>
                <span className="font-medium">92%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "92%" }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Resource Optimization</span>
                <span className="font-medium">88%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: "88%" }} />
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