"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { queryKeys } from "@/lib/query-keys";
import {
	Calendar,
	MapPin,
	DollarSign,
	CheckCircle,
	XCircle,
	Trash2,
	Eye,
} from "lucide-react";
import { adminService } from "../../../lib/admin";
import { toast } from "react-hot-toast";
import { Button } from "../../../components/ui/button";
import { AdminDataTable } from "@/components/ui/admin-data-table";
import { AdminTableSkeleton } from "@/components/skeletons";
import { useConfirmModal } from "@/components/ui/confirmation-modal";
import { cn } from "@/lib/utils";

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
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
    verified: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    denied: "bg-red-500/10 text-red-600 border-red-500/20",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wide border",
      config[status] || config.pending
    )}>
      {status}
    </span>
  );
}

const PAGE_SIZE = 20;

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({
    total_count: 0,
    total_pages: 1,
    page_size: PAGE_SIZE,
    current_page: 1,
    has_next: false,
    has_previous: false,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const searchDebounceRef = useRef(null);
  const { confirm } = useConfirmModal();

  const fetchEvents = useCallback(async (page, status, search) => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      if (status && status !== "all") params.status = status;
      if (search && search.trim()) params.search = search.trim();
      const data = await adminService.getAllEvents(params);
      setEvents(data.events || []);
      if (data.pagination) {
        setPagination({
          current_page: data.pagination.current_page,
          total_pages: data.pagination.total_pages,
          total_count: data.pagination.total_count,
          page_size: data.pagination.page_size,
          has_next: data.pagination.has_next,
          has_previous: data.pagination.has_previous,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(currentPage, filter, debouncedSearch);
  }, [currentPage, filter, debouncedSearch, fetchEvents]);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const handleStatusUpdate = async (eventId, newStatus) => {
    const isApproving = newStatus === 'verified';
    const confirmed = await confirm({
      title: isApproving ? "Approve Event" : "Deny Event",
      description: isApproving 
        ? "Are you sure you want to approve this event? It will become visible to all users."
        : "Are you sure you want to deny this event? It will be hidden from the public.",
      confirmText: isApproving ? "Approve" : "Deny",
      variant: isApproving ? "success" : "warning",
    });
    if (!confirmed) return;

    try {
      await adminService.updateEventStatus(eventId, newStatus);
      toast.success(`Event marked as ${newStatus}`);
      fetchEvents(currentPage, filter, debouncedSearch);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update event status");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const confirmed = await confirm({
      title: "Delete Event",
      description: "Are you sure you want to permanently delete this event? This action cannot be undone and all associated tickets will be removed.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      await adminService.deleteEvent(eventId);
      toast.success("Event deleted successfully");
      fetchEvents(currentPage, filter, debouncedSearch);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete event");
    }
  };

  if (loading && events.length === 0) {
    return <AdminTableSkeleton columns={5} rows={8} />;
  }

  const tabs = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "verified", label: "Verified" },
    { id: "denied", label: "Denied" },
  ];

  const eventColumns = [
    {
      key: "event",
      label: "Event",
      render: (_, event) => (
        <div className="min-w-0">
          <Link
            href={`/lighthouse/events/${event.event_id}`}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
          >
            {event.event_name}
          </Link>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <DollarSign className="w-3 h-3" />
            {event.pricing_type === "free"
              ? "Free"
              : event.price != null
                ? `₦${Number(event.price).toLocaleString()}`
                : "Paid"}
          </div>
        </div>
      ),
    },
    {
      key: "organiser",
      label: "Organizer",
      render: (_, event) => (
        <p className="text-sm text-muted-foreground truncate max-w-[180px]">
          {event.organisation_name}
        </p>
      ),
    },
    {
      key: "date_location",
      label: "Date & Location",
      render: (_, event) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>
              {new Date(event.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate max-w-[150px]">{event.location}</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, event) => <StatusBadge status={event.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (_, event) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            asChild
          >
            <Link href={`/lighthouse/events/${event.event_id}`}>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </Link>
          </Button>
          {event.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                onClick={() => handleStatusUpdate(event.event_id, "verified")}
                title="Approve"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={() => handleStatusUpdate(event.event_id, "denied")}
                title="Deny"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
          {event.status === "verified" && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
              onClick={() => handleStatusUpdate(event.event_id, "denied")}
              title="Revoke"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          )}
          {event.status === "denied" && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
              onClick={() => handleStatusUpdate(event.event_id, "verified")}
              title="Approve"
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-500/10"
            onClick={() => handleDeleteEvent(event.event_id)}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <AdminDataTable
        columns={eventColumns}
        data={events}
        pagination={pagination}
        loading={loading}
        onPageChange={setCurrentPage}
        emptyMessage={debouncedSearch.trim() ? "No events match your search" : "No events found"}
        emptyIcon={Calendar}
        searchPlaceholder="Search by name, organizer, location..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        extraToolbar={
          <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl border border-border/40 overflow-x-auto">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={filter === tab.id}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
              </TabButton>
            ))}
          </div>
        }
        getRowKey={(row) => row.event_id}
      />
    </div>
  );
}
