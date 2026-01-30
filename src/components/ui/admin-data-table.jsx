"use client";

import { useMemo } from "react";
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Reusable admin data table powered by TanStack React Table.
 * Same design as before; supports server-side pagination.
 *
 * @param {Object} props
 * @param {Array<{ key: string, label: string, render?: (value, row) => ReactNode, className?: string }>} props.columns - Column definitions
 * @param {Array<Object>} props.data - Row data (already filtered by parent if search used)
 * @param {Object} props.pagination - Backend pagination: { current_page, total_pages, total_count, page_size, has_next, has_previous }
 * @param {boolean} props.loading - Show loading state
 * @param {(page: number) => void} props.onPageChange - Called when user changes page
 * @param {string} [props.emptyMessage="No records found"] - Message when data is empty
 * @param {ReactNode} [props.emptyIcon] - Icon component for empty state
 * @param {string} [props.searchPlaceholder] - If provided, show search input (parent handles filter)
 * @param {string} [props.searchValue] - Controlled search value
 * @param {(value: string) => void} [props.onSearchChange] - Search change handler
 * @param {ReactNode} [props.extraToolbar] - Optional content to the left of search (e.g. tabs)
 * @param {string} [props.tableClassName] - Extra class for table wrapper
 * @param {(row: Object) => string|number} [props.getRowKey] - Optional key for each row (default: row.id ?? index)
 */
export function AdminDataTable({
	columns,
	data,
	pagination,
	loading,
	onPageChange,
	emptyMessage = "No records found",
	emptyIcon: EmptyIcon,
	searchPlaceholder,
	searchValue,
	onSearchChange,
	extraToolbar,
	tableClassName,
	getRowKey,
}) {
	const totalCount = pagination?.total_count ?? 0;
	const totalPages = pagination?.total_pages ?? 1;
	const currentPage = pagination?.current_page ?? 1;
	const pageSize = pagination?.page_size ?? 20;
	const hasNext = pagination?.has_next ?? false;
	const hasPrevious = pagination?.has_previous ?? false;

	const indexOfFirstItem =
		totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
	const indexOfLastItem = Math.min(currentPage * pageSize, totalCount);

	const tableColumns = useMemo(
		() =>
			columns.map((col) => ({
				id: col.key,
				accessorKey: col.key,
				header: () => col.label,
				cell: ({ row }) =>
					col.render
						? col.render(row.original[col.key], row.original)
						: row.original[col.key] ?? "—",
				meta: { className: col.className },
			})),
		[columns]
	);

	const table = useReactTable({
		data,
		columns: tableColumns,
		getCoreRowModel: getCoreRowModel(),
		getRowId: getRowKey
			? (row) => String(getRowKey(row))
			: (row, index) => String(row?.id ?? index),
	});

	return (
		<div className="space-y-4">
			{(extraToolbar || searchPlaceholder != null) && (
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					{extraToolbar}
					{searchPlaceholder != null && (
						<div className="relative w-full sm:w-72">
							<input
								type="text"
								placeholder={searchPlaceholder}
								value={searchValue ?? ""}
								onChange={(e) =>
									onSearchChange?.(e.target.value)
								}
								className="w-full h-10 pl-10 pr-4 rounded-xl border border-border/40 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
							/>
						</div>
					)}
				</div>
			)}

			<Card
				className={cn(
					"border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden",
					tableClassName
				)}
			>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							{table.getHeaderGroups().map((headerGroup) => (
								<tr
									key={headerGroup.id}
									className="border-b border-border/40"
								>
									{headerGroup.headers.map((header) => (
										<th
											key={header.id}
											className={cn(
												"text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide",
												header.column.columnDef.meta?.className
											)}
										>
											{flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody className="divide-y divide-border/40">
							{loading ? (
								<tr>
									<td
										colSpan={columns.length}
										className="p-12 text-center text-sm text-muted-foreground"
									>
										Loading...
									</td>
								</tr>
							) : table.getRowModel().rows.length === 0 ? (
								<tr>
									<td
										colSpan={columns.length}
										className="p-12 text-center"
									>
										{EmptyIcon && (
											<div className="flex justify-center mb-2">
												<EmptyIcon className="w-8 h-8 text-muted-foreground/40" />
											</div>
										)}
										<p className="text-sm text-muted-foreground">
											{emptyMessage}
										</p>
									</td>
								</tr>
							) : (
								table.getRowModel().rows.map((row) => (
									<tr
										key={row.id}
										className="hover:bg-muted/30 transition-colors"
									>
										{row.getVisibleCells().map((cell) => (
											<td
												key={cell.id}
												className={cn(
													"p-4",
													cell.column.columnDef.meta?.className
												)}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)}
											</td>
										))}
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{(totalPages > 1 || totalCount > 0) && !loading && (
					<div className="flex items-center justify-between p-4 border-t border-border/40">
						<p className="text-xs text-muted-foreground">
							Showing {indexOfFirstItem}-{indexOfLastItem} of{" "}
							{totalCount}
						</p>
						<div className="flex items-center gap-1">
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									onPageChange?.(Math.max(1, currentPage - 1))
								}
								disabled={
									currentPage === 1 || !hasPrevious
								}
								className="h-8 w-8 p-0"
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<span className="text-sm text-muted-foreground px-2">
								{currentPage} / {totalPages}
							</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									onPageChange?.(currentPage + 1)
								}
								disabled={
									currentPage === totalPages || !hasNext
								}
								className="h-8 w-8 p-0"
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}
			</Card>
		</div>
	);
}
