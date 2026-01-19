"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Banknote, 
  Clock,
  AlertCircle,
  User,
  Building2,
  Wallet
} from "lucide-react";
import { adminService } from "@/lib/admin";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/skeletons";

export default function PayoutRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [processing, setProcessing] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const itemsPerPage = 20;

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      
      const data = await adminService.getPayoutRequests(params);
      setRequests(data.payout_requests || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch payout requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!confirm("Are you sure you want to APPROVE this payout request? This will debit the organizer's wallet.")) return;
    
    setProcessing(requestId);
    try {
      await adminService.updatePayoutRequestStatus(requestId, 'approved');
      toast.success("Payout request approved! Wallet debited. Now transfer money manually and mark transaction as completed.");
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to approve request");
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setAdminNotes("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    setProcessing(selectedRequest.request_id);
    try {
      await adminService.updatePayoutRequestStatus(selectedRequest.request_id, 'rejected', adminNotes || null);
      toast.success("Payout request rejected");
      setShowRejectModal(false);
      setSelectedRequest(null);
      setAdminNotes("");
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to reject request");
    } finally {
      setProcessing(null);
    }
  };

  const statuses = ["all", "pending", "approved", "rejected", "completed"];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = requests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border border-green-100';
      case 'approved':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'rejected':
        return 'bg-red-50 text-red-700 border border-red-100';
      case 'pending':
      default:
        return 'bg-yellow-50 text-yellow-700 border border-yellow-100';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payout Requests</h2>
          <p className="text-sm text-muted-foreground">
            Review and approve organizer payout requests. Money is transferred manually.
          </p>
        </div>
        <div className="flex gap-2 bg-muted p-1 rounded-lg flex-wrap">
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

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-semibold mb-1">Manual Transfer Workflow</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-600">
            <li>Approve request → Wallet is debited, Transaction created as "pending"</li>
            <li>Transfer money manually to organizer's bank account</li>
            <li>Go to <strong>Transactions</strong> page and mark as "completed"</li>
          </ol>
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
                   <th className="p-3 font-medium whitespace-nowrap">Wallet Balance</th>
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
                       No payout requests found.
                     </td>
                   </tr>
                 ) : (
                   currentItems.map((req) => (
                     <tr key={req.request_id} className="hover:bg-muted/30 transition-colors text-xs">
                       <td className="p-3">
                         <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                             <User className="w-4 h-4 text-primary" />
                           </div>
                           <div>
                             <div className="font-medium">{req.organizer_name}</div>
                             <div className="text-[10px] text-muted-foreground">{req.organizer_email}</div>
                           </div>
                         </div>
                       </td>
                       <td className="p-3">
                         <div className="flex items-center gap-2">
                            <Banknote className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium">{req.bank_name}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground">{req.account_name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{req.bank_account_number}</div>
                       </td>
                       <td className="p-3 font-bold text-base">
                         ₦{Number(req.amount).toLocaleString()}
                       </td>
                       <td className="p-3">
                         <div className="flex items-center gap-1">
                           <Wallet className="w-3 h-3 text-muted-foreground" />
                           <span className="text-muted-foreground">₦{Number(req.current_wallet_balance).toLocaleString()}</span>
                         </div>
                       </td>
                       <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wide ${getStatusStyle(req.status)}`}>
                            {req.status}
                          </span>
                          {req.admin_notes && (
                            <div className="text-[10px] text-muted-foreground mt-1 max-w-[150px] truncate" title={req.admin_notes}>
                              Note: {req.admin_notes}
                            </div>
                          )}
                       </td>
                       <td className="p-3 text-muted-foreground">
                         <div>{new Date(req.created_at).toLocaleDateString()}</div>
                         <div className="text-[10px]">{new Date(req.created_at).toLocaleTimeString()}</div>
                       </td>
                       <td className="p-3 text-right">
                         {req.status === 'pending' && (
                           <div className="flex items-center justify-end gap-1">
                             <Button
                               size="sm"
                               variant="ghost"
                               className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                               title="Approve"
                               onClick={() => handleApprove(req.request_id)}
                               disabled={processing === req.request_id}
                             >
                               {processing === req.request_id ? (
                                 <Loader2 className="w-4 h-4 animate-spin" />
                               ) : (
                                 <CheckCircle className="w-4 h-4" />
                               )}
                             </Button>
                             <Button
                               size="sm"
                               variant="ghost"
                               className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                               title="Reject"
                               onClick={() => handleRejectClick(req)}
                               disabled={processing === req.request_id}
                             >
                               <XCircle className="w-4 h-4" />
                             </Button>
                           </div>
                         )}
                         {req.status === 'approved' && (
                           <span className="text-[10px] text-blue-600 font-medium">
                             Awaiting transfer
                           </span>
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          <span className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold">Reject Payout Request</h3>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>You are about to reject the payout request from <strong>{selectedRequest.organizer_name}</strong> for <strong>₦{Number(selectedRequest.amount).toLocaleString()}</strong>.</p>
              <p className="mt-2 text-gray-500">The wallet will NOT be debited.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Rejection Notes (Optional)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Reason for rejection..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setAdminNotes("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                onClick={handleReject}
                disabled={processing === selectedRequest.request_id}
              >
                {processing === selectedRequest.request_id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Reject Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
