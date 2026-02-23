"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  MoreVertical,
  Mail,
  Phone,
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  User,
} from "lucide-react";
import { adminService } from "@/lib/admin";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminTableSkeleton } from "@/components/skeletons";
import { AdminDataTable } from "@/components/ui/admin-data-table";
import { useConfirmModal } from "@/components/ui/confirmation-modal";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PAGE_SIZE = 20;

// ── Tab button ──
function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {children}
    </button>
  );
}

// ── Status badge ──
function ApplicationStatusBadge({ status }) {
  const config = {
    new: { label: "New", className: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Clock },
    reviewed: { label: "Reviewed", className: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Eye },
    shortlisted: { label: "Shortlisted", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle },
    rejected: { label: "Rejected", className: "bg-red-500/10 text-red-600 border-red-500/20", icon: XCircle },
    hired: { label: "Hired", className: "bg-violet-500/10 text-violet-600 border-violet-500/20", icon: CheckCircle },
  };
  const c = config[status] || config.new;
  const Icon = c.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border",
        c.className
      )}
    >
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

// ── Role type badge ──
function RoleTypeBadge({ roleType }) {
  const labels = {
    full_time: "Full-time",
    intern: "Intern",
    part_time: "Part-time",
    contract: "Contract",
  };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border bg-primary/10 text-primary border-primary/20">
      {labels[roleType] || roleType}
    </span>
  );
}

// ── Detail modal ──
function ApplicationDetailModal({ application, onClose }) {
  if (!application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto space-y-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">{application.full_name}</h3>
            <p className="text-sm text-muted-foreground">{application.position}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-1">Email</p>
            <p className="font-medium">{application.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Phone</p>
            <p className="font-medium">{application.phone || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Role Type</p>
            <RoleTypeBadge roleType={application.role_type} />
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Status</p>
            <ApplicationStatusBadge status={application.status} />
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Applied</p>
            <p className="font-medium">
              {application.created_at
                ? new Date(application.created_at).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>

        {application.cover_message && (
          <div>
            <p className="text-muted-foreground text-xs mb-1">Cover Message</p>
            <p className="text-sm bg-muted/50 rounded-xl p-4 leading-relaxed">{application.cover_message}</p>
          </div>
        )}

        {application.resume_url && (
          <a
            href={application.resume_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
          >
            <Download className="h-4 w-4" />
            Download Resume
          </a>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──
export default function AdminHiringPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({
    total_count: 0,
    total_pages: 1,
    page_size: PAGE_SIZE,
    current_page: 1,
    has_next: false,
    has_previous: false,
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState(null);
  const { confirm } = useConfirmModal();

  const fetchApplications = async (page = 1, status = filterStatus) => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      if (status !== "all") params.status = status;
      const data = await adminService.getHiringApplications(params);
      setApplications(data.hiring_applications || []);
      if (data.pagination) {
        setPagination({
          current_page: data.pagination.current_page,
          total_pages: data.pagination.total_pages,
          total_count: data.pagination.total_count,
          page_size: data.pagination.page_size,
          has_next: data.pagination.has_next,
          has_previous: data.pagination.has_previous,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(currentPage, filterStatus);
  }, [currentPage, filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const handleStatusChange = async (application, newStatus) => {
    const confirmed = await confirm({
      title: `Mark as ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      description: `Are you sure you want to update ${application.full_name}'s application to "${newStatus}"?`,
      confirmText: "Update",
      variant: newStatus === "rejected" ? "danger" : "success",
    });
    if (!confirmed) return;
    try {
      await adminService.updateHiringApplicationStatus(application.id || application.application_id, newStatus);
      toast.success(`Application marked as ${newStatus}`);
      fetchApplications(currentPage, filterStatus);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "new", label: "New" },
    { id: "reviewed", label: "Reviewed" },
    { id: "shortlisted", label: "Shortlisted" },
    { id: "hired", label: "Hired" },
    { id: "rejected", label: "Rejected" },
  ];

  const filteredApplications = applications.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (a.full_name && a.full_name.toLowerCase().includes(q)) ||
      (a.email && a.email.toLowerCase().includes(q)) ||
      (a.position && a.position.toLowerCase().includes(q))
    );
  });

  const statusActions = ["new", "reviewed", "shortlisted", "hired", "rejected"];

  const columns = [
    {
      key: "full_name",
      label: "Applicant",
      render: (_, app) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <span className="text-sm font-medium text-foreground block truncate max-w-[150px]">
              {app.full_name}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[150px] block">
              {app.position}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact",
      render: (_, app) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[180px]">{app.email}</span>
          </div>
          {app.phone && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
              <Phone className="w-3 h-3 shrink-0" />
              <span>{app.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "role_type",
      label: "Role Type",
      render: (_, app) => <RoleTypeBadge roleType={app.role_type} />,
    },
    {
      key: "status",
      label: "Status",
      render: (_, app) => <ApplicationStatusBadge status={app.status} />,
    },
    {
      key: "resume_url",
      label: "Resume",
      render: (_, app) =>
        app.resume_url ? (
          <a href={app.resume_url} target="_blank" rel="noopener noreferrer">
            <FileText className="h-4 w-4 text-primary hover:text-primary/80" />
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "created_at",
      label: "Applied",
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—",
    },
    {
      key: "id",
      label: "Actions",
      className: "text-right",
      render: (_, app) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSelectedApp(app)}>
              <Eye className="mr-2 h-4 w-4 text-blue-500" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Update Status
            </DropdownMenuLabel>
            {statusActions
              .filter((s) => s !== app.status)
              .map((s) => (
                <DropdownMenuItem key={s} onClick={() => handleStatusChange(app, s)}>
                  <ApplicationStatusIcon status={s} />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading && applications.length === 0) {
    return <AdminTableSkeleton columns={7} rows={8} />;
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-1 p-1 bg-muted/30 rounded-xl border border-border/40 overflow-x-auto">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={filterStatus === tab.id}
                onClick={() => setFilterStatus(tab.id)}
              >
                {tab.label}
              </TabButton>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, position..."
              className="pl-9 h-10 bg-card/50 border-border/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <AdminDataTable
          columns={columns}
          data={filteredApplications}
          pagination={pagination}
          loading={loading}
          onPageChange={setCurrentPage}
          emptyMessage={
            searchQuery.trim()
              ? "No applications match your search"
              : "No applications found"
          }
          emptyIcon={Briefcase}
        />
      </div>

      {selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </>
  );
}

// ── Helper: Status icon for dropdown ──
function ApplicationStatusIcon({ status }) {
  const icons = {
    new: <Clock className="mr-2 h-4 w-4 text-blue-500" />,
    reviewed: <Eye className="mr-2 h-4 w-4 text-amber-500" />,
    shortlisted: <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />,
    hired: <CheckCircle className="mr-2 h-4 w-4 text-violet-500" />,
    rejected: <XCircle className="mr-2 h-4 w-4 text-red-500" />,
  };
  return icons[status] || null;
}
