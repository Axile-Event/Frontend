"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Users, 
  Building2, 
  Calendar, 
  DollarSign, 
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { adminService } from "../../../lib/admin";
import { toast } from "react-hot-toast";

function MetricCard({ title, value, icon: Icon, description }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground/70" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-xl font-bold">{value}</div>
        {description && (
          <p className="text-[10px] text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function MetricCardSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Skeleton className="h-7 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-3 w-full" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-9 rounded-md" />
              <Skeleton className="h-9 rounded-md" />
              <Skeleton className="h-9 rounded-md" />
              <Skeleton className="h-9 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Overview of platform activity and performance
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Users" 
          value={(stats?.total_students || 0) + (stats?.total_organisers || 0)} 
          icon={Users}
          description={`${stats?.total_students || 0} Students, ${stats?.total_organisers || 0} Organizers`}
        />
        <MetricCard 
          title="Active Events" 
          value={stats?.total_events || 0} 
          icon={Calendar}
          description="Total events created"
        />
        <MetricCard 
          title="Total Revenue" 
          value={`₦${stats?.total_revenue?.toLocaleString() || '0'}`} 
          icon={DollarSign}
          description="Platform earnings"
        />
        <MetricCard 
          title="Organizers" 
          value={stats?.total_organisers || 0} 
          icon={Building2}
          description="Registered organizations"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {recentEvents.length === 0 ? (
                <p className="text-muted-foreground text-xs">No recent events found.</p>
              ) : (
                recentEvents.map((event) => (
                  <div key={event.event_id} className="flex items-center text-sm">
                    <div className="space-y-0.5">
                      <p className="font-medium leading-none">
                        <Link href={`/lighthouse/events/${event.event_id}`} className="hover:underline hover:text-primary transition-colors">
                          {event.event_name}
                        </Link>
                      </p>
                      <p className="text-[10px] text-muted-foreground">{event.organisation_name}</p>
                    </div>
                    <div className="ml-auto font-medium">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wide ${
                        event.status === 'verified' ? 'bg-green-100 text-green-700' :
                        event.status === 'denied' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Manage platform settings and approvals.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/lighthouse/events" className="flex items-center justify-center gap-2 p-2 border rounded-md hover:bg-muted transition-colors text-xs font-medium">
                <Calendar className="w-3 h-3" />
                Events
              </Link>
              <Link href="/lighthouse/users" className="flex items-center justify-center gap-2 p-2 border rounded-md hover:bg-muted transition-colors text-xs font-medium">
                <Users className="w-3 h-3" />
                Users
              </Link>
              <Link href="/lighthouse/organizations" className="flex items-center justify-center gap-2 p-2 border rounded-md hover:bg-muted transition-colors text-xs font-medium">
                <Building2 className="w-3 h-3" />
                Orgs
              </Link>
              <Link href="/lighthouse/revenue" className="flex items-center justify-center gap-2 p-2 border rounded-md hover:bg-muted transition-colors text-xs font-medium">
                <DollarSign className="w-3 h-3" />
                Revenue
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
