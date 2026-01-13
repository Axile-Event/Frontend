
"use client";

import { useEffect, useState } from "react";
import { Loader2, User, MoreVertical, Trash2, Ban, CheckCircle, ShieldCheck, Mail, Search } from "lucide-react";
import { adminService } from "../../../lib/admin";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
    if (!confirm(`Are you sure you want to ${user.is_active ? 'DISABLE' : 'ENABLE'} this user?`)) return;
    try {
      const role = user.role || 'student'; // Default fallback
      await adminService.toggleUserStatus(user.id, role, !user.is_active);
      toast.success(`User ${user.is_active ? 'disabled' : 'enabled'}`);
      fetchUsers(filterRole);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const handleVerifyOrganizer = async (user) => {
    if (user.role !== 'organizer') return;
    if (!confirm(`Are you sure you want to ${user.is_verified ? 'UNVERIFY' : 'VERIFY'} this organizer?`)) return;

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
    if (!confirm("Are you sure you want to PERMANENTLY DELETE this user? This action cannot be undone.")) return;
    
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRole, searchQuery]);

  return (
    <div className="space-y-4">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h2 className="text-2xl font-bold tracking-tight">Users</h2>
            <p className="text-sm text-muted-foreground">
            View and manage registered users.
            </p>
         </div>

         {/* Search Input */}
         <div className="relative w-full sm:w-64">
             <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
             <Input
                 placeholder="Search users..."
                 className="pl-8 h-9 bg-background"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
             />
         </div>
      </div>

       <div className="flex p-1 bg-muted/40 rounded-lg w-fit border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id)}
              className={`
                px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200
                ${filterRole === tab.id 
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
       </div>

       <Card className="shadow-sm border-border">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-base flex items-center justify-between">
            <span>
              {filterRole === 'all' ? 'All Users' : filterRole === 'student' ? 'Students' : 'Organizers'} 
              <span className="ml-2 text-xs font-normal text-muted-foreground">({users.length})</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
             <div className="border-t-0 overflow-x-auto">
             <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                <tr>
                   <th className="p-3 font-medium whitespace-nowrap">User</th>
                   <th className="p-3 font-medium whitespace-nowrap">Email</th>
                   <th className="p-3 font-medium whitespace-nowrap hidden md:table-cell">Role</th>
                   <th className="p-3 font-medium whitespace-nowrap hidden lg:table-cell">Status</th>
                   <th className="p-3 font-medium whitespace-nowrap hidden lg:table-cell">Joined</th>
                   <th className="p-3 font-medium whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-xs text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors text-xs">
                      <td className="p-3">
                         <div className="flex items-center gap-2.5 min-w-[140px]">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                                <div className="font-medium truncate max-w-[120px] md:max-w-none flex items-center gap-1">
                                  {user.name || "Unknown User"}
                                  {user.role === 'organizer' && user.is_verified && (
                                    <ShieldCheck className="w-3 h-3 text-blue-500 fill-blue-100" />
                                  )}
                                </div>
                            </div>
                         </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="max-w-[150px] md:max-w-none truncate flex items-center gap-1" title={user.email}>
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          {user.email}
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border
                          ${user.role === 'organizer'
                            ? "bg-purple-50 text-purple-700 border-purple-100" 
                            : "bg-blue-50 text-blue-700 border-blue-100"
                          }`}>
                          {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : "Student"}
                        </span>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                         {user.is_active === false ? (
                           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-red-50 text-red-700 border border-red-100">
                             Disabled
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-green-50 text-green-700 border border-green-100">
                             Active
                           </span>
                         )}
                      </td>
                      <td className="p-3 text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                         {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            
                            <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                              {user.is_active === false ? (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Enable Account
                                </>
                              ) : (
                                <>
                                  <Ban className="mr-2 h-4 w-4 text-orange-600" />
                                  Disable Account
                                </>
                              )}
                            </DropdownMenuItem>
                            
                            {user.role === 'organizer' && (
                              <DropdownMenuItem onClick={() => handleVerifyOrganizer(user)}>
                                <ShieldCheck className="mr-2 h-4 w-4 text-blue-600" />
                                {user.is_verified ? 'Unverify Organizer' : 'Verify Organizer'}
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-red-600 focus:text-red-700 focus:bg-red-50">
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
