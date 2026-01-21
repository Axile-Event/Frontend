"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "../../../../../lib/axios";
import toast from "react-hot-toast";
import useOrganizerStore from "../../../../../store/orgStore";
import CustomDropdown from "@/components/ui/CustomDropdown";
import Loading from "@/components/ui/Loading";
import PinPromptModal from "@/components/PinPromptModal";
import {
  MapPin,
  Calendar,
  Camera,
  ImageIcon,
  Eye,
  X,
  ChevronDown,
  CheckCircle2,
  Ticket,
  ArrowRight,
  XCircle,
  Plus,
  Edit2,
  Zap,
} from "lucide-react";
import DateTimePicker from "@/components/ui/DateTimePicker";

const FALLBACK_EVENT_TYPES = [
  { value: "conference", label: "Conference" },
  { value: "concert", label: "Concert" },
  { value: "meetup", label: "Meetup" },
  { value: "workshop", label: "Workshop" },
  { value: "webinar", label: "Webinar" },
  { value: "other", label: "Other" },
];

export default function CreateEvent() {
  const router = useRouter();
  // const { triggerRefetch } = useOrganizerStore(); // triggerRefetch is not in the store definition
  const { addEvent, organization } = useOrganizerStore();

  const [configLoading, setConfigLoading] = useState(true);
  const [eventTypes, setEventTypes] = useState(FALLBACK_EVENT_TYPES);
  const [pricingTypes, setPricingTypes] = useState([
    { value: "free", label: "Free" },
    { value: "paid", label: "Paid" },
  ]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    pricing_type: "free",
    event_type: FALLBACK_EVENT_TYPES[0].value,
    location: "",
    date: "",
    capacity: "",
  });

  const [categories, setCategories] = useState([]);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdEventId, setCreatedEventId] = useState(null);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  // Fetch config (GET /config/) and populate eventTypes/pricingTypes.
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
          setForm((f) => ({
            ...f,
            event_type: f.event_type || data.event_types[0].value,
          }));
        }
        if (Array.isArray(data.pricing_types) && data.pricing_types.length) {
          setPricingTypes(data.pricing_types);
          setForm((f) => ({
            ...f,
            pricing_type: f.pricing_type || data.pricing_types[0].value,
          }));
        }
      } catch {
        // fallback silently to defaults
      } finally {
        if (mounted) setConfigLoading(false);
      }
    }
    loadConfig();
    return () => (mounted = false);
    // api is stable (module import). Disable exhaustive-deps to avoid noisy warning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setPreview(null);
      return;
    }
    // Use a data: URL for preview so it works even when CSP blocks blob:.
    if (!(imageFile instanceof File)) {
      setPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setPreview(typeof result === "string" ? result : null);
    };
    reader.onerror = () => {
      setPreview(null);
      toast.error("Failed to preview image");
    };

    reader.readAsDataURL(imageFile);
    return () => {
      try {
        reader.abort();
      } catch {
        // ignore
      }
    };
  }, [imageFile]);

  const handleChange = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((s) => ({ ...s, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  // const handleImage = (e) => {
  //   const file = e.target.files?.[0];
  //   console.log("File selected:", file);
    
  //   if (!file) {
  //     console.log("No file selected");
  //     setImageFile(null);
  //     return;
  //   }

  //   // Validate file type
  //   if (!file.type.startsWith('image/')) {
  //     toast.error("Please select an image file");
  //     console.error("Invalid file type:", file.type);
  //     e.target.value = ''; // Reset input
  //     return;
  //   }

  //   // Validate file size (max 5MB)
  //   const maxSize = 5 * 1024 * 1024; // 5MB
  //   if (file.size > maxSize) {
  //     toast.error("Image size must be less than 5MB");
  //     console.error("File too large:", file.size);
  //     e.target.value = ''; // Reset input
  //     return;
  //   }

  //   console.log("Valid image file:", file.name, file.type, file.size);
  //   setImageFile(file);
  // };


  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    // allow re-selecting same file again
    e.target.value = "";
  };

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

    // New behavior requested:
    // - Free events MUST have a capacity
    // - Paid events use ticket categories for capacity and pricing
    if (form.pricing_type === "free") {
      const capVal = parseInt(String(form.capacity).replace(/,/g, ""), 10);
      if (!form.capacity || isNaN(capVal) || capVal < 1) {
        e.capacity = "Capacity is required for free events";
      }
    } else {
      // Paid event: require at least one category with a valid price
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

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      pricing_type: pricingTypes[0]?.value || "free",
      event_type: eventTypes[0]?.value || FALLBACK_EVENT_TYPES[0].value,
      location: "",
      date: "",
      capacity: "",
    });
    setImageFile(null);
    setPreview(null);
    setErrors({});
    setCategories([]);
  };



  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    // Check if PIN is set from database
    if (!organization?.has_pin) {
      toast.error('Please set up your PIN first from the dashboard');
      return;
    }

    // Require PIN verification before creating event
    setPendingSubmit(true);
    setShowPinPrompt(true);
  };

  const executeCreateEvent = async () => {
    setLoading(true);
    setPendingSubmit(false);

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("pricing_type", form.pricing_type);
      formData.append("event_type", form.event_type);
      formData.append("location", form.location.trim());

      // convert local datetime input to ISO with Z
      const isoDate = form.date ? new Date(form.date).toISOString() : "";
      formData.append("date", isoDate);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      // IMPORTANT: don't set Content-Type for FormData; the browser will add the correct boundary.
      const res = await api.post("/event/", formData);


      if (res && res.status >= 200 && res.status < 300) {
        const newId = res.data.event_id || res.data.id;

        // If backend hasn't propagated the image URL yet, keep the selected image
        // so the organizer can still see the correct cover immediately in My Events.
        if (newId && preview) {
          try {
            sessionStorage.setItem(`created-event-image:${newId}`, preview);
          } catch {
            // ignore storage failures (private mode, quota, etc.)
          }
        }

        // Create categories (required by migration)
          const categoriesToCreate =
            form.pricing_type === "free"
              ? [
                  {
                    name: "General",
                    price: 0,
                    max_tickets: form.capacity,
                  },
                ]
              : categories;

          if (categoriesToCreate.length > 0) {
          try {
            await Promise.all(
                categoriesToCreate.map((cat) => {
                  if (!cat.name) return Promise.resolve();

                const rawPrice = String(cat.price ?? "").trim();
                const parsedPrice = rawPrice === "" ? 0 : parseFloat(String(cat.price).replace(/,/g, ""));
                // Round to 2 decimal places to avoid floating-point precision issues
                const catPrice = Math.round(parsedPrice * 100) / 100;
                const catMaxTickets = cat.max_tickets
                  ? parseInt(String(cat.max_tickets).replace(/,/g, ""), 10)
                  : null;
                
                const categoryPayload = {
                  event_id: newId,
                  name: cat.name,
                  price: !isNaN(catPrice) ? catPrice : 0,
                  max_tickets: !isNaN(catMaxTickets) ? catMaxTickets : null,
                };
                
                // Include description if provided
                if (cat.description?.trim()) {
                  categoryPayload.description = cat.description.trim();
                }
                
                return api.post("/tickets/categories/create/", categoryPayload);
              })
            );
          } catch (catErr) {
            console.error("Error creating categories:", catErr);
            toast.error(
              "Event created, but some ticket categories failed to create. You can add them later."
            );
          }
        }

        setCreatedEventId(newId);
        setShowSuccessModal(true);
        
        // resetForm();
      } else {
        toast.error(`Unexpected server response: ${res?.status}`);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        (err?.response?.data ? JSON.stringify(err.response.data) : null) ||
        err?.message ||
        "Failed to create event";
      toast.error(msg);
      console.error("Create event error:", err?.response || err);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
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

  if (configLoading) {
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
            {/* Event Name */}
            <div className="space-y-2">
              <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
              <div className="h-32 w-full bg-white/5 rounded-xl animate-pulse" />
            </div>
            
            {/* Pricing & Type Row */}
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
            
            {/* Location & Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
              </div>
            </div>
            
            {/* Image Upload */}
            <div className="space-y-2">
              <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
              <div className="h-40 w-full bg-white/5 rounded-xl animate-pulse" />
            </div>
            
            {/* Submit Button */}
            <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
          </section>

          {/* Preview Section Skeleton */}
          <section className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-5 w-5 bg-white/5 rounded animate-pulse" />
              <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
            </div>
            
            {/* Preview Image */}
            <div className="h-48 w-full bg-white/5 rounded-xl animate-pulse" />
            
            {/* Preview Details */}
            <div className="space-y-4">
              <div className="h-6 w-3/4 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
              
              <div className="flex gap-4 pt-4">
                <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-10 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">Create Event</h1>
          <p className="text-gray-400 text-xs">
            Fill in event details. <span className="text-rose-500">*</span>{" "}
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
          <form onSubmit={submit} className="space-y-6" noValidate>
            {/* No more serverError div */}

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
                      onClick={() =>
                        {
                          setForm((s) => ({
                            ...s,
                            pricing_type: p.value,
                            // Capacity is only for free events
                            capacity: p.value === "paid" ? "" : s.capacity,
                          }));
                          setErrors((prev) => ({
                            ...prev,
                            pricing_type: undefined,
                            capacity: undefined,
                            categories: undefined,
                          }));
                          if (p.value === "free") {
                            // Simplify free event flow: capacity-driven single category
                            setCategories([]);
                          }
                        }
                      }
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
              {form.pricing_type === "free" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Capacity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.capacity}
                    onChange={handleChange("capacity")}
                    placeholder="e.g. 100"
                    className={`w-full bg-white/5 border ${errors.capacity ? "border-rose-500/50 focus:border-rose-500" : "border-white/10 focus:border-rose-500"} rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all`}
                  />
                  {errors.capacity && (
                    <p className="text-[10px] text-rose-500 font-bold">
                      {errors.capacity}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-500 font-medium">
                    Free events require a capacity. This becomes the max tickets for the default “General” category.
                  </p>
                </div>
              )}
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
                      Click to upload cover image
                    </span>
                    <span className="text-[10px] text-gray-600 mt-1">
                      PNG, JPG up to 5MB
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
                      No ticket categories added. Events must have at least one ticket category.
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Creating Event...
                </>
              ) : (
                "Create Event"
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
              {preview || imageFile ? (
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
                  Get Tickets
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
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 transform animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
              </div>
              <h2 className="text-2xl font-bold text-white">Event Created & Pending</h2>
              <p className="text-gray-400 text-center max-w-md">
                Your event has been successfully created and is currently pending approval. An email will be delivered to you once your event is approved and is live.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  resetForm();
                  router.push("/dashboard/org/my-event");
                }}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
              >
                Go to My Events
                <ArrowRight className="w-4 h-4" />
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
          setPendingSubmit(false);
        }}
        onSuccess={() => {
          setShowPinPrompt(false);
          executeCreateEvent();
        }}
        action="create event"
        requireSetup={true}
      />
    </div>
  );
}
