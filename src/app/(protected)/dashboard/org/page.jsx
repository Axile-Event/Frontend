"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import { Ticket, Users, Calendar, TrendingUp, DollarSign, Clock, Plus, ChevronRight, ShieldAlert, X, Eye, EyeOff, MapPin, QrCode as QrCodeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import useAuthStore from "../../../../store/authStore";
import { toast } from "react-hot-toast";
import useOrganizerStore from "../../../../store/orgStore";
import { OrganizerDashboardSkeleton } from "@/components/skeletons";
import OtpPinInput from "@/components/OtpPinInput";
import { getImageUrl } from "../../../../lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { queryKeys } from "@/lib/query-keys";


export default function Overview() {
  const [showPinReminder, setShowPinReminder] = useState(false);
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [confirmPinValue, setConfirmPinValue] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [hideBalances, setHideBalances] = useState(true);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { setOrganization, setEvents, lastUpdate, hydrated } = useOrganizerStore();
  const initialLastUpdateRef = useRef(lastUpdate);

  const { data, isLoading: loading } = useQuery({
    queryKey: queryKeys.organizer.dashboard,
    queryFn: async () => {
      const [analyticsRes, eventsRes, orgRes, walletRes] = await Promise.allSettled([
        api.get("/analytics/global/"),
        api.get("/organizer/events/"),
        api.get("/organizer/profile/"),
        api.get("/wallet/balance/"),
      ]);
      
      let eventsData = [];
      let totalTicketsFromEvents = 0;
      let totalNetRevenueFromEvents = 0;

      if (eventsRes.status === "fulfilled") {
        eventsData = eventsRes.value.data.events || [];
        // Fetch detailed stats for each event to get NET revenue for aggregation
        const eventsWithNetStats = await Promise.all(
          eventsData.map(async (event) => {
            const eventId = event.event_id ?? event.id;
            try {
              const res = await api.get(`/analytics/event/${eventId}/`);
              const aData = res.data.analytics || res.data;
              const aStats = aData.statistics || {};
              const aRevenueSource = res.data.event?.revenue;
              
              let netRevenue = 0;
              if (aRevenueSource && typeof aRevenueSource === "object") {
                netRevenue = aRevenueSource.organizer_revenue ?? aRevenueSource.net_revenue ?? aRevenueSource.earnings ?? aRevenueSource.organizer_share ?? 0;
              } else {
                netRevenue = aRevenueSource ?? aStats.net_revenue ?? aStats.total_revenue ?? 0;
              }
              
              const confirmedCount = aStats.total_tickets_sold || event.ticket_stats?.confirmed_tickets || 0;
              totalTicketsFromEvents += confirmedCount;
              totalNetRevenueFromEvents += netRevenue;

              return {
                ...event,
                ticket_stats: {
                  ...event.ticket_stats,
                  tickets_sold: confirmedCount,
                  total_revenue: netRevenue // Store net revenue
                }
              };
            } catch {
              return event;
            }
          })
        );
        eventsData = eventsWithNetStats;
      }
      
      const recentEvents = [...eventsData].sort((a, b) =>
        new Date(b.created_at || b.date) - new Date(a.created_at || a.date)
      ).slice(0, 3);
      
      const eventStatusStats = eventsData.reduce((acc, e) => {
        acc.total_events_created++;
        if (e.status === 'verified') acc.verified_events++;
        else if (e.status === 'pending') acc.pending_events++;
        else if (e.status === 'denied') acc.denied_events++;
        return acc;
      }, { total_events_created: 0, verified_events: 0, pending_events: 0, denied_events: 0 });

      const orgWallet = walletRes.status === "fulfilled" ? walletRes.value.data : null;
      
      let analytics = null;
      if (analyticsRes.status === "fulfilled") {
        const analyticsData = analyticsRes.value.data.analytics || analyticsRes.value.data;
        analytics = { 
          ...analyticsData, 
          total_revenue: orgWallet ? Number(orgWallet.total_balance) : totalNetRevenueFromEvents,
          total_tickets_sold: totalTicketsFromEvents, 
          total_events: eventsData.length 
        };
      } else {
        analytics = {
          total_events: eventsData.length,
          total_tickets_sold: totalTicketsFromEvents,
          total_revenue: orgWallet ? Number(orgWallet.total_balance) : totalNetRevenueFromEvents,
          revenue_by_event: [],
        };
      }
      
      const organization = orgRes.status === "fulfilled"
        ? (orgRes.value.data.Org_profile || orgRes.value.data)
        : null;
        
      return { analytics, eventsData, organization, recentEvents, eventStatusStats, wallet: orgWallet };
    },
    enabled: !!hydrated,
    refetchOnWindowFocus: true
  });

  const analytics = data?.analytics ?? null;
  const recentEvents = data?.recentEvents ?? [];
  const eventStatusStats = data?.eventStatusStats ?? { total_events_created: 0, verified_events: 0, pending_events: 0, denied_events: 0 };
  const { organization: orgFromStore } = useOrganizerStore();
  const organization = data?.organization ?? orgFromStore;
  const orgWallet = data?.wallet ?? null;

  useEffect(() => {
    if (!data) return;
    if (data.eventsData?.length !== undefined) setEvents(data.eventsData);
    if (data.organization) setOrganization(data.organization);
  }, [data, setEvents, setOrganization]);

  useEffect(() => {
    if (lastUpdate === null || lastUpdate === initialLastUpdateRef.current) {
      initialLastUpdateRef.current = lastUpdate;
      return;
    }
    initialLastUpdateRef.current = lastUpdate;
    queryClient.invalidateQueries({ queryKey: queryKeys.organizer.dashboard });
  }, [lastUpdate, queryClient]);

  // Check if PIN reminder should be shown - ONLY uses has_pin from database
  useEffect(() => {
    // Only check after organization data is loaded
    if (!organization) return;
    
    // Check if user has set a PIN from backend profile (ONLY source of truth)
    const hasPin = organization.has_pin === true;
    
    // If user has PIN, NEVER show reminder
    if (hasPin) {
      setShowPinReminder(false);
      // Clear any dismiss flag since user has PIN now
      localStorage.removeItem('Axile_pin_reminder_dismissed');
      return;
    }
    
    // User doesn't have PIN - check if they dismissed the reminder
    const dismissed = localStorage.getItem('Axile_pin_reminder_dismissed');
    const dismissedDate = dismissed ? new Date(dismissed) : null;
    const now = new Date();
    
    // Show reminder if never dismissed or dismissed more than 1 day ago
    if (!dismissedDate || (now - dismissedDate) > 24 * 60 * 60 * 1000) {
      setShowPinReminder(true);
    } else {
      setShowPinReminder(false);
    }
  }, [organization]);

  const handleDismissReminder = () => {
    localStorage.setItem('Axile_pin_reminder_dismissed', new Date().toISOString());
    setShowPinReminder(false);
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    setPinError('');

    if (!pinValue || pinValue.length !== 4) {
      setPinError('PIN must be exactly 4 digits');
      return;
    }

    if (pinValue !== confirmPinValue) {
      setPinError('PINs do not match');
      return;
    }

    setPinLoading(true);
    try {
      const email = user?.email;
      if (!email) {
        setPinError('Unable to detect your email. Please re-login.');
        setPinLoading(false);
        return;
      }

      // Backend expects: { Email, pin }
      try {
        await api.post('/pin/', { Email: email, pin: pinValue });
        toast.success('PIN set successfully!');
      } catch (apiErr) {
        const emailErr = apiErr?.response?.data?.Email?.[0];
        const alreadyExists =
          typeof emailErr === 'string' && emailErr.toLowerCase().includes('already exists');

        if (alreadyExists) {
          toast.error('You have already set a PIN for this account');
        } else {
          throw apiErr;
        }
      }
      
      // Refetch organization profile
      try {
        const orgRes = await api.get("/organizer/profile/");
        if (orgRes.data) {
          const orgData = orgRes.data.Org_profile || orgRes.data;
          setOrganization(orgData);
          localStorage.removeItem('Axile_pin_reminder_dismissed');
        }
      } catch (profileErr) {
        console.error("Failed to refetch organization profile:", profileErr);
      }
      
      setShowSetPinModal(false);
      setShowPinReminder(false);
      setPinValue('');
      setConfirmPinValue('');
      
    } catch (err) {
      const msg =
        err?.response?.data?.Message ||
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to set PIN';
      setPinError(msg);
    } finally {
      setPinLoading(false);
    }
  };

  if (loading) {
    return <OrganizerDashboardSkeleton />;
  }

  if (!analytics) {
     return (
       <div className="text-white flex flex-col items-center justify-center h-screen">
         <p className="mb-4">Failed to load dashboard data.</p>
         <button 
           onClick={() => window.location.reload()}
           className="px-4 py-2 bg-rose-600 rounded-lg hover:bg-rose-700"
         >
           Retry
         </button>
       </div>
     );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-10 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">
            Welcome, {user?.full_name?.split(' ')[0] || 'Organizer'}!
          </h1>
          <p className="text-gray-400 text-xs">Overview of your event performance and analytics.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/org/create-event")}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95 font-semibold text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Create New Event
        </button>
      </div>

      {/* PIN Setup Reminder Banner */}
      <AnimatePresence>
        {showPinReminder && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative overflow-hidden bg-gradient-to-r from-rose-900/40 via-rose-900/20 to-black/40 border border-rose-500/30 p-5 rounded-2xl shadow-xl backdrop-blur-md"
          >
             <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative z-1">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 flex items-center justify-center bg-rose-500/20 rounded-2xl border border-rose-500/30">
                   <ShieldAlert className="w-6 h-6 text-rose-500" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-white">Enable Your Security PIN</h3>
                   <p className="text-sm text-gray-300">Set a 4-digit PIN to protect your payouts and banking details.</p>
                 </div>
               </div>
               <div className="flex items-center gap-3 w-full md:w-auto">
                 <button
                   onClick={handleDismissReminder}
                   className="flex-1 md:flex-initial px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 text-sm font-semibold transition-colors"
                 >
                   Dismiss
                 </button>
                 <button
                   onClick={() => setShowSetPinModal(true)}
                   className="flex-1 md:flex-initial px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-xl text-white text-sm font-semibold transition-colors shadow-lg shadow-rose-600/20"
                 >
                   Set PIN Now
                 </button>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Set PIN Modal */}
      {showSetPinModal && !organization?.has_pin && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowSetPinModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <button
              onClick={() => setShowSetPinModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-500/10 rounded-xl">
                <ShieldAlert className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Set Your PIN</h2>
                <p className="text-xs text-gray-500">Protect sensitive actions</p>
              </div>
            </div>

            <form onSubmit={handleSetPin} className="space-y-5">
              {pinError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <p className="text-xs text-rose-200">{pinError}</p>
                </div>
              )}

              <div className="space-y-5">
                <OtpPinInput
                  label="PIN"
                  value={pinValue}
                  onChange={setPinValue}
                  disabled={pinLoading}
                  autoFocus={true}
                />

                <OtpPinInput
                  label="Confirm PIN"
                  value={confirmPinValue}
                  onChange={setConfirmPinValue}
                  disabled={pinLoading}
                />
              </div>

              <button
                type="submit"
                disabled={pinLoading || pinValue.length !== 4 || confirmPinValue.length !== 4}
                className="w-full px-4 py-3 bg-rose-600 hover:bg-rose-700 rounded-xl text-white text-sm font-semibold transition-all shadow-lg shadow-rose-600/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pinLoading ? 'Setting PIN...' : 'Set PIN'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
          label="Net revenue"
          value={`₦${Number(analytics.total_revenue || 0).toLocaleString()}`}
          description="Organizer's share from all events"
          trend="Live"
          hideBalances={hideBalances}
          onToggleVisibility={() => setHideBalances(!hideBalances)}
        />
        <StatCard
          icon={<Ticket className="w-5 h-5 text-blue-500" />}
          label="Total tickets sold"
          value={analytics.total_tickets_sold?.toLocaleString() || 0}
          description="Total confirmed bookings"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5 text-cyan-500" />}
          label="Total events"
          value={analytics.total_events?.toLocaleString() || 0}
          description="Events created on the platform"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-amber-500" />}
          label="Pending orders"
          value={analytics.total_tickets_pending?.toLocaleString() || 0}
          description="Waitlisted or awaiting payment"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Performance Grid */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <TrendingUp className="w-6 h-6 text-rose-500" />
                 <h2 className="text-2xl font-bold">Event Status Overview</h2>
              </div>
           </div>

           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryBox label="Total created" value={eventStatusStats.total_events_created} />
              <SummaryBox label="Verified & live" value={eventStatusStats.verified_events} color="text-emerald-400" />
              <SummaryBox label="Pending review" value={eventStatusStats.pending_events} color="text-amber-400" />
              <SummaryBox label="Denied" value={eventStatusStats.denied_events} color="text-rose-400" />
           </div>

           {/* Recent Events List */}
           <div className="mt-10">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-rose-500" />
                    <h2 className="text-xl font-bold">Recent Events</h2>
                 </div>
                 <button onClick={() => router.push("/dashboard/org/my-event")} className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1 font-medium">
                    View All <ChevronRight className="w-3.5 h-3.5" />
                 </button>
              </div>

              {recentEvents.length === 0 ? (
                <div className="p-10 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center">
                   <Plus className="w-10 h-10 text-gray-800 mb-3" />
                   <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
                   <button onClick={() => router.push("/dashboard/org/create-event")} className="px-6 py-2.5 bg-rose-600 rounded-xl text-sm font-bold">Create Event</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentEvents.map((event, idx) => (
                    <div
                      key={event.event_id || event.id || idx}
                      onClick={() => router.push(`/dashboard/org/my-event/${event.event_id || event.id}`)}
                      className="group bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-rose-500/30 transition-all cursor-pointer flex flex-col"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={getImageUrl(event.image)} 
                          alt={event.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                        <div className="absolute top-2 right-2">
                           <span className="px-2 py-1 bg-blue-600/80 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest text-white shadow-lg">
                              {event.pricing_type}
                           </span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                         <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                               <h3 className="font-bold text-lg truncate group-hover:text-rose-400 transition-colors">{event.name}</h3>
                               <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1 font-medium">
                                  <div className="flex items-center gap-1">
                                     <Clock className="w-3 h-3" />
                                     {new Date(event.created_at || event.date).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-1">
                                     <MapPin className="w-3 h-3" />
                                     <span className="truncate">{event.location || 'Online'}</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                         
                         <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                            <div className="flex flex-col gap-3 flex-1">
                               {event.pricing_type !== 'free' && (
                                 <div>
                                    <p className="text-rose-500 font-black text-xl leading-none">₦{(event.ticket_stats?.total_revenue || 0).toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-500 font-bold mt-1">Net Revenue</p>
                                 </div>
                               )}
                               <div>
                                  <p className="text-blue-500 font-black text-xl leading-none">{event.ticket_stats?.tickets_sold ?? event.ticket_stats?.confirmed_tickets ?? 0}</p>
                                  <p className="text-[10px] text-gray-500 font-bold mt-1">Sold</p>
                               </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-rose-500 transition-colors ml-2 shrink-0" />
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">
           {/* QR Code Quick Access */}
           <div className="bg-gradient-to-br from-rose-500 to-rose-700 p-6 rounded-3xl shadow-xl shadow-rose-900/20 relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <QrCodeIcon className="w-48 h-48" />
              </div>
              <div className="relative z-1">
                 <h2 className="text-xl font-black mb-2 uppercase tracking-tighter">Event Check-in</h2>
                 <p className="text-xs text-rose-100 mb-6 font-medium opacity-90">Ready to scan tickets for your attendees? Open the scanner now.</p>
                 <button 
                  onClick={() => router.push("/dashboard/org/qr-scanner")}
                  className="w-full bg-white text-rose-600 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-50 transition-colors shadow-lg active:scale-[0.98]"
                 >
                   Launch Scanner
                 </button>
              </div>
           </div>

           {/* Organization Stats */}
           <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-3xl shadow-lg shrink-0">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                 <MapPin className="w-4 h-4" />
                 Organization Balance
              </h2>
              
              <div className="space-y-5">
                 <div className="p-4 bg-white/3 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] text-gray-500 font-bold mb-1">Available</p>
                       <p className="text-xl font-black text-emerald-500 font-mono">
                          {hideBalances ? '₦••••••' : `₦${Number(orgWallet?.available_balance || 0).toLocaleString()}`}
                       </p>
                    </div>
                    <div className="p-2 bg-emerald-500/10 rounded-xl">
                       <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                 </div>

                 <div className="p-4 bg-white/3 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] text-gray-500 font-bold mb-1">Pending</p>
                       <p className="text-xl font-black text-amber-500 font-mono">
                          {hideBalances ? '₦••••••' : `₦${Number(orgWallet?.pending_balance || 0).toLocaleString()}`}
                       </p>
                    </div>
                    <div className="p-2 bg-amber-500/10 rounded-xl">
                       <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                 </div>

                 <button 
                  onClick={() => router.push("/dashboard/org/payout")}
                  className="w-full py-4 border border-rose-500/30 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all duration-300 active:scale-95 shadow-lg shadow-rose-900/10"
                 >
                   Request Payout
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI Components ---------- */

function StatCard({ label, value, icon, description, trend, hideBalances, onToggleVisibility }) {
  const displayValue = hideBalances ? '₦••••••' : value;
  
  return (
    <div 
      onClick={onToggleVisibility}
      className={`bg-[#0A0A0A] border border-white/5 p-5 rounded-2xl shadow-lg hover:border-white/10 transition-all group ${onToggleVisibility ? 'cursor-pointer active:scale-[0.98]' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        <div className="flex items-center gap-2">
          {trend && (
             <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full pulse">
               {trend}
             </div>
          )}
          {onToggleVisibility && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility();
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-500 hover:text-white"
              title={hideBalances ? "Show balance" : "Hide balance"}
            >
              {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-xs font-semibold mb-1">{label}</p>
        <h3 className="text-2xl font-bold">{displayValue}</h3>
        <p className="text-gray-600 text-[10px] mt-1.5 font-medium">{description}</p>
      </div>
    </div>
  );
}

function SummaryBox({ label, value, color }) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : (value || 0);
  return (
    <div className="p-4 bg-white/2 border border-white/5 rounded-xl flex flex-col items-center justify-center text-center group hover:bg-white/4 transition-colors">
      <p className={`text-2xl font-black mb-1 ${color || 'text-white'}`}>{formattedValue}</p>
      <p className="text-[10px] text-gray-500 font-bold">{label}</p>
    </div>
  );
}
