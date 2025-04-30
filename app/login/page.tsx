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

// Demo credentials
const demoUsers = {
  '1669': {
    email: 'operator@1669.th',
    password: '1669demo',
  },
  'hospital': {
    email: 'staff@hospital.th',
    password: 'hospitaldemo',
  },
  'rescue': {
    email: 'team@rescue.th',
    password: 'rescuedemo',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [defaultTab, setDefaultTab] = useState('1669');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const role = searchParams?.get('role');
    if (role) {
      setDefaultTab(role);
      setFormData({
        email: demoUsers[role as keyof typeof demoUsers].email,
        password: demoUsers[role as keyof typeof demoUsers].password,
      });
    }
  }, [searchParams]);

  const handleLogin = (event: React.FormEvent, role: string) => {
    event.preventDefault();
    setIsLoading(true);
    
    const demoUser = demoUsers[role as keyof typeof demoUsers];
    
    if (formData.email === demoUser.email && formData.password === demoUser.password) {
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Login successful",
          description: `You have been logged in as ${role} user.`,
        });
        
        if (role === '1669') {
          router.push('/1669/dashboard');
        } else if (role === 'hospital') {
          router.push('/hospital/dashboard');
        } else if (role === 'rescue') {
          router.push('/rescue/dashboard');
        }
      }, 1500);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
        });
      }, 1500);
    }
  };

  const handleTabChange = (value: string) => {
    setFormData({
      email: demoUsers[value as keyof typeof demoUsers].email,
      password: demoUsers[value as keyof typeof demoUsers].password,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-slate-950 dark:to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Emergency Response System</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Login to access your dashboard
          </p>
        </div>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            This is a demo version. Use the pre-filled credentials to log in.
          </AlertDescription>
        </Alert>
        
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
              <span className="hidden sm:inline">Hospital</span>
            </TabsTrigger>
            <TabsTrigger value="rescue" className="flex items-center gap-2">
              <Ambulance className="h-4 w-4" />
              <span className="hidden sm:inline">Rescue</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="1669">
            <LoginCard 
              title="1669 Response Center" 
              description="Access the emergency response center dashboard"
              icon={<PhoneCall className="h-5 w-5 text-red-600" />}
              formData={formData}
              setFormData={setFormData}
              onSubmit={(e) => handleLogin(e, '1669')}
              isLoading={isLoading}
              demoCredentials={demoUsers['1669']}
            />
          </TabsContent>
          
          <TabsContent value="hospital">
            <LoginCard 
              title="Hospital Staff" 
              description="Access the hospital management dashboard"
              icon={<Hospital className="h-5 w-5 text-blue-600" />}
              formData={formData}
              setFormData={setFormData}
              onSubmit={(e) => handleLogin(e, 'hospital')}
              isLoading={isLoading}
              demoCredentials={demoUsers['hospital']}
            />
          </TabsContent>
          
          <TabsContent value="rescue">
            <LoginCard 
              title="Rescue Team" 
              description="Access the rescue team dashboard"
              icon={<Ambulance className="h-5 w-5 text-green-600" />}
              formData={formData}
              setFormData={setFormData}
              onSubmit={(e) => handleLogin(e, 'rescue')}
              isLoading={isLoading}
              demoCredentials={demoUsers['rescue']}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface LoginCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  formData: {
    email: string;
    password: string;
  };
  setFormData: (data: { email: string; password: string; }) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  demoCredentials: {
    email: string;
    password: string;
  };
}

function LoginCard({ 
  title, 
  description, 
  icon, 
  formData,
  setFormData,
  onSubmit, 
  isLoading,
  demoCredentials
}: LoginCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                placeholder="Enter your email"
                type="email"
                required
                className="pl-10"
                disabled={isLoading}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a 
                href="#" 
                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                placeholder="Enter your password"
                type="password"
                required
                className="pl-10"
                disabled={isLoading}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                Logging in...
              </>
            ) : (
              <>
                Login <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          
          <div className="w-full">
            <Separator className="my-4" />
            <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4">
              <h4 className="text-sm font-medium mb-2">Demo Credentials</h4>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">
                    {demoCredentials.email}
                  </code>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500">Password:</span>
                  <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">
                    {demoCredentials.password}
                  </code>
                </p>
              </div>
            </div>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}