"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, Ticket, QrCode, Search } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

import { TicketsPageSkeleton } from "@/components/skeletons";

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // Add search state

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get("/tickets/my-tickets/");
        setTickets(response.data.tickets || []);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "used":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.ticket_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [selectedTicket, setSelectedTicket] = useState(null);

  // ... (existing getStatusColor function) ...

  if (loading) {
    return <TicketsPageSkeleton />;
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Tickets</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            View and manage your booked tickets. Each ticket has a unique QR code for check-in.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tickets..." 
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-3 md:space-y-4 text-center border rounded-2xl bg-muted/10 border-dashed p-4">
          <div className="p-3 md:p-4 rounded-full bg-muted">
            <Ticket className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground" />
          </div>
          <div className="space-y-1 md:space-y-2">
            <h3 className="text-lg md:text-xl font-bold">No Tickets Yet</h3>
            <p className="text-xs md:text-base text-muted-foreground max-w-sm mx-auto">
              You haven't booked any events yet. Browse our events to find something interesting!
            </p>
          </div>
          <Link href="/dashboard/student/events">
            <Button className="h-9 md:h-10 text-sm md:text-base">Explore Events</Button>
          </Link>
        </div>
      ) : filteredTickets.length === 0 ? (
         <div className="text-center py-12 border rounded-xl bg-muted/5 border-dashed">
            <p className="text-muted-foreground">No tickets found matching "{searchQuery}"</p>
            <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2 text-primary">Clear Search</Button>
         </div>
      ) : (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTickets.map((ticket, index) => (
            <motion.div
              key={ticket.ticket_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setSelectedTicket(ticket)}
              className="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
            >
              <Card className="h-full flex flex-col overflow-hidden border-l-4 border-l-primary">
                <CardHeader className="pb-2 p-4 md:p-6">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="line-clamp-1 text-base md:text-lg">
                      {ticket.event_name}
                    </CardTitle>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium border ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <CardDescription className="text-[10px] md:text-xs">
                    ID: {ticket.ticket_id.split(":")[1]}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>
                        {new Date(ticket.event_date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="line-clamp-1">{ticket.event_location}</span>
                    </div>
                  </div>

                  {/* Small QR Code Preview - Show actual QR code */}
                  {ticket.status === "confirmed" && ticket.ticket_id && (
                    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg mt-2 hover:bg-gray-50 transition-colors relative group">
                      <QRCodeSVG
                        value={ticket.ticket_id}
                        size={80}
                        level={"H"}
                        marginSize={0}
                      />
                      <div className="flex items-center gap-1 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black opacity-60">
                          <circle cx="11" cy="11" r="8"/>
                          <path d="m21 21-4.35-4.35"/>
                          <line x1="11" y1="8" x2="11" y2="14"/>
                          <line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                        <span className="text-[10px] text-black opacity-80">Click to expand</span>
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-colors pointer-events-none" />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/50 pt-4">
                  <div className="flex justify-between items-center w-full text-sm">
                    <span className="text-muted-foreground">
                      Individual Ticket
                    </span>
                    <span className="font-bold text-lg">
                      {ticket.total_price > 0 ? `₦${parseFloat(ticket.total_price).toLocaleString()}` : "Free"}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Full Screen Ticket Modal */}
      {selectedTicket && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedTicket(null)}
        >
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()} 
                className="bg-background w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative border border-border"
            >
                {/* Close Button */}
                <button 
                    onClick={() => setSelectedTicket(null)}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors z-10"
                >
                    <span className="sr-only">Close</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>

                <div className="p-6 md:p-8 flex flex-col items-center text-center space-y-6 bg-linear-to-b from-primary/5 to-transparent">
                    
                    {/* Event Details */}
                    <div className="space-y-2">
                        <h2 className="text-2xl md:text-3xl font-bold leading-tight">{selectedTicket.event_name}</h2>
                        <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(selectedTicket.event_date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                             <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {selectedTicket.event_location}
                            </span>
                        </div>
                    </div>

                    {/* QR Code Area - Bright and Big */}
                    {selectedTicket.status === "confirmed" && selectedTicket.ticket_id ? (
                        <div className="bg-white p-4 rounded-2xl shadow-inner w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
                            <QRCodeSVG
                                value={selectedTicket.ticket_id}
                                size={256}
                                className="w-full h-full"
                                level={"H"}
                                marginSize={0}
                            />
                        </div>
                    ) : (
                        <div className="w-64 h-64 bg-muted/20 rounded-2xl flex items-center justify-center border-2 border-dashed border-muted">
                            <p className="text-muted-foreground">QR Code Unavailable</p>
                        </div>
                    )}

                    {/* Ticket Code */}
                    <div className="w-full">
                        <div className="bg-muted/10 p-3 rounded-xl border border-border/50">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Ticket ID</p>
                            <p className="text-lg font-mono font-bold">{selectedTicket.ticket_id.split(":")[1] || "N/A"}</p>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="text-sm text-muted-foreground pt-4 border-t w-full">
                        <p>Show this code at the entrance</p>
                        <p className={`mt-2 font-medium capitalize ${
                            selectedTicket.status === 'confirmed' ? 'text-green-500' : 'text-yellow-500'
                        }`}>
                            Status: {selectedTicket.status}
                        </p>
                    </div>

                </div>
            </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;
