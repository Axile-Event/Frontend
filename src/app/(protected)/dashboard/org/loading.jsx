import { AnalyticsSkeleton } from "@/components/skeletons";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <AnalyticsSkeleton />
    </div>
  );
}
