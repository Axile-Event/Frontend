"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { ChevronLeft, Save, Loader2, X, Plus, Edit2, Trash2, Camera, MapPin, Eye, ImageIcon, Zap, Ticket, Calendar } from "lucide-react";
import Loading from "@/components/ui/Loading";
import { Skeleton } from "@/components/ui/skeleton";
import DateTimePicker from "@/components/ui/DateTimePicker";
import CustomDropdown from "@/components/ui/CustomDropdown";
import PinPromptModal from "@/components/PinPromptModal";
import { motion } from "framer-motion";

const FALLBACK_EVENT_TYPES = [
  { value: "conference", label: "Conference" },
  { value: "concert", label: "Concert" },
  { value: "meetup", label: "Meetup" },
  { value: "workshop", label: "Workshop" },
  { value: "webinar", label: "Webinar" },
  { value: "other", label: "Other" },
];

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.["my-eventId"];
  const isMountedRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [eventTypes, setEventTypes] = useState(FALLBACK_EVENT_TYPES);
  const [pricingTypes, setPricingTypes] = useState([
    { value: "free", label: "Free" },
    { value: "paid", label: "Paid" },
  ]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    date: "",
    event_type: "",
    pricing_type: "",
    max_quantity_per_booking: "",
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch config on mount
  useEffect(() => {
    let mounted = true;
    async function loadConfig() {
      setConfigLoading(true);
      try {
        const res = await api.get("/config/");
        const data = res?.data || {};
        if (!mounted) return;
        if (Array.isArray(data.event_types) && data.event_types.length) {
          setEventTypes(data.event_types);
        }
        if (Array.isArray(data.pricing_types) && data.pricing_types.length) {
          setPricingTypes(data.pricing_types);
        }
      } catch {
        // fallback silently to defaults
      } finally {
        if (mounted) setConfigLoading(false);
      }
    }
    loadConfig();
    return () => (mounted = false);
  }, []);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        toast.error("Invalid event ID");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/events/${eventId}/details/`);
        const eventData = res?.data;

        if (isMountedRef.current && eventData) {
          setEvent(eventData);
          
          // Parse date correctly for DateTimePicker
          const dateObj = eventData.date ? new Date(eventData.date) : null;
          
          setForm({
            name: eventData.name || "",
            description: eventData.description || "",
            location: eventData.location || "",
            date: dateObj ? dateObj.toISOString() : "",
            event_type: eventData.event_type || "",
            pricing_type: eventData.pricing_type || "free",
            max_quantity_per_booking: eventData.max_quantity_per_booking || "",
          });

          // Load ticket categories if paid event
          if (eventData.pricing_type === "paid" && eventData.ticket_categories) {
            setCategories(eventData.ticket_categories || []);
          }

          if (eventData.image) {
            setPreview(eventData.image);
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          toast.error("Failed to load event details");
          console.error(err);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type?.startsWith("image/")) {
      toast.error("Please select an image file");
      e.target.value = "";
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Alias for handleImage for backward compatibility
  const handleImageChange = handleImage;

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        name: "",
        price: "",
        max_tickets: "",
        description: "",
      },
    ]);
  };

  const removeCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategory = (index, key, value) => {
    const newCats = [...categories];
    newCats[index][key] = value;
    setCategories(newCats);
  };

  // Format number with commas for display
  const formatPriceWithCommas = (value) => {
    // Remove non-digit characters except decimal point
    const cleaned = String(value).replace(/[^\d.]/g, "");
    // Split by decimal point to handle decimals separately
    const parts = cleaned.split(".");
    // Format the integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // Rejoin with decimal if exists
    return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
  };

  // Handle price input change with comma formatting
  const handlePriceChange = (index, rawValue) => {
    // Remove commas to get raw number for storage
    const numericValue = rawValue.replace(/,/g, "");
    // Only allow digits and one decimal point
    if (/^\d*\.?\d*$/.test(numericValue)) {
      updateCategory(index, "price", numericValue);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!["paid", "free"].includes(form.pricing_type))
      e.pricing_type = "Invalid pricing type";
    if (!form.event_type) e.event_type = "Event type is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.date) e.date = "Date & time is required";

    // For paid events, require at least one category with a valid price
    if (form.pricing_type === "paid") {
      const nonEmptyCategories = categories.filter((c) => (c?.name || "").trim());
      if (nonEmptyCategories.length === 0) {
        e.categories = "At least one ticket category is required for paid events";
      } else {
        const invalidCategory = nonEmptyCategories.find((c) => {
          const rawPrice = String(c?.price ?? "").trim();
          const parsedPrice = rawPrice === "" ? NaN : Number(rawPrice);
          return !Number.isFinite(parsedPrice) || parsedPrice <= 0;
        });

        if (invalidCategory) {
          e.categories = "Each category must have a price greater than 0";
        }
      }
    }

    // length checks per docs
    if (form.name && form.name.length > 200)
      e.name = "Name must be ≤ 200 characters";
    if (form.location && form.location.length > 200)
      e.location = "Location must be ≤ 200 characters";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setPendingSubmit(true);
    setShowPinPrompt(true);
  };

  const executeUpdateEvent = async () => {
    setSubmitting(true);
    setPendingSubmit(false);

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("pricing_type", form.pricing_type);
      formData.append("event_type", form.event_type);
      formData.append("location", form.location.trim());

      const isoDate = form.date ? new Date(form.date).toISOString() : "";
      formData.append("date", isoDate);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Add max_quantity_per_booking if provided
      if (form.max_quantity_per_booking) {
        formData.append("max_quantity_per_booking", form.max_quantity_per_booking);
      }

      const response = await api.patch(`/events/${eventId}/update/`, formData);

      if (response && response.status >= 200 && response.status < 300) {
        // Update categories for paid events
        if (form.pricing_type === "paid" && categories.length > 0) {
          try {
            await Promise.all(
              categories.map((cat) => {
                if (!cat.name || !cat.name.trim()) return Promise.resolve();

                const rawPrice = String(cat.price ?? "").trim();
                const parsedPrice = rawPrice === "" ? 0 : parseFloat(String(cat.price).replace(/,/g, ""));
                const catPrice = Math.round(parsedPrice * 100) / 100;
                const catMaxTickets = cat.max_tickets
                  ? parseInt(String(cat.max_tickets).replace(/,/g, ""), 10)
                  : null;

                // Get the category ID - check both 'id' and 'category_id' fields
                const categoryId = cat.id || cat.category_id;

                // If category has an ID, update it; otherwise create it
                if (categoryId) {
                  return api.patch(`/tickets/categories/${categoryId}/`, {
                    name: cat.name.trim(),
                    price: !isNaN(catPrice) ? catPrice : 0,
                    max_tickets: !isNaN(catMaxTickets) ? catMaxTickets : null,
                  });
                } else {
                  return api.post("/tickets/categories/create/", {
                    event_id: eventId,
                    name: cat.name.trim(),
                    price: !isNaN(catPrice) ? catPrice : 0,
                    max_tickets: !isNaN(catMaxTickets) ? catMaxTickets : null,
                  });
                }
              })
            );
          } catch (catErr) {
            console.error("Error updating categories:", catErr);
            toast.error(
              "Event updated, but some ticket categories failed to update. You can manage them in the tickets section."
            );
          }
        }

        toast.success("Event updated successfully!");
        router.push(`/dashboard/org/my-event/${eventId}`);
      } else {
        toast.error(`Unexpected server response: ${response?.status}`);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        (err?.response?.data ? JSON.stringify(err.response.data) : null) ||
        err?.message ||
        "Failed to update event";
      toast.error(msg);
      console.error("Update event error:", err?.response || err);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  const formattedDate = (iso) => {
    if (!iso) return "TBD";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  if (loading || configLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 space-y-10 max-w-7xl mx-auto text-white">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="h-7 w-40 bg-white/5 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-56 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section Skeleton */}
          <section className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
              <div className="h-32 w-full bg-white/5 rounded-xl animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
              </div>
            </div>
          </section>

          {/* Preview Section Skeleton */}
          <section className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-5 w-5 bg-white/5 rounded animate-pulse" />
              <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="h-48 w-full bg-white/5 rounded-xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 w-3/4 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-gray-400">Event not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-10 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">Edit Event</h1>
          <p className="text-gray-400 text-xs">
            Update your event details. <span className="text-rose-500">*</span>{" "}
            required.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs font-semibold text-gray-500 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <section className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Event Name <span className="text-rose-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={handleChange("name")}
                placeholder="e.g. Summer Tech Conference 2024"
                className={`w-full bg-white/5 border ${errors.name ? "border-rose-500/50 focus:border-rose-500" : "border-white/10 focus:border-rose-500"} rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all`}
              />
              {errors.name && (
                <p className="text-[10px] text-rose-500 font-bold">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={handleChange("description")}
                placeholder="What to expect, schedule, speakers..."
                className={`w-full bg-white/5 border ${errors.description ? "border-rose-500/50 focus:border-rose-500" : "border-white/10 focus:border-rose-500"} rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all min-h-[120px] resize-y`}
              />
              {errors.description && (
                <p className="text-[10px] text-rose-500 font-bold">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Pricing <span className="text-rose-500">*</span>
                </label>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                  {pricingTypes.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => {
                        setForm((s) => ({
                          ...s,
                          pricing_type: p.value,
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          pricing_type: undefined,
                          categories: undefined,
                        }));
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${form.pricing_type === p.value ? "bg-rose-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <CustomDropdown
                value={form.event_type}
                onChange={(val) => {
                  setForm((s) => ({ ...s, event_type: val }));
                  setErrors((p) => ({ ...p, event_type: undefined }));
                }}
                options={eventTypes.map((t) => ({
                  value: t.value || t,
                  label: t.label || t,
                  icon: Zap,
                }))}
                placeholder="Select Type"
                error={errors.event_type}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Location <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    value={form.location}
                    onChange={handleChange("location")}
                    placeholder="Venue address or online link"
                    className={`w-full pl-10 bg-white/5 border ${errors.location ? "border-rose-500/50 focus:border-rose-500" : "border-white/10 focus:border-rose-500"} rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all`}
                  />
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
                {errors.location && (
                  <p className="text-[10px] text-rose-500 font-bold">
                    {errors.location}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Date & Time <span className="text-rose-500">*</span>
                </label>
                <DateTimePicker
                  selected={form.date}
                  onChange={(value) => setForm(prev => ({ ...prev, date: value }))}
                  placeholder="Select event date and time"
                  hasError={!!errors.date}
                />
                {errors.date && (
                  <p className="text-[10px] text-rose-500 font-bold">
                    {errors.date}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Max Tickets Per Booking
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.max_quantity_per_booking}
                  onChange={handleChange("max_quantity_per_booking")}
                  placeholder="Default: 3"
                  className="w-full bg-white/5 border border-white/10 focus:border-rose-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all"
                />
                <p className="text-[10px] text-gray-500 font-medium">
                  Maximum number of tickets a user can purchase in a single booking. Defaults to 3 if not set.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Cover Image {imageFile && <span className="text-rose-500">• Selected: {imageFile.name}</span>}
                </label>
                <div className="relative group cursor-pointer border-2 border-dashed border-white/10 rounded-2xl hover:border-rose-500/50 hover:bg-rose-500/5 transition-all h-32 flex flex-col items-center justify-center text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="pointer-events-none flex flex-col items-center">
                    <Camera className="w-8 h-8 mb-2 text-gray-500 group-hover:text-rose-400 transition-colors" />
                    <span className="text-xs text-gray-500 group-hover:text-rose-400 font-medium">
                      Click to upload new cover image
                    </span>
                  </div>
                </div>
                {preview && (
                  <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-white/10 mt-3 group">
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-rose-600 text-white p-1.5 rounded-lg backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Ticket Categories Section */}
              {form.pricing_type === "paid" && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-rose-500" />
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                        Ticket Categories
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={addCategory}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 rounded-lg text-[10px] font-bold transition-all border border-rose-500/20 group"
                    >
                      <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      ADD CATEGORY
                    </button>
                  </div>

                  {categories.length === 0 ? (
                    <div className="bg-white/5 border border-white/5 rounded-xl p-6 text-center">
                      <p className="text-[10px] text-gray-500 font-medium">
                        No ticket categories. Events must have at least one ticket category.
                      </p>
                      {errors.categories && (
                        <p className="text-[10px] text-rose-500 font-bold mt-2">
                          {errors.categories}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categories.map((cat, idx) => (
                        <div
                          key={idx}
                          className="relative bg-white/5 border border-white/10 rounded-xl p-4 space-y-4 group"
                        >
                          <button
                            type="button"
                            onClick={() => removeCategory(idx)}
                            className="absolute top-3 right-3 p-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-lg transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                Category Name{" "}
                                <span className="text-rose-500">*</span>
                              </label>
                              <input
                                value={cat.name}
                                onChange={(e) =>
                                  updateCategory(idx, "name", e.target.value)
                                }
                                placeholder="e.g. VIP, Early Bird"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                Price (₦) <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={formatPriceWithCommas(cat.price)}
                                onChange={(e) =>
                                  handlePriceChange(idx, e.target.value)
                                }
                                placeholder="0.00"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 transition-all"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                Max Tickets
                              </label>
                              <input
                                type="number"
                                value={cat.max_tickets}
                                onChange={(e) =>
                                  updateCategory(
                                    idx,
                                    "max_tickets",
                                    e.target.value
                                  )
                                }
                                placeholder="Unlimited"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 transition-all"
                              />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                                <span>Description</span>
                                <span className={`${(cat.description?.length || 0) > 140 ? 'text-rose-500' : 'text-gray-600'}`}>
                                  {cat.description?.length || 0}/150
                                </span>
                              </label>
                              <textarea
                                value={cat.description || ""}
                                onChange={(e) =>
                                  updateCategory(idx, "description", e.target.value)
                                }
                                maxLength={150}
                                placeholder="Describe what this ticket includes (e.g., Front row seats, Backstage access)"
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 transition-all resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-rose-600 file:text-white hover:file:bg-rose-700 file:cursor-pointer"
              />
              <p className="text-xs text-gray-500">
                Upload a new image to replace the current one (max 5MB)
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Updating Event...
                </>
              ) : (
                "Update Event"
              )}
            </button>
          </form>
        </section>

        {/* Live Preview Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-white/5 rounded-lg">
              <Eye className="w-4 h-4 text-rose-500" />
            </div>
            <h2 className="text-lg font-bold">Live Preview</h2>
          </div>

          {/* Preview Card */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="h-48 relative overflow-hidden bg-white/5">
              {preview ? (
                <img
                  src={preview}
                  alt="poster"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 gap-2">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    No Cover Image
                  </span>
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md border ${
                    form.pricing_type === "free"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  }`}
                >
                  {form.pricing_type === "paid" ? "PAID" : "FREE"}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-xl font-bold line-clamp-2 leading-tight">
                  {form.name || "Untitled Event"}
                </h3>
                <p className="text-rose-500 text-xs font-bold mt-2 uppercase tracking-wider">
                  {eventTypes.find((t) => t.value === form.event_type)?.label ||
                    form.event_type ||
                    "Event Type"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formattedDate(form.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{form.location || "Location TBD"}</span>
                </div>
              </div>

              <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                {form.description || "Description will appear here..."}
              </p>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">
                    Price
                  </p>
                  <p className="text-white font-bold text-lg">
                    {(() => {
                      if (form.pricing_type === "free") return "Free";
                      const prices = categories
                        .filter((c) => (c?.name || "").trim())
                        .map((c) => Number(String(c?.price ?? "").trim() || 0))
                        .filter((n) => Number.isFinite(n) && n >= 0);
                      if (!prices.length) return "Paid";
                      const minPrice = Math.min(...prices);
                      return `From ₦${minPrice.toLocaleString()}`;
                    })()}
                  </p>
                </div>
                <button
                  disabled
                  className="px-4 py-2 bg-white/5 text-gray-500 rounded-lg text-xs font-bold cursor-default"
                >
                  View Event
                </button>
              </div>

              {/* Categories Preview */}
              {categories.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    Available Tickets
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(
                      (cat, i) =>
                        cat.name && (
                          <div
                            key={i}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2"
                          >
                            <span className="text-[10px] font-bold text-gray-300">
                              {cat.name}
                            </span>
                            <span className="text-[10px] font-black text-rose-500">
                              ₦{formatPriceWithCommas(cat.price) || "0"}
                            </span>
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 text-xs text-rose-300 font-medium text-center">
            Values update in real-time as you type.
          </div>
        </section>
      </div>

      {/* PIN Prompt Modal */}
      <PinPromptModal
        isOpen={showPinPrompt}
        onClose={() => {
          setShowPinPrompt(false);
          setPendingSubmit(false);
        }}
        onSuccess={() => {
          setShowPinPrompt(false);
          executeUpdateEvent();
        }}
        action="update event"
        requireSetup={true}
      />
    </div>
  );
}
