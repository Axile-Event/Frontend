"use client";

import { useEffect, useState } from "react";
import {
	Loader2,
	CheckCircle,
	XCircle,
	Clock,
	User,
	CreditCard,
	Calendar,
	Filter,
	Landmark,
} from "lucide-react";
import { adminService } from "@/lib/admin";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminDataTable } from "@/components/ui/admin-data-table";
import { AdminTableSkeleton } from "@/components/skeletons";
import { formatCurrency, cn } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select-component";

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  const icons = {
    pending: Clock,
    confirmed: CheckCircle,
    rejected: XCircle,
  };

  const Icon = icons[status] || AlertCircle;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
      styles[status] || "bg-muted text-muted-foreground border-border"
    )}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, variant }) {
  const variantStyles = {
    default: "text-foreground",
    pending: "text-amber-500",
    confirmed: "text-emerald-500",
    rejected: "text-red-500",
  };

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className={cn("text-2xl font-semibold tracking-tight", variantStyles[variant] || variantStyles.default)}>{value}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentFormsPage() {
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const itemsPerPage = 20;

  useEffect(() => {
    fetchForms();
  }, [statusFilter, currentPage]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, page_size: itemsPerPage };
      if (statusFilter !== "all") params.status = statusFilter;
      
      const data = await adminService.getPaymentForms(params);
      setForms(data.payment_forms || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 500 || error.response?.status === 404) {
        toast.error("Payment forms endpoint not available yet.");
      } else {
        toast.error("Failed to fetch payment forms");
      }
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClick = (form) => {
    setSelectedForm(form);
    setAdminNotes("");
    setShowConfirmModal(true);
  };

  const handleRejectClick = (form) => {
    setSelectedForm(form);
    setAdminNotes("");
    setShowRejectModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedForm) return;
    
    setProcessing(selectedForm.id);
    try {
      await adminService.updatePaymentFormStatus(selectedForm.id, 'confirmed', adminNotes || null);
      toast.success("Payment confirmed successfully!");
      setShowConfirmModal(false);
      setSelectedForm(null);
      setAdminNotes("");
      fetchForms();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to confirm payment");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedForm) return;
    
    if (!adminNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setProcessing(selectedForm.id);
    try {
      await adminService.updatePaymentFormStatus(selectedForm.id, 'rejected', adminNotes);
      toast.success("Payment form rejected");
      setShowRejectModal(false);
      setSelectedForm(null);
      setAdminNotes("");
      fetchForms();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to reject payment");
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  // Stats
  const pendingCount = forms.filter(f => f.status === 'pending').length;
  const confirmedCount = forms.filter(f => f.status === 'confirmed').length;
  const rejectedCount = forms.filter(f => f.status === 'rejected').length;
  const totalAmount = forms.reduce((sum, f) => sum + (parseFloat(f.amount_sent) || 0), 0);

  const filteredForms = forms.filter((form) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const displayName =
      form.account_name ||
      [form.Firstname, form.Lastname].filter(Boolean).join(" ").trim();
    return (
      displayName.toLowerCase().includes(query) ||
      form.account_number?.includes(query) ||
      form.bank_code?.toLowerCase().includes(query) ||
      form.bank_name?.toLowerCase().includes(query) ||
      String(form.amount_sent).includes(query) ||
      form.payment_form_id?.toLowerCase().includes(query)
    );
  });

  if (loading && forms.length === 0) {
    return <AdminTableSkeleton columns={6} rows={8} />;
  }

  const displayName = (form) =>
    form.account_name ||
    [form.Firstname, form.Lastname].filter(Boolean).join(" ").trim() ||
    "—";

  const paymentFormColumns = [
    {
      key: "user_details",
      label: "User Details",
      render: (_, form) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">
              {displayName(form)}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono tracking-tight">
              {form.account_number || form.bank_account_number || "No Account #"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "bank",
      label: "Bank Verification",
      render: (_, form) => (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-sm font-semibold text-foreground">
              {form.account_name || "Not Verified"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Landmark className="w-3.5 h-3.5" />
            <p className="text-[11px] font-mono">
              {form.account_number || form.bank_account_number || "—"}{" "}
              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-muted text-[9px] font-black uppercase text-muted-foreground/80 border border-border/50">
                {form.bank_name || form.bank_code || "BANK"}
              </span>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "transfer",
      label: "Transfer Info",
      render: (_, form) => (
        <div className="space-y-1">
          <p className="text-sm font-black text-foreground">
            ₦{Number(form.amount_sent).toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(form.sent_at)}</span>
          </div>
        </div>
      ),
    },
    {
      key: "internal_id",
      label: "Internal ID",
      render: (_, form) => (
        <span className="font-mono text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">
          {form.payment_form_id || `#${form.id}`}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, form) => (
        <div className="space-y-2">
          <StatusBadge status={form.status} />
          {form.admin_notes && (
            <p
              className="text-[10px] text-muted-foreground italic leading-tight max-w-[120px] truncate"
              title={form.admin_notes}
            >
              "{form.admin_notes}"
            </p>
          )}
          {form.confirmed_at && (
            <p className="text-[9px] text-muted-foreground/60 italic">
              {new Date(form.confirmed_at).toLocaleDateString()}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (_, form) =>
        form.status === "pending" ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              className="h-8 bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-600/20 text-xs font-bold transition-all px-3"
              onClick={() => handleConfirmClick(form)}
              disabled={processing === form.id}
            >
              {processing === form.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Confirm
                </>
              )}
            </Button>
            <Button
              size="sm"
              className="h-8 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white border border-red-600/20 text-xs font-bold transition-all px-3"
              onClick={() => handleRejectClick(form)}
              disabled={processing === form.id}
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              Reject
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">
              Handled By
            </p>
            <p className="text-[11px] text-muted-foreground font-medium truncate max-w-[120px]">
              {form.confirmed_by || "System"}
            </p>
          </div>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Forms" value={forms.length} icon={CreditCard} />
        <StatCard title="Pending" value={pendingCount} icon={Clock} variant="pending" />
        <StatCard title="Confirmed" value={confirmedCount} icon={CheckCircle} variant="confirmed" />
        <StatCard title="Rejected" value={rejectedCount} icon={XCircle} variant="rejected" />
      </div>

      <AdminDataTable
        columns={paymentFormColumns}
        data={filteredForms}
        pagination={pagination || { current_page: 1, total_pages: 1, total_count: 0, page_size: itemsPerPage, has_next: false, has_previous: false }}
        loading={loading}
        onPageChange={setCurrentPage}
        emptyMessage="No payment forms found"
        emptyIcon={CreditCard}
        searchPlaceholder="Search by name, amount, ID..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        extraToolbar={
          <div className="w-[180px]">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="bg-card/50 border-border/40">
                <div className="flex items-center gap-2 text-sm">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Filter status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        getRowKey={(row) => row.id}
      />

      {/* Confirm Modal */}
      {showConfirmModal && selectedForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-md p-6 z-10">
            <h3 className="text-lg font-semibold mb-4">Confirm Payment</h3>
            <div className="space-y-3 mb-4 p-3 bg-muted/40 rounded-lg border border-border/50">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">User / Account Name:</span>
                <span className="font-medium">{displayName(selectedForm)}</span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-border/20">
                <span className="text-muted-foreground">Account Name (verified):</span>
                <span className="font-semibold text-emerald-600">{selectedForm.account_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Account Number:</span>
                <span className="font-mono font-bold">{selectedForm.account_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Bank Name:</span>
                <span className="font-medium">{selectedForm.bank_name || selectedForm.bank_code || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-border/20">
                <span className="text-muted-foreground">Amount Total:</span>
                <span className="font-bold text-lg text-emerald-600">{formatCurrency(selectedForm.amount_sent)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Transfer Date:</span>
                <span className="font-medium text-muted-foreground">{formatDate(selectedForm.sent_at)}</span>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Admin Notes (optional)</label>
              <Input
                placeholder="e.g., Payment verified via bank statement"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700" 
                onClick={handleConfirm}
                disabled={processing}
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirm Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowRejectModal(false)} />
          <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-md p-6 z-10">
            <h3 className="text-lg font-semibold mb-4">Reject Payment Form</h3>
            <div className="space-y-3 mb-4 p-3 bg-muted/40 rounded-lg border border-border/50">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">User / Account Name:</span>
                <span className="font-medium">{displayName(selectedForm)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Account Name (verified):</span>
                <span className="font-medium">{selectedForm.account_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Account Number:</span>
                <span className="font-mono font-bold">{selectedForm.account_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Bank Name:</span>
                <span className="font-medium">{selectedForm.bank_name || selectedForm.bank_code || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-border/20">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-red-600">{formatCurrency(selectedForm.amount_sent)}</span>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Reason for Rejection <span className="text-red-500">*</span></label>
              <Input
                placeholder="e.g., Amount mismatch, Payment not found"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                className="flex-1" 
                onClick={handleReject}
                disabled={processing || !adminNotes.trim()}
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
