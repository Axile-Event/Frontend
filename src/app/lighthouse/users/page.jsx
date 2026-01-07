
"use client";

import { useEffect, useState } from "react";
import { Loader2, User } from "lucide-react";
import { adminService } from "../../../lib/admin";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Note: The API currently supports getting organizers. 
    // Student list endpoint is not yet exposed in this version of the API docs.
    // Displaying Organizers as Users for now.
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Try to get real users (students)
      const usersData = await adminService.getAllUsers();
      
      // Handle various response structures
      let combinedUsers = [];
      if (Array.isArray(usersData)) {
        combinedUsers = usersData;
      } else if (usersData?.users) {
        combinedUsers = usersData.users;
      } else if (usersData?.students) {
        combinedUsers = usersData.students;
      }

      setUsers(combinedUsers);
    } catch (error) {
       console.error(error);
       toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      );
  }

  return (
    <div className="space-y-4">
       <div>
        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
        <p className="text-sm text-muted-foreground">
          View and manage registered users. (Currently showing Organizers)
        </p>
      </div>

       <Card className="shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
             <div className="border border-t-0">
             <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                <tr>
                   <th className="p-3 font-medium">User</th>
                   <th className="p-3 font-medium">Email</th>
                   <th className="p-3 font-medium">Role</th>
                   <th className="p-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-xs text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.organiser_id} className="hover:bg-muted/30 transition-colors text-xs">
                      <td className="p-3 flex items-center gap-2.5">
                         <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-gray-500" />
                         </div>
                         <div>
                            <div className="font-medium">
                              {user.full_name || user.username || user.organisation_name || "Unknown User"}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {user.id || user.user_id || user.organiser_id}
                            </div>
                         </div>
                      </td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border
                          ${user.organisation_name 
                            ? "bg-purple-50 text-purple-700 border-purple-100" 
                            : "bg-blue-50 text-blue-700 border-blue-100"
                          }`}>
                          {user.organisation_name ? "Organizer" : "Student"}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                         {new Date(user.created_at).toLocaleDateString()}
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
