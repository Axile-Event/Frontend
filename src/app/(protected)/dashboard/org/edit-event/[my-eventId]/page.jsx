"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import Loading from "@/components/ui/Loading";
import { Skeleton } from "@/components/ui/skeleton";
import DateTimePicker from "@/components/ui/DateTimePicker";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.["my-eventId"];
  const isMountedRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    date: "",
    event_type: "",
    pricing_type: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
          
          // Format date for datetime-local input
          const formattedDate = eventData.date
            ? new Date(eventData.date).toISOString().slice(0, 16)
            : "";

          setForm({
            name: eventData.name || "",
            description: eventData.description || "",
            location: eventData.location || "",
            date: formattedDate,
            event_type: eventData.event_type || "",
            pricing_type: eventData.pricing_type || "",
          });

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
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();

      // Append all form fields
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("location", form.location);
      formData.append("event_type", form.event_type);
      formData.append("pricing_type", form.pricing_type);
      
      // Format date back to ISO string
      if (form.date) {
        const isoDate = new Date(form.date).toISOString();
        formData.append("date", isoDate);
      }

      // Append new image if selected
      if (imageFile) {
        formData.append("image", imageFile);
      }

      // TODO: Replace with actual edit endpoint once confirmed by backend
      // Currently using a placeholder endpoint - update this when backend confirms the endpoint
      const response = await api.patch(`/organizer/events/${eventId}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Event updated successfully!");
      router.push(`/dashboard/org/my-event/${eventId}`);
    } catch (err) {
      console.error("Error updating event:", err);
      const errorMsg = err.response?.data?.error || "Failed to update event. The edit endpoint may not be available yet.";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-10 pb-32">
        <div className="max-w-4xl mx-auto space-y-8">
           <Skeleton className="h-6 w-24" />
           
           <div className="space-y-4">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-64" />
           </div>

           {/* Form Skeleton */}
           <div className="space-y-8">
              <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
                 <Skeleton className="h-8 w-40 mb-6" />
                 <div className="space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                 </div>
                 <div className="space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <Skeleton className="h-4 w-24" />
                       <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                    <div className="space-y-4">
                       <Skeleton className="h-4 w-24" />
                       <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                 </div>
              </div>
           </div>
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
    <div className="min-h-screen bg-black text-white p-4 md:p-10 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Edit Event
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Update your event details below
          </p>
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <p className="text-amber-400 text-sm font-medium">
              ⚠️ <strong>Note:</strong> This edit functionality requires backend API support.
              If you encounter errors, please confirm the edit endpoint with your backend team.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold">Basic Information</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Event Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={handleChange("description")}
                required
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500 transition-all resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={handleChange("location")}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Date & Time <span className="text-rose-500">*</span>
                </label>
                <DateTimePicker
                  selected={form.date}
                  onChange={(value) => setForm(prev => ({ ...prev, date: value }))}
                  placeholder="Select event date and time"
                  minDate={null}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Event Type <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.event_type}
                  onChange={handleChange("event_type")}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500 transition-all"
                 />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold">Pricing</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Pricing Type <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pricing_type"
                    value="free"
                    checked={form.pricing_type === "free"}
                    onChange={handleChange("pricing_type")}
                    className="text-rose-500"
                  />
                  <span className="text-sm">Free</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pricing_type"
                    value="paid"
                    checked={form.pricing_type === "paid"}
                    onChange={handleChange("pricing_type")}
                    className="text-rose-500"
                  />
                  <span className="text-sm">Paid</span>
                </label>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Ticket prices and capacity are now managed via ticket categories.
            </p>
          </div>

          {/* Event Image */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold">Event Image</h2>

            <div className="space-y-4">
              {preview && (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                  <img
                    src={preview}
                    alt="Event poster"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-rose-600 file:text-white hover:file:bg-rose-700 file:cursor-pointer"
              />
              <p className="text-xs text-gray-500">
                Upload a new image to replace the current one
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-300 font-bold transition-all hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update 
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
