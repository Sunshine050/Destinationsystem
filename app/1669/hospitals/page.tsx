'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Building2, Phone, MapPin, Search, Plus, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/components/websocket-provider';

// อินเตอร์เฟซสำหรับข้อมูลโรงพยาบาล
interface Hospital {
  id: string;
  name: string;
  address: string;
  contactPhone: string;
  status: string;
  city: string;
  state?: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  contactEmail?: string;
}

// อินเตอร์เฟซสำหรับฟอร์มเพิ่มโรงพยาบาล
interface NewHospitalData {
  name: string;
  address: string;
  city: string;
  state?: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  contactPhone: string;
  contactEmail?: string;
  status: string;
}

export default function HospitalsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { client, connected } = useWebSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [newHospitalOpen, setNewHospitalOpen] = useState(false);
  const [newHospitalData, setNewHospitalData] = useState<NewHospitalData>({
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    latitude: 0,
    longitude: 0,
    contactPhone: '',
    contactEmail: '',
    status: 'ACTIVE',
  });
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลโรงพยาบาลจาก API
  useEffect(() => {
    const fetchHospitals = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast({
            title: 'ข้อผิดพลาด',
            description: 'ไม่พบโทเค็น กรุณาล็อกอินใหม่',
            variant: 'destructive',
          });
          router.push('/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: 'ข้อผิดพลาด',
              description: 'ไม่ได้รับอนุญาต กรุณาล็อกอินใหม่',
              variant: 'destructive',
            });
            router.push('/login');
            return;
          }
          throw new Error('ไม่สามารถดึงข้อมูลโรงพยาบาลได้');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error('[HospitalsPage] API response is not an array:', data);
          toast({
            title: 'ข้อผิดพลาด',
            description: 'ข้อมูลโรงพยาบาลจาก API ไม่ถูกต้อง',
            variant: 'destructive',
          });
          setHospitals([]);
          return;
        }
        setHospitals(data);
      } catch (error) {
        console.error('[HospitalsPage] ข้อผิดพลาดในการดึงข้อมูลโรงพยาบาล:', error);
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่สามารถโหลดข้อมูลโรงพยาบาลได้',
          variant: 'destructive',
        });
        setHospitals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHospitals();
  }, [toast, router]);

  // WebSocket subscriptions
  useEffect(() => {
    if (!client || !connected) {
      toast({
        title: 'WebSocket ตัดการเชื่อมต่อ',
        description: 'ไม่สามารถรับการอัปเดตแบบเรียลไทม์ได้',
        variant: 'destructive',
      });
      return;
    }

    const handleHospitalUpdate = (data: any) => {
      setHospitals((prev) => {
        if (!Array.isArray(prev)) {
          console.warn('[HospitalsPage] hospitals state is not an array:', prev);
          return [];
        }
        return prev.map((h) =>
          h.id === data.id
            ? {
                ...h,
                status: data.status || h.status,
                name: data.name || h.name,
                address: data.address || h.address,
                contactPhone: data.contactPhone || h.contactPhone,
                city: data.city || h.city,
                state: data.state || h.state,
                postalCode: data.postalCode || h.postalCode,
                latitude: data.latitude || h.latitude,
                longitude: data.longitude || h.longitude,
                contactEmail: data.contactEmail || h.contactEmail,
              }
            : h
        );
      });
      toast({
        title: 'อัปเดตโรงพยาบาล',
        description: `สถานะโรงพยาบาล ${data.name} อัปเดตเป็น ${data.status}`,
      });
    };

    const handleNewHospital = (data: Hospital) => {
      setHospitals((prev) => {
        if (!Array.isArray(prev)) {
          console.warn('[HospitalsPage] hospitals state is not an array:', prev);
          return [data];
        }
        return [data, ...prev];
      });
      toast({
        title: 'เพิ่มโรงพยาบาล',
        description: `โรงพยาบาล ${data.name} ถูกเพิ่ม`,
      });
    };

    client.on('hospitalUpdate', handleHospitalUpdate);
    client.on('newHospital', handleNewHospital);

    return () => {
      client.off('hospitalUpdate', handleHospitalUpdate);
      client.off('newHospital', handleNewHospital);
    };
  }, [client, connected, toast]);

  // ฟังก์ชันค้นหาโรงพยาบาล
  const filteredHospitals = Array.isArray(hospitals)
    ? hospitals.filter(
        (hospital) =>
          hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hospital.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 'BUSY':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500';
      case 'AVAILABLE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const handleContactHospital = (hospitalId: string) => {
    toast({
      title: 'ติดต่อโรงพยาบาล',
      description: 'กำลังเริ่มการสื่อสารกับทีมโรงพยาบาล...',
    });
  };

  const handleUpdateStatus = async (hospitalId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่พบโทเค็น กรุณาล็อกอินใหม่',
          variant: 'destructive',
        });
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals/${hospitalId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'ACTIVE' }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: 'ข้อผิดพลาด',
            description: 'ไม่ได้รับอนุญาต กรุณาล็อกอินใหม่',
            variant: 'destructive',
          });
          router.push('/login');
          return;
        }
        throw new Error('ไม่สามารถอัปเดตสถานะโรงพยาบาลได้');
      }

      toast({
        title: 'อัปเดตสถานะ',
        description: 'สถานะโรงพยาบาลอัปเดตเรียบร้อยแล้ว',
      });
    } catch (error) {
      console.error('[HospitalsPage] ข้อผิดพลาดในการอัปเดตสถานะ:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตสถานะโรงพยาบาลได้',
        variant: 'destructive',
      });
    }
  };

  const handleAddHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่พบโทเค็น กรุณาล็อกอินใหม่',
          variant: 'destructive',
        });
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newHospitalData.name,
          address: newHospitalData.address,
          city: newHospitalData.city,
          state: newHospitalData.state,
          postalCode: newHospitalData.postalCode,
          latitude: newHospitalData.latitude,
          longitude: newHospitalData.longitude,
          contactPhone: newHospitalData.contactPhone,
          contactEmail: newHospitalData.contactEmail,
          status: newHospitalData.status,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: 'ข้อผิดพลาด',
            description: 'ไม่ได้รับอนุญาต กรุณาล็อกอินใหม่',
            variant: 'destructive',
          });
          router.push('/login');
          return;
        }
        throw new Error('ไม่สามารถเพิ่มโรงพยาบาลได้');
      }

      const newHospital = await response.json();
      setHospitals((prev) => {
        if (!Array.isArray(prev)) {
          console.warn('[HospitalsPage] hospitals state is not an array:', prev);
          return [newHospital];
        }
        return [newHospital, ...prev];
      });
      setNewHospitalOpen(false);
      setNewHospitalData({
        name: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        latitude: 0,
        longitude: 0,
        contactPhone: '',
        contactEmail: '',
        status: 'ACTIVE',
      });
      toast({
        title: 'สำเร็จ',
        description: 'เพิ่มโรงพยาบาลเรียบร้อยแล้ว',
      });
    } catch (error) {
      console.error('[HospitalsPage] ข้อผิดพลาดในการเพิ่มโรงพยาบาล:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถเพิ่มโรงพยาบาลได้',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout role="emergency-center">
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">โรงพยาบาลที่เชื่อมต่อ</h1>
                <p className="text-slate-500 dark:text-slate-400">ตรวจสอบและจัดการเครือข่ายโรงพยาบาล</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหาโรงพยาบาล..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-full md:w-[200px]"
                  />
                </div>
                <Dialog open={newHospitalOpen} onOpenChange={setNewHospitalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      เพิ่มโรงพยาบาล
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>เพิ่มโรงพยาบาลใหม่</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddHospital} className="space-y-4">
                      <Input
                        placeholder="ชื่อโรงพยาบาล"
                        value={newHospitalData.name}
                        onChange={(e) => setNewHospitalData({ ...newHospitalData, name: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="ที่อยู่"
                        value={newHospitalData.address}
                        onChange={(e) => setNewHospitalData({ ...newHospitalData, address: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="เมือง"
                        value={newHospitalData.city}
                        onChange={(e) => setNewHospitalData({ ...newHospitalData, city: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="จังหวัด"
                        value={newHospitalData.state}
                        onChange={(e) => setNewHospitalData({ ...newHospitalData, state: e.target.value })}
                      />
                      <Input
                        placeholder="รหัสไปรษณีย์"
                        value={newHospitalData.postalCode}
                        onChange={(e) => setNewHospitalData({ ...newHospitalData, postalCode: e.target.value })}
                        required
                      />
                      <Input
                        type="number"
                        placeholder="ละติจูด"
                        value={newHospitalData.latitude}
                        onChange={(e) =>
                          setNewHospitalData({ ...newHospitalData, latitude: parseFloat(e.target.value) || 0 })
                        }
                      />
                      <Input
                        type="number"
                        placeholder="ลองจิจูด"
                        value={newHospitalData.longitude}
                        onChange={(e) =>
                          setNewHospitalData({ ...newHospitalData, longitude: parseFloat(e.target.value) || 0 })
                        }
                      />
                      <Input
                        placeholder="เบอร์โทรศัพท์"
                        value={newHospitalData.contactPhone}
                        onChange={(e) => setNewHospitalData({ ...newHospitalData, contactPhone: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="อีเมลติดต่อ"
                        value={newHospitalData.contactEmail}
                        onChange={(e) => setNewHospitalData({ ...newHospitalData, contactEmail: e.target.value })}
                      />
                      <Input
                        placeholder="สถานะ (เช่น ACTIVE, BUSY, AVAILABLE)"
                        value={newHospitalData.status}
                        onChange={(e) => setNewHospitalData({ ...newHospitalData, status: e.target.value })}
                        required
                      />
                      <DialogFooter>
                        <Button type="submit">เพิ่มโรงพยาบาล</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {hospitals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">ไม่พบข้อมูลโรงพยาบาล</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredHospitals.map((hospital) => (
                  <Card key={hospital.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <CardTitle>{hospital.name}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(hospital.status)}>
                          {hospital.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {hospital.address}, {hospital.city}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4" />
                          {hospital.contactPhone}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleContactHospital(hospital.id)}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            ติดต่อ
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleUpdateStatus(hospital.id)}
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            อัปเดตสถานะ
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}