"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminService } from "@/lib/admin";
import { toast } from "react-hot-toast";
import { Loader2, Calendar, MapPin, DollarSign, User, Mail, Phone, ArrowLeft, CheckCircle, XCircle, Star, Trash2, Clock, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/utils";
import { EventDetailsSkeleton } from "@/components/skeletons";

export default function AdminEventDetailsPage() {
  const { event_id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (event_id) {
      fetchEventDetails();
    }
  }, [event_id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const data = await adminService.getEventDetails(event_id);
      
      // Attempt to fetch detailed organizer info if we have an ID
      // Assuming data.organizer is the User ID based on common API patterns
      if (data.organizer) {
          try {
              const organizerData = await adminService.getUserDetails(data.organizer, 'organizer');
              // Merge details
              data.organizer_email = organizerData.email;
              data.organizer_phone = organizerData.phone || organizerData.phone_number;
              data.organizer_id = data.organizer;
              // If organization_name was missing in event details but present in user profile
              if (!data.organisation_name && organizerData.name) {
                  data.organisation_name = organizerData.name;
              }
          } catch (orgError) {
              console.warn("Failed to fetch extended organizer details:", orgError);
          }
      }
      
      setEvent(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch event details");
      // router.push("/lighthouse/events");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this event as ${newStatus}?`)) return;

    try {
      // Optimistically update the UI to show the new status immediately
      setEvent((prev) => ({ ...prev, status: newStatus }));

      await adminService.updateEventStatus(event_id, newStatus);
      toast.success(`Event marked as ${newStatus}`);
      
      // We can optionally re-fetch, but if the API is slow to index, it might revert to old data.
      // For now, let's trust the optimistic update and the successful API call.
      // fetchEventDetails(); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to update event status");
      // Revert on error
      fetchEventDetails();
    }
  };



  const handleDeleteEvent = async () => {
    if (!window.confirm("Are you sure you want to PERMANENTLY DELETE this event? This action cannot be undone.")) return;

    try {
      await adminService.deleteEvent(event_id);
      toast.success("Event deleted successfully");
      router.push("/lighthouse/events");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete event");
    }
  };

  if (loading) {
    return <EventDetailsSkeleton />;
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4">
        <p className="text-muted-foreground">Event not found.</p>
        <Button onClick={() => router.push("/lighthouse/events")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
        </Button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100';
      case 'denied': return 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100 hover:bg-yellow-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/lighthouse/events")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
             <h1 className="text-2xl font-bold tracking-tight">Event Details</h1>
             <p className="text-sm text-muted-foreground">Manage and moderate this event.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">

            
            <Button variant="destructive" size="sm" onClick={handleDeleteEvent}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content: Info & Image */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Image Banner */}
            <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden bg-muted/30 border border-border">
              {event.image_url ? (
                <img 
                  src={getImageUrl(event.image_url)} 
                  alt={event.event_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Calendar className="w-16 h-16 opacity-20" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                 <Badge className={getStatusColor(event.status)}>
                   {event.status.toUpperCase()}
                 </Badge>
              </div>
            </div>

            <Card className="shadow-sm border-border">
               <CardHeader>
                  <CardTitle className="text-xl">About Event</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div>
                    <h3 className="tex-lg font-semibold mb-2">{event.event_name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {event.description || "No description provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                      <div className="flex items-start gap-3">
                         <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Calendar className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase">Date</p>
                            <p className="text-sm font-medium">{new Date(event.date).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-3">
                         <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Clock className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase">Time</p>
                            <p className="text-sm font-medium">{event.time || new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                         </div>
                      </div>
                       <div className="flex items-start gap-3">
                         <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <MapPin className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase">Location</p>
                            <p className="text-sm font-medium">{event.location}</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-3">
                         <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <DollarSign className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase">Pricing</p>
                            <p className="text-sm font-medium">
                              {event.pricing_type === 'free'
                                ? 'Free Event'
                                : event.event_price != null
                                  ? `₦${Number(event.event_price).toLocaleString()}`
                                  : 'Paid Event'}
                            </p>
                         </div>
                      </div>
                  </div>
               </CardContent>
            </Card>

             {event.ticket_tiers && event.ticket_tiers.length > 0 && (
              <Card className="shadow-sm border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Ticket Tiers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {event.ticket_tiers.map((tier, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                          <div className="flex items-center gap-3">
                             <Ticket className="w-4 h-4 text-muted-foreground" />
                             <div>
                               <p className="text-sm font-medium">{tier.name}</p>
                               <p className="text-xs text-muted-foreground">{tier.quantity} available</p>
                             </div>
                          </div>
                          <div className="text-sm font-bold">
                             {tier.price == 0 ? "Free" : `₦${Number(tier.price).toLocaleString()}`}
                          </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Sidebar: Organizer & Actions */}
        <div className="space-y-6">
            
            {/* Status Actions */}
            <Card className="shadow-sm border-border">
               <CardHeader>
                  <CardTitle className="text-base">Moderation</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg text-center mb-4">
                     <p className="text-xs text-muted-foreground mb-1">Current Status</p>
                     <Badge className={`text-sm ${getStatusColor(event.status)}`}>
                        {event.status.toUpperCase()}
                     </Badge>
                  </div>

                  <div className="grid gap-2">
                     {event.status === 'pending' && (
                        <>
                           <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusUpdate('verified')}>
                              <CheckCircle className="w-4 h-4 mr-2" /> Approve Event
                           </Button>
                           <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleStatusUpdate('denied')}>
                              <XCircle className="w-4 h-4 mr-2" /> Deny Event
                           </Button>
                        </>
                     )}
                     
                     {event.status === 'verified' && (
                        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleStatusUpdate('denied')}>
                           <XCircle className="w-4 h-4 mr-2" /> Revoke Verification
                        </Button>
                     )}

                     {event.status === 'denied' && (
                        <Button variant="outline" className="w-full text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleStatusUpdate('verified')}>
                           <CheckCircle className="w-4 h-4 mr-2" /> Reactivate Event
                        </Button>
                     )}
                  </div>
               </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card className="shadow-sm border-border">
               <CardHeader>
                  <CardTitle className="text-base">Organizer Details</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b">
                     <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="font-medium text-sm">{event.organisation_name || "Unknown Organizer"}</p>
                        <p className="text-xs text-muted-foreground">Organizer ID: {event.organizer_id}</p>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{event.organizer_email || "No email"}</span>
                     </div>
                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{event.organizer_phone || "No phone"}</span>
                     </div>
                  </div>
                  

               </CardContent>
            </Card>

            {/* Stats (Placeholder for now) */}
            <Card className="shadow-sm border-border">
               <CardHeader>
                  <CardTitle className="text-base">Quick Stats</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 bg-muted/40 rounded-lg text-center">
                        <p className="text-2xl font-bold">{event.tickets_sold || 0}</p>
                        <p className="text-xs text-muted-foreground">Tickets Sold</p>
                     </div>
                     <div className="p-3 bg-muted/40 rounded-lg text-center">
                        <p className="text-2xl font-bold">₦{Number(event.revenue || 0).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                     </div>
                  </div>
               </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}
