"use client";

import React, { useState } from "react";
import { User, Bell, Shield, Key, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="text-2xl font-bold text-white font-display">Account Settings</h1>
        <p className="text-xs text-slate-400">Manage your profile, notifications, and security preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details */}
        <Card className="border-slate-800 bg-[#12182D] p-6 space-y-4">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Profile Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">First Name</label>
              <Input defaultValue="Chidi" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Last Name</label>
              <Input defaultValue="Okonkwo" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300">Email Address</label>
            <Input defaultValue="chidi.okonkwo@gmail.com" disabled className="opacity-70" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300">Bio</label>
            <Input defaultValue="Digital worker and field verification contributor in Lagos." />
          </div>
        </Card>

        {/* Notifications */}
        <Card className="border-slate-800 bg-[#12182D] p-6 space-y-4">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <Bell className="h-4 w-4 text-secondary" /> Notification Preferences
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/40 cursor-pointer">
              <span>Task approval and reward notifications</span>
              <input
                type="checkbox"
                defaultChecked
                className="rounded text-primary focus:ring-primary"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/40 cursor-pointer">
              <span>New high-paying task alerts in my area</span>
              <input
                type="checkbox"
                defaultChecked
                className="rounded text-primary focus:ring-primary"
              />
            </label>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          {saved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Settings updated successfully
            </span>
          )}
          <Button type="submit" className="ml-auto bg-primary text-white font-semibold">
            <Save className="h-4 w-4 mr-1.5" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
