"use client";

import { useEffect, useState } from "react";
import { adminService } from "../../../lib/admin";
import { Loader2, DollarSign, Calendar, Users, BarChart3, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { AnalyticsSkeleton, TableSkeleton } from "@/components/skeletons";

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    Promise.all([
      adminService.getAnalytics(),
      adminService.getAllWithdrawals({ page: 1, page_size: 100 })
    ]).then(([analyticsData, withdrawalsData]) => {
      setStats(analyticsData);
      setWithdrawals(withdrawalsData.withdrawals || []);
      setLoading(false);
      setWithdrawalsLoading(false);
    }).catch(() => {
      setLoading(false);
      setWithdrawalsLoading(false);
    });
  }, []);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  const totalRevenue = stats?.total_revenue || 0;
  const totalEvents = stats?.total_events || 0;
  const totalOrganizers = stats?.total_organisers || 0;
  const totalStudents = stats?.total_students || 0;
  const totalUsers = stats?.total_users || 0;
  
  const avgRevenuePerEvent = totalEvents > 0 ? (totalRevenue / totalEvents) : 0;
  const avgRevenuePerOrganizer = totalOrganizers > 0 ? (totalRevenue / totalOrganizers) : 0;

  const filteredWithdrawals = statusFilter 
    ? withdrawals.filter(w => w.status === statusFilter)
    : withdrawals;

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Revenue Analytics</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Platform revenue and withdrawal transactions
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Platform fees collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Events on platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrganizers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active organizers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <p className="text-sm font-medium">Total Platform Revenue</p>
                <p className="text-xs text-muted-foreground">All-time earnings</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">₦{totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <p className="text-sm font-medium">Average per Event</p>
                <p className="text-xs text-muted-foreground">Revenue per event</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  ₦{avgRevenuePerEvent.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Average per Organizer</p>
                <p className="text-xs text-muted-foreground">Revenue per organizer</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  ₦{avgRevenuePerOrganizer.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-xs text-muted-foreground">All registered users</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{totalUsers}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <p className="text-sm font-medium">Students</p>
                <p className="text-xs text-muted-foreground">Student accounts</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{totalStudents}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Organizers</p>
                <p className="text-xs text-muted-foreground">Event organizers</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{totalOrganizers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Withdrawal Transactions</CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter(null)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  statusFilter === null 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  statusFilter === 'pending' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  statusFilter === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setStatusFilter('failed')}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  statusFilter === 'failed' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Failed
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {withdrawalsLoading ? (
            <TableSkeleton />
          ) : filteredWithdrawals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No withdrawal transactions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Transaction Details
                    </th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      User
                    </th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Bank Details
                    </th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal.transaction_id} className="hover:bg-secondary/50 transition-colors">
                      <td className="py-4">
                        <div>
                          <p className="font-mono text-sm font-medium text-primary">
                            {withdrawal.transaction_id}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Withdrawal request
                          </p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="text-sm font-medium">{withdrawal.organiser_name}</p>
                          <p className="text-xs text-muted-foreground">{withdrawal.organiser_email}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <p className="text-sm font-bold">₦{Number(withdrawal.amount).toLocaleString()}</p>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="text-sm font-medium">{withdrawal.bank_name}</p>
                          <p className="text-xs text-muted-foreground">{withdrawal.account_number}</p>
                          <p className="text-xs text-muted-foreground">{withdrawal.account_name}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(withdrawal.status)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(withdrawal.status)}`}>
                            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="text-sm">
                            {new Date(withdrawal.requested_at).toLocaleDateString('en-US', { 
                              month: 'numeric', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(withdrawal.requested_at).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
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