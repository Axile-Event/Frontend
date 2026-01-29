"use client";

import { useEffect, useState } from "react";
import { Ticket, ChevronLeft, ChevronRight } from "lucide-react";
import { adminService } from "@/lib/admin";
import { toast } from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    checked_in: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };
  
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border",
      config[status] || config.pending
    )}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

const ITEMS_PER_PAGE = 20;

export default function TicketsPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    total_count: 0,
    total_pages: 1,
    page_size: ITEMS_PER_PAGE,
    has_next: false,
    has_previous: false,
  });

  const fetchTickets = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: ITEMS_PER_PAGE,
      };
      if (statusFilter !== "all") params.status = statusFilter;

      const data = await adminService.getAllTickets(params);
      setTickets(data.tickets || []);
      if (data.pagination) {
        setPagination({
          total_count: data.pagination.total_count ?? 0,
          total_pages: data.pagination.total_pages ?? 1,
          page_size: data.pagination.page_size ?? ITEMS_PER_PAGE,
          has_next: data.pagination.has_next ?? false,
          has_previous: data.pagination.has_previous ?? false,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(currentPage);
  }, [statusFilter, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const tabs = [
    { id: "all", label: "All" },
    { id: "confirmed", label: "Confirmed" },
    { id: "pending", label: "Pending" },
    { id: "checked_in", label: "Checked In" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const filteredTickets = tickets.filter((ticket) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const ref = ticket.referral || ticket.referral_source || ticket.referral_payload || "";
    return (
      ticket.student_name?.toLowerCase().includes(q) ||
      ticket.student_email?.toLowerCase().includes(q) ||
      ticket.ticket_id?.toLowerCase().includes(q) ||
      ticket.event_name?.toLowerCase().includes(q) ||
      ref.toLowerCase().includes(q)
    );
  });

  const totalPages = pagination.total_pages;
  const totalCount = pagination.total_count;
  const indexOfFirstItem = totalCount === 0 ? 0 : (currentPage - 1) * pagination.page_size + 1;
  const indexOfLastItem = Math.min(currentPage * pagination.page_size, totalCount);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search]);

  if (loading) {
    return <AdminTableSkeleton columns={7} rows={8} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl border border-border/40 overflow-x-auto">
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

        <div className="relative w-full md:w-72">
          <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-card border border-border/40 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Ticket ID</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Event</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Attendee</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Referral</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Price</th>
                <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <Ticket className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No tickets found</p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  const refDisplay = t.referral || t.referral_source || t.referral_payload;
                  return (
                    <tr key={t.ticket_id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="font-mono text-sm text-muted-foreground">{t.ticket_id}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate max-w-[180px]">{t.event_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{t.event_id}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{t.student_name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">{t.student_email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-muted-foreground">{refDisplay ? String(refDisplay) : "—"}</span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(t.total_price)}</p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {(totalPages > 1 || totalCount > 0) && (
          <div className="flex items-center justify-between p-4 border-t border-border/40">
            <p className="text-xs text-muted-foreground">
              Showing {indexOfFirstItem}-{indexOfLastItem} of {totalCount}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || !pagination.has_previous}
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
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages || !pagination.has_next}
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
