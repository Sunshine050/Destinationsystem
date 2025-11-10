// app/1669/hospitals/components/HospitalCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Building2, Phone, MapPin, Bed, Activity, Mail, Clock } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Hospital } from "@/shared/types";
import { statusColors, getCaseStatusLabel } from "@/shared/utils/statusUtils";

interface HospitalCardProps {
  hospital: Hospital;
  onContact: (hospital: Hospital) => void;
  onUpdateStatus: (id: string) => void;
  updatingId: string | null;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  onContact,
  onUpdateStatus,
  updatingId,
}) => (
  <Card className="overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-200">
    <CardHeader className="pb-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
              {hospital.name}
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
              {/* ถ้า hospital.type ไม่มีใน interface ให้ fallback */}
              {"type" in hospital ? hospital.type : "โรงพยาบาล"}
            </p>
          </div>
        </div>

        {/* แก้ใช้ statusColors และ getCaseStatusLabel */}
        <Badge
          className={`${statusColors[hospital.status ?? "UNKNOWN"] ?? "text-gray-500"} border text-sm px-3 py-1.5 font-medium shadow-sm`}
          variant="secondary"
        >
          {getCaseStatusLabel(hospital.status ?? "")}
        </Badge>
      </div>
    </CardHeader>

    <CardContent className="pt-4 space-y-5">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          <MapPin className="h-3 w-3" />
          ที่ตั้ง
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-gray-900 dark:text-white leading-relaxed mb-1">
            {hospital.address ?? "-"}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            {hospital.city && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-700 rounded-full text-xs font-medium">
                {hospital.city}
              </span>
            )}
            {hospital.state && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-700 rounded-full text-xs font-medium">
                {hospital.state}
              </span>
            )}
            {hospital.postalCode && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300">
                {hospital.postalCode}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          <Phone className="h-3 w-3" />
          ช่องทางติดต่อ
        </div>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start h-auto py-3 px-4 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            onClick={() => onContact(hospital)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">โทรศัพท์</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{hospital.contactPhone ?? "-"}</p>
              </div>
            </div>
          </Button>

          {hospital.contactEmail && (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start h-auto py-3 px-4 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              onClick={() => window.open(`mailto:${hospital.contactEmail}?subject=Emergency Coordination - ${hospital.name}`, "_blank")}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">อีเมล</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{hospital.contactEmail}</p>
                </div>
              </div>
            </Button>
          )}
        </div>
      </div>

      {(hospital.availableBeds ?? -1) >= 0 && (
        <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            <Bed className="h-3 w-3" />
            ความสามารถในการรับผู้ป่วย
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{hospital.availableBeds} เตียงว่าง</span>
            </div>
            <Badge variant="outline" className="text-xs border-green-200 dark:border-green-800">
              พร้อมรับผู้ป่วย
            </Badge>
          </div>
        </div>
      )}

      {hospital.medicalInfo && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wide">
            <Activity className="h-3 w-3" />
            ข้อมูลทางการแพทย์เพิ่มเติม
          </div>
          <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-white dark:bg-slate-800 p-3 rounded-md border border-slate-200 dark:border-slate-700 overflow-x-auto">
            {JSON.stringify(hospital.medicalInfo, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button
          variant="outline"
          className="flex-1 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm font-medium"
          onClick={() => onContact(hospital)}
        >
          <Phone className="h-4 w-4 mr-2" />
          ติดต่อด่วน
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm font-medium"
          onClick={() => onUpdateStatus(hospital.id)}
          disabled={updatingId === hospital.id}
        >
          {updatingId === hospital.id ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              กำลังอัปเดต
            </>
          ) : (
            <>
              <Activity className="h-4 w-4 mr-2" />
              อัปเดตสถานะ
            </>
          )}
        </Button>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          สร้าง:{" "}
          {hospital.createdAt
            ? new Date(hospital.createdAt).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "-"}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          อัปเดต:{" "}
          {hospital.updatedAt
            ? new Date(hospital.updatedAt).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "-"}
        </span>
      </div>
    </CardContent>
  </Card>
);
