
"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Phone, Building2, Search } from "lucide-react";
import { adminService } from "../../../lib/admin";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/skeletons";

export default function OrganizationsPage() {
  const [loading, setLoading] = useState(true);
  const [organizers, setOrganizers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const data = await adminService.getAllUsers({ role: 'organizer' });
      // API returns { users: [...], ... }
      setOrganizers(data.users || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrganizers = organizers.filter((org) => {
    const query = searchQuery.toLowerCase();
    return (
        (org.name && org.name.toLowerCase().includes(query)) ||
        (org.email && org.email.toLowerCase().includes(query))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrganizers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrganizers.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
      setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
          <div className="h-4 w-72 bg-muted animate-pulse rounded" />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organizations</h2>
          <p className="text-sm text-muted-foreground">
            Manage organizer accounts and view their performance.
          </p>
        </div>

         {/* Search Input */}
         <div className="relative w-full sm:w-64">
             <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
             <Input
                 placeholder="Search organizations..."
                 className="pl-8 h-9 bg-background"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
             />
         </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Registered Organizations ({organizers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                <tr>
                  <th className="p-3 font-medium">Organization</th>
                  <th className="p-3 font-medium">Contact</th>
                  <th className="p-3 font-medium">Events</th>
                  <th className="p-3 font-medium">Joined</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-xs text-muted-foreground">
                      No organizations found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((org) => (
                    <tr key={org.id} className="hover:bg-muted/30 transition-colors text-xs">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{org.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-muted-foreground" /> {org.email}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-muted-foreground" /> {org.phone || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {org.total_events || 0} Events
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(org.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <button 
                          className="text-primary hover:text-primary/80 font-medium transition-colors"
                          onClick={() => toast("View details feature coming soon")}
                        >
                          View
                        </button>
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
