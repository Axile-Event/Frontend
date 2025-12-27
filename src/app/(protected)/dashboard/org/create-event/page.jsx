"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../../lib/axios";
import toast from "react-hot-toast";

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
    price: "",
    allows_seat_selection: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

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
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((s) => ({ ...s, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleImage = (e) => {
    const f = e.target.files?.[0] ?? null;
    setImageFile(f);
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
    if (form.pricing_type === "paid") {
      if (!form.price || Number(form.price) <= 0)
        e.price = "Price must be greater than 0";
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
      price: "",
      allows_seat_selection: false,
    });
    setImageFile(null);
    setPreview(null);
    setErrors({});
    setServerError("");
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("pricing_type", form.pricing_type);
      formData.append("event_type", form.event_type);
      formData.append("location", form.location.trim());

      // convert local datetime input to ISO with Z (server expects ISO 8601)
      // if user already provided an ISO string, this will still produce a valid ISO
      const isoDate = form.date ? new Date(form.date).toISOString() : "";
      formData.append("date", isoDate);

      if (form.capacity !== "" && form.capacity !== null) {
        // ensure integer
        formData.append("capacity", parseInt(form.capacity, 10));
      }
      // price required for paid; for free set 0.00 per docs
      if (form.pricing_type === "paid") {
        formData.append("price", parseFloat(form.price));
      } else {
        // append price 0 for free events (server may require)
        formData.append("price", 0.0);
      }

      formData.append(
        "allows_seat_selection",
        form.allows_seat_selection ? "true" : "false"
      );

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await api.post("/create-event/", formData);

      if (res && res.status >= 200 && res.status < 300) {
        toast.success("Event created successfully");
        resetForm();
      } else {
        setServerError(`Unexpected server response: ${res?.status}`);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        (err?.response?.data ? JSON.stringify(err.response.data) : null) ||
        err?.message ||
        "Failed to create event";
      setServerError(msg);
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

  return (
    <main
      className="min-h-screen text-slate-100"
      style={{
        background:
          "var(--sidebar-bg, linear-gradient(180deg,#05060a 0%, #000 100%))",
        color: "var(--text-color, #e6eef8)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div
          className="rounded-2xl overflow-hidden shadow-2xl border"
          style={{
            borderColor: "var(--sidebar-accent, rgba(148,163,184,0.06))",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
            backdropFilter: "blur(6px)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <section className="p-6 sm:p-8 lg:p-10">
              <header className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  Create event
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Fill in event details.{" "}
                  <span className="text-rose-500">*</span> required.
                </p>
              </header>

              <form onSubmit={submit} className="space-y-5" noValidate>
                {serverError && (
                  <div className="rounded-md bg-rose-900/30 border border-rose-800 p-3 text-rose-200 text-sm">
                    {serverError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="Event name"
                    aria-invalid={!!errors.name}
                    className={`mt-2 w-full rounded-xl bg-transparent border border-slate-800/60 px-3 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-(--sidebar-accent,#5b21b6) ${errors.name ? "ring-rose-500" : ""}`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-rose-400">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={handleChange("description")}
                    placeholder="What to expect, schedule, speakers..."
                    aria-invalid={!!errors.description}
                    className={`mt-2 w-full rounded-xl bg-transparent border border-slate-800/60 px-3 py-3 text-sm min-h-[120px] resize-y placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar-accent, #5b21b6)] ${errors.description ? "ring-rose-500" : ""}`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-rose-400">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300">
                      Pricing <span className="text-rose-500">*</span>
                    </label>
                    <div className="mt-2 flex items-center gap-4">
                      {pricingTypes.map((p) => (
                        <label
                          key={p.value}
                          className="inline-flex items-center gap-2 cursor-pointer text-sm"
                        >
                          <input
                            type="radio"
                            name="pricing"
                            value={p.value}
                            checked={form.pricing_type === p.value}
                            onChange={() =>
                              setForm((s) => ({
                                ...s,
                                pricing_type: p.value,
                                price: p.value === "free" ? "" : s.price,
                              }))
                            }
                            className="h-4 w-4 accent-(--sidebar-accent,#7c3aed)"
                          />
                          {p.label}
                        </label>
                      ))}
                    </div>
                    {errors.pricing_type && (
                      <p className="mt-1 text-xs text-rose-400">
                        {errors.pricing_type}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300">
                      Event type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={form.event_type}
                      onChange={handleChange("event_type")}
                      className="mt-2 w-full rounded-xl bg-transparent border border-slate-800/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--sidebar-accent,#5b21b6)"
                    >
                      {eventTypes.map((t) => (
                        <option
                          key={t.value}
                          value={t.value}
                          className="bg-slate-900 text-slate-200"
                        >
                          {t.label}
                        </option>
                      ))}
                    </select>
                    {configLoading && (
                      <p className="mt-1 text-xs text-slate-500">
                        Loading types…
                      </p>
                    )}
                    {errors.event_type && (
                      <p className="mt-1 text-xs text-rose-400">
                        {errors.event_type}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300">
                      Location <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={form.location}
                      onChange={handleChange("location")}
                      placeholder="Venue address or online link"
                      aria-invalid={!!errors.location}
                      className="mt-2 w-full rounded-xl bg-transparent border border-slate-800/60 px-3 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-(--sidebar-accent,#5b21b6)"
                    />
                    {errors.location && (
                      <p className="mt-1 text-xs text-rose-400">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300">
                      Date &amp; time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={form.date}
                      onChange={handleChange("date")}
                      aria-invalid={!!errors.date}
                      className="mt-2 w-full rounded-xl bg-transparent border border-slate-800/60 px-3 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-(--sidebar-accent,#5b21b6)"
                    />
                    {errors.date && (
                      <p className="mt-1 text-xs text-rose-400">
                        {errors.date}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300">
                      Capacity (optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.capacity}
                      onChange={handleChange("capacity")}
                      placeholder="e.g. 200"
                      className="mt-2 w-full rounded-xl bg-transparent border border-slate-800/60 px-3 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-(--sidebar-accent,#5b21b6)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300">
                      Price{" "}
                      {form.pricing_type === "paid" && (
                        <span className="text-rose-500">*</span>
                      )}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={handleChange("price")}
                      placeholder={
                        form.pricing_type === "paid"
                          ? "Amount"
                          : "Not required for free"
                      }
                      disabled={form.pricing_type === "free"}
                      className="mt-2 w-full rounded-xl bg-transparent border border-slate-800/60 px-3 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-(--sidebar-accent,#5b21b6) disabled:opacity-40"
                    />
                    {errors.price && (
                      <p className="mt-1 text-xs text-rose-400">
                        {errors.price}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-300">
                      Poster / image (optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImage}
                      className="mt-2 text-sm text-slate-400"
                    />
                    {preview && (
                      <img
                        src={preview}
                        alt="preview"
                        className="mt-3 h-36 w-full sm:w-56 rounded-md object-cover border border-slate-800/60"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={form.allows_seat_selection}
                        onChange={handleChange("allows_seat_selection")}
                        className="h-4 w-4 accent-(--sidebar-accent,#7c3aed)"
                      />
                      Allow seat selection
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg border border-slate-800 bg-transparent text-slate-300 hover:bg-slate-800/40"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-lg bg-var(--sidebar-accent,#7c3aed) text-white hover:brightness-95 disabled:opacity-60"
                  >
                    {loading ? "Creating..." : "Create event"}
                  </button>
                </div>
              </form>
            </section>

            {/* Preview */}
            <aside className="p-6 sm:p-8 lg:p-10 border-l border-slate-800/60 bg-linear-to-t from-black/30 to-transparent">
              <div className="sticky top-6">
                <h2 className="text-lg font-medium text-slate-100">
                  Live preview
                </h2>

                <div className="mt-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-sm">
                  {preview ? (
                    <div className="h-44 sm:h-56 w-full overflow-hidden bg-slate-800">
                      <img
                        src={preview}
                        alt="poster"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-44 sm:h-56 w-full flex items-center justify-center bg-linear-to-r from-indigo-900 to-slate-900 text-slate-400">
                      <span className="text-sm">No poster</span>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-100">
                          {form.name || "Event title"}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {eventTypes.find((t) => t.value === form.event_type)
                            ?.label || form.event_type}{" "}
                          • {form.pricing_type === "paid" ? "Paid" : "Free"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-100">
                          {form.pricing_type === "paid" && form.price
                            ? `${form.price}`
                            : form.pricing_type === "paid"
                              ? "Price"
                              : "Free"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formattedDate(form.date)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-slate-300 line-clamp-4">
                      {form.description ||
                        "Event description preview will appear here."}
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-300">
                      <div>
                        <strong className="text-slate-200">Location: </strong>
                        <span>{form.location || "TBD"}</span>
                      </div>
                      <div>
                        <strong className="text-slate-200">Capacity: </strong>
                        <span>{form.capacity || "Unlimited"}</span>
                      </div>
                      <div>
                        <strong className="text-slate-200">
                          Seat selection:{" "}
                        </strong>
                        <span>
                          {form.allows_seat_selection ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        disabled
                        className="px-3 py-1 rounded bg-(--sidebar-accent,#7c3aed) text-white text-sm"
                      >
                        Preview
                      </button>
                      <button
                        disabled
                        className="px-3 py-1 rounded border border-slate-800 text-sm"
                      >
                        Share
                      </button>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  Preview updates live as you fill the form. Images are local
                  previews until submission.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
