"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, Ticket, QrCode, Armchair } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col gap-1 md:gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Tickets</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          View and manage your booked tickets.
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

                  {/* QR Code Section */}
                  {ticket.status === "confirmed" && ticket.qr_code && (
                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg mt-2">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.qr_code}`}
                        alt="Ticket QR Code"
                        className="w-32 h-32 object-contain"
                      />
                      <p className="text-[10px] text-gray-500 mt-2 text-center font-mono">
                        {ticket.qr_code}
                      </p>
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
    </div>
  );
};

export default MyTicketsPage;
