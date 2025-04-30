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
  MessageSquare,
  Bed,
  Building2,
  Users
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

const hospitalSettingsSchema = z.object({
  hospitalName: z.string(),
  address: z.string(),
  primaryContact: z.string(),
  emergencyContact: z.string(),
  totalBeds: z.string(),
  icuBeds: z.string(),
  emergencyCapacity: z.string(),
  ambulanceCount: z.string(),
});

export default function HospitalSettings() {
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

  const hospitalForm = useForm<z.infer<typeof hospitalSettingsSchema>>({
    resolver: zodResolver(hospitalSettingsSchema),
    defaultValues: {
      hospitalName: "Thonburi Hospital",
      address: "34/1 Itsaraphap Rd, Bangkok",
      primaryContact: "+66 2 123 4567",
      emergencyContact: "+66 2 234 5678",
      totalBeds: "120",
      icuBeds: "15",
      emergencyCapacity: "30",
      ambulanceCount: "8",
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
          Manage your hospital settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Hospital Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Hospital Settings
            </CardTitle>
            <CardDescription>
              Configure your hospital information and capacity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...hospitalForm}>
              <form onSubmit={hospitalForm.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4">
                  <FormField
                    control={hospitalForm.control}
                    name="hospitalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hospital Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={hospitalForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={hospitalForm.control}
                      name="primaryContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Contact</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={hospitalForm.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={hospitalForm.control}
                      name="totalBeds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Beds</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={hospitalForm.control}
                      name="icuBeds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ICU Beds</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={hospitalForm.control}
                      name="emergencyCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Capacity</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={hospitalForm.control}
                      name="ambulanceCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Ambulances</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save hospital settings"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}