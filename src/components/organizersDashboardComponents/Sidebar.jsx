// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   GroupIcon,
//   Home,
//   LogOut,
//   PlusIcon,
//   QrCodeIcon,
//   Settings,
//   User,
// } from 'lucide-react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { motion, AnimatePresence } from 'framer-motion';
// import Logo from '@/components/Logo';

// const OrganizationDashboardNavLinks = [
//   { name: 'Overview', link: '/dashboard/org', icon: <Home size={24} /> },
//   { name: 'Create Event', link: '/dashboard/org/create-event', icon: <PlusIcon size={24} /> },
//   { name: 'My Event', link: '/dashboard/org/my-event', icon: <GroupIcon size={24} /> },
//   { name: 'QR Scanner', link: '/dashboard/org/qr-scanner', icon: <QrCodeIcon size={24} /> },
//   { name: 'Profile', link: '/dashboard/org/profile', icon: <User size={24} /> },
// ];

// const Sidebar = () => {
//   const pathname = usePathname();
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <>
//       {/* Mobile Header */}
//       <div className="flex md:hidden items-center justify-between bg-gray-900 p-4 text-white fixed top-0 left-0 right-0 z-50">
//         <Logo />
//         <button onClick={() => setIsOpen(!isOpen)}>
//           <svg
//             className="w-6 h-6"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth={2}
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
//             />
//           </svg>
//         </button>
//       </div>

//       {/* Mobile Sidebar with Motion */}
//       <AnimatePresence>
//         {isOpen && (
//           <>
//             {/* Backdrop */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 0.5 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.2 }}
//               className="fixed inset-0 bg-black z-40"
//               onClick={() => setIsOpen(false)}
//             />

//             {/* Slide-in Sidebar */}
//             <motion.div
//               initial={{ x: '-100%' }}
//               animate={{ x: 0 }}
//               exit={{ x: '-100%' }}
//               transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
//               className="fixed inset-y-0 left-0 w-64 bg-gray-900 z-50 p-6 flex flex-col"
//             >
//               <Logo />
//               <nav className="flex flex-col gap-4 mt-6">
//                 {OrganizationDashboardNavLinks.map((link) => (
//                   <Link
//                     key={link.name}
//                     href={link.link}
//                     onClick={() => setIsOpen(false)}
//                     className={`flex items-center gap-3 p-2 rounded-lg ${
//                       pathname === link.link
//                         ? 'bg-gray-200 text-gray-900 font-bold'
//                         : 'text-gray-200 hover:bg-gray-800'
//                     }`}
//                   >
//                     {link.icon}
//                     <span>{link.name}</span>
//                   </Link>
//                 ))}
//               </nav>

//               <div className="mt-auto space-y-4">
//                 <Link
//                   href="/dashboard/org/settings"
//                   onClick={() => setIsOpen(false)}
//                   className={`flex items-center gap-3 p-2 rounded-lg ${
//                     pathname === '/dashboard/org/settings'
//                       ? 'bg-gray-200 text-gray-900 font-bold'
//                       : 'text-gray-200 hover:bg-gray-800'
//                   }`}
//                 >
//                   <Settings />
//                   <span>Settings</span>
//                 </Link>
//                 <button className="flex items-center gap-3 p-2 rounded-lg text-red-500 hover:bg-gray-800">
//                   <LogOut />
//                   <span>Logout</span>
//                 </button>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       {/* Desktop Sidebar */}
//       <aside className="hidden md:flex flex-col w-64 h-screen bg-gray-900 text-white p-6 fixed left-0 top-0">
//         <div className="mb-6 flex justify-center">
//           <Logo />
//         </div>
//         <nav className="flex-1 flex flex-col gap-4">
//           {OrganizationDashboardNavLinks.map((link) => (
//             <Link
//               key={link.name}
//               href={link.link}
//               className={`flex items-center gap-3 p-2 rounded-lg ${
//                 pathname === link.link
//                   ? 'bg-gray-200 text-gray-900 font-bold'
//                   : 'text-gray-200 hover:bg-gray-800'
//               }`}
//             >
//               {link.icon}
//               <span className="text-sm">{link.name}</span>
//             </Link>
//           ))}
//         </nav>
//         <div className="mt-auto space-y-4">
//           <Link
//             href="/dashboard/org/settings"
//             className={`flex items-center gap-3 p-2 rounded-lg ${
//               pathname === '/dashboard/org/settings'
//                 ? 'bg-gray-200 text-gray-900 font-bold'
//                 : 'text-gray-200 hover:bg-gray-800'
//             }`}
//           >
//             <Settings />
//             <span>Settings</span>
//           </Link>
//           <button className="flex items-center gap-3 p-2 rounded-lg text-red-500 hover:bg-gray-800">
//             <LogOut />
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;


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
import { motion } from "framer-motion";
import useAuthStore from "@/store/authStore";

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
      <div className="flex flex-row justify-around max-md:bg-black max-sm:rounded-xl max-sm:items-center md:flex-col md:gap-8">
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
