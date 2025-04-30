"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Filter, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Sample report data
const reports = [
  {
    id: 1,
    title: "Emergency Response Analysis",
    type: "emergency",
    date: "2025-03-15",
    stats: {
      totalCases: 247,
      avgResponseTime: 12.5,
      criticalCases: 45,
      successfulTransfers: 182
    }
  },
  {
    id: 2,
    title: "Hospital Dispatch Summary",
    type: "dispatch",
    date: "2025-03-14",
    stats: {
      totalDispatches: 195,
      avgDispatchTime: 8.3,
      hospitalAcceptance: 98,
      pendingCases: 12
    }
  },
  {
    id: 3,
    title: "Hospital Performance Report",
    type: "hospital",
    date: "2025-03-13",
    stats: {
      totalAdmissions: 156,
      bedUtilization: 78,
      avgTreatmentTime: 45,
      transferRate: 15
    }
  }
];

export default function ReportsPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="emergency">Emergency Reports</SelectItem>
            <SelectItem value="dispatch">Dispatch Reports</SelectItem>
            <SelectItem value="hospital">Hospital Reports</SelectItem>
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
            <CardTitle>Response Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5 min</div>
            <p className="text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-muted-foreground">Cases this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Critical Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-muted-foreground">High severity cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-muted-foreground">Case resolution rate</p>
          </CardContent>
        </Card>
      </div>

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