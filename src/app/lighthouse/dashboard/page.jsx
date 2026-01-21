"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Users, 
  Building2, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { AdminDashboardSkeleton } from "@/components/skeletons";
import { adminService } from "../../../lib/admin";
import { toast } from "react-hot-toast";
import { cn, formatCurrency } from "@/lib/utils";

function StatCard({ title, value, icon: Icon, subtitle, trend }) {
  return (
    <Card className="relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/40">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-xs text-emerald-500 font-medium">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }) {
  const config = {
    verified: { 
      icon: CheckCircle, 
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
    },
    denied: { 
      icon: XCircle, 
      className: "bg-red-500/10 text-red-600 border-red-500/20" 
    },
    pending: { 
      icon: AlertCircle, 
      className: "bg-amber-500/10 text-amber-600 border-amber-500/20" 
    },
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

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, eventsData] = await Promise.all([
          adminService.getAnalytics(),
          adminService.getRecentEvents(5)
        ]);
        setStats(analyticsData);
        setRecentEvents(eventsData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  const pendingEvents = recentEvents.filter(e => e.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Users" 
          value={(stats?.total_students || 0) + (stats?.total_organisers || 0)} 
          icon={Users}
          subtitle={`${stats?.total_students || 0} students · ${stats?.total_organisers || 0} organizers`}
        />
        <StatCard 
          title="Total Events" 
          value={stats?.total_events || 0} 
          icon={Calendar}
          subtitle="Events on platform"
        />
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats?.total_revenue || 0)} 
          icon={DollarSign}
          subtitle="Platform earnings"
        />
        <StatCard 
          title="Organizers" 
          value={stats?.total_organisers || 0} 
          icon={Building2}
          subtitle="Registered organizations"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
              <Link 
                href="/lighthouse/events" 
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentEvents.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No events yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentEvents.map((event) => (
                  <Link
                    key={event.event_id} 
                    href={`/lighthouse/events/${event.event_id}`}
                    className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {event.event_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {event.organisation_name}
                      </p>
                    </div>
                    <StatusBadge status={event.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2 border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {pendingEvents > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{pendingEvents} pending event{pendingEvents > 1 ? 's' : ''}</span>
                </div>
                <p className="text-xs text-amber-600/70 mt-1">Requires review</p>
              </div>
            )}
            
            <div className="grid gap-2">
              <Link 
                href="/lighthouse/events?filter=pending" 
                className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Review Events</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link 
                href="/lighthouse/users" 
                className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Manage Users</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link 
                href="/lighthouse/withdrawals?status=pending" 
                className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Process Payouts</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
