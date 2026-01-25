"use client";

import { useEffect, useState } from "react";
import { User, MoreVertical, Trash2, Ban, CheckCircle, ShieldCheck, Mail, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { adminService } from "../../../lib/admin";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminTableSkeleton } from "@/components/skeletons";
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

function StatusBadge({ active }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border",
      active === false
        ? "bg-red-500/10 text-red-600 border-red-500/20"
        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    )}>
      {active === false ? "Disabled" : "Active"}
    </span>
  );
}

function RoleBadge({ role }) {
  const isOrganizer = role?.toLowerCase() === 'organizer';
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border",
      isOrganizer
        ? "bg-violet-500/10 text-violet-600 border-violet-500/20"
        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
    )}>
      {role ? role.charAt(0).toUpperCase() + role.slice(1) : "Student"}
    </span>
  );
}

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const { confirm } = useConfirmModal();

  useEffect(() => {
    fetchUsers(filterRole);
  }, [filterRole]);

  const fetchUsers = async (role) => {
    setLoading(true);
    setUsers([]); 
    try {
      const params = {};
      if (role !== "all") {
        params.role = role;
      }
      
      const usersData = await adminService.getAllUsers(params);
      
      let combinedUsers = [];
      if (usersData?.users) {
        combinedUsers = usersData.users;
      } else if (Array.isArray(usersData)) {
        combinedUsers = usersData;
      }

      setUsers(combinedUsers);
    } catch (error) {
       console.error(error);
       toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const isDisabling = user.is_active;
    const confirmed = await confirm({
      title: isDisabling ? "Disable Account" : "Enable Account",
      description: `Are you sure you want to ${isDisabling ? 'disable' : 'enable'} this user's account? ${isDisabling ? 'They will lose access to the platform.' : 'They will regain access to the platform.'}`,
      confirmText: isDisabling ? "Disable" : "Enable",
      variant: isDisabling ? "warning" : "success",
    });
    if (!confirmed) return;
    
    try {
      const role = user.role || 'student';
      await adminService.toggleUserStatus(user.id, role, !user.is_active);
      toast.success(`User ${user.is_active ? 'disabled' : 'enabled'}`);
      fetchUsers(filterRole);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const handleVerifyOrganizer = async (user) => {
    if (user.role?.toLowerCase() !== 'organizer') return;
    
    const isUnverifying = user.is_verified;
    const confirmed = await confirm({
      title: isUnverifying ? "Remove Verification" : "Verify Organizer",
      description: `Are you sure you want to ${isUnverifying ? 'remove verification from' : 'verify'} this organizer? ${isUnverifying ? 'Their verified badge will be removed.' : 'They will receive a verified badge.'}`,
      confirmText: isUnverifying ? "Remove Verification" : "Verify",
      variant: isUnverifying ? "warning" : "success",
    });
    if (!confirmed) return;

    try {
      await adminService.verifyOrganizer(user.id, !user.is_verified);
      toast.success(`Organizer ${user.is_verified ? 'unverified' : 'verified'}`);
      fetchUsers(filterRole);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update verification");
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = await confirm({
      title: "Delete Account",
      description: "Are you sure you want to permanently delete this user? This action cannot be undone and all associated data will be lost.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;
    
    try {
      const role = user.role || 'student';
      await adminService.deleteUser(user.id, role);
      toast.success("User deleted successfully");
      fetchUsers(filterRole);
    } catch (error) {
       console.error(error);
       toast.error("Failed to delete user");
    }
  };

  const tabs = [
    { id: "all", label: "All Users" },
    { id: "student", label: "Students" },
    { id: "organizer", label: "Organizers" },
  ];

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRole, searchQuery]);

  if (loading) {
    return <AdminTableSkeleton columns={6} rows={8} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl border border-border/40">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={filterRole === tab.id}
              onClick={() => setFilterRole(tab.id)}
            >
              {tab.label}
            </TabButton>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9 h-10 bg-card/50 border-border/40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">User</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Joined</th>
                <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <User className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No users found</p>
                  </td>
                </tr>
              ) : (
                currentItems.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-foreground truncate max-w-[150px]">
                              {user.name || "Unknown User"}
                            </p>
                            {user.role?.toLowerCase() === 'organizer' && user.is_verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[200px]">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="p-4">
                      <StatusBadge active={user.is_active} />
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                            {user.is_active === false ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                                Enable Account
                              </>
                            ) : (
                              <>
                                <Ban className="mr-2 h-4 w-4 text-amber-500" />
                                Disable Account
                              </>
                            )}
                          </DropdownMenuItem>
                          
                          {user.role?.toLowerCase() === 'organizer' && (
                            <DropdownMenuItem onClick={() => handleVerifyOrganizer(user)}>
                              <ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />
                              {user.is_verified ? 'Remove Verification' : 'Verify Organizer'}
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user)} 
                            className="text-red-600 focus:text-red-700 focus:bg-red-500/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length}
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
