"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, CreditCard, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { adminService } from "@/lib/admin";
import { toast } from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminTableSkeleton } from "@/components/skeletons";
import { useConfirmModal } from "@/components/ui/confirmation-modal";
import { cn, formatCurrency } from "@/lib/utils";

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const config = {
    completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-600 border-red-500/20",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };
  
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border",
      config[status] || config.pending
    )}>
      {status}
    </span>
  );
}

export default function WithdrawalsPage() {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const { confirm } = useConfirmModal();

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      
      const data = await adminService.getAllWithdrawals(params);
      setWithdrawals(data.withdrawals || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch withdrawals");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    const isApproving = status === 'completed';
    const confirmed = await confirm({
      title: isApproving ? "Approve Withdrawal" : "Reject Withdrawal",
      description: isApproving 
        ? "Are you sure you want to approve this withdrawal? The funds will be released to the organizer."
        : "Are you sure you want to reject this withdrawal? The organizer will be notified.",
      confirmText: isApproving ? "Approve" : "Reject",
      variant: isApproving ? "success" : "danger",
    });
    if (!confirmed) return;
    
    try {
      await adminService.updateWithdrawalStatus(id, status);
      toast.success(`Withdrawal ${status === 'completed' ? 'approved' : 'rejected'}`);
      fetchWithdrawals();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
    { id: "failed", label: "Failed" },
  ];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = withdrawals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(withdrawals.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;

  if (loading) {
    return <AdminTableSkeleton columns={6} rows={8} />;
  }

  return (
    <div className="space-y-5">
      {pendingCount > 0 && statusFilter === 'all' && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">{pendingCount} pending withdrawal{pendingCount > 1 ? 's' : ''}</p>
              <p className="text-xs text-amber-600/70 mt-0.5">Requires your review and action</p>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
              onClick={() => setStatusFilter('pending')}
            >
              View Pending
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl border border-border/40">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            active={statusFilter === tab.id}
            onClick={() => setStatusFilter(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
      </div>

      <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Organizer</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Bank</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Amount</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <CreditCard className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No withdrawals found</p>
                  </td>
                </tr>
              ) : (
                currentItems.map((w) => (
                  <tr key={w.transaction_id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate max-w-[150px]">{w.organizer_name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">{w.organizer_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium text-foreground">{w.bank_name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{w.account_name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(w.amount)}</p>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={w.status} />
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <p className="text-sm text-muted-foreground">
                        {new Date(w.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        {w.status === 'pending' ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                              title="Approve"
                              onClick={() => handleAction(w.transaction_id, 'completed')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                              title="Reject"
                              onClick={() => handleAction(w.transaction_id, 'failed')}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border/40">
            <p className="text-xs text-muted-foreground">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, withdrawals.length)} of {withdrawals.length}
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
      </Card>
    </div>
  );
}
