"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "../../../../../../../lib/axios";
import { Plus, Trash2, Edit2, ArrowLeft, Loader2, Save, X, Ticket, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import PinPromptModal from "@/components/PinPromptModal";

export default function ManageTicketsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.["my-eventId"];

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [event, setEvent] = useState(null);

    const [newCategory, setNewCategory] = useState({
        name: "",
        price: "",
        max_tickets: "",
        description: "",
    });

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Delete confirmation states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [showPinPrompt, setShowPinPrompt] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Format number with commas for display
    const formatPriceWithCommas = (value) => {
        const cleaned = String(value).replace(/[^\d.]/g, "");
        const parts = cleaned.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
    };

    // Handle price input change with comma formatting
    const handleNewPriceChange = (rawValue) => {
        const numericValue = rawValue.replace(/,/g, "");
        if (/^\d*\.?\d*$/.test(numericValue)) {
            setNewCategory({ ...newCategory, price: numericValue });
        }
    };

    const handleEditPriceChange = (rawValue) => {
        const numericValue = rawValue.replace(/,/g, "");
        if (/^\d*\.?\d*$/.test(numericValue)) {
            setEditForm({ ...editForm, price: numericValue });
        }
    };

    const fetchEventAndCategories = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            // First get event details (which may include ticket_categories)
            const eventRes = await api.get(`/events/${id}/details/`);
            console.log("Event response:", eventRes.data);
            setEvent(eventRes.data);
            
            // Try to get categories from dedicated endpoint first
            try {
                const catRes = await api.get(`/tickets/categories/?event_id=${id}`);
                console.log("Categories response:", catRes.data);
                // Handle both array and object response formats
                const categoriesData = Array.isArray(catRes.data) 
                    ? catRes.data 
                    : (catRes.data.categories || []);
                
                if (categoriesData.length > 0) {
                    setCategories(categoriesData);
                } else {
                    // Fallback to ticket_categories from event details
                    setCategories(eventRes.data.ticket_categories || []);
                }
            } catch (catErr) {
                console.log("Categories endpoint failed, using event details:", catErr);
                // Fallback to ticket_categories from event details
                setCategories(eventRes.data.ticket_categories || []);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error(err?.response?.data?.error || "Failed to load ticket data");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchEventAndCategories();
    }, [fetchEventAndCategories]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newCategory.name || newCategory.price === "") {
            toast.error("Name and Price are required");
            return;
        }

        setCreating(true);
        try {
            // Round to 2 decimal places to avoid floating-point precision issues
            const parsedPrice = parseFloat(newCategory.price);
            const roundedPrice = Math.round(parsedPrice * 100) / 100;
            const payload = {
                event_id: event?.event_id || id,
                name: newCategory.name,
                price: roundedPrice,
                max_tickets: newCategory.max_tickets ? parseInt(newCategory.max_tickets) : null,
            };
            
            // Include description if provided
            if (newCategory.description?.trim()) {
                payload.description = newCategory.description.trim();
            }

            await api.post("/tickets/categories/create/", payload);
            toast.success("Ticket category created!");
            setNewCategory({ name: "", price: "", max_tickets: "", description: "" });
            fetchEventAndCategories();
        } catch (err) {
            const errors = err?.response?.data;
            if (errors && typeof errors === 'object') {
                const messages = Object.values(errors).flat();
                messages.forEach(msg => toast.error(msg));
            } else {
                toast.error(err?.response?.data?.error || "Failed to create category");
            }
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteClick = (category) => {
        setCategoryToDelete(category);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        setShowDeleteConfirm(false);
        setShowPinPrompt(true);
    };

    const handlePinSuccess = async (pin) => {
        setShowPinPrompt(false);
        if (!categoryToDelete) return;
        
        setDeleting(true);
        try {
            await api.delete(`/tickets/categories/${categoryToDelete.category_id}/`);
            toast.success("Category deleted");
            fetchEventAndCategories();
        } catch (err) {
            console.error("Delete error:", err);
            toast.error(err?.response?.data?.error || "Failed to delete category");
        } finally {
            setDeleting(false);
            setCategoryToDelete(null);
        }
    };

    const startEdit = (cat) => {
        setEditingId(cat.category_id);
        setEditForm({
            name: cat.name || "",
            price: cat.price || "",
            max_tickets: cat.max_tickets || "",
            description: cat.description || ""
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // Build payload with proper types
            const payload = {
                name: editForm.name,
            };
            
            // Only include price if it's a valid number
            if (editForm.price !== "" && editForm.price !== null) {
                const parsedPrice = parseFloat(editForm.price);
                payload.price = Math.round(parsedPrice * 100) / 100; // Round to 2 decimals
            }
            
            // Only include max_tickets if it's set
            if (editForm.max_tickets !== "" && editForm.max_tickets !== null) {
                payload.max_tickets = parseInt(editForm.max_tickets);
            }
            
            // Include description if set
            if (editForm.description) {
                payload.description = editForm.description;
            }
            
            console.log("Update payload:", payload);
            await api.patch(`/tickets/categories/${editingId}/`, payload);
            toast.success("Category updated");
            setEditingId(null);
            fetchEventAndCategories();
        } catch (err) {
            console.error("Update error:", err?.response?.data || err);
            const errorMsg = err?.response?.data?.error || err?.response?.data?.detail || "Failed to update category";
            toast.error(errorMsg);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white p-4 md:p-8 max-w-5xl mx-auto space-y-10">
                {/* Header Skeleton */}
                <header className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-white/5 rounded-full animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-7 w-64 bg-white/5 rounded-lg animate-pulse" />
                        <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />
                    </div>
                </header>

                {/* Create Section Skeleton */}
                <section className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-white/5 animate-pulse" />
                        <div className="h-5 w-44 bg-white/5 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 md:col-span-2">
                            <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                            <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                            <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                            <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
                        </div>
                        <div className="md:col-span-2">
                            <div className="h-12 w-full bg-rose-600/20 rounded-xl animate-pulse" />
                        </div>
                    </div>
                </section>

                {/* Existing Categories Skeleton */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-white/5 animate-pulse" />
                        <div className="h-5 w-40 bg-white/5 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-24 bg-white/5 rounded animate-pulse" />
                                            <div className="h-5 w-16 bg-white/5 rounded-full animate-pulse" />
                                        </div>
                                        <div className="h-3 w-48 bg-white/5 rounded animate-pulse" />
                                        <div className="flex gap-4 pt-2">
                                            <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                                            <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-9 w-9 bg-white/5 rounded-xl animate-pulse" />
                                        <div className="h-9 w-9 bg-white/5 rounded-xl animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 max-w-5xl mx-auto space-y-10">
            {/* Header */}
            <header className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Manage Ticket Categories</h1>
                    <p className="text-gray-400 text-sm">{event?.name || "Event Details"}</p>
                </div>
            </header>

            {/* Create Section */}
            <section className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-rose-500" /> Create New Category
                </h2>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Category Name (e.g. VIP, Regular)</label>
                        <input
                            type="text"
                            required
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            placeholder="VIP Access"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Price (₦)</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            required
                            value={formatPriceWithCommas(newCategory.price)}
                            onChange={(e) => handleNewPriceChange(e.target.value)}
                            placeholder="10,000"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Max Tickets (Optional)</label>
                        <input
                            type="number"
                            min="1"
                            value={newCategory.max_tickets}
                            onChange={(e) => setNewCategory({ ...newCategory, max_tickets: e.target.value })}
                            placeholder="Unlimited"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                        />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex justify-between">
                            <span>Description (Optional)</span>
                            <span className={`${(newCategory.description?.length || 0) > 140 ? 'text-rose-500' : 'text-gray-600'}`}>
                                {newCategory.description?.length || 0}/150
                            </span>
                        </label>
                        <textarea
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                            maxLength={150}
                            placeholder="Describe what this ticket category includes (e.g., Front row seats, Backstage access, Free drinks)"
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500 transition-colors resize-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={creating}
                            className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            {creating ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            Add Ticket Category
                        </button>
                    </div>
                </form>
            </section>

            {/* List Section */}
            <section className="space-y-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-rose-500" /> Existing Categories
                </h2>

                {categories.length === 0 ? (
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-12 text-center">
                        <p className="text-gray-500 italic">No ticket categories created yet. Users will use the default event price if no categories are active.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {categories.map((cat) => (
                            <div key={cat.category_id} className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                                {editingId === cat.category_id ? (
                                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            value={editForm.name ?? ""}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            placeholder="Category Name"
                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                        />
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={formatPriceWithCommas(editForm.price ?? "")}
                                            onChange={(e) => handleEditPriceChange(e.target.value)}
                                            placeholder="Price"
                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                        />
                                        <input
                                            type="number"
                                            value={editForm.max_tickets ?? ""}
                                            onChange={(e) => setEditForm({ ...editForm, max_tickets: e.target.value })}
                                            placeholder="Max Tickets (Unlimited)"
                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                        />
                                        <div className="md:col-span-2 space-y-1">
                                            <div className="flex justify-between text-[10px] text-gray-500">
                                                <span>Description</span>
                                                <span className={`${(editForm.description?.length || 0) > 140 ? 'text-rose-500' : ''}`}>
                                                    {editForm.description?.length || 0}/150
                                                </span>
                                            </div>
                                            <textarea
                                                value={editForm.description ?? ""}
                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                maxLength={150}
                                                placeholder="Description (what this ticket includes)"
                                                rows={2}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2 flex justify-end gap-2">
                                            <button type="button" onClick={() => setEditingId(null)} className="p-2 hover:bg-white/5 rounded-lg">
                                                <X className="w-4 h-4" />
                                            </button>
                                            <button type="submit" className="p-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg">
                                                <Save className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-white">{cat.name}</h3>
                                                <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded-full text-rose-500 uppercase">
                                                    ₦{parseFloat(cat.price).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 max-w-xl">{cat.description || "No description provided."}</p>
                                            <div className="flex gap-4 text-[10px] text-gray-600 font-bold uppercase tracking-wider pt-2">
                                                <span>Available: {typeof cat.available_tickets === 'number' ? cat.available_tickets.toLocaleString() : (cat.available_tickets ?? "Unlimited")}</span>
                                                <span>Sold: {(cat.tickets_sold ?? 0).toLocaleString()}</span>
                                                <span>Max/Booking: {event?.max_quantity_per_booking || 3}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => startEdit(cat)} 
                                                className="p-2.5 rounded-xl transition-colors hover:bg-white/5 text-gray-400 hover:text-white"
                                                title="Edit category"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(cat)} 
                                                disabled={deleting}
                                                className="p-2.5 rounded-xl transition-colors hover:bg-rose-600/10 text-gray-500 hover:text-rose-500"
                                                title="Delete category"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && categoryToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-rose-500/10 rounded-2xl">
                                    <AlertTriangle className="w-6 h-6 text-rose-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Delete Category</h3>
                            </div>
                            <button 
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setCategoryToDelete(null);
                                }}
                                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Are you sure you want to delete the ticket category{" "}
                                <span className="text-white font-bold">"{categoryToDelete.name}"</span>?
                            </p>
                            <p className="text-rose-400 text-xs">
                                This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setCategoryToDelete(null);
                                }}
                                className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-sm transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="flex-1 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PIN Prompt Modal */}
            <PinPromptModal
                isOpen={showPinPrompt}
                onClose={() => {
                    setShowPinPrompt(false);
                    setCategoryToDelete(null);
                }}
                onSuccess={handlePinSuccess}
                action="delete this ticket category"
                requireSetup={true}
            />
        </div>
    );
}
