"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "../../../lib/admin";
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  AlertCircle,
  Loader2,
  Check,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminRevenueSkeleton } from "@/components/skeletons";
import { cn, formatCurrency } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

function StatCard({ title, value, subtitle, icon: Icon, variant }) {
  const variantStyles = {
    default: "text-foreground",
    pending: "text-amber-500",
    approved: "text-emerald-500",
    rejected: "text-red-500",
    completed: "text-blue-500"
  };

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className={cn("text-2xl font-semibold tracking-tight", variantStyles[variant] || variantStyles.default)}>{value}</p>
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
    approved: { icon: Check, className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    rejected: { icon: XCircle, className: "bg-red-500/10 text-red-600 border-red-500/20" },
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

function TabButton({ active, children, onClick, variant, count }) {
  const variants = {
    pending: "data-[active=true]:bg-amber-500 data-[active=true]:text-white",
    approved: "data-[active=true]:bg-blue-500 data-[active=true]:text-white",
    completed: "data-[active=true]:bg-emerald-500 data-[active=true]:text-white",
    rejected: "data-[active=true]:bg-red-500 data-[active=true]:text-white",
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
      {count !== undefined && count > 0 && (
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

export default function PayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [processing, setProcessing] = useState({});
  const itemsPerPage = 20;

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    requestId: null,
    action: null,
    organizerName: null,
    amount: null
  });

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
    totalPendingAmount: 0
  });

  const fetchPayoutRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: itemsPerPage
      };
      if (statusFilter) params.status = statusFilter;

      const data = await adminService.getPayoutRequests(params);
      setPayoutRequests(data.payout_requests || []);
      setTotalCount(data.pagination?.total_count || 0);

      // Calculate stats from all requests (need to fetch all for accurate counts)
      const allData = await adminService.getPayoutRequests({ page_size: 1000 });
      const allRequests = allData.payout_requests || [];
      
      const pendingRequests = allRequests.filter(r => r.status === 'pending');
      const approvedRequests = allRequests.filter(r => r.status === 'approved');
      const completedRequests = allRequests.filter(r => r.status === 'completed');
      const rejectedRequests = allRequests.filter(r => r.status === 'rejected');
      
      setStats({
        pending: pendingRequests.length,
        approved: approvedRequests.length,
        completed: completedRequests.length,
        rejected: rejectedRequests.length,
        totalPendingAmount: pendingRequests.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0)
      });

    } catch (error) {
      console.error("Failed to fetch payout requests:", error);
      toast.error("Failed to load payout requests");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchPayoutRequests();
  }, [fetchPayoutRequests]);

  const handleApprove = (request) => {
    setConfirmModal({
      isOpen: true,
      requestId: request.request_id,
      action: 'approve',
      organizerName: request.organizer_name,
      amount: request.amount
    });
  };

  const handleDecline = (request) => {
    setConfirmModal({
      isOpen: true,
      requestId: request.request_id,
      action: 'decline',
      organizerName: request.organizer_name,
      amount: request.amount
    });
  };

  const executeAction = async () => {
    const { requestId, action } = confirmModal;
    if (!requestId || !action) return;

    try {
      setProcessing(prev => ({ ...prev, [requestId]: action }));
      
      const status = action === 'approve' ? 'approved' : 'rejected';
      await adminService.updatePayoutRequestStatus(requestId, status);
      
      toast.success(`Payout request ${status} successfully`);
      setConfirmModal({ isOpen: false, requestId: null, action: null, organizerName: null, amount: null });
      fetchPayoutRequests();
    } catch (error) {
      const errorMsg = error.response?.data?.error || `Failed to ${action} payout request`;
      toast.error(errorMsg);
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: null }));
    }
  };

  const handleMarkCompleted = async (payoutRequest) => {
    try {
      setProcessing(prev => ({ ...prev, [payoutRequest.request_id]: 'completing' }));
      
      // Workaround: Fetch pending withdrawals and find the matching transaction
      // by organizer email and amount
      const withdrawalsData = await adminService.getAllWithdrawals({ status: 'pending', page_size: 100 });
      const withdrawals = withdrawalsData.withdrawals || [];
      
      // Find matching transaction by organizer email and amount
      const matchingTransaction = withdrawals.find(w => 
        w.organizer_email === payoutRequest.organizer_email && 
        parseFloat(w.amount) === parseFloat(payoutRequest.amount)
      );
      
      if (!matchingTransaction) {
        toast.error("Could not find matching transaction. It may have already been completed or the payout wasn't properly approved.");
        return;
      }
      
      const transactionId = matchingTransaction.transaction_id;
      await adminService.updateWithdrawalStatus(transactionId, 'completed');
      toast.success("Payout marked as completed");
      fetchPayoutRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to complete payout");
    } finally {
      setProcessing(prev => ({ ...prev, [payoutRequest.request_id]: null }));
    }
  };

  if (loading) {
    return <AdminRevenueSkeleton />;
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard 
          title="Pending Requests" 
          value={stats.pending} 
          subtitle={`${formatCurrency(stats.totalPendingAmount)} total`}
          icon={Clock}
          variant="pending"
        />
        <StatCard 
          title="Approved" 
          value={stats.approved} 
          subtitle="Awaiting transfer"
          icon={Check}
          variant="approved"
        />
        <StatCard 
          title="Completed" 
          value={stats.completed} 
          subtitle="Successfully transferred"
          icon={CheckCircle}
          variant="completed"
        />
        <StatCard 
          title="Rejected" 
          value={stats.rejected} 
          subtitle="Declined requests"
          icon={XCircle}
          variant="rejected"
        />
        <StatCard 
          title="Total Requests" 
          value={totalCount} 
          subtitle="All time"
          icon={CreditCard}
        />
      </div>

      {/* Payout Requests Table */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payout Requests
            </CardTitle>
            
            {/* Status Filters */}
            <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
              <TabButton 
                active={statusFilter === null} 
                onClick={() => { setStatusFilter(null); setCurrentPage(1); }}
              >
                All
              </TabButton>
              <TabButton 
                active={statusFilter === 'pending'} 
                onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
                variant="pending"
                count={stats.pending}
              >
                Pending
              </TabButton>
              <TabButton 
                active={statusFilter === 'approved'} 
                onClick={() => { setStatusFilter('approved'); setCurrentPage(1); }}
                variant="approved"
                count={stats.approved}
              >
                Approved
              </TabButton>
              <TabButton 
                active={statusFilter === 'completed'} 
                onClick={() => { setStatusFilter('completed'); setCurrentPage(1); }}
                variant="completed"
              >
                Completed
              </TabButton>
              <TabButton 
                active={statusFilter === 'rejected'} 
                onClick={() => { setStatusFilter('rejected'); setCurrentPage(1); }}
                variant="rejected"
              >
                Rejected
              </TabButton>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {payoutRequests.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No payout requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Organizer</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Bank Details</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Amount</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Wallet Balance</th>
                    <th className="text-left pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="text-right pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden xl:table-cell">Date</th>
                    <th className="text-right pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {payoutRequests.map((request) => (
                    <tr key={request.request_id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate max-w-[120px]">{request.organizer_name || '—'}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[120px]">{request.organizer_email || '—'}</p>
                        </div>
                      </td>
                      <td className="py-3 hidden md:table-cell">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{request.bank_name || '—'}</p>
                          <p className="text-xs text-muted-foreground">{request.account_name || '—'}</p>
                          <p className="text-xs text-muted-foreground font-mono">{request.bank_account_number || '—'}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(request.amount || 0)}</p>
                      </td>
                      <td className="py-3 hidden lg:table-cell">
                        <p className="text-sm text-muted-foreground">{formatCurrency(request.current_wallet_balance || 0)}</p>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={request.status || 'pending'} />
                      </td>
                      <td className="py-3 text-right hidden xl:table-cell">
                        <p className="text-sm text-muted-foreground">
                          {request.created_at ? new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </p>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {request.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                onClick={() => handleApprove(request)}
                                disabled={!!processing[request.request_id]}
                              >
                                {processing[request.request_id] === 'approve' ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="w-4 h-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                                onClick={() => handleDecline(request)}
                                disabled={!!processing[request.request_id]}
                              >
                                {processing[request.request_id] === 'decline' ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <X className="w-4 h-4 mr-1" />
                                    Decline
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-500/10"
                              onClick={() => handleMarkCompleted(request)}
                              disabled={!!processing[request.request_id]}
                            >
                              {processing[request.request_id] === 'completing' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Mark Complete
                                </>
                              )}
                            </Button>
                          )}
                          {(request.status === 'completed' || request.status === 'rejected') && (
                            <span className="text-xs text-muted-foreground px-3">—</span>
                          )}
                        </div>
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
                Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
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
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, requestId: null, action: null, organizerName: null, amount: null })}
        onConfirm={executeAction}
        title={confirmModal.action === 'approve' ? 'Approve Payout Request' : 'Decline Payout Request'}
        description={
          confirmModal.action === 'approve'
            ? `Are you sure you want to approve this payout request of ${formatCurrency(confirmModal.amount || 0)} for ${confirmModal.organizerName || 'this organizer'}? The organizer's wallet will be debited immediately.`
            : `Are you sure you want to decline this payout request of ${formatCurrency(confirmModal.amount || 0)} for ${confirmModal.organizerName || 'this organizer'}? The organizer's wallet balance will remain unchanged.`
        }
        confirmText={confirmModal.action === 'approve' ? 'Approve' : 'Decline'}
        cancelText="Cancel"
        variant={confirmModal.action === 'approve' ? 'success' : 'danger'}
        loading={!!processing[confirmModal.requestId]}
      />
    </div>
  );
}
