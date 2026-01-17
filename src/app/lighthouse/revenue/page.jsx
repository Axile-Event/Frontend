"use client";

import { useEffect, useState } from "react";
import { adminService } from "../../../lib/admin";
import { DollarSign, Calendar, Users, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { AdminRevenueSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }) {
  const config = {
    completed: { icon: CheckCircle, className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    failed: { icon: XCircle, className: "bg-red-500/10 text-red-600 border-red-500/20" },
    pending: { icon: Clock, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  };
  
  const { icon: StatusIcon, className } = config[status] || config.pending;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border",
      className
    )}>
      <StatusIcon className="w-3 h-3" />
      {status}
    </span>
  );
}

function TabButton({ active, children, onClick, variant }) {
  const variants = {
    pending: "data-[active=true]:bg-amber-500 data-[active=true]:text-white",
    completed: "data-[active=true]:bg-emerald-500 data-[active=true]:text-white",
    failed: "data-[active=true]:bg-red-500 data-[active=true]:text-white",
    default: "data-[active=true]:bg-foreground data-[active=true]:text-background",
  };

  return (
    <button
      data-active={active}
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
        "text-muted-foreground hover:text-foreground hover:bg-muted/50",
        variants[variant] || variants.default
      )}
    >
      {children}
    </button>
  );
}

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    Promise.all([
      adminService.getAnalytics(),
      adminService.getAllWithdrawals({ page: 1, page_size: 50 })
    ]).then(([analyticsData, withdrawalsData]) => {
      setStats(analyticsData);
      setWithdrawals(withdrawalsData.withdrawals || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <AdminRevenueSkeleton />;
  }

  const totalRevenue = stats?.total_revenue || 0;
  const totalEvents = stats?.total_events || 0;
  const totalOrganizers = stats?.total_organisers || 0;
  const totalStudents = stats?.total_students || 0;
  
  const avgRevenuePerEvent = totalEvents > 0 ? (totalRevenue / totalEvents) : 0;
  const avgRevenuePerOrganizer = totalOrganizers > 0 ? (totalRevenue / totalOrganizers) : 0;

  const filteredWithdrawals = statusFilter 
    ? withdrawals.filter(w => w.status === statusFilter)
    : withdrawals;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={`₦${totalRevenue.toLocaleString()}`} 
          subtitle="Platform fees collected"
          icon={DollarSign}
        />
        <StatCard 
          title="Total Events" 
          value={totalEvents} 
          subtitle="Events on platform"
          icon={Calendar}
        />
        <StatCard 
          title="Organizers" 
          value={totalOrganizers} 
          subtitle="Active organizers"
          icon={Users}
        />
        <StatCard 
          title="Students" 
          value={totalStudents} 
          subtitle="Registered students"
          icon={Users}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border/40">
              <div>
                <p className="text-sm font-medium text-foreground">Total Platform Revenue</p>
                <p className="text-xs text-muted-foreground">All-time earnings</p>
              </div>
              <p className="text-lg font-semibold text-foreground">₦{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border/40">
              <div>
                <p className="text-sm font-medium text-foreground">Average per Event</p>
                <p className="text-xs text-muted-foreground">Revenue per event</p>
              </div>
              <p className="text-lg font-semibold text-foreground">
                ₦{avgRevenuePerEvent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Average per Organizer</p>
                <p className="text-xs text-muted-foreground">Revenue per organizer</p>
              </div>
              <p className="text-lg font-semibold text-foreground">
                ₦{avgRevenuePerOrganizer.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Total Users</p>
                  <p className="text-xs text-muted-foreground">All registered users</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-foreground">{totalStudents + totalOrganizers}</p>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Students</p>
                  <p className="text-xs text-muted-foreground">Student accounts</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-foreground">{totalStudents}</p>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Organizers</p>
                  <p className="text-xs text-muted-foreground">Event organizers</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-foreground">{totalOrganizers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent Withdrawals</CardTitle>
            <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
              <TabButton active={statusFilter === null} onClick={() => setStatusFilter(null)}>
                All
              </TabButton>
              <TabButton active={statusFilter === 'pending'} onClick={() => setStatusFilter('pending')} variant="pending">
                Pending
              </TabButton>
              <TabButton active={statusFilter === 'completed'} onClick={() => setStatusFilter('completed')} variant="completed">
                Completed
              </TabButton>
              <TabButton active={statusFilter === 'failed'} onClick={() => setStatusFilter('failed')} variant="failed">
                Failed
              </TabButton>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {filteredWithdrawals.length === 0 ? (
            <div className="py-12 text-center">
              <DollarSign className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No withdrawals found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Transaction</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">User</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Bank</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Amount</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="text-right pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredWithdrawals.slice(0, 10).map((withdrawal) => (
                    <tr key={withdrawal.transaction_id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3">
                        <p className="font-mono text-sm text-muted-foreground">{withdrawal.transaction_id}</p>
                      </td>
                      <td className="py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate max-w-[120px]">{withdrawal.organiser_name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[120px]">{withdrawal.organiser_email}</p>
                        </div>
                      </td>
                      <td className="py-3 hidden md:table-cell">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{withdrawal.bank_name}</p>
                          <p className="text-xs text-muted-foreground">{withdrawal.account_name}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="text-sm font-semibold text-foreground">₦{Number(withdrawal.amount).toLocaleString()}</p>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={withdrawal.status} />
                      </td>
                      <td className="py-3 text-right hidden lg:table-cell">
                        <p className="text-sm text-muted-foreground">
                          {new Date(withdrawal.requested_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}