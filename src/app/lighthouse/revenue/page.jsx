"use client";

import { useEffect, useState } from "react";
import { adminService } from "../../../lib/admin";
import { 
  DollarSign, 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminRevenueSkeleton } from "@/components/skeletons";
import { cn, formatCurrency } from "@/lib/utils";

function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue }) {
  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
            <div className="flex items-center gap-2">
              {trend && (
                <span className={cn(
                  "inline-flex items-center text-xs font-medium",
                  trend === 'up' ? "text-emerald-600" : "text-red-600"
                )}>
                  {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {trendValue}
                </span>
              )}
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
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
    cancelled: { icon: XCircle, className: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
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

function TabButton({ active, children, onClick, variant, count }) {
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
        "px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5",
        "text-muted-foreground hover:text-foreground hover:bg-muted/50",
        variants[variant] || variants.default
      )}
    >
      {children}
      {count !== undefined && (
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded-full",
          active ? "bg-white/20" : "bg-muted text-muted-foreground"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [withdrawalFilter, setWithdrawalFilter] = useState(null);
  const [transactionFilter, setTransactionFilter] = useState(null);
  const [activeTab, setActiveTab] = useState('withdrawals'); // 'transactions' or 'withdrawals' - default to withdrawals since payment-transactions may not be available
  const [transactionsError, setTransactionsError] = useState(false);
  
  // Pagination for transactions
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions' && !transactionsError) {
      fetchTransactions();
    }
  }, [currentPage, transactionFilter, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    
    // Use Promise.allSettled to handle partial failures gracefully
    const results = await Promise.allSettled([
      adminService.getAnalytics(),
      adminService.getAllWithdrawals({ page: 1, page_size: 50 }),
      adminService.getPaymentTransactions({ limit: itemsPerPage, offset: 0 })
    ]);
    
    // Handle analytics result
    if (results[0].status === 'fulfilled') {
      setStats(results[0].value);
    } else {
      console.error("Failed to fetch analytics:", results[0].reason);
    }
    
    // Handle withdrawals result
    if (results[1].status === 'fulfilled') {
      setWithdrawals(results[1].value?.withdrawals || []);
    } else {
      console.error("Failed to fetch withdrawals:", results[1].reason);
    }
    
    // Handle transactions result
    if (results[2].status === 'fulfilled') {
      setTransactions(results[2].value?.transactions || []);
      setTotalTransactions(results[2].value?.total_count || 0);
      setTransactionsError(false);
    } else {
      console.error("Failed to fetch transactions:", results[2].reason);
      setTransactionsError(true);
    }
    
    setLoading(false);
  };

  const fetchTransactions = async () => {
    try {
      const params = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage
      };
      if (transactionFilter) params.status = transactionFilter;
      
      const data = await adminService.getPaymentTransactions(params);
      setTransactions(data.transactions || []);
      setTotalTransactions(data.total_count || 0);
      setTransactionsError(false);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactionsError(true);
    }
  };

  if (loading) {
    return <AdminRevenueSkeleton />;
  }

  const totalRevenue = stats?.total_revenue || 0;
  const totalEvents = stats?.total_events || 0;
  const totalOrganizers = stats?.total_organisers || 0;
  const totalStudents = stats?.total_students || 0;
  
  const avgRevenuePerEvent = totalEvents > 0 ? (totalRevenue / totalEvents) : 0;
  const avgRevenuePerOrganizer = totalOrganizers > 0 ? (totalRevenue / totalOrganizers) : 0;

  // Calculate transaction stats
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const totalTransactionValue = completedTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const totalPlatformFees = completedTransactions.reduce((sum, t) => sum + parseFloat(t.platform_fee || 0), 0);

  const filteredWithdrawals = withdrawalFilter 
    ? withdrawals.filter(w => w.status === withdrawalFilter)
    : withdrawals;

  const totalPages = Math.ceil(totalTransactions / itemsPerPage);

  // Withdrawal stats
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const completedWithdrawals = withdrawals.filter(w => w.status === 'completed');
  const pendingWithdrawalAmount = pendingWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(totalRevenue)} 
          subtitle="Platform fees collected"
          icon={DollarSign}
        />
        <StatCard 
          title="Total Transactions" 
          value={totalTransactions.toLocaleString()} 
          subtitle={`${formatCurrency(totalTransactionValue)} processed`}
          icon={Receipt}
        />
        <StatCard 
          title="Platform Fees" 
          value={formatCurrency(totalPlatformFees)} 
          subtitle="From recent transactions"
          icon={TrendingUp}
        />
        <StatCard 
          title="Pending Payouts" 
          value={formatCurrency(pendingWithdrawalAmount)} 
          subtitle={`${pendingWithdrawals.length} pending requests`}
          icon={CreditCard}
        />
      </div>

      {/* Revenue Breakdown Cards */}
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
              <p className="text-lg font-semibold text-foreground">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border/40">
              <div>
                <p className="text-sm font-medium text-foreground">Average per Event</p>
                <p className="text-xs text-muted-foreground">Revenue per event</p>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(avgRevenuePerEvent, false)}
              </p>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Average per Organizer</p>
                <p className="text-xs text-muted-foreground">Revenue per organizer</p>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(avgRevenuePerOrganizer, false)}
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

      {/* Main Data Section with Tabs */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl border border-border/40">
              <TabButton 
                active={activeTab === 'transactions'} 
                onClick={() => setActiveTab('transactions')}
              >
                <Receipt className="w-3.5 h-3.5" />
                Payment Transactions
              </TabButton>
              <TabButton 
                active={activeTab === 'withdrawals'} 
                onClick={() => setActiveTab('withdrawals')}
                count={pendingWithdrawals.length > 0 ? pendingWithdrawals.length : undefined}
              >
                <CreditCard className="w-3.5 h-3.5" />
                Withdrawals
              </TabButton>
            </div>
            
            {/* Status Filters */}
            <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
              {activeTab === 'transactions' ? (
                <>
                  <TabButton active={transactionFilter === null} onClick={() => { setTransactionFilter(null); setCurrentPage(1); }}>All</TabButton>
                  <TabButton active={transactionFilter === 'completed'} onClick={() => { setTransactionFilter('completed'); setCurrentPage(1); }} variant="completed">Completed</TabButton>
                  <TabButton active={transactionFilter === 'pending'} onClick={() => { setTransactionFilter('pending'); setCurrentPage(1); }} variant="pending">Pending</TabButton>
                  <TabButton active={transactionFilter === 'failed'} onClick={() => { setTransactionFilter('failed'); setCurrentPage(1); }} variant="failed">Failed</TabButton>
                </>
              ) : (
                <>
                  <TabButton active={withdrawalFilter === null} onClick={() => setWithdrawalFilter(null)}>All</TabButton>
                  <TabButton active={withdrawalFilter === 'pending'} onClick={() => setWithdrawalFilter('pending')} variant="pending">Pending</TabButton>
                  <TabButton active={withdrawalFilter === 'completed'} onClick={() => setWithdrawalFilter('completed')} variant="completed">Completed</TabButton>
                  <TabButton active={withdrawalFilter === 'failed'} onClick={() => setWithdrawalFilter('failed')} variant="failed">Failed</TabButton>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {activeTab === 'transactions' ? (
            /* Payment Transactions Table */
            <>
              {transactionsError ? (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 mb-3">
                    <Receipt className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Payment Transactions Unavailable</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    The payment transactions endpoint is currently experiencing issues. 
                    Please check back later or contact the backend team.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setActiveTab('withdrawals')}
                  >
                    View Withdrawals Instead
                  </Button>
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-12 text-center">
                  <Receipt className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No transactions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/40">
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Transaction</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Buyer</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border/40">Event</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border/40">Amount</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border/40">Platform Fee</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border/40">Status</th>
                        <th className="text-right pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border/40">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {transactions.map((txn) => (
                        <tr key={txn.transaction_id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3">
                            <div className="min-w-0">
                              <p className="font-mono text-xs text-foreground truncate max-w-[100px]" title={txn.transaction_id}>
                                {txn.transaction_id?.slice(-12) || '—'}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{txn.paystack_reference?.slice(0, 12) || '—'}</p>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate max-w-[120px]">{txn.user_name || '—'}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[120px]">{txn.user_email || '—'}</p>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate max-w-[150px]">{txn.event_name || '—'}</p>
                              <p className="text-xs text-muted-foreground">{txn.category_name || 'Standard'}</p>
                            </div>
                          </td>
                          <td className="py-3">
                            <p className="text-sm font-semibold text-foreground">{formatCurrency(txn.amount || 0)}</p>
                          </td>
                          <td className="py-3">
                            <p className="text-sm text-emerald-600 font-medium">{formatCurrency(txn.platform_fee || 0)}</p>
                          </td>
                          <td className="py-3">
                            <StatusBadge status={txn.status || 'pending'} />
                          </td>
                          <td className="py-3 text-right">
                            <p className="text-sm text-muted-foreground">
                              {txn.created_at ? new Date(txn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-4">
                  <p className="text-xs text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalTransactions)} of {totalTransactions}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Withdrawals Table */
            <>
              {filteredWithdrawals.length === 0 ? (
                <div className="py-12 text-center">
                  <CreditCard className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No withdrawals found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/40">
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Transaction</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Organizer</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Bank</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Amount</th>
                        <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                        <th className="text-right pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredWithdrawals.slice(0, 15).map((withdrawal) => (
                        <tr key={withdrawal.transaction_id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3">
                            <p className="font-mono text-sm text-muted-foreground truncate max-w-[100px]" title={withdrawal.transaction_id}>
                              {withdrawal.transaction_id?.slice(-12) || '—'}
                            </p>
                          </td>
                          <td className="py-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate max-w-[120px]">{withdrawal.organizer_name || '—'}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[120px]">{withdrawal.organizer_email || '—'}</p>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">{withdrawal.bank_name || '—'}</p>
                              <p className="text-xs text-muted-foreground">{withdrawal.account_name || '—'}</p>
                            </div>
                          </td>
                          <td className="py-3">
                            <p className="text-sm font-semibold text-foreground">{formatCurrency(withdrawal.amount || 0)}</p>
                          </td>
                          <td className="py-3">
                            <StatusBadge status={withdrawal.status || 'pending'} />
                          </td>
                          <td className="py-3 text-right">
                            <p className="text-sm text-muted-foreground">
                              {withdrawal.created_at ? new Date(withdrawal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Payout Requests Quick Action */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                Payout Requests Management
              </h3>
              <p className="text-xs text-muted-foreground">
                Review, approve, or decline organizer payout requests. Pending requests: <span className="font-semibold text-amber-500">{pendingWithdrawals.length}</span>
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = '/lighthouse/payouts'}
              className="shrink-0"
            >
              Manage Payout Requests
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}