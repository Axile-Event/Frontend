"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../../lib/axios";
import { Loader2 } from "lucide-react";

const MyEvent = () => {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const isMountedRef = useRef(true);

  const fetchEvents = useCallback(async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setServerError("");
    try {
      const res = await api.get("/organizer/events/");
      const payload = res?.data;
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (Array.isArray(payload?.events)) list = payload.events;
      else if (Array.isArray(payload?.data)) list = payload.data;
      else list = [];
      if (isMountedRef.current) setEvents(list);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        (err?.response?.data ? JSON.stringify(err.response.data) : null) ||
        err?.message ||
        "Failed to load events";
      if (isMountedRef.current) setServerError(msg);
      console.error("Error fetching events:", msg);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchEvents();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchEvents]);

  const formattedDate = (iso) => {
    if (!iso) return "TBD";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };



  return (
    <div className="w-full text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div
          className="rounded-2xl overflow-hidden shadow-2xl border"
          style={{
            borderColor: "var(--sidebar-accent, rgba(148,163,184,0.06))",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
            backdropFilter: "blur(6px)",
          }}
        >
          <div className="p-6 sm:p-8 lg:p-10">
            <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-100">
                  Your Events
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Manage events and view ticket stats. Click any card for
                  details.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/dashboard/org/create-event")}
                  className="px-5 py-2 rounded-lg bg-(--sidebar-accent,#7c3aed) hover:brightness-95 text-white font-semibold transition"
                >
                  Create
                </button>
                <button
                  onClick={fetchEvents}
                  className="px-4 py-2 rounded-lg border border-slate-800 bg-transparent text-slate-300 hover:bg-slate-800/30 transition"
                >
                  Refresh
                </button>
              </div>
            </header>

            {serverError && (
              <div className="rounded-xl bg-rose-900/30 border border-rose-800 p-3 text-rose-200 text-sm mb-6 w-[50%]">
                {serverError}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin h-8 w-8 text-slate-500" />
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-xl border border-slate-800/60 p-10 text-center text-slate-400">
                <p className="text-lg font-semibold">No events yet</p>
                <p className="mt-2 text-sm">
                  Create your first event to start selling tickets.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((ev) => {
                  const id = ev.event_id ?? ev.id;
                  return (
                    <article
                      key={id}
                      role="link"
                      tabIndex={0}
                      className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 hover:bg-slate-900 shadow-sm hover:shadow-md transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--sidebar-accent,#7c3aed)] group"
                      aria-label={`Open event ${ev.name}`}
                      onClick={() => router.push(`/dashboard/org/my-event/${id}`)}
                    >
                      <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                        <img
                          src={ev.image || null}
                          alt={ev.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          onError={(e) => {
                            e.currentTarget.src = "";
                          }}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                        <div className="absolute left-4 bottom-3 text-white">
                          <h3 className="text-base font-semibold drop-shadow line-clamp-1">
                            {ev.name}
                          </h3>
                          <p className="text-xs text-slate-200 mt-0.5 drop-shadow-sm flex items-center gap-1">
                            {ev.location || "TBD"}
                          </p>
                        </div>
                        <div className="absolute right-4 top-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                          {ev.pricing_type === "paid" && ev.price
                            ? `₦${ev.price}`
                            : "Free"}
                        </div>
                      </div>

                      <div className="p-4 flex flex-col gap-3 min-h-[160px]">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[var(--sidebar-accent,#a78bfa)] uppercase tracking-wider mb-1">
                              {(ev.event_type && ev.event_type.replace('_', ' ')) || "Event"}
                            </p>
                            <p className="text-sm text-slate-400 flex items-center gap-1">
                              {formattedDate(ev.date)}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-slate-300 line-clamp-2">
                          {ev.description || "No description provided."}
                        </p>

                        <div className="mt-auto pt-3 border-t border-slate-800/50 grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-400">
                          <div className="flex justify-between">
                            <span>Sold</span>
                            <span className="text-slate-200 font-medium">{ev.ticket_stats?.confirmed_tickets ?? 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pending</span>
                            <span className="text-slate-200 font-medium">{ev.ticket_stats?.pending_tickets ?? 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avail</span>
                            <span className="text-slate-200 font-medium">{ev.ticket_stats?.available_spots ?? "-"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rev</span>
                            <span className="text-emerald-400 font-medium">₦{ev.ticket_stats?.total_revenue ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyEvent;
