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

const StudentDashboardNavLinks = [
  { name: "Overview", link: "/dashboard/student", icon: <Home className="h-5 w-5 md:h-7 md:w-7" /> },
  {
    name: "Events",
    link: "/dashboard/student/events",
    icon: <Calendar className="h-5 w-5 md:h-7 md:w-7" />,
  },
  {
    name: "My Tickets",
    link: "/dashboard/student/my-tickets",
    icon: <Ticket className="h-5 w-5 md:h-7 md:w-7" />,
  },
  { name: "Profile", link: "/dashboard/student/profile", icon: <User className="h-5 w-5 md:h-7 md:w-7" /> },
];

const Sidebar = () => {
  const location = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const active = StudentDashboardNavLinks.find(
    (link) => location === `${link.link}`
  );

  return (
    <div className="flex flex-col h-full px-4">
      {/* Logo is now in the global header, so we might not need it here, 
          but keeping it or removing it depends on design. 
          Since Header is sticky top, Sidebar starts below it. 
          So we don't need Logo in Sidebar anymore. */}
      
      <div className="flex flex-col gap-2 w-full">
        {StudentDashboardNavLinks.map((link) => (
          <Link
            href={link.link}
            key={link.name}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              active && active.link === link.link 
                ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/20" 
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {link.icon}
            <span className="text-base font-medium">{link.name}</span>
          </Link>
        ))}
      </div>

      <div className="mt-auto pt-8 space-y-2 border-t border-gray-800">
        <Link
          href={`/dashboard/student/settings`}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            location === "/dashboard/student/settings" 
              ? "bg-rose-600 text-white font-bold" 
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          }`}
        >
          <Settings className="h-5 w-5 md:h-7 md:w-7" />
          <span className="text-base font-medium">Settings</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="h-5 w-5 md:h-7 md:w-7" />
          <span className="text-base font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;