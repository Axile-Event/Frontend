"use client";

import { useEffect, useState } from "react";
import { Loader2, History, Filter } from "lucide-react";
import { adminService } from "@/lib/admin";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-component";

export default function AuditLogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filterAction, setFilterAction] = useState("all");
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterAction !== "all") params.action = filterAction;
      
      const data = await adminService.getAuditLogs(params);
      setLogs(data.logs || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    { value: "all", label: "All Actions" },
    { value: "settings_update", label: "Settings Update" },
    { value: "user_disable", label: "User Disabled" },
    { value: "user_enable", label: "User Enabled" },
    { value: "organizer_verify", label: "Organizer Verified" },
    { value: "event_approve", label: "Event Approved" },
    { value: "event_deny", label: "Event Denied" },
    { value: "withdrawal_approve", label: "Withdrawal Approved" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-sm text-muted-foreground">
            Track administrative actions and system changes.
          </p>
        </div>
        <div className="w-[200px]">
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger>
              <div className="flex items-center gap-2 text-muted-foreground">
                 <Filter className="w-3 h-3" />
                 <SelectValue placeholder="Filter by action" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {actions.map((action) => (
                <SelectItem key={action.value} value={action.value}>
                  {action.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-sm border-border">
         <CardContent className="p-0">
            <div className="border-t-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                  <tr>
                    <th className="p-3 font-medium whitespace-nowrap">Admin</th>
                    <th className="p-3 font-medium whitespace-nowrap">Action</th>
                    <th className="p-3 font-medium whitespace-nowrap">Target</th>
                    <th className="p-3 font-medium whitespace-nowrap">Details</th>
                    <th className="p-3 font-medium whitespace-nowrap text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center">
                         <div className="flex flex-col items-center justify-center gap-2">
                           <Loader2 className="w-6 h-6 animate-spin text-primary" />
                         </div>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-muted-foreground">
                        No audit logs found.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors text-xs">
                        <td className="p-3 font-medium text-muted-foreground">
                          {log.admin_email}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800 border border-gray-200 uppercase tracking-wider">
                            {log.action.replace(/_/g, " ")}
                          </span>
                        </td>
                         <td className="p-3 text-muted-foreground">
                           <div className="flex flex-col">
                             <span className="font-medium text-foreground">{log.target_type}</span>
                             <span className="text-[10px] opacity-70">{log.target_id}</span>
                           </div>
                        </td>
                        <td className="p-3 max-w-[300px]">
                           <pre className="text-[10px] bg-muted/50 p-1.5 rounded overflow-x-auto">
                             {JSON.stringify(log.details, null, 2)}
                           </pre>
                        </td>
                        <td className="p-3 text-right text-muted-foreground whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
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
