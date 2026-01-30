"use client";

import { useEffect, useState } from "react";
import {
	User,
	MoreVertical,
	Trash2,
	Ban,
	CheckCircle,
	ShieldCheck,
	Mail,
	Search,
} from "lucide-react";
import { adminService } from "@/lib/admin";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminTableSkeleton } from "@/components/skeletons";
import { AdminDataTable } from "@/components/ui/admin-data-table";
import { useConfirmModal } from "@/components/ui/confirmation-modal";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PAGE_SIZE = 20;

function TabButton({ active, children, onClick }) {
	return (
		<button
			onClick={onClick}
			className={cn(
				"px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
				active
					? "bg-foreground text-background"
					: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
			)}
		>
			{children}
		</button>
	);
}

function StatusBadge({ active }) {
	return (
		<span
			className={cn(
				"inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border",
				active === false
					? "bg-red-500/10 text-red-600 border-red-500/20"
					: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
			)}
		>
			{active === false ? "Disabled" : "Active"}
		</span>
	);
}

function RoleBadge({ role }) {
	const isOrganizer = role?.toLowerCase() === "organizer";
	return (
		<span
			className={cn(
				"inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border",
				isOrganizer
					? "bg-violet-500/10 text-violet-600 border-violet-500/20"
					: "bg-blue-500/10 text-blue-600 border-blue-500/20"
			)}
		>
			{role ? role.charAt(0).toUpperCase() + role.slice(1) : "Student"}
		</span>
	);
}

