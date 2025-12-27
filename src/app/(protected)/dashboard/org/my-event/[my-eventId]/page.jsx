"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "../../../../../../lib/axios";

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.["my-eventId"] ?? params?.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isMountedRef = useRef(true);

  const formattedDate = (iso) => {
    if (!iso) return "TBD";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const fetchEvent = useCallback(async () => {
    if (!id) {
      setError("Invalid event id");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/events/${id}/details`);
      if (isMountedRef.current) setEvent(res?.data ?? null);
    } catch (err) {
      try {
        const fallback = await api.get("/organizer/events/");
        const list = Array.isArray(fallback.data)
          ? fallback.data
          : (fallback.data?.events ?? []);
        const found = list.find(
          (e) => String(e.event_id ?? e.id) === String(id)
        );
        if (isMountedRef.current) {
          if (found) setEvent(found);
          else setError("Event not found");
        }
      } catch (inner) {
        if (isMountedRef.current) {
          setError(
            inner?.response?.data?.detail ||
              inner?.message ||
              "Failed to load event"
          );
        }
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchEvent();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchEvent]);

  const eventMeta = event
    ? [
        { label: "Date & Time", value: formattedDate(event.date) },
        { label: "Location", value: event.location || "TBD" },
        { label: "Capacity", value: event.capacity ?? "Unlimited" },
        {
          label: "Seat selection",
          value: event.allows_seat_selection ? "Enabled" : "Disabled",
        },
      ]
    : [];

  const ticketStats = event
    ? [
        {
          label: "Total tickets",
          value: event.ticket_stats?.total_tickets ?? 0,
        },
        {
          label: "Confirmed",
          value: event.ticket_stats?.confirmed_tickets ?? 0,
        },
        {
          label: "Pending",
          value: event.ticket_stats?.pending_tickets ?? 0,
        },
        {
          label: "Available",
          value: event.ticket_stats?.available_spots ?? "-",
        },
        {
          label: "Revenue",
          value: `₦${event.ticket_stats?.total_revenue ?? 0}`,
        },
      ]
    : [];

  if (loading) {
    return (
      <main className="min-h-screen bg-linear-to-b from-[#05060a] to-black p-10 text-slate-100">
        <div className="max-w-6xl mx-auto animate-pulse space-y-6">
          <div className="h-10 w-1/3 bg-slate-800 rounded" />
          <div className="h-80 bg-slate-800 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-linear-to-b from-[#05060a] to-black p-10 text-slate-100">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <p className="text-rose-400 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded border border-slate-700"
          >
            ← Back
          </button>
        </div>
      </main>
    );
  }

  if (!event) return null;

  return (
    <main className="min-h-screen bg-linear-to-b from-[#05060a] to-black text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl shadow-2xl">
          <div className="p-8 lg:p-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl font-semibold">{event.name}</h1>
                <p className="mt-1 text-sm text-slate-400">
                  {event.event_type} •{" "}
                  {event.pricing_type === "paid" ? "Paid" : "Free"}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/org/edit-event/${event.event_id ?? event.id}`
                    )
                  }
                  className="px-5 py-2 rounded-xl bg-(--sidebar-accent,#7c3aed) text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 rounded-xl border border-slate-700"
                >
                  Back
                </button>
              </div>
            </header>

            {/* Main layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left */}
              <section className="lg:col-span-2 space-y-8">
                <div className="h-96 rounded-2xl overflow-hidden bg-slate-800">
                  <img
                    src={event.image || ""}
                    alt={event.name}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = "")}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-medium mb-3">Description</h2>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                    {event.description || "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {eventMeta.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
                    >
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-100">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Right */}
              <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 h-fit">
                <h3 className="text-sm font-medium mb-5">Ticket Summary</h3>

                <div className="space-y-4 text-sm">
                  {ticketStats.map((stat) => (
                    <div key={stat.label} className="flex justify-between">
                      <span className="text-slate-400">{stat.label}</span>
                      <span className="font-medium text-slate-100">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/org/events/${event.event_id ?? event.id}/tickets`
                      )
                    }
                    className="w-full px-4 py-2 rounded-xl bg-(--sidebar-accent,#7c3aed) text-white"
                  >
                    View tickets
                  </button>
                  <button className="w-full px-4 py-2 rounded-xl border border-slate-700">
                    Manage settings
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
