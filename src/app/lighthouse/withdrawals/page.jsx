"use client";

import { useEffect, useState } from "react";
import {
	Loader2,
	CheckCircle,
	XCircle,
	CreditCard,
	AlertCircle,
} from "lucide-react";
import { adminService } from "@/lib/admin";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminDataTable } from "@/components/ui/admin-data-table";
import { AdminTableSkeleton } from "@/components/skeletons";
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

const ITEMS_PER_PAGE = 20;

export default function WithdrawalsPage() {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter, currentPage]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, page_size: ITEMS_PER_PAGE };
      if (statusFilter !== "all") params.status = statusFilter;

      const data = await adminService.getAllWithdrawals(params);
      setWithdrawals(data.withdrawals || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch transactions");
      setWithdrawals([]);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const tabs = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
    { id: "failed", label: "Failed" },
  ];

  const withdrawalColumns = [
    {
      key: "transaction_id",
      label: "Transaction ID",
      render: (val) => (
        <span className="font-mono text-[10px] text-muted-foreground">
          {val}
        </span>
      ),
    },
    {
      key: "organizer",
      label: "Organizer",
      render: (_, w) => (
        <div>
          <div className="font-medium">{w.organizer_name}</div>
          <div className="text-[10px] text-muted-foreground">
            {w.organizer_email}
          </div>
        </div>
      ),
    },
    {
      key: "bank",
      label: "Bank Details",
      render: (_, w) => (
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-3 h-3 text-muted-foreground" />
            <span className="font-medium">{w.bank_name}</span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            {w.account_name}
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (_, w) => (
        <span className="font-bold">
          ₦{Number(w.amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, w) => (
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wide border",
            w.status === "completed"
              ? "bg-green-50 text-green-700 border-green-100"
              : w.status === "failed"
                ? "bg-red-50 text-red-700 border-red-100"
                : "bg-yellow-50 text-yellow-700 border-yellow-100"
          )}
        >
          {w.status}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (_, w) => (
        <div>
          <div>{new Date(w.created_at).toLocaleDateString()}</div>
          {w.completed_at && (
            <div className="text-[10px] text-green-600">
              Completed: {new Date(w.completed_at).toLocaleDateString()}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (_, w) =>
        w.status === "pending" ? (
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
        ) : null,
    },
  ];

  const paginationObj =
    pagination ||
    ({
      current_page: 1,
      total_pages: 1,
      total_count: 0,
      page_size: ITEMS_PER_PAGE,
      has_next: false,
      has_previous: false,
    });

  if (loading && withdrawals.length === 0) {
    return <AdminTableSkeleton columns={7} rows={8} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Payout Transactions
          </h2>
          <p className="text-sm text-muted-foreground">
            Transactions from approved payout requests. Mark as completed after
            manual transfer.
          </p>
        </div>
      </div>

      {statusFilter === "pending" && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700">
            <p className="font-semibold">Pending Transactions</p>
            <p className="text-amber-600">
              These are approved payout requests awaiting manual transfer.
              Transfer the money to the organizer's bank account, then mark as
              completed.
            </p>
          </div>
        </div>
      )}

      <AdminDataTable
        columns={withdrawalColumns}
        data={withdrawals}
        pagination={paginationObj}
        loading={loading}
        onPageChange={(page) => {
          setCurrentPage(page);
        }}
        emptyMessage="No transactions found."
        emptyIcon={CreditCard}
        extraToolbar={
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
        }
        getRowKey={(row) => row.transaction_id}
      />
    </div>
  );
}