export default function UsersPage() {
	const [loading, setLoading] = useState(true);
	const [users, setUsers] = useState([]);
	const [pagination, setPagination] = useState({
		total_count: 0,
		total_pages: 1,
		page_size: PAGE_SIZE,
		current_page: 1,
		has_next: false,
		has_previous: false,
	});
	const [filterRole, setFilterRole] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const { confirm } = useConfirmModal();

	const fetchUsers = async (page = 1, role = filterRole) => {
		setLoading(true);
		try {
			const params = { page, page_size: PAGE_SIZE };
			if (role !== "all") params.role = role;
			const data = await adminService.getAllUsers(params);
			setUsers(data.users || []);
			if (data.pagination) {
				setPagination({
					current_page: data.pagination.current_page,
					total_pages: data.pagination.total_pages,
					total_count: data.pagination.total_count,
					page_size: data.pagination.page_size,
					has_next: data.pagination.has_next,
					has_previous: data.pagination.has_previous,
				});
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to fetch users");
			setUsers([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers(currentPage, filterRole);
	}, [currentPage, filterRole]);

	useEffect(() => {
		setCurrentPage(1);
	}, [filterRole]);

	const handleToggleStatus = async (user) => {
		const isDisabling = user.is_active;
		const confirmed = await confirm({
			title: isDisabling ? "Disable Account" : "Enable Account",
			description: `Are you sure you want to ${isDisabling ? "disable" : "enable"} this user's account?`,
			confirmText: isDisabling ? "Disable" : "Enable",
			variant: isDisabling ? "warning" : "success",
		});
		if (!confirmed) return;
		try {
			await adminService.toggleUserStatus(
				user.id,
				user.role || "student",
				!user.is_active
			);
			toast.success(`User ${user.is_active ? "disabled" : "enabled"}`);
			fetchUsers(currentPage, filterRole);
		} catch (error) {
			toast.error("Failed to update status");
		}
	};

	const handleVerifyOrganizer = async (user) => {
		if (user.role?.toLowerCase() !== "organizer") return;
		const isUnverifying = user.is_verified;
		const confirmed = await confirm({
			title: isUnverifying ? "Remove Verification" : "Verify Organizer",
			description: `Are you sure you want to ${isUnverifying ? "remove verification from" : "verify"} this organizer?`,
			confirmText: isUnverifying ? "Remove Verification" : "Verify",
			variant: isUnverifying ? "warning" : "success",
		});
		if (!confirmed) return;
		try {
			await adminService.verifyOrganizer(user.id, !user.is_verified);
			toast.success(`Organizer ${user.is_verified ? "unverified" : "verified"}`);
			fetchUsers(currentPage, filterRole);
		} catch (error) {
			toast.error("Failed to update verification");
		}
	};

	const handleDeleteUser = async (user) => {
		const confirmed = await confirm({
			title: "Delete Account",
			description:
				"Are you sure you want to permanently delete this user? This action cannot be undone.",
			confirmText: "Delete",
			variant: "danger",
		});
		if (!confirmed) return;
		try {
			await adminService.deleteUser(user.id, user.role || "student");
			toast.success("User deleted successfully");
			fetchUsers(currentPage, filterRole);
		} catch (error) {
			toast.error("Failed to delete user");
		}
	};

	const tabs = [
		{ id: "all", label: "All Users" },
		{ id: "student", label: "Students" },
		{ id: "organizer", label: "Organizers" },
	];

	const filteredUsers = users.filter((u) => {
		if (!searchQuery.trim()) return true;
		const q = searchQuery.toLowerCase();
		return (
			(u.name && u.name.toLowerCase().includes(q)) ||
			(u.email && u.email.toLowerCase().includes(q))
		);
	});

	const columns = [
		{
			key: "name",
			label: "User",
			render: (_, user) => (
				<div className="flex items-center gap-3">
					<div className="h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
						<User className="h-4 w-4 text-muted-foreground" />
					</div>
					<div className="flex items-center gap-1.5">
						<span className="text-sm font-medium text-foreground truncate max-w-[150px]">
							{user.name || "Unknown User"}
						</span>
						{user.role?.toLowerCase() === "organizer" && user.is_verified && (
							<ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
						)}
					</div>
				</div>
			),
		},
		{
			key: "email",
			label: "Email",
			render: (_, user) => (
				<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
					<Mail className="w-3.5 h-3.5 shrink-0" />
					<span className="truncate max-w-[200px]">{user.email}</span>
				</div>
			),
		},
		{
			key: "role",
			label: "Role",
			render: (_, user) => <RoleBadge role={user.role} />,
		},
		{
			key: "is_active",
			label: "Status",
			render: (_, user) => <StatusBadge active={user.is_active} />,
		},
		{
			key: "created_at",
			label: "Joined",
			render: (val) =>
				val
					? new Date(val).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric",
						})
					: "—",
		},
		{
			key: "id",
			label: "Actions",
			className: "text-right",
			render: (_, user) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						<DropdownMenuLabel className="text-xs text-muted-foreground">
							Actions
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => handleToggleStatus(user)}>
							{user.is_active === false ? (
								<>
									<CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
									Enable Account
								</>
							) : (
								<>
									<Ban className="mr-2 h-4 w-4 text-amber-500" />
									Disable Account
								</>
							)}
						</DropdownMenuItem>
						{user.role?.toLowerCase() === "organizer" && (
							<DropdownMenuItem onClick={() => handleVerifyOrganizer(user)}>
								<ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />
								{user.is_verified ? "Remove Verification" : "Verify Organizer"}
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => handleDeleteUser(user)}
							className="text-red-600 focus:text-red-700 focus:bg-red-500/10"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete Account
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	if (loading && users.length === 0) {
		return <AdminTableSkeleton columns={6} rows={8} />;
	}

	return (
		<div className="space-y-5">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex gap-1 p-1 bg-muted/30 rounded-xl border border-border/40">
					{tabs.map((tab) => (
						<TabButton
							key={tab.id}
							active={filterRole === tab.id}
							onClick={() => setFilterRole(tab.id)}
						>
							{tab.label}
						</TabButton>
					))}
				</div>
				<div className="relative w-full sm:w-72">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by name or email..."
						className="pl-9 h-10 bg-card/50 border-border/40"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			<AdminDataTable
				columns={columns}
				data={filteredUsers}
				pagination={pagination}
				loading={loading}
				onPageChange={setCurrentPage}
				emptyMessage={
					searchQuery.trim()
						? "No users on this page match your search"
						: "No users found"
				}
				emptyIcon={User}
			/>
		</div>
	);
}
