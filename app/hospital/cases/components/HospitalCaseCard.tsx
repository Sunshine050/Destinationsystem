// app/hospital/cases/components/HospitalCaseCard.tsx
// Hospital-specific card (add transfer/cancel)
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { User, Phone, Map, Clock } from "lucide-react";
import { cn } from "@lib/utils";
import { EmergencyCase } from "@/shared/types";
import { statusColors, severityColors } from "@/shared/utils/statusUtils";

interface HospitalCaseCardProps extends EmergencyCase {
  onTransfer: (id: string) => void;
  onCancel: (id: string) => void;
}

export const HospitalCaseCard: React.FC<HospitalCaseCardProps> = ({ id, description, status, severity, reportedAt, patientName, contactNumber, emergencyType, location, assignedTo, symptoms, onTransfer, onCancel }) => (
  <Card className="bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-200">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Case #{id.slice(-8)}</CardTitle>
        <Badge className={cn("text-sm font-medium", statusColors[status])}>{status}</Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500" />
            <p className="text-sm text-slate-600 dark:text-slate-400"><span className="font-medium">Patient:</span> {patientName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-slate-500" />
            <p className="text-sm text-slate-600 dark:text-slate-400"><span className="font-medium">Contact:</span> {contactNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4 text-slate-500" />
            <p className="text-sm text-slate-600 dark:text-slate-400"><span className="font-medium">Location:</span> {location.address}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <p className="text-sm text-slate-600 dark:text-slate-400"><span className="font-medium">Time:</span> {new Date(reportedAt).toLocaleString("th-TH")}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-600 dark:text-slate-400"><span className="font-medium">Type:</span> {emergencyType}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Severity:</span>
            <Badge className={cn("ml-2", severityColors[severity])}>Level {severity}</Badge>
          </div>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Description:</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-3">{description}</p>
      </div>
      {symptoms.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Symptoms:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {symptoms.map((symptom, index) => <Badge key={index} variant="outline" className="text-xs">{symptom}</Badge>)}
          </div>
        </div>
      )}
      {assignedTo && <p className="text-sm text-slate-600 dark:text-slate-400"><span className="font-medium">Assigned to:</span> {assignedTo}</p>}
      <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
        {status === "assigned" && (
          <Button variant="outline" className="flex-1" onClick={() => onTransfer(id)}>
            Transfer to Rescue
          </Button>
        )}
        {(status === "assigned" || status === "in-progress") && (
          <Button variant="destructive" className="flex-1" onClick={() => onCancel(id)}>
            Cancel Case
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);