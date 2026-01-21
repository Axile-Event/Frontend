"use client";

import { useEffect, useState } from "react";
import { History, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { adminService } from "@/lib/admin";
import { toast } from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminTableSkeleton } from "@/components/skeletons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-component";

function ActionBadge({ action }) {
  const colors = {
    settings_update: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    user_disable: "bg-red-500/10 text-red-600 border-red-500/20",
    user_enable: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    organizer_verify: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    event_approve: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    event_deny: "bg-red-500/10 text-red-600 border-red-500/20",
    withdrawal_approve: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border ${colors[action] || 'bg-muted text-muted-foreground border-border'}`}>
      {action.replace(/_/g, ' ')}
    </span>
  );
}

export default function AuditLogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filterAction, setFilterAction] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = logs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(logs.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterAction]);

  if (loading) {
    return <AdminTableSkeleton columns={5} rows={8} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <div className="w-[220px]">
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="bg-card/50 border-border/40">
              <div className="flex items-center gap-2 text-sm">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
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

      <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Admin</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Action</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Target</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Details</th>
                <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <History className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No audit logs found</p>
                  </td>
                </tr>
              ) : (
                currentItems.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <p className="text-sm text-muted-foreground truncate max-w-[150px]">{log.admin_email}</p>
                    </td>
                    <td className="p-4">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{log.target_type}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">{log.target_id}</p>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell max-w-[280px]">
                      <pre className="text-[10px] text-muted-foreground bg-muted/30 p-2 rounded overflow-x-auto max-h-16">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                    <td className="p-4 text-right">
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border/40">
            <p className="text-xs text-muted-foreground">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, logs.length)} of {logs.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
