"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { adminService } from "@/lib/admin";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    platform_fee_percentage: 0.05,
    maintenance_mode: false,
    maintenance_message: "",
    allow_student_registration: true,
    allow_organizer_registration: true,
    require_event_approval: true,
    max_events_per_organizer: 50,
    min_withdrawal_amount: 1000.00,
    max_withdrawal_amount: 1000000.00,
    support_email: "support@radar.app",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await adminService.getSystemSettings();
      if (data) setSettings(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSystemSettings(settings);
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage platform-wide configurations and controls.
        </p>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid gap-6">
          {/* General & Fees */}
          <Card>
            <CardHeader>
              <CardTitle>General Configuration</CardTitle>
              <CardDescription>Platform fees and support contacts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform_fee">Platform Fee Percentage</Label>
                  <Input 
                    id="platform_fee"
                    type="number" 
                    step="0.01" 
                    value={settings.platform_fee_percentage}
                    onChange={(e) => handleChange("platform_fee_percentage", parseFloat(e.target.value))}
                  />
                  <p className="text-[10px] text-muted-foreground">Current: {(settings.platform_fee_percentage * 100).toFixed(1)}%</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input 
                    id="support_email"
                    type="email" 
                    value={settings.support_email}
                    onChange={(e) => handleChange("support_email", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Control */}
          <Card>
            <CardHeader>
              <CardTitle>Access & Registration</CardTitle>
              <CardDescription>Control who can join and use the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Student Registration</Label>
                  <p className="text-xs text-muted-foreground">Allow new student accounts</p>
                </div>
                <Switch 
                  checked={settings.allow_student_registration}
                  onCheckedChange={(checked) => handleChange("allow_student_registration", checked)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Organizer Registration</Label>
                  <p className="text-xs text-muted-foreground">Allow new organizer accounts</p>
                </div>
                <Switch 
                  checked={settings.allow_organizer_registration}
                  onCheckedChange={(checked) => handleChange("allow_organizer_registration", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between rounded-lg border p-4 bg-red-50/50 border-red-100">
                <div className="space-y-0.5">
                  <Label className="text-base text-red-900">Maintenance Mode</Label>
                  <p className="text-xs text-red-700">Disable platform access for all users</p>
                </div>
                <Switch 
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => handleChange("maintenance_mode", checked)}
                  className="data-[state=checked]:bg-red-600"
                />
              </div>
              {settings.maintenance_mode && (
                <div className="space-y-2">
                  <Label htmlFor="maint_msg">Maintenance Message</Label>
                  <Input 
                    id="maint_msg"
                    value={settings.maintenance_message}
                    onChange={(e) => handleChange("maintenance_message", e.target.value)}
                    placeholder="We will be back shortly..."
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Events & Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Events & Limits</CardTitle>
              <CardDescription>Set operational limits for organizers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Require Event Approval</Label>
                  <p className="text-xs text-muted-foreground">Admin must approve events before they go live</p>
                </div>
                <Switch 
                  checked={settings.require_event_approval}
                  onCheckedChange={(checked) => handleChange("require_event_approval", checked)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                 <div className="space-y-2">
                  <Label htmlFor="max_events">Max Events / Org</Label>
                  <Input 
                    id="max_events"
                    type="number"
                    value={settings.max_events_per_organizer}
                    onChange={(e) => handleChange("max_events_per_organizer", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_wd">Min Withdrawal (₦)</Label>
                  <Input 
                    id="min_wd"
                    type="number"
                    value={settings.min_withdrawal_amount}
                    onChange={(e) => handleChange("min_withdrawal_amount", parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_wd">Max Withdrawal (₦)</Label>
                  <Input 
                    id="max_wd"
                    type="number"
                    value={settings.max_withdrawal_amount}
                    onChange={(e) => handleChange("max_withdrawal_amount", parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="min-w-[150px]">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
