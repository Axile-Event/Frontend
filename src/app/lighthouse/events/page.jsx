
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Calendar, MapPin, DollarSign, CheckCircle, XCircle, Star, Trash2 } from "lucide-react";
import { adminService } from "../../../lib/admin";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

export default function EventsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");

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
    if (!window.confirm(`Are you sure you want to mark this event as ${newStatus}?`)) return;

    try {
      await adminService.updateEventStatus(eventId, newStatus);
      toast.success(`Event marked as ${newStatus}`);
      fetchEvents(); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to update event status");
    }
  };

  const handleToggleFeatured = async (eventId, currentStatus) => {
    try {
      await adminService.toggleEventFeatured(eventId, !currentStatus);
      toast.success(currentStatus ? "Removed from featured" : "Added to featured");
      fetchEvents();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update featured status");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to DELETE this event? This action cannot be undone.")) return;

    try {
      await adminService.deleteEvent(eventId);
      toast.success("Event deleted successfully");
      fetchEvents();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete event");
    }
  };

  const filteredEvents = events.filter(event => 
    filter === "all" ? true : event.status === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Events</h2>
          <p className="text-sm text-muted-foreground">
            Monitor and moderate all events on the platform.
          </p>
        </div>
        <div className="flex gap-2 bg-muted p-1 rounded-lg self-start">
          {["all", "pending", "verified", "denied"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                filter === status 
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
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                <tr>
                  <th className="p-3 font-medium">Event Name</th>
                  <th className="p-3 font-medium">Organizer</th>
                  <th className="p-3 font-medium">Date & Location</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-xs text-muted-foreground">
                      No events found matching this filter.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr key={event.event_id} className="hover:bg-muted/30 transition-colors text-xs">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                           {event.is_featured && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                           <div className="font-medium">
                              <Link href={`/dashboard/student/events/${event.event_id}`} className="hover:underline hover:text-primary transition-colors">
                                {event.event_name}
                              </Link>
                           </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <DollarSign className="w-3 h-3" /> 
                          {event.pricing_type === 'free' ? 'Free' : `₦${event.price}`}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {event.organisation_name}
                      </td>
                      <td className="p-3">
                         <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-3 w-3" /> 
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3 w-3" /> 
                            {event.location}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wide ${
                          event.status === 'verified' ? 'bg-green-50 text-green-700 border border-green-100' :
                          event.status === 'denied' ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-yellow-50 text-yellow-700 border border-yellow-100'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                             size="sm" 
                             variant="ghost"
                             className={`h-7 w-7 p-0 ${event.is_featured ? 'text-yellow-600 bg-yellow-50' : 'text-gray-400 hover:text-yellow-600'}`}
                             onClick={() => handleToggleFeatured(event.event_id, event.is_featured)}
                             title={event.is_featured ? "Unfeature" : "Feature"}
                           >
                             <Star className={`w-4 h-4 ${event.is_featured ? 'fill-current' : ''}`} />
                           </Button>

                          {event.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 h-7 w-7 p-0"
                                onClick={() => handleStatusUpdate(event.event_id, 'verified')}
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0"
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
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                                onClick={() => handleStatusUpdate(event.event_id, 'denied')}
                                title="Revoke Verification"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                          )}
                          {event.status === 'denied' && (
                             <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 h-7 w-7 p-0"
                                onClick={() => handleStatusUpdate(event.event_id, 'verified')}
                                title="Re-approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                          )}
                          <Button 
                             size="sm" 
                             variant="ghost"
                             className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                             onClick={() => handleDeleteEvent(event.event_id)}
                             title="Delete Event"
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
        </CardContent>
      </Card>
    </div>
  );
}
