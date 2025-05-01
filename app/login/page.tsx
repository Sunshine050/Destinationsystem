"use client"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  PhoneCall, 
  Hospital, 
  Ambulance, 
  Lock, 
  Mail,
  User,
  ArrowRight,
  Loader2,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { Separator } from "@/components/ui/separator";
import axios from 'axios';

interface FormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const roleMapping = {
  '1669': 'EMERGENCY_CENTER',
  'hospital': 'HOSPITAL',
  'rescue': 'RESCUE_TEAM',
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [defaultTab, setDefaultTab] = useState('1669');
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    const role = searchParams?.get('role');
    if (role && ['1669', 'hospital', 'rescue'].includes(role)) {
      setDefaultTab(role);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (event: React.FormEvent, role: string) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      console.log('Sending login request to:', `${API_BASE_URL}/auth/login`);
      console.log('Login request body:', {
        email: formData.email,
        password: formData.password,
      });

      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      console.log('Login response:', response.data);

      const { access_token, refresh_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      toast({
        title: "ล็อกอินสำเร็จ",
        description: `ยินดีต้อนรับเข้าสู่ระบบในฐานะ ${role}`,
      });

      if (role === '1669') {
        router.push('/1669/dashboard');
      } else if (role === 'hospital') {
        router.push('/hospital/dashboard');
      } else if (role === 'rescue') {
        router.push('/rescue/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      toast({
        variant: "destructive",
        title: "ล็อกอินไม่สำเร็จ",
        description: error.response?.data?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent, role: string) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      console.log('Sending register request to:', `${API_BASE_URL}/auth/register`);
      console.log('Register request body:', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: roleMapping[role as keyof typeof roleMapping],
      });

      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        phone: formData.phone || undefined,
        role: roleMapping[role as keyof typeof roleMapping],
      });

      console.log('Register response:', response.data);

      toast({
        title: "ลงทะเบียนสำเร็จ",
        description: "ลงทะเบียนเรียบร้อย กรุณาล็อกอินเพื่อใช้งาน",
      });

      setIsRegister(false);
      setFormData({
        email: formData.email,
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
      });
    } catch (error: any) {
      console.error('Register error:', error.response?.data || error.message);
      toast({
        variant: "destructive",
        title: "ลงทะเบียนไม่สำเร็จ",
        description: error.response?.data?.message || "เกิดข้อผิดพลาดในการลงทะเบียน",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setDefaultTab(value);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-slate-950 dark:to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">ระบบตอบสนองฉุกเฉิน</h1>
          <p className="text-slate-600 dark:text-slate-400">
            ล็อกอินหรือลงทะเบียนเพื่อเข้าถึงแดชบอร์ดของคุณ
          </p>
        </div>

        <Tabs 
          defaultValue={defaultTab} 
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="1669" className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4" />
              <span className="hidden sm:inline">1669</span>
            </TabsTrigger>
            <TabsTrigger value="hospital" className="flex items-center gap-2">
              <Hospital className="h-4 w-4" />
              <span className="hidden sm:inline">โรงพยาบาล</span>
            </TabsTrigger>
            <TabsTrigger value="rescue" className="flex items-center gap-2">
              <Ambulance className="h-4 w-4" />
              <span className="hidden sm:inline">ทีมกู้ภัย</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="1669">
            <AuthCard 
              title="ศูนย์ตอบสนอง 1669" 
              description="เข้าถึงแดชบอร์ดศูนย์ตอบสนองฉุกเฉิน"
              icon={<PhoneCall className="h-5 w-5 text-red-600" />}
              role="1669"
              formData={formData}
              setFormData={setFormData}
              isRegister={isRegister}
              setIsRegister={setIsRegister}
              onLogin={handleLogin}
              onRegister={handleRegister}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="hospital">
            <AuthCard 
              title="เจ้าหน้าที่โรงพยาบาล" 
              description="เข้าถึงแดชบอร์ดการจัดการโรงพยาบาล"
              icon={<Hospital className="h-5 w-5 text-blue-600" />}
              role="hospital"
              formData={formData}
              setFormData={setFormData}
              isRegister={isRegister}
              setIsRegister={setIsRegister}
              onLogin={handleLogin}
              onRegister={handleRegister}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="rescue">
            <AuthCard 
              title="ทีมกู้ภัย" 
              description="เข้าถึงแดชบอร์ดทีมกู้ภัย"
              icon={<Ambulance className="h-5 w-5 text-green-600" />}
              role="rescue"
              formData={formData}
              setFormData={setFormData}
              isRegister={isRegister}
              setIsRegister={setIsRegister}
              onLogin={handleLogin}
              onRegister={handleRegister}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface AuthCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  role: string;
  formData: FormData;
  setFormData: (data: FormData) => void;
  isRegister: boolean;
  setIsRegister: (value: boolean) => void;
  onLogin: (e: React.FormEvent, role: string) => Promise<void>;
  onRegister: (e: React.FormEvent, role: string) => Promise<void>;
  isLoading: boolean;
}

function AuthCard({ 
  title, 
  description, 
  icon, 
  role,
  formData,
  setFormData,
  isRegister,
  setIsRegister,
  onLogin,
  onRegister,
  isLoading
}: AuthCardProps) {
  const handleSubmit = (e: React.FormEvent) => {
    console.log('Form submitted, isRegister:', isRegister, 'role:', role);
    if (isRegister) {
      onRegister(e, role);
    } else {
      onLogin(e, role);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} id={`auth-form-${role}`}>
        <CardContent className="space-y-4">
          {isRegister && (
            <>
              <div className="space-y-2">
                <Label htmlFor="firstName">ชื่อ</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="ชื่อ"
                    required
                    className="pl-10"
                    disabled={isLoading}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    autoComplete="given-name" // ระบุว่าเป็นชื่อ
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">นามสกุล</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="นามสกุล"
                    required
                    className="pl-10"
                    disabled={isLoading}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    autoComplete="family-name" // ระบุว่าเป็นนามสกุล
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <div className="relative">
                  <PhoneCall className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="เบอร์โทรศัพท์"
                    className="pl-10"
                    disabled={isLoading}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    autoComplete="tel" // ระบุว่าเป็นเบอร์โทร
                  />
                </div>
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                name="email"
                placeholder="กรอกอีเมล"
                type="email"
                required
                className="pl-10"
                disabled={isLoading}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="email" // ระบุว่าเป็นอีเมล
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">รหัสผ่าน</Label>
              {!isRegister && (
                <a 
                  href="#" 
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  ลืมรหัสผ่าน?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                name="password"
                placeholder="กรอกรหัสผ่าน"
                type="password"
                required
                className="pl-10"
                disabled={isLoading}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                autoComplete={isRegister ? "new-password" : "current-password"} // ใช้ new-password สำหรับลงทะเบียน
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isRegister ? 'กำลังลงทะเบียน...' : 'กำลังล็อกอิน...'}
              </>
            ) : (
              <>
                {isRegister ? 'ลงทะเบียน' : 'ล็อกอิน'} <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <Button
            variant="link"
            className="w-full"
            onClick={() => setIsRegister(!isRegister)}
            disabled={isLoading}
          >
            {isRegister ? 'มีบัญชีแล้ว? ล็อกอิน' : 'ไม่มีบัญชี? ลงทะเบียน'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}