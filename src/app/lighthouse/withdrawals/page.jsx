"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, CreditCard, AlertCircle } from "lucide-react";
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
  const [statusFilter, setStatusFilter] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [processing, setProcessing] = useState(null);
  const itemsPerPage = 20;

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
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (id) => {
    if (!confirm("Have you transferred the money to the organizer's bank account? This will mark the transaction as COMPLETED.")) return;
    
    setProcessing(id);
    try {
      await adminService.updateWithdrawalStatus(id, 'completed');
      toast.success("Transaction marked as completed!");
      fetchWithdrawals();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setProcessing(null);
    }
  };

  const handleMarkFailed = async (id) => {
    if (!confirm("This will mark the transaction as FAILED and refund the amount back to the organizer's wallet. Continue?")) return;
    
    setProcessing(id);
    try {
      await adminService.updateWithdrawalStatus(id, 'failed');
      toast.success("Transaction marked as failed. Amount refunded to wallet.");
      fetchWithdrawals();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setProcessing(null);
    }
  };

  const statuses = ["all", "pending", "completed", "failed"];

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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payout Transactions</h2>
          <p className="text-sm text-muted-foreground">
            Transactions from approved payout requests. Mark as completed after manual transfer.
          </p>
        </div>
      </div>

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

      {/* Info Banner for Pending */}
      {statusFilter === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700">
            <p className="font-semibold">Pending Transactions</p>
            <p className="text-amber-600">These are approved payout requests awaiting manual transfer. Transfer the money to the organizer's bank account, then mark as completed.</p>
          </div>
        </div>
      )}

       <Card className="shadow-sm border-border">
         <CardContent className="p-0">
           <div className="border-t-0 overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                 <tr>
                   <th className="p-3 font-medium whitespace-nowrap">Transaction ID</th>
                   <th className="p-3 font-medium whitespace-nowrap">Organizer</th>
                   <th className="p-3 font-medium whitespace-nowrap">Bank Details</th>
                   <th className="p-3 font-medium whitespace-nowrap">Amount</th>
                   <th className="p-3 font-medium whitespace-nowrap">Status</th>
                   <th className="p-3 font-medium whitespace-nowrap">Date</th>
                   <th className="p-3 font-medium whitespace-nowrap text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-4">
                        <TableSkeleton />
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                   <tr>
                     <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                       No transactions found.
                     </td>
                   </tr>
                 ) : (
                   currentItems.map((w) => (
                     <tr key={w.transaction_id} className="hover:bg-muted/30 transition-colors text-xs">
                       <td className="p-3">
                         <span className="font-mono text-[10px] text-muted-foreground">{w.transaction_id}</span>
                       </td>
                       <td className="p-3">
                         <div className="font-medium">{w.organizer_name}</div>
                         <div className="text-[10px] text-muted-foreground">{w.organizer_email}</div>
                       </td>
                       <td className="p-3">
                         <div className="flex items-center gap-2">
                            <CreditCard className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium">{w.bank_name}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground">{w.account_name}</div>
                       </td>
                       <td className="p-3 font-bold">
                         ₦{Number(w.amount).toLocaleString()}
                       </td>
                       <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wide ${
                            w.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-100' :
                            w.status === 'failed' ? 'bg-red-50 text-red-700 border border-red-100' :
                            'bg-yellow-50 text-yellow-700 border border-yellow-100'
                          }`}>
                            {w.status}
                          </span>
                       </td>
                       <td className="p-3 text-muted-foreground">
                         <div>{new Date(w.created_at).toLocaleDateString()}</div>
                         {w.completed_at && (
                           <div className="text-[10px] text-green-600">
                             Completed: {new Date(w.completed_at).toLocaleDateString()}
                           </div>
                         )}
                       </td>
                       <td className="p-3 text-right">
                         {w.status === 'pending' && (
                           <div className="flex items-center justify-end gap-1">
                             <Button
                               size="sm"
                               variant="ghost"
                               className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 text-[10px] font-semibold"
                               title="Mark as Completed"
                               onClick={() => handleMarkCompleted(w.transaction_id)}
                               disabled={processing === w.transaction_id}
                             >
                               {processing === w.transaction_id ? (
                                 <Loader2 className="w-3 h-3 animate-spin mr-1" />
                               ) : (
                                 <CheckCircle className="w-3 h-3 mr-1" />
                               )}
                               Complete
                             </Button>
                             <Button
                               size="sm"
                               variant="ghost"
                               className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-[10px] font-semibold"
                               title="Mark as Failed (Refund)"
                               onClick={() => handleMarkFailed(w.transaction_id)}
                               disabled={processing === w.transaction_id}
                             >
                               <XCircle className="w-3 h-3 mr-1" />
                               Failed
                             </Button>
                           </div>
                         )}
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
         </CardContent>

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
