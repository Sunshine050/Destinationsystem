"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import {
  Building2,
  Phone,
  MapPin,
  Search,
  AlertTriangle,
  Bed,
  Activity,
  Users,
  Mail,
  Clock,
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { webSocketClient } from "@lib/websocket";

interface Hospital {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  contactPhone: string;
  contactEmail: string | null;
  status: "ACTIVE" | "INACTIVE" | "BUSY" | string;
  medicalInfo: any | null;
  createdAt: string;
  updatedAt: string;
  availableBeds: number | null;
}

export default function HospitalsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingHospitalId, setUpdatingHospitalId] = useState<string | null>(
    null
  );

  const fetchHospitals = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found. Please log in.");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok)
        throw new Error(`Failed to fetch hospitals: ${res.statusText}`);
      const data = await res.json();

      // Sanitize data to ensure required fields
      const sanitizedData = data.map((hospital: any) => ({
        ...hospital,
        availableBeds: hospital.availableBeds || 0,
      }));

      setHospitals(sanitizedData as Hospital[]);
    } catch (err: any) {
      console.error("Error fetching hospitals:", err);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลโรงพยาบาลได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update hospital status
  const handleUpdateStatus = async (hospitalId: string) => {
    try {
      setUpdatingHospitalId(hospitalId);
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token");

      const hospital = hospitals.find((h) => h.id === hospitalId);
      if (!hospital) return;

      const newStatus = hospital.status === "ACTIVE" ? "BUSY" : "ACTIVE";

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hospitals/${hospitalId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");

      setHospitals((prev) =>
        prev.map((h) => (h.id === hospitalId ? { ...h, status: newStatus } : h))
      );

      toast({
        title: "อัปเดตสถานะสำเร็จ",
        description: `สถานะโรงพยาบาล ${hospital.name} เปลี่ยนเป็น ${
          newStatus === "ACTIVE" ? "ใช้งานได้" : "ยุ่ง"
        }`,
      });
    } catch (err: any) {
      console.error("Error updating status:", err);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะได้",
        variant: "destructive",
      });
    } finally {
      setUpdatingHospitalId(null);
    }
  };

  const handleContactHospital = (hospital: Hospital) => {
    if (hospital.contactPhone) {
      window.open(`tel:${hospital.contactPhone}`, "_blank");
    } else if (hospital.contactEmail) {
      window.open(
        `mailto:${hospital.contactEmail}?subject=Emergency Coordination - ${hospital.name}`,
        "_blank"
      );
    } else {
      toast({
        title: "ไม่พบข้อมูลติดต่อ",
        description: "กรุณาตรวจสอบข้อมูลโรงพยาบาล",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาเข้าสู่ระบบเพื่อใช้งาน",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    fetchHospitals();

    // Connect WebSocket and listen for hospital updates
    webSocketClient.connect(token);
    webSocketClient.on("hospitalUpdate", (data) => {
      console.log("Received hospital update:", data);
      fetchHospitals(); // Refresh hospital data
      toast({
        title: "อัปเดตโรงพยาบาล",
        description: `มีการเปลี่ยนแปลงข้อมูลโรงพยาบาล ID: ${data.hospitalId}`,
      });
    });

    return () => {
      webSocketClient.disconnect();
    };
  }, [router, toast]);

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.city && h.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      h.contactPhone.includes(searchQuery)
  );

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 border-green-200";
      case "BUSY":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500 border-orange-200";
      case "AVAILABLE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500 border-blue-200";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500 border-gray-200";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "ใช้งานได้";
      case "BUSY":
        return "ยุ่ง";
      case "AVAILABLE":
        return "พร้อมรับ";
      case "INACTIVE":
        return "ไม่ใช้งาน";
      default:
        return status;
    }
  };

  const totalHospitals = hospitals.length;
  const totalAvailableBeds = hospitals.reduce(
    (sum, h) => sum + (h.availableBeds || 0),
    0
  );
  const activeHospitals = hospitals.filter((h) => h.status === "ACTIVE").length;

  if (loading) {
    return (
      <DashboardLayout
        role="emergency-center"
        notifications={[]}
        unreadCount={0}
        onMarkAsRead={() => {}}
        onMarkAllAsRead={() => {}}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            กำลังโหลดข้อมูลโรงพยาบาล...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="emergency-center"
      notifications={[]}
      unreadCount={0}
      onMarkAsRead={() => {}}
      onMarkAllAsRead={() => {}}
    >
      <div className="space-y-6">
        {/* Header with Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              โรงพยาบาล
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              จัดการข้อมูลโรงพยาบาลที่เชื่อมต่อระบบฉุกเฉิน
            </p>
          </div>
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="ค้นหาโรงพยาบาล ชื่อ ที่อยู่ จังหวัด หรือเบอร์โทร..."
              className="pl-8 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                โรงพยาบาลทั้งหมด
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalHospitals}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                หน่วยที่เชื่อมต่อ
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Bed className="h-4 w-4 text-green-600" />
                เตียงว่างทั้งหมด
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalAvailableBeds}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                เตียงพร้อมใช้งาน
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" />
                สถานะพร้อมรับ
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeHospitals}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                โรงพยาบาลใช้งานได้
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hospital List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredHospitals.length === 0 ? (
            <Card className="col-span-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <CardContent className="py-12 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  ไม่พบข้อมูล
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ไม่พบโรงพยาบาลที่ตรงกับเกณฑ์การค้นหา
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ลองค้นหาด้วยชื่อหรือที่อยู่
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredHospitals.map((hospital) => (
              <Card
                key={hospital.id}
                className="overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-200"
              >
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
                          {hospital.type || "โรงพยาบาล"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`${getStatusColor(
                        hospital.status
                      )} border text-sm px-3 py-1.5 font-medium shadow-sm`}
                      variant="secondary"
                    >
                      {getStatusLabel(hospital.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-5">
                  {/* Location Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      <MapPin className="h-3 w-3" />
                      ที่ตั้ง
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-gray-900 dark:text-white leading-relaxed mb-1">
                        {hospital.address}
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

                  {/* Contact Section */}
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
                        onClick={() => handleContactHospital(hospital)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              โทรศัพท์
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                              {hospital.contactPhone}
                            </p>
                          </div>
                        </div>
                      </Button>
                      {hospital.contactEmail && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start h-auto py-3 px-4 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                          onClick={() =>
                            window.open(
                              `mailto:${hospital.contactEmail}?subject=Emergency Coordination - ${hospital.name}`,
                              "_blank"
                            )
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                อีเมล
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                                {hospital.contactEmail}
                              </p>
                            </div>
                          </div>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Capacity Section */}
                  {hospital.availableBeds !== null &&
                    hospital.availableBeds >= 0 && (
                      <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          <Bed className="h-3 w-3" />
                          ความสามารถในการรับผู้ป่วย
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2">
                            <Bed className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {hospital.availableBeds} เตียงว่าง
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs border-green-200 dark:border-green-800"
                          >
                            พร้อมรับผู้ป่วย
                          </Badge>
                        </div>
                      </div>
                    )}

                  {/* Medical Info if exists */}
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

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      className="flex-1 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm font-medium"
                      onClick={() => handleContactHospital(hospital)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      ติดต่อด่วน
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm font-medium"
                      onClick={() => handleUpdateStatus(hospital.id)}
                      disabled={updatingHospitalId === hospital.id}
                    >
                      {updatingHospitalId === hospital.id ? (
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

                  {/* Footer with dates */}
                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      สร้าง:{" "}
                      {new Date(hospital.createdAt).toLocaleDateString(
                        "th-TH",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      อัปเดต:{" "}
                      {new Date(hospital.updatedAt).toLocaleDateString(
                        "th-TH",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
