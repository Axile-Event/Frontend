"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ChevronRight
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { cn } from "@/lib/utils";

const navigationGroups = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/lighthouse/dashboard",
        icon: LayoutDashboard,
      },
    ]
  },
  {
    label: "Management",
    items: [
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
    ]
  },
  {
    label: "Finance",
    items: [
      {
        title: "Payout Requests",
        href: "/lighthouse/payouts",
        icon: CreditCard,
      },
      {
        title: "Withdrawals",
        href: "/lighthouse/withdrawals",
        icon: CreditCard,
      },
      {
        title: "Revenue",
        href: "/lighthouse/revenue",
        icon: BarChart3,
      },
    ]
  },
  {
    label: "System",
    items: [
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
    ]
  },
];

function NavItem({ item, isActive }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-[13px] font-medium",
        isActive
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <item.icon className={cn(
        "w-[18px] h-[18px] shrink-0 transition-colors",
        isActive ? "text-background" : "text-muted-foreground group-hover:text-foreground"
      )} />
      <span className="flex-1">{item.title}</span>
      {isActive && (
        <ChevronRight className="w-4 h-4 opacity-60" />
      )}
    </Link>
  );
}

export function AdminSidebar({ className }) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);

  const isActiveRoute = (href) => {
    if (href === "/lighthouse/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

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

      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem 
                  key={item.href} 
                  item={item} 
                  isActive={isActiveRoute(item.href)}
                />
              ))}
            </div>
          </div>
        ))}
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
