"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "../../../../../../../lib/axios";
import { Plus, Trash2, Edit2, ArrowLeft, Loader2, Save, X, Ticket } from "lucide-react";
import toast from "react-hot-toast";

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
        max_quantity_per_booking: "",
    });

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const fetchEventAndCategories = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [eventRes, catRes] = await Promise.all([
                api.get(`/events/${id}/details/`),
                api.get(`/tickets/categories/?event_id=${id}`)
            ]);
            setEvent(eventRes.data);
            setCategories(catRes.data.categories || []);
        } catch (err) {
            // Fallback to simpler ID if prefixed one fails, or just show error
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
            const payload = {
                event_id: event?.event_id || id,
                name: newCategory.name,
                price: parseFloat(newCategory.price),
                max_tickets: newCategory.max_tickets ? parseInt(newCategory.max_tickets) : null,
                max_quantity_per_booking: newCategory.max_quantity_per_booking ? parseInt(newCategory.max_quantity_per_booking) : null,
            };

            await api.post("/tickets/categories/create/", payload);
            toast.success("Ticket category created!");
            setNewCategory({ name: "", price: "", max_tickets: "", max_quantity_per_booking: "" });
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

    const handleDelete = async (catId) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            await api.delete(`/tickets/categories/${catId}/`);
            toast.success("Category deleted");
            fetchEventAndCategories();
        } catch (err) {
            toast.error("Failed to delete category");
        }
    };

    const startEdit = (cat) => {
        setEditingId(cat.category_id);
        setEditForm({ ...cat });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/tickets/categories/${editingId}/`, editForm);
            toast.success("Category updated");
            setEditingId(null);
            fetchEventAndCategories();
        } catch (err) {
            toast.error("Failed to update category");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <Loader2 className="animate-spin w-8 h-8 text-rose-500" />
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
                            type="number"
                            required
                            min="0"
                            value={newCategory.price}
                            onChange={(e) => setNewCategory({ ...newCategory, price: e.target.value })}
                            placeholder="10000"
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
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                        />
                                        <input
                                            type="number"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                        />
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
                                                    ₦{cat.price}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 max-w-xl">{cat.description || "No description provided."}</p>
                                            <div className="flex gap-4 text-[10px] text-gray-600 font-bold uppercase tracking-wider pt-2">
                                                <span>Available: {cat.available_tickets ?? "Unlimited"}</span>
                                                <span>Sold: {cat.tickets_sold ?? 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => startEdit(cat)} className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(cat.category_id)} className="p-2.5 hover:bg-rose-600/10 rounded-xl transition-colors text-gray-500 hover:text-rose-500">
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
        </div>
    );
}
