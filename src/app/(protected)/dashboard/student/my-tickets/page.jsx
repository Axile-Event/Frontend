"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, Ticket, QrCode, Armchair } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const [selectedTicket, setSelectedTicket] = useState(null);

  // ... (existing getStatusColor function) ...

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0 relative">
      <div className="flex flex-col gap-1 md:gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Tickets</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          View and manage your booked tickets. Click on a ticket to view it full screen.
        </p>
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
      ) : (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket, index) => (
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
                    {ticket.seat_number && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Armchair className="h-4 w-4 shrink-0" />
                        <span>Seat: {ticket.seat_number}</span>
                      </div>
                    )}
                  </div>

                  {/* Small QR Code Preview */}
                  {ticket.status === "confirmed" && ticket.qr_code && (
                    <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg mt-2 opacity-50">
                      <QrCode className="h-8 w-8 text-black" />
                      <span className="text-[10px] text-black mt-1">Click to expand</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/50 pt-4">
                  <div className="flex justify-between items-center w-full text-sm">
                    <span className="text-muted-foreground">
                      {ticket.quantity} {ticket.quantity === 1 ? "Ticket" : "Tickets"}
                    </span>
                    <span className="font-bold text-lg">
                      {ticket.total_price > 0 ? `₦${ticket.total_price}` : "Free"}
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

                <div className="p-6 md:p-8 flex flex-col items-center text-center space-y-6 bg-gradient-to-b from-primary/5 to-transparent">
                    
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
                    {selectedTicket.status === "confirmed" && selectedTicket.qr_code ? (
                        <div className="bg-white p-4 rounded-2xl shadow-inner w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
                            <QRCodeSVG
                                value={selectedTicket.qr_code}
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

                    {/* Ticket Code & Seat */}
                    <div className="w-full grid grid-cols-2 gap-4">
                        <div className="bg-muted/10 p-3 rounded-xl border border-border/50">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Ticket ID</p>
                            <p className="text-lg font-mono font-bold">{selectedTicket.ticket_id.split(":")[1] || "N/A"}</p>
                        </div>
                         <div className="bg-muted/10 p-3 rounded-xl border border-border/50">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Seat</p>
                            <p className="text-lg font-bold">{selectedTicket.seat_number || "General"}</p>
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
