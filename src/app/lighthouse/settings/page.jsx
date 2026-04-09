"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { adminService } from "@/lib/admin";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AdminSettingsSkeleton } from "@/components/skeletons";

function SettingRow({ children, title, description, danger }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${danger ? 'bg-red-500/5 border-red-500/20' : 'border-border/40'}`}>
      <div className="space-y-0.5">
        <p className={`text-sm font-medium ${danger ? 'text-red-600' : 'text-foreground'}`}>{title}</p>
        <p className={`text-xs ${danger ? 'text-red-600/70' : 'text-muted-foreground'}`}>{description}</p>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    platform_fee_percentage: 0.06,
    platform_fee_fixed: 80.00,
    paystack_fee_percentage: 0.015,
    paystack_fee_fixed: 100.00,
    paystack_fee_threshold: 2500.00,
    maintenance_mode: false,
    maintenance_message: "",
    allow_student_registration: true,
    allow_organizer_registration: true,
    require_event_approval: true,
    max_events_per_organizer: 50,
    min_withdrawal_amount: 1000.00,
    max_withdrawal_amount: 1000000.00,
    support_email: "",
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
    return <AdminSettingsSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <CardDescription className="text-xs">Default platform fee configuration (can be overridden per event)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform_fee_percentage" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Platform Fee Percentage (%)
                </Label>
                <Input 
                  id="platform_fee_percentage"
                  type="number" 
                  step="0.0001" 
                  min="0"
                  max="1"
                  value={settings.platform_fee_percentage}
                  onChange={(e) => handleChange("platform_fee_percentage", parseFloat(e.target.value) || 0)}
                  className="bg-background/50 border-border/40"
                  placeholder="0.06"
                />
                <p className="text-[10px] text-muted-foreground">Current: {((settings.platform_fee_percentage || 0) * 100).toFixed(1)}%</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform_fee_fixed" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Fixed Platform Fee (₦)
                </Label>
                <Input 
                  id="platform_fee_fixed"
                  type="number" 
                  step="1" 
                  value={settings.platform_fee_fixed || 80}
                  onChange={(e) => handleChange("platform_fee_fixed", parseFloat(e.target.value))}
                  className="bg-background/50 border-border/40"
                />
                <p className="text-[10px] text-muted-foreground">Added per ticket purchase</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Paystack Fees</CardTitle>
            <CardDescription className="text-xs">Payment gateway fee configuration (charged to customers)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paystack_fee_pct" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Paystack Fee (%)
                </Label>
                <Input 
                  id="paystack_fee_pct"
                  type="number" 
                  step="0.001" 
                  value={settings.paystack_fee_percentage || 0.015}
                  onChange={(e) => handleChange("paystack_fee_percentage", parseFloat(e.target.value))}
                  className="bg-background/50 border-border/40"
                />
                <p className="text-[10px] text-muted-foreground">Current: {((settings.paystack_fee_percentage || 0.015) * 100).toFixed(2)}%</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paystack_fee_fixed" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Fixed Paystack Fee (₦)
                </Label>
                <Input 
                  id="paystack_fee_fixed"
                  type="number" 
                  step="1" 
                  value={settings.paystack_fee_fixed || 100}
                  onChange={(e) => handleChange("paystack_fee_fixed", parseFloat(e.target.value))}
                  className="bg-background/50 border-border/40"
                />
                <p className="text-[10px] text-muted-foreground">Applied when above threshold</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paystack_threshold" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Fee Threshold (₦)
                </Label>
                <Input 
                  id="paystack_threshold"
                  type="number" 
                  step="100" 
                  value={settings.paystack_fee_threshold || 2500}
                  onChange={(e) => handleChange("paystack_fee_threshold", parseFloat(e.target.value))}
                  className="bg-background/50 border-border/40"
                />
                <p className="text-[10px] text-muted-foreground">₦100 waived under this amount</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">General</CardTitle>
            <CardDescription className="text-xs">Support and contact configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="support_email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Support Email
                </Label>
                <Input 
                  id="platform_fee_fixed"
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={settings.platform_fee_fixed}
                  onChange={(e) => handleChange("platform_fee_fixed", parseFloat(e.target.value) || 0)}
                  className="bg-background/50 border-border/40"
                  placeholder="80.00"
                />
                <p className="text-[10px] text-muted-foreground">
                  Fixed amount added per ticket
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Paystack Fees</CardTitle>
            <CardDescription className="text-xs">Configure Paystack payment gateway fees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paystack_fee_percentage" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Paystack Fee Percentage (%)
                </Label>
                <Input 
                  id="paystack_fee_percentage"
                  type="number" 
                  step="0.0001" 
                  min="0"
                  max="1"
                  value={settings.paystack_fee_percentage}
                  onChange={(e) => handleChange("paystack_fee_percentage", parseFloat(e.target.value) || 0)}
                  className="bg-background/50 border-border/40"
                  placeholder="0.015"
                />
                <p className="text-[10px] text-muted-foreground">
                  {(settings.paystack_fee_percentage * 100).toFixed(2)}% of transaction
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paystack_fee_fixed" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Paystack Fixed Fee (₦)
                </Label>
                <Input 
                  id="paystack_fee_fixed"
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={settings.paystack_fee_fixed}
                  onChange={(e) => handleChange("paystack_fee_fixed", parseFloat(e.target.value) || 0)}
                  className="bg-background/50 border-border/40"
                  placeholder="100.00"
                />
                <p className="text-[10px] text-muted-foreground">
                  Applied when amount &gt;= threshold
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paystack_fee_threshold" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Fixed Fee Threshold (₦)
                </Label>
                <Input 
                  id="paystack_fee_threshold"
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={settings.paystack_fee_threshold}
                  onChange={(e) => handleChange("paystack_fee_threshold", parseFloat(e.target.value) || 0)}
                  className="bg-background/50 border-border/40"
                  placeholder="2500.00"
                />
                <p className="text-[10px] text-muted-foreground">
                  Fixed fee applies when transaction &gt;= this amount
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">General</CardTitle>
            <CardDescription className="text-xs">Support and general configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="support_email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Support Email
              </Label>
              <Input 
                id="support_email"
                type="email" 
                value={settings.support_email}
                onChange={(e) => handleChange("support_email", e.target.value)}
                className="bg-background/50 border-border/40"
                placeholder="support@example.com"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Access Control</CardTitle>
            <CardDescription className="text-xs">Manage registration and platform access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SettingRow title="Student Registration" description="Allow new student accounts">
              <Switch 
                checked={settings.allow_student_registration}
                onCheckedChange={(checked) => handleChange("allow_student_registration", checked)}
              />
            </SettingRow>
            <SettingRow title="Organizer Registration" description="Allow new organizer accounts">
              <Switch 
                checked={settings.allow_organizer_registration}
                onCheckedChange={(checked) => handleChange("allow_organizer_registration", checked)}
              />
            </SettingRow>
            <SettingRow title="Maintenance Mode" description="Disable platform access for all users" danger>
              <Switch 
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) => handleChange("maintenance_mode", checked)}
              />
            </SettingRow>
            {settings.maintenance_mode && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="maint_msg" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Maintenance Message
                </Label>
                <Input 
                  id="maint_msg"
                  value={settings.maintenance_message}
                  onChange={(e) => handleChange("maintenance_message", e.target.value)}
                  placeholder="We will be back shortly..."
                  className="bg-background/50 border-border/40"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Events & Limits</CardTitle>
            <CardDescription className="text-xs">Set operational limits for the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow title="Require Event Approval" description="Admin must approve events before they go live">
              <Switch 
                checked={settings.require_event_approval}
                onCheckedChange={(checked) => handleChange("require_event_approval", checked)}
              />
            </SettingRow>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="max_events" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Max Events / Org
                </Label>
                <Input 
                  id="max_events"
                  type="number"
                  value={settings.max_events_per_organizer}
                  onChange={(e) => handleChange("max_events_per_organizer", parseInt(e.target.value))}
                  className="bg-background/50 border-border/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_wd" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Min Withdrawal (₦)
                </Label>
                <Input 
                  id="min_wd"
                  type="number"
                  value={settings.min_withdrawal_amount}
                  onChange={(e) => handleChange("min_withdrawal_amount", parseFloat(e.target.value))}
                  className="bg-background/50 border-border/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_wd" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Max Withdrawal (₦)
                </Label>
                <Input 
                  id="max_wd"
                  type="number"
                  value={settings.max_withdrawal_amount}
                  onChange={(e) => handleChange("max_withdrawal_amount", parseFloat(e.target.value))}
                  className="bg-background/50 border-border/40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={saving} className="min-w-[140px]">
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
      </form>
    </div>
  );
}
