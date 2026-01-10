"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, CreditCard } from "lucide-react";
import { adminService } from "@/lib/admin";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WithdrawalsPage() {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

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
    if (!confirm(`Are you sure you want to ${status === 'completed' ? 'APPROVE' : 'REJECT'} this withdrawal?`)) return;
    
    try {
      await adminService.updateWithdrawalStatus(id, status);
      toast.success(`Withdrawal ${status === 'completed' ? 'approved' : 'rejected'}`);
      fetchWithdrawals();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const statuses = ["all", "pending", "completed", "failed"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Withdrawals</h2>
          <p className="text-sm text-muted-foreground">
            Manage payout requests from organizers.
          </p>
        </div>
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
          {statuses.map((status) => (
            <button
               key={status}
               onClick={() => setStatusFilter(status)}
               className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                 statusFilter === status 
                   ? "bg-white shadow text-foreground" 
                   : "text-muted-foreground hover:text-foreground"
               }`}
             >
               {status.charAt(0).toUpperCase() + status.slice(1)}
             </button>
          ))}
        </div>
      </div>

       <Card className="shadow-sm border-border">
         <CardContent className="p-0">
           <div className="border-t-0 overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                 <tr>
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
                     <td colSpan={6} className="p-10 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                     </td>
                   </tr>
                 ) : withdrawals.length === 0 ? (
                   <tr>
                     <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground">
                       No withdrawals found.
                     </td>
                   </tr>
                 ) : (
                   withdrawals.map((w) => (
                     <tr key={w.transaction_id} className="hover:bg-muted/30 transition-colors text-xs">
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
                       <td className="p-3 font-medium">
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
                         {new Date(w.created_at).toLocaleDateString()}
                       </td>
                       <td className="p-3 text-right">
                         {w.status === 'pending' && (
                           <div className="flex items-center justify-end gap-1">
                             <Button
                               size="sm"
                               variant="ghost"
                               className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                               title="Approve"
                               onClick={() => handleAction(w.transaction_id, 'completed')}
                             >
                               <CheckCircle className="w-4 h-4" />
                             </Button>
                             <Button
                               size="sm"
                               variant="ghost"
                               className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                               title="Reject"
                               onClick={() => handleAction(w.transaction_id, 'failed')}
                             >
                               <XCircle className="w-4 h-4" />
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
       </Card>
    </div>
  );
}
