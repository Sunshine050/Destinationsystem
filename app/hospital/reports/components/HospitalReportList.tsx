// app/hospital/reports/components/HospitalReportList.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Download, FileText } from "lucide-react";
import { HospitalReport } from "@/shared/types";

interface HospitalReportListProps {
  reports: HospitalReport[];
  onDownload: (reportId: number) => void;
}

export const HospitalReportList: React.FC<HospitalReportListProps> = ({ reports, onDownload }) => (
  <Card>
    <CardHeader>
      <CardTitle>Generated Reports</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">{report.title}</h3>
              <p className="text-sm text-muted-foreground">Generated on {new Date(report.date).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onDownload(report.id)}>
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
);