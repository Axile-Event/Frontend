"use client";

import {
  Calendar,
  Home,
  LogOut,
  Settings,
  Ticket,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

const UserDashboardNavLinks = [
  { name: "Dashboard", link: "/dashboard/user", icon: <Home className="h-5 w-5 md:h-7 md:w-7" /> },
  {
    name: "Events",
    link: "/dashboard/user/events",
    icon: <Calendar className="h-5 w-5 md:h-7 md:w-7" />,
  },
  {
    name: "My Tickets",
    link: "/dashboard/user/my-tickets",
    icon: <Ticket className="h-5 w-5 md:h-7 md:w-7" />,
  },
  { name: "Settings", link: "/dashboard/user/settings", icon: <Settings className="h-5 w-5 md:h-7 md:w-7" /> },
  { name: "Profile", link: "/dashboard/user/profile", icon: <User className="h-5 w-5 md:h-7 md:w-7" /> },
];

const Sidebar = ({ mobile }) => {
  const location = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const active = UserDashboardNavLinks.find(
    (link) => location === `${link.link}`
  );

  if (mobile) {
    return (
      <div className="flex flex-row justify-around bg-background border-t border-border py-2 w-full">
        {UserDashboardNavLinks.map((link) => (
          <Link
            href={link.link}
            key={link.name}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
              active && active.link === link.link
                ? "text-rose-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {link.icon}
            <span className="text-[10px] mt-1">{link.name}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-4">

      
      <div className="flex flex-col gap-2 w-full">
        {UserDashboardNavLinks.map((link) => (
          <Link
            href={link.link}
            key={link.name}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              active && active.link === link.link 
                ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/20" 
                : "text-gray-400 hover:bg-accent hover:text-foreground"
            }`}
          >
            {link.icon}
            <span className="text-sm font-medium">{link.name}</span>
          </Link>
        ))}
      </div>

      <div className="mt-auto pt-8 border-t border-border">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="h-5 w-5 md:h-7 md:w-7" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;