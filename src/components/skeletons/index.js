// Primitives
export * from "./primitives";

// Page-specific skeletons
export * from "./pages";

// Admin-specific skeletons
export * from "./admin";

// Legacy exports for backward compatibility
export {
  DashboardHeaderSkeleton,
  SidebarSkeleton,
} from "./pages/LayoutSkeletons";

export { OrganizerDashboardSkeleton as AnalyticsSkeleton } from "./pages/OrganizerDashboardSkeleton";

export { EventCardSkeleton } from "./pages/EventsGridSkeleton";

export { EventDetailsSkeleton } from "./pages/EventDetailsSkeleton";

export { TicketsPageSkeleton as TicketListSkeleton } from "./pages/TicketsPageSkeleton";

export { WalletPageSkeleton as WalletSkeleton } from "./pages/WalletPageSkeleton";

export { AdminTableSkeleton as TableSkeleton } from "./pages/AdminTableSkeleton";

export { ProfilePageSkeleton as ProfileSkeleton } from "./pages/ProfilePageSkeleton";
