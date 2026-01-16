"use client";

import { useEffect, useState } from "react";
import { Loader2, Ticket, QrCode } from "lucide-react";
import { adminService } from "@/lib/admin";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";

export default function TicketsPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      
      const data = await adminService.getAllTickets(params);
      setTickets(data.tickets || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const statuses = ["all", "confirmed", "pending", "checked_in", "cancelled"];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tickets.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  return (
    <div className="space-y-4">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tickets</h2>
          <p className="text-sm text-muted-foreground">
            View all tickets sold across the platform.
          </p>
        </div>
        <div className="flex gap-2 bg-muted p-1 rounded-lg overflow-x-auto">
          {statuses.map((status) => (
            <button
               key={status}
               onClick={() => setStatusFilter(status)}
               className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                 statusFilter === status 
                   ? "bg-primary text-primary-foreground shadow" 
                   : "text-muted-foreground hover:text-foreground"
               }`}
             >
               {status.charAt(0).toUpperCase() + status.slice(1)}
             </button>
          ))}
        </div>
      </div>

       <Card className="shadow-sm border-white/10">
         <CardContent className="p-0">
           <div className="border-t-0 overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                 <tr>
                   <th className="p-3 font-medium whitespace-nowrap">Ticket ID</th>
                   <th className="p-3 font-medium whitespace-nowrap">Event</th>
                   <th className="p-3 font-medium whitespace-nowrap">Student</th>
                   <th className="p-3 font-medium whitespace-nowrap">Status</th>
                   <th className="p-3 font-medium whitespace-nowrap">Price</th>
                   <th className="p-3 font-medium whitespace-nowrap text-right">Sold At</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-4">
                        <TableSkeleton />
                      </td>
                    </tr>
                  )
 : currentItems.length === 0 ? (
                   <tr>
                     <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground">
                       No tickets found.
                     </td>
                   </tr>
                 ) : (
                   currentItems.map((t) => (
                     <tr key={t.ticket_id} className="hover:bg-muted/30 transition-colors text-xs">
                       <td className="p-3 font-mono text-muted-foreground">
                         <div className="flex items-center gap-2">
                            <Ticket className="w-3 h-3" />
                            {t.ticket_id}
                         </div>
                       </td>
                       <td className="p-3">
                         <div className="font-medium truncate max-w-[150px]">{t.event_name}</div>
                         <div className="text-[10px] text-muted-foreground">{t.event_id}</div>
                       </td>
                       <td className="p-3">
                         <div className="font-medium">{t.student_name}</div>
                         <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">{t.student_email}</div>
                       </td>
                       <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wide ${
                            t.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-100' :
                            t.status === 'checked_in' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            t.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-100' :
                            'bg-yellow-50 text-yellow-700 border border-yellow-100'
                          }`}>
                            {t.status}
                          </span>
                       </td>
                       <td className="p-3">
                         <div className="font-medium text-muted-foreground">Individual</div>
                         <div className="text-foreground font-semibold">₦{Number(t.total_price).toLocaleString()}</div>
                       </td>
                       <td className="p-3 text-right text-muted-foreground whitespace-nowrap">
                         {new Date(t.created_at).toLocaleDateString()}
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
         </CardContent>
       </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          <span className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
