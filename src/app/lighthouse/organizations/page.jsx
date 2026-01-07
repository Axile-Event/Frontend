
"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Phone, Building2 } from "lucide-react";
import { adminService } from "../../../lib/admin";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

export default function OrganizationsPage() {
  const [loading, setLoading] = useState(true);
  const [organizers, setOrganizers] = useState([]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organizations</h2>
          <p className="text-sm text-muted-foreground">
            Manage organizer accounts and view their performance.
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Registered Organizations ({organizers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t">
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
                {organizers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-xs text-muted-foreground">
                      No organizations found.
                    </td>
                  </tr>
                ) : (
                  organizers.map((org) => (
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
    </div>
  );
}
