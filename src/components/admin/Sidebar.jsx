"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
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
    title: "Dashboard",
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
    title: "Settings",
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
    <div className={cn(
      "flex flex-col w-60 border-r border-border/40 bg-card/50 backdrop-blur-sm h-full",
      className
    )}>
      <div className="p-5 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background font-bold text-sm">T</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Axile</h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Admin Console</p>
          </div>
        </div>
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

      <div className="p-3 border-t border-border/40 mt-auto">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
