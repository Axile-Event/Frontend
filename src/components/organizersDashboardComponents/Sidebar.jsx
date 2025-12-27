"use client";

import {
  Group,
  GroupIcon,
  Home,
  LogOut,
  PlusIcon,
  QrCodeIcon,
  Settings,
  User,
  User2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

const OrganizationDashboardNavLinks = [
  { name: "Overview", link: "/dashboard/org", icon: <Home size={30} /> },
  {
    name: "Create Event",
    link: "/dashboard/org/create-event",
    icon: <PlusIcon size={30} />,
  },
  {
    name: "My Event",
    link: "/dashboard/org/my-event",
    icon: <GroupIcon size={30} />,
  },
  {
    name: "QR Scanner",
    link: "/dashboard/org/qr-scanner",
    icon: <QrCodeIcon size={30} />,
  },
  { name: "Profile", link: "/dashboard/org/profile", icon: <User size={30} /> },
];

const Sidebar = () => {
  const location = usePathname();
  console.log(location);
  const active = OrganizationDashboardNavLinks.find(
    (link) => location === `${link.link}`
  );
  console.log(active);
  return (
    <>
      <div className="hidden md:flex justify-center mb-6">
        <Logo />
      </div>
      <div className="flex flex-row justify-around max-sm:items-center md:flex-col md:gap-8">
        {OrganizationDashboardNavLinks.map((link) => (
          <Link
            href={link.link}
            key={link.name}
            className={`${active ? (active.link === link.link ? "bg-gray-200 p-2 md:p-2 rounded-xl text-gray-800 font-bold" : "") : null}`}
          >
            <div className="flex flex-col md:flex-row items-center md:gap-3 gap-1">
              <span className="">{link.icon}</span>
              <p
                className={`${active ? (active.link === link.link ? "text-xs md:text-base" : "hidden md:block") : "hidden md:block"}`}
              >
                {link.name}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <hr className="mt-8 text-gray-800 hidden md:block" />

      <div className="mt-8 space-y-7 hidden md:block">
        <Link
          href={`/dashboard/org/settings`}
          className={`${location === "/dashboard/org/settings" ? "bg-gray-200 flex gap-3 text-gray-800 p-2 rounded-xl font-bold" : "md:flex md:flex-row hidden md:gap-3 items-center"}`}
        >
          <span>
            <Settings />
          </span>
          <p>Settings</p>
        </Link>
        <button className="hover:bg-gray-200 p-2 md:p-2 hover:rounded-xl font-bold md:flex md:flex-row hidden md:gap-3 items-center text-red-500 cursor-pointer">
          <span>
            <LogOut />
          </span>
          <p>Logout</p>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
