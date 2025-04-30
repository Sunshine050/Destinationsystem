"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Bell,
  Volume2,
  Phone,
  MapPin,
  Globe,
  Shield,
  Clock,
  Radio,
  Smartphone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const notificationSettingsSchema = z.object({
  emergencyAlerts: z.boolean(),
  statusUpdates: z.boolean(),
  systemNotifications: z.boolean(),
  soundEnabled: z.boolean(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
});

const systemSettingsSchema = z.object({
  language: z.string(),
  timeZone: z.string(),
  dateFormat: z.string(),
  mapProvider: z.string(),
  autoRefreshInterval: z.string(),
});

const communicationSettingsSchema = z.object({
  primaryContactNumber: z.string(),
  backupContactNumber: z.string(),
  emergencyEmail: z.string(),
  broadcastChannel: z.string(),
});

export default function EmergencyCenterSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emergencyAlerts: true,
      statusUpdates: true,
      systemNotifications: true,
      soundEnabled: true,
      emailNotifications: true,
      smsNotifications: true,
    },
  });

  const systemForm = useForm<z.infer<typeof systemSettingsSchema>>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      language: "th",
      timeZone: "Asia/Bangkok",
      dateFormat: "DD/MM/YYYY",
      mapProvider: "google",
      autoRefreshInterval: "30",
    },
  });

  const communicationForm = useForm<z.infer<typeof communicationSettingsSchema>>({
    resolver: zodResolver(communicationSettingsSchema),
    defaultValues: {
      primaryContactNumber: "+66 2 123 4567",
      backupContactNumber: "+66 2 234 5678",
      emergencyEmail: "emergency@1669.th",
      broadcastChannel: "primary",
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    toast({
      title: "Settings updated",
      description: "Your settings have been saved successfully.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your system preferences and configurations
        </p>
      </div>

      <div className="grid gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure how you receive alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...notificationForm}>
              <form onSubmit={notificationForm.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4">
                  <FormField
                    control={notificationForm.control}
                    name="emergencyAlerts"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Emergency Alerts</FormLabel>
                          <FormDescription>
                            Receive critical emergency notifications
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={notificationForm.control}
                    name="statusUpdates"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Status Updates</FormLabel>
                          <FormDescription>
                            Get updates on case status changes
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={notificationForm.control}
                    name="soundEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Sound Alerts</FormLabel>
                          <FormDescription>
                            Play sound for important notifications
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save notification settings"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              Configure system-wide preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...systemForm}>
              <form onSubmit={systemForm.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4">
                  <FormField
                    control={systemForm.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="th">ภาษาไทย</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={systemForm.control}
                    name="timeZone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Zone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time zone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Asia/Bangkok">Bangkok (GMT+7)</SelectItem>
                            <SelectItem value="Asia/Singapore">Singapore (GMT+8)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={systemForm.control}
                    name="dateFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Format</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select date format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={systemForm.control}
                    name="mapProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Map Provider</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select map provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="google">Google Maps</SelectItem>
                            <SelectItem value="here">HERE Maps</SelectItem>
                            <SelectItem value="osm">OpenStreetMap</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={systemForm.control}
                    name="autoRefreshInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auto-refresh Interval (seconds)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select refresh interval" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="15">15 seconds</SelectItem>
                            <SelectItem value="30">30 seconds</SelectItem>
                            <SelectItem value="60">1 minute</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save system settings"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Communication Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Communication Settings
            </CardTitle>
            <CardDescription>
              Configure emergency communication channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...communicationForm}>
              <form onSubmit={communicationForm.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4">
                  <FormField
                    control={communicationForm.control}
                    name="primaryContactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+66 2 XXX XXXX" {...field} />
                        </FormControl>
                        <FormDescription>
                          Main contact number for emergency communications
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={communicationForm.control}
                    name="backupContactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Backup Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+66 2 XXX XXXX" {...field} />
                        </FormControl>
                        <FormDescription>
                          Secondary contact number for fallback communications
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={communicationForm.control}
                    name="emergencyEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="emergency@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Email address for emergency notifications
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={communicationForm.control}
                    name="broadcastChannel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Broadcast Channel</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select broadcast channel" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="primary">Primary Network</SelectItem>
                            <SelectItem value="secondary">Secondary Network</SelectItem>
                            <SelectItem value="both">Both Networks</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Channel for broadcasting emergency messages
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save communication settings"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}