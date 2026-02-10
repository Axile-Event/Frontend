"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ticket } from "lucide-react";
import { adminService } from "@/lib/admin";
import { toast } from "react-hot-toast";
import { queryKeys } from "@/lib/query-keys";
import { AdminTableSkeleton } from "@/components/skeletons";
import { AdminDataTable } from "@/components/ui/admin-data-table";
import { cn, formatCurrency } from "@/lib/utils";

function TabButton({ active, children, onClick }) {
	return (
		<button
			onClick={onClick}
			className={cn(
				"px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap",
				active
					? "bg-foreground text-background"
					: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
			)}
		>
			{children}
		</button>
	);
}

function StatusBadge({ status }) {
	const config = {
		confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
		checked_in: "bg-blue-500/10 text-blue-600 border-blue-500/20",
		cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
		pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
	};
	return (
		<span
			className={cn(
				"inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border",
				config[status] || config.pending
			)}
		>
			{status.replace(/_/g, " ")}
		</span>
	);
}

const ITEMS_PER_PAGE = 20;

const defaultPagination = {
	current_page: 1,
	total_count: 0,
	total_pages: 1,
	page_size: ITEMS_PER_PAGE,
	has_next: false,
	has_previous: false
};

export default function TicketsPage() {
	const [statusFilter, setStatusFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [search, setSearch] = useState("");

	const { data, isLoading: loading } = useQuery({
		queryKey: [...queryKeys.tickets.adminAll({ statusFilter }), currentPage],
		queryFn: async () => {
			const params = { page: currentPage, page_size: ITEMS_PER_PAGE };
			if (statusFilter !== "all") params.status = statusFilter;
			return adminService.getAllTickets(params);
		},
		refetchOnWindowFocus: true
	});

	const tickets = data?.tickets ?? [];
	const pagination = data?.pagination
		? {
				current_page: data.pagination.current_page ?? currentPage,
				total_count: data.pagination.total_count ?? 0,
				total_pages: data.pagination.total_pages ?? 1,
				page_size: data.pagination.page_size ?? ITEMS_PER_PAGE,
				has_next: data.pagination.has_next ?? false,
				has_previous: data.pagination.has_previous ?? false
			}
		: defaultPagination;

	useEffect(() => {
		setCurrentPage(1);
	}, [statusFilter]);

	const tabs = [
		{ id: "all", label: "All" },
		{ id: "confirmed", label: "Confirmed" },
		{ id: "pending", label: "Pending" },
		{ id: "checked_in", label: "Checked In" },
		{ id: "cancelled", label: "Cancelled" },
	];

	const filteredTickets = tickets.filter((ticket) => {
		if (!search.trim()) return true;
		const q = search.toLowerCase();
		const ref =
			ticket.referral ||
			ticket.referral_source ||
			ticket.referral_payload ||
			"";
		return (
			ticket.student_name?.toLowerCase().includes(q) ||
			ticket.student_email?.toLowerCase().includes(q) ||
			ticket.ticket_id?.toLowerCase().includes(q) ||
			ticket.event_name?.toLowerCase().includes(q) ||
			ref.toLowerCase().includes(q)
		);
	});

	const columns = [
		{
			key: "ticket_id",
			label: "Ticket ID",
			render: (_, t) => (
				<div className="flex items-center gap-2">
					<Ticket className="w-4 h-4 text-muted-foreground shrink-0" />
					<span className="font-mono text-sm text-muted-foreground">
						{t.ticket_id}
					</span>
				</div>
			),
		},
		{
			key: "booking_id",
			label: "Booking ID",
			render: (_, t) => (
				<span className="font-mono text-xs text-muted-foreground">
					{t.booking_id || "—"}
				</span>
			),
		},
		{
			key: "event_name",
			label: "Event",
			render: (_, t) => (
				<div className="min-w-0">
					<p className="text-sm font-medium text-foreground truncate max-w-[180px]">
						{t.event_name}
					</p>
					<p className="text-xs text-muted-foreground font-mono">
						{t.event_id}
					</p>
				</div>
			),
		},
		{
			key: "student_name",
			label: "Attendee",
			render: (_, t) => (
				<div className="min-w-0">
					<p className="text-sm font-medium text-foreground">
						{t.student_name}
					</p>
					<p className="text-xs text-muted-foreground truncate max-w-[150px]">
						{t.student_email}
					</p>
				</div>
			),
		},
		{
			key: "referral",
			label: "Referral",
			render: (_, t) => {
				const ref =
					t.referral || t.referral_source || t.referral_payload;
				return (
					<span className="text-xs text-muted-foreground">
						{ref ? String(ref) : "—"}
					</span>
				);
			},
		},
		{
			key: "status",
			label: "Status",
			render: (_, t) => <StatusBadge status={t.status} />,
		},
		{
			key: "total_price",
			label: "Price",
			render: (_, t) => (
				<p className="text-sm font-semibold text-foreground">
					{formatCurrency(t.total_price)}
				</p>
			),
		},
		{
			key: "created_at",
			label: "Date",
			className: "text-right",
			render: (val) =>
				val
					? new Date(val).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric",
						})
					: "—",
		},
	];

	if (loading && tickets.length === 0) {
		return <AdminTableSkeleton columns={8} rows={8} />;
	}

	return (
		<div className="space-y-5">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="flex gap-1 p-1 bg-muted/30 rounded-xl border border-border/40 overflow-x-auto">
					{tabs.map((tab) => (
						<TabButton
							key={tab.id}
							active={statusFilter === tab.id}
							onClick={() => setStatusFilter(tab.id)}
						>
							{tab.label}
						</TabButton>
					))}
				</div>
				<div className="relative w-full md:w-72">
					<Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<input
						type="text"
						placeholder="Search tickets..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full h-10 pl-10 pr-4 bg-card border border-border/40 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
					/>
				</div>
			</div>

			<AdminDataTable
				columns={columns}
				data={filteredTickets}
				pagination={pagination}
				loading={loading}
				onPageChange={setCurrentPage}
				emptyMessage={
					search.trim()
						? "No tickets on this page match your search"
						: "No tickets found"
				}
				emptyIcon={Ticket}
				getRowKey={(row) => row.ticket_id}
			/>
		</div>
	);
}
