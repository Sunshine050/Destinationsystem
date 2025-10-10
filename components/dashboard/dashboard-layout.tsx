"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  AlertTriangle, 
  LayoutDashboard, 
  Bell,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  ChevronsLeft,
  ChevronsRight,
  PhoneCall,
  Hospital,
  Ambulance,
  User,
  Check,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'emergency-center' | 'hospital' | 'rescue';
  notifications: Notification[] | undefined;
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

// Utility function to format relative time
const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return `${diffInDays} days ago`;
};

export default function DashboardLayout({ 
  children, 
  role, 
  notifications = [], 
  unreadCount, 
  onMarkAsRead, 
  onMarkAllAsRead 
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const roleIcon = {
    'emergency-center': <PhoneCall className="h-5 w-5 text-red-600" />,
    'hospital': <Hospital className="h-5 w-5 text-blue-600" />,
    'rescue': <Ambulance className="h-5 w-5 text-green-600" />,
  };

  const roleColor = {
    'emergency-center': 'text-red-600',
    'hospital': 'text-blue-600',
    'rescue': 'text-green-600',
  };

  const roleName = {
    'emergency-center': '1669 Response Center',
    'hospital': 'Hospital Management',
    'rescue': 'Rescue Team',
  };

  const roleBasePath = {
    'emergency-center': '/1669',
    'hospital': '/hospital',
    'rescue': '/rescue',
  };

  const getNavItems = (role: 'emergency-center' | 'hospital' | 'rescue') => {
    const basePath = roleBasePath[role];
    const items = [
      {
        name: 'Dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
        path: `${basePath}/dashboard`,
      },
      {
        name: 'Emergency Cases',
        icon: <AlertTriangle className="h-5 w-5" />,
        path: `${basePath}/cases`,
      },
      {
        name: 'Reports',
        icon: <FileText className="h-5 w-5" />,
        path: `${basePath}/reports`,
      },
      {
        name: 'Settings',
        icon: <Settings className="h-5 w-5" />,
        path: `${basePath}/settings`,
      },
    ];

    if (role === 'emergency-center') {
      items.splice(2, 0, {
        name: 'Hospitals',
        icon: <Hospital className="h-5 w-5" />,
        path: `${basePath}/hospitals`,
      });
    } else if (role === 'hospital') {
      items.splice(2, 0, {
        name: 'Rescue Teams',
        icon: <Ambulance className="h-5 w-5" />,
        path: `${basePath}/rescue-teams`,
      });
    }

    return items;
  };

  const navItems = getNavItems(role);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMarkAsRead = (notificationId: string) => {
    onMarkAsRead(notificationId);
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read.",
    });
  };

  const handleClearAll = () => {
    onMarkAllAsRead();
    toast({
      title: "All notifications cleared",
      description: "All notifications have been marked as read.",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'hospital':
        return <Hospital className="h-5 w-5 text-blue-500" />;
      case 'status':
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="hidden md:flex items-center">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleSidebar}
                className="mr-2"
              >
                {isSidebarOpen ? (
                  <ChevronsLeft className="h-5 w-5" />
                ) : (
                  <ChevronsRight className="h-5 w-5" />
                )}
              </Button>
              <div className="flex items-center gap-2">
                {roleIcon[role]}
                <span className={cn("font-semibold", roleColor[role])}>
                  {roleName[role]}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="flex justify-between items-center">
                    <span>Notifications</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearAll}
                    >
                      Mark all as read
                    </Button>
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                  <div className="space-y-4">
                    {notifications?.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 rounded-lg border",
                          notification.isRead
                            ? "bg-white dark:bg-slate-800"
                            : "bg-blue-50 dark:bg-blue-900/10"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">{notification.title}</h4>
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  Mark as read
                                </Button>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {notification.body}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                              {formatRelativeTime(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )) || <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading notifications...</div>}
                    {notifications && notifications.length === 0 && (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No notifications
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Navigation Menu */}
        <div 
          className={`md:hidden fixed inset-0 bg-slate-900/50 z-20 ${
            isMobileMenuOpen ? 'block' : 'hidden'
          }`}
          onClick={toggleMobileMenu}
        ></div>
        
        <aside 
          className={`
            w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-shrink-0
            md:static md:h-[calc(100vh-4rem)] md:block
            fixed top-16 bottom-0 z-20 transition-all duration-300 ease-in-out
            ${isMobileMenuOpen ? 'left-0' : '-left-64'}
            ${isSidebarOpen ? 'md:w-64' : 'md:w-20'}
          `}
        >
          <div className="h-full overflow-y-auto py-4">
            <nav className="px-3 space-y-1">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.path
                      ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-50"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-50"
                  )}
                >
                  {item.icon}
                  <span className={isSidebarOpen ? "block" : "hidden md:hidden"}>
                    {item.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}