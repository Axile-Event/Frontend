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
import Logo from "../Logo";

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
    label: "Finance",
    items: [
      {
        title: "Payout Requests",
        href: "/lighthouse/payouts",
        icon: Banknote,
        showBadge: true,
      },
      {
        title: "Withdrawals",
        href: "/lighthouse/withdrawals",
        icon: History,
      },
      {
        title: "Revenue",
        href: "/lighthouse/revenue",
        icon: BarChart3,
      },
    ]
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

  const renderLink = (item) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm",
          isActive
            ? "bg-primary/10 text-primary font-medium shadow-xs"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground/70")} />
        <span className="flex-1">{item.title}</span>
        {item.showBadge && pendingCount > 0 && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full min-w-[18px] text-center">
            {pendingCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className={cn(
      "flex flex-col w-60 border-r border-border/40 bg-card/50 backdrop-blur-sm h-full",
      className
    )}>
      <div className="h-16 border-b border-border/40 flex items-center justify-center overflow-hidden">
        <Link href="/lighthouse/dashboard" className="hover:opacity-80 transition-opacity">
          <Logo 
            iconSize="h-28 w-auto" 
            style={{ marginTop: '-20px', marginBottom: '-20px' }}
          />
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        <div className="space-y-1">
          {sidebarItems.map((item, index) => {
            if (item.items) {
              return (
                <div key={item.label || index} className="pt-2">
                  <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                    {item.label}
                  </p>
                  <div className="space-y-1">
                    {item.items.map(subItem => renderLink(subItem))}
                  </div>
                </div>
              );
            }
            return renderLink(item);
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-border/40 mt-auto bg-card/80 backdrop-blur-md">
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
