'use client';

import {
  Group,
  GroupIcon,
  LayoutDashboard,
  LogOut,
  PlusIcon,
  QrCodeIcon,
  Settings,
  User,
  User2,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";
import useAuthStore from "@/store/authStore";
import useOrganizerStore from "@/store/orgStore";

const OrganizationDashboardNavLinks = [
  { name: "Overview", link: "/dashboard/org", icon: <LayoutDashboard size={24} /> },
  {
    name: "Create Event",
    link: "/dashboard/org/create-event",
    icon: <PlusIcon size={24} />,
  },
  {
    name: "My Event",
    link: "/dashboard/org/my-event",
    icon: <GroupIcon size={24} />,
  },
  {
    name: "QR Scanner",
    link: "/dashboard/org/qr-scanner",
    icon: <QrCodeIcon size={24} />,
  },
  { name: "Profile", link: "/dashboard/org/profile", icon: <User size={24} /> },
  { name: "Payout", link: "/dashboard/org/payout", icon: <Wallet size={24} /> },
];

const Sidebar = () => {
  const location = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const clearOrgStore = useOrganizerStore((state) => state.clearStore);

  const handleLogout = () => {
    // Clear stores
    logout();
    clearOrgStore();
    
    // Selectively clear localStorage, preserving user-specific PIN data
    if (typeof window !== 'undefined') {
      // Preserve email-specific PIN keys (radar_pin_*:email) and welcome flags
      const allKeys = Object.keys(localStorage);
      const keysToPreserve = allKeys.filter(key => 
        key.startsWith('radar_pin_salt:') || 
        key.startsWith('radar_pin_hash:') || 
        key.startsWith('radar_has_pin:') ||
        key.startsWith('radar_org_first_welcome:')
      );
      
      const keysToRemove = allKeys.filter(key => !keysToPreserve.includes(key));
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    router.push("/login");
  };

  const active = OrganizationDashboardNavLinks.find(
    (link) => location === `${link.link}`
  );
  return (
    <>
      {/* Mobile Bottom Nav */}
      <div className="flex flex-row justify-around fixed bottom-0 left-0 right-0 bg-black border border-gray-900 py-1 rounded-t-xl items-center md:hidden">
        {OrganizationDashboardNavLinks.filter(link => link.name !== "Payout").map((link) => (
          <Link
            href={link.link}
            key={link.name}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors duration-200 ${
              active && active.link === link.link
                ? "text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <span className="mb-1">{link.icon}</span>
            <p className="text-xs text-center">
              {link.name}
            </p>
          </Link>
        ))}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-black border-r border-gray-900 text-white px-6 py-8 fixed left-0 top-0">
        <div className="mb-8 flex items-center px-2">
          <Logo className="text-white" textSize="text-2xl" />
        </div>
        <nav className="flex-1 flex flex-col gap-4">
          {OrganizationDashboardNavLinks.map((link) => (
            <Link
              key={link.name}
              href={link.link}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                location === link.link
                  ? 'bg-gray-200 text-gray-900 font-bold'
                  : 'text-gray-200 hover:bg-gray-800'
              }`}
            >
              {link.icon}
              <span className="text-xs">{link.name}</span>
            </Link>
          ))}
        </nav>
        <hr className="border-gray-800 w-full mb-4" />
        <div className="space-y-4">
          <Link
            href="/dashboard/org/settings"
            className={`flex items-center gap-3 p-2 rounded-lg ${
              location === '/dashboard/org/settings'
                ? 'bg-gray-200 text-gray-900 font-bold'
                : 'text-gray-200 hover:bg-gray-800'
            }`}
          >
                <Settings />
                <span className="text-xs">Settings</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="hover:bg-gray-200 p-2 md:p-2 hover:rounded-xl font-bold md:flex md:flex-row hidden md:gap-3 items-center text-red-500 cursor-pointer w-full text-left"
        >
          <span className="flex items-center gap-3">
            <LogOut />
            <span className="text-sm">Logout</span>
          </span>
        </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
