"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Phone, 
  MapPin, 
  Search,
  Plus,
  AlertTriangle,
  Bed,
  Activity,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HospitalCapacity {
  icu: {
    total: number;
    available: number;
  };
  emergency: {
    total: number;
    available: number;
  };
  general: {
    total: number;
    available: number;
  };
}

interface HospitalStaff {
  doctors: number;
  nurses: number;
  available: number;
}

interface Hospital {
  id: number;
  name: string;
  address: string;
  phone: string;
  status: "active" | "busy" | "available";
  capacity: HospitalCapacity;
  staff: HospitalStaff;
}

export default function HospitalsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchHospitals = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found. Please log in.");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/hospitals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Failed to fetch hospitals: ${res.statusText}`);
      const data = await res.json();
      setHospitals(data);
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

  useEffect(() => {
    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500";
      case "busy":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500";
      case "available":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const handleContactHospital = (hospitalId: number) => {
    toast({
      title: "Contacting Hospital",
      description: "Establishing communication with hospital staff...",
    });
  };

  const handleUpdateStatus = (hospitalId: number) => {
    toast({
      title: "Status Updated",
      description: "Hospital status has been updated successfully.",
    });
  };

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
          <div className="text-slate-500">Loading hospitals...</div>
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
        {/* Search and Add */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search hospitals..."
              className="pl-8"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Hospital
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Hospitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hospitals.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Available ICU Beds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hospitals.reduce((sum, h) => sum + h.capacity.icu.available, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Emergency Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hospitals.reduce((sum, h) => sum + h.capacity.emergency.available, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Available Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hospitals.reduce((sum, h) => sum + h.staff.available, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hospital List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredHospitals.length === 0 ? (
            <div className="col-span-full text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p className="text-slate-500 dark:text-slate-400">
                ไม่พบโรงพยาบาลที่ตรงกับเกณฑ์การค้นหา
              </p>
            </div>
          ) : (
            filteredHospitals.map(hospital => (
              <Card key={hospital.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <CardTitle>{hospital.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(hospital.status)}>
                      {hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {hospital.address}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      {hospital.phone}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* ICU */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Bed className="h-4 w-4" />
                          ICU Beds
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Available:</span>
                          <span className="font-medium">{hospital.capacity.icu.available}/{hospital.capacity.icu.total}</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(hospital.capacity.icu.available / hospital.capacity.icu.total) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Emergency */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <AlertTriangle className="h-4 w-4" />
                          Emergency
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Available:</span>
                          <span className="font-medium">{hospital.capacity.emergency.available}/{hospital.capacity.emergency.total}</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${(hospital.capacity.emergency.available / hospital.capacity.emergency.total) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Staff */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Users className="h-4 w-4" />
                          Staff
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Available:</span>
                          <span className="font-medium">{hospital.staff.available}</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(hospital.staff.available / (hospital.staff.doctors + hospital.staff.nurses)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleContactHospital(hospital.id)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleUpdateStatus(hospital.id)}
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Update Status
                      </Button>
                    </div>
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
