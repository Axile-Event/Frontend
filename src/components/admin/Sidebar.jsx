
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CalendarDays, 
  Ticket, 
  BarChart3, 
  LogOut,
  CreditCard,
  Settings,
  History,
  Banknote
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { adminService } from "@/lib/admin";

const sidebarItems = [
  {
    title: "Overview",
    href: "/lighthouse/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/lighthouse/users",
    icon: Users,
  },
  {
    title: "Events",
    href: "/lighthouse/events",
    icon: CalendarDays,
  },
  {
    title: "Tickets",
    href: "/lighthouse/tickets",
    icon: Ticket,
  },
  {
    title: "Payout Requests",
    href: "/lighthouse/payout-requests",
    icon: Banknote,
    showBadge: true,
  },
  {
    title: "Transactions",
    href: "/lighthouse/withdrawals",
    icon: CreditCard,
  },
  {
    title: "Revenue",
    href: "/lighthouse/revenue",
    icon: BarChart3,
  },
  {
    title: "System Settings",
    href: "/lighthouse/settings",
    icon: Settings,
  },
  {
    title: "Audit Logs",
    href: "/lighthouse/audit-logs",
    icon: History,
  },
];

export function AdminSidebar({ className }) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await adminService.getPayoutNotifications();
        setPendingCount(data.pending_count || 0);
      } catch (error) {
        console.error("Failed to fetch payout notifications", error);
      }
    };

    fetchNotifications();
    // Poll every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col w-56 border-r bg-card h-full ${className || ''}`}>
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          TreEvents Admin
        </h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.title}</span>
              {item.showBadge && pendingCount > 0 && (
                <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 w-full rounded-md text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
