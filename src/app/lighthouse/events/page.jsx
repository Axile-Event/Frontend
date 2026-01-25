"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, DollarSign, CheckCircle, XCircle, Trash2, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { adminService } from "../../../lib/admin";
import { toast } from "react-hot-toast";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function EventsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const { confirm } = useConfirmModal();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await adminService.getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

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
      fetchEvents(); 
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
      fetchEvents();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete event");
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesStatus = filter === "all" ? true : event.status === filter;
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch = 
        (event.event_name && event.event_name.toLowerCase().includes(lowerQuery)) ||
        (event.organisation_name && event.organisation_name.toLowerCase().includes(lowerQuery)) ||
        (event.location && event.location.toLowerCase().includes(lowerQuery));
    
    return matchesStatus && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  if (loading) {
    return <AdminTableSkeleton columns={5} rows={8} />;
  }

  const tabs = [
    { id: "all", label: "All", count: events.length },
    { id: "pending", label: "Pending", count: events.filter(e => e.status === 'pending').length },
    { id: "verified", label: "Verified", count: events.filter(e => e.status === 'verified').length },
    { id: "denied", label: "Denied", count: events.filter(e => e.status === 'denied').length },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl border border-border/40 overflow-x-auto">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={filter === tab.id}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  "ml-1.5 px-1.5 py-0.5 text-[10px] rounded",
                  filter === tab.id 
                    ? "bg-background/20 text-background" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {tab.count}
                </span>
              )}
            </TabButton>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="pl-9 h-10 bg-card/50 border-border/40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Event</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Organizer</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Date & Location</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Calendar className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No events found</p>
                  </td>
                </tr>
              ) : (
                currentItems.map((event) => (
                  <tr key={event.event_id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4">
                      <div className="min-w-0">
                        <Link 
                          href={`/lighthouse/events/${event.event_id}`}
                          className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {event.event_name}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <DollarSign className="w-3 h-3" />
                          {event.pricing_type === 'free'
                            ? 'Free'
                            : event.event_price != null
                              ? `₦${Number(event.event_price).toLocaleString()}`
                              : 'Paid'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                        {event.organisation_name}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate max-w-[150px]">{event.location}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          asChild
                        >
                          <Link href={`/lighthouse/events/${event.event_id}`}>
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </Link>
                        </Button>
                        
                        {event.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                              onClick={() => handleStatusUpdate(event.event_id, 'verified')}
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={() => handleStatusUpdate(event.event_id, 'denied')}
                              title="Deny"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {event.status === 'verified' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => handleStatusUpdate(event.event_id, 'denied')}
                            title="Revoke"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {event.status === 'denied' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                            onClick={() => handleStatusUpdate(event.event_id, 'verified')}
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
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredEvents.length)} of {filteredEvents.length}
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
