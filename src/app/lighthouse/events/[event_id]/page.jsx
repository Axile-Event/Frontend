"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminService } from "@/lib/admin";
import { toast } from "react-hot-toast";
import { Calendar, MapPin, DollarSign, User, Mail, Phone, ArrowLeft, CheckCircle, XCircle, Trash2, Clock, Ticket, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getImageUrl, cn, formatCurrency } from "@/lib/utils";
import { AdminEventDetailsSkeleton } from "@/components/skeletons";
import { useConfirmModal } from "@/components/ui/confirmation-modal";

function StatusBadge({ status, size = "default" }) {
  const config = {
    verified: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    denied: "bg-red-500/10 text-red-600 border-red-500/20",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };
  
  return (
    <span className={cn(
      "inline-flex items-center rounded font-semibold uppercase tracking-wide border",
      config[status] || config.pending,
      size === "lg" ? "px-3 py-1.5 text-xs" : "px-2 py-0.5 text-[10px]"
    )}>
      {status}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function AdminEventDetailsPage() {
  const { event_id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const { confirm } = useConfirmModal();

  useEffect(() => {
    if (event_id) {
      fetchEventDetails();
    }
  }, [event_id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const data = await adminService.getEventDetails(event_id);
      
      if (data.organizer) {
        try {
          const organizerData = await adminService.getUserDetails(data.organizer, 'organizer');
          data.organizer_email = organizerData.email;
          data.organizer_phone = organizerData.phone || organizerData.phone_number;
          data.organizer_id = data.organizer;
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
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
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
      setEvent((prev) => ({ ...prev, status: newStatus }));
      await adminService.updateEventStatus(event_id, newStatus);
      toast.success(`Event marked as ${newStatus}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update event status");
      fetchEventDetails();
    }
  };

  const handleDeleteEvent = async () => {
    const confirmed = await confirm({
      title: "Delete Event",
      description: "Are you sure you want to permanently delete this event? This action cannot be undone and all associated tickets will be removed.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

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
    return <AdminEventDetailsSkeleton />;
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Calendar className="w-12 h-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">Event not found</p>
        <Button variant="outline" onClick={() => router.push("/lighthouse/events")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push("/lighthouse/events")}
          className="h-9 w-9"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate">{event.event_name}</h1>
          <p className="text-sm text-muted-foreground">{event.organisation_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={event.status} size="lg" />
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleDeleteEvent}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden bg-muted/30 border border-border/40">
            {event.image_url ? (
              <img 
                src={getImageUrl(event.image_url)} 
                alt={event.event_name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Calendar className="w-16 h-16 text-muted-foreground/20" />
              </div>
            )}
          </div>

          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow 
                  icon={Calendar} 
                  label="Date" 
                  value={new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} 
                />
                <InfoRow 
                  icon={Clock} 
                  label="Time" 
                  value={event.time || new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                />
                <InfoRow 
                  icon={MapPin} 
                  label="Location" 
                  value={event.location} 
                />
                <InfoRow 
                  icon={DollarSign} 
                  label="Pricing" 
                  value={event.pricing_type === 'free' ? 'Free Event' : event.event_price != null ? formatCurrency(event.event_price) : 'Paid Event'} 
                />
              </div>

              {event.description && (
                <div className="pt-4 border-t border-border/40">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {event.ticket_tiers && event.ticket_tiers.length > 0 && (
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Ticket Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {event.ticket_tiers.map((tier, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                      <div className="flex items-center gap-3 min-w-0">
                        <Ticket className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{tier.name}</p>
                          <p className="text-xs text-muted-foreground">{tier.quantity} available</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {tier.price == 0 ? "Free" : formatCurrency(tier.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Moderation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/30 text-center border border-border/40">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Current Status</p>
                <StatusBadge status={event.status} size="lg" />
              </div>

              <div className="grid gap-2">
                {event.status === 'pending' && (
                  <>
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                      onClick={() => handleStatusUpdate('verified')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve Event
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 border-red-500/30 hover:bg-red-500/10" 
                      onClick={() => handleStatusUpdate('denied')}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Deny Event
                    </Button>
                  </>
                )}
                
                {event.status === 'verified' && (
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 border-red-500/30 hover:bg-red-500/10" 
                    onClick={() => handleStatusUpdate('denied')}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Revoke Verification
                  </Button>
                )}

                {event.status === 'denied' && (
                  <Button 
                    variant="outline" 
                    className="w-full text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10" 
                    onClick={() => handleStatusUpdate('verified')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Reactivate Event
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Organizer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{event.organisation_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">ID: {event.organizer_id}</p>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-border/40">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate">{event.organizer_email || "No email"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{event.organizer_phone || "No phone"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-muted/30 text-center border border-border/40">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xl font-semibold text-foreground">{event.tickets_sold || 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tickets Sold</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 text-center border border-border/40">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xl font-semibold text-foreground">{formatCurrency(event.revenue || 0)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
