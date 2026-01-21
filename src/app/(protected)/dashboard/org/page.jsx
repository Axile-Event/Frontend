"use client";

import { useEffect, useState, useRef } from "react";
import api from "../../../../lib/axios";
import { Ticket, Users, Calendar, TrendingUp, DollarSign, Clock, Plus, ChevronRight, ShieldAlert, X, Eye, EyeOff, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import useAuthStore from "../../../../store/authStore";
import { toast } from "react-hot-toast";
import useOrganizerStore from "../../../../store/orgStore";
import { OrganizerDashboardSkeleton } from "@/components/skeletons";
import OtpPinInput from "@/components/OtpPinInput";
import { getImageUrl } from "../../../../lib/utils";
import { AnimatePresence, motion } from "framer-motion";


export default function Overview() {
  const [analytics, setAnalytics] = useState(null);
  const [eventsSummary, setEventsSummary] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eventStatusStats, setEventStatusStats] = useState({
    total_events_created: 0,
    verified_events: 0,
    pending_events: 0,
    denied_events: 0
  });
  const [showPinReminder, setShowPinReminder] = useState(false);
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [confirmPinValue, setConfirmPinValue] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [hideBalances, setHideBalances] = useState(true);

  const router = useRouter();
  const { user } = useAuthStore();
  const { events, setOrganization, setEvents, lastUpdate, hydrated } = useOrganizerStore();
  
  // Track initial lastUpdate to prevent refetch loop on mount
  const initialLastUpdateRef = useRef(lastUpdate);

  useEffect(() => {
    // Wait for orgStore hydration before fetching data
    if (!hydrated) return;

    async function fetchOverview() {
      setLoading(true);
      try {
        setLoading(true);

        const [
          analyticsRes,
          eventsRes,
          orgRes,
        ] = await Promise.allSettled([
          api.get("/analytics/global/"),
          api.get("/organizer/events/"),
          api.get("/organizer/profile/"),
        ]);
        // Process events data first to calculate correct ticket counts
        let totalTicketsFromEvents = 0;
        if (eventsRes.status === "fulfilled") {
          const eventsData = eventsRes.value.data.events || [];
          console.log("Events Data with ticket_stats:", eventsData);
          setEvents(eventsData);
          
          // Sort events by created_at in descending order (latest created first) and take the first 3
          const sortedEvents = [...eventsData].sort((a, b) => {
            const dateA = new Date(a.created_at || a.date);
            const dateB = new Date(b.created_at || b.date);
            return dateB - dateA;
          });
          setRecentEvents(sortedEvents.slice(0, 3));

          // Calculate event status statistics from organizer's events
          const stats = eventsData.reduce((acc, event) => {
            acc.total_events_created++;
            if (event.status === 'verified') acc.verified_events++;
            else if (event.status === 'pending') acc.pending_events++;
            else if (event.status === 'denied') acc.denied_events++;
            return acc;
          }, {
            total_events_created: 0,
            verified_events: 0,
            pending_events: 0,
            denied_events: 0
          });
          setEventStatusStats(stats);

          // Calculate total tickets sold from event ticket_stats
          totalTicketsFromEvents = eventsData.reduce((total, event) => {
            return total + (event.ticket_stats?.confirmed_tickets || 0);
          }, 0);
          console.log("Total tickets calculated from events:", totalTicketsFromEvents);
        }

        // Set analytics with corrected ticket count and total events
        if (analyticsRes.status === "fulfilled") {
          const analyticsData = analyticsRes.value.data.analytics || analyticsRes.value.data;
          console.log("Analytics API Response:", analyticsData);
          
          const eventsData = eventsRes.status === "fulfilled" ? (eventsRes.value.data.events || []) : [];
          
          // Use calculated values from events data instead of potentially incorrect API values
          const correctedAnalytics = {
            ...analyticsData,
            total_tickets_sold: totalTicketsFromEvents,
            total_events: eventsData.length
          };
          
          if (analyticsData.total_tickets_sold !== totalTicketsFromEvents) {
            console.warn(`Analytics endpoint returned ${analyticsData.total_tickets_sold} tickets, corrected to ${totalTicketsFromEvents} from events data`);
          }
          if (analyticsData.total_events !== eventsData.length) {
            console.warn(`Analytics endpoint returned ${analyticsData.total_events} events, corrected to ${eventsData.length} from events data`);
          }
          
          setAnalytics(correctedAnalytics);
        } else {
          console.error("Analytics API failed:", analyticsRes.reason);
          // Fallback: Create analytics from events data
          if (eventsRes.status === "fulfilled") {
            const eventsData = eventsRes.value.data.events || [];
            const totalPendingTickets = eventsData.reduce((total, event) => {
              return total + (event.ticket_stats?.pending_tickets || 0);
            }, 0);
            const totalRevenue = eventsData.reduce((total, event) => {
              return total + (event.ticket_stats?.total_revenue || 0);
            }, 0);
            
            setAnalytics({
              total_events: eventsData.length,
              total_tickets_sold: totalTicketsFromEvents,
              total_tickets_pending: totalPendingTickets,
              total_revenue: totalRevenue,
              revenue_by_event: [],
              average_revenue_per_event: eventsData.length > 0 ? totalRevenue / eventsData.length : 0
            });
            console.log("Using fallback analytics calculated from events data");
          }
        }

        if (orgRes.status === "fulfilled") {
          setOrganization(orgRes.value.data.Org_profile || orgRes.value.data);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load overview");
        setLoading(false);
      }
    }


    fetchOverview();
  }, [hydrated, setOrganization, setEvents]);

  // get the organization from the store to display in the welcome message
  const { organization } = useOrganizerStore();
  organization && console.log("Organization Name:", organization.Organization_Name);

  // Removed first-welcome logic (no longer needed)
  
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
      let pinAlreadyExists = false;
      try {
        await api.post('/pin/', { Email: email, pin: pinValue });
        toast.success('PIN set successfully!');
      } catch (apiErr) {
        const emailErr = apiErr?.response?.data?.Email?.[0];
        const alreadyExists =
          typeof emailErr === 'string' && emailErr.toLowerCase().includes('already exists');

        if (alreadyExists) {
          // PIN already exists - this is actually an error state
          toast.error('You have already set a PIN for this account');
          pinAlreadyExists = true;
        } else {
          throw apiErr;
        }
      }
      
      // Refetch organization profile to update has_pin status from database
      try {
        const orgRes = await api.get("/organizer/profile/");
        if (orgRes.data) {
          const orgData = orgRes.data.Org_profile || orgRes.data;
          setOrganization(orgData);
          
          // Clear PIN reminder dismiss flag from localStorage
          localStorage.removeItem('Axile_pin_reminder_dismissed');
        }
      } catch (profileErr) {
        console.error("Failed to refetch organization profile:", profileErr);
      }
      
      // Close modal and hide reminder
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

  // Refetch analytics and events summary when events change to update total events count and summary
  useEffect(() => {
    // Skip refetch on initial mount or if lastUpdate hasn't changed meaningfully
    // This prevents the infinite loop where fetchOverview -> setEvents -> lastUpdate change -> refetch
    if (lastUpdate === null || lastUpdate === initialLastUpdateRef.current) {
      // Update the ref to the current value after initial load
      initialLastUpdateRef.current = lastUpdate;
      return;
    }
    
    // Update ref to current value to track subsequent changes
    initialLastUpdateRef.current = lastUpdate;
    
    async function refetchData() {
      try {
        const [analyticsRes, eventsRes] = await Promise.allSettled([
          api.get("/analytics/global/"),
          api.get("/organizer/events/")
        ]);

        // Calculate correct ticket count from events
        let totalTicketsFromEvents = 0;
        let eventsData = [];
        if (eventsRes.status === 'fulfilled') {
          eventsData = eventsRes.value.data.events || [];
          totalTicketsFromEvents = eventsData.reduce((total, event) => {
            return total + (event.ticket_stats?.confirmed_tickets || 0);
          }, 0);
        }

        if (analyticsRes.status === 'fulfilled') {
          const analyticsData = analyticsRes.value.data.analytics || analyticsRes.value.data;
          setAnalytics({
            ...analyticsData,
            total_tickets_sold: totalTicketsFromEvents,
            total_events: eventsData.length
          });
        } else if (eventsRes.status === 'fulfilled') {
          // Fallback if analytics endpoint fails
          const eventsData = eventsRes.value.data.events || [];
          const totalPendingTickets = eventsData.reduce((total, event) => {
            return total + (event.ticket_stats?.pending_tickets || 0);
          }, 0);
          const totalRevenue = eventsData.reduce((total, event) => {
            return total + (event.ticket_stats?.total_revenue || 0);
          }, 0);
          
          setAnalytics({
            total_events: eventsData.length,
            total_tickets_sold: totalTicketsFromEvents,
            total_tickets_pending: totalPendingTickets,
            total_revenue: totalRevenue
          });
        }
      } catch (err) {
        console.error("Failed to refetch data:", err);
      }
    }
    
    console.log("Refetch effect fired", lastUpdate);

    // refetch data so that the overview stats are always up to date
    refetchData();
  }, [lastUpdate]);

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
            Welcome, {organization?.Organization_Name || 'Organizer'}!
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
            className="bg-linear-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/30 rounded-2xl p-5 md:p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl" />
            <button
              onClick={handleDismissReminder}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg transition-colors z-10"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 relative z-10">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <ShieldAlert className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Set up your PIN</h3>
                <p className="text-sm text-gray-300">
                  This PIN will be used to authorize withdrawals and sensitive account changes. Keep your account secure.
                </p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={handleDismissReminder}
                  className="flex-1 md:flex-initial px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-semibold transition-colors"
                >
                  Later
                </button>
                <button
                  onClick={() => setShowSetPinModal(true)}
                  className="flex-1 md:flex-initial px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-xl text-white text-sm font-semibold transition-colors"
                >
                  Set PIN
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Set PIN Modal */}
      {showSetPinModal && !organization?.has_pin && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSetPinModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-xl p-5 shadow-2xl"
          >
            <button
              onClick={() => setShowSetPinModal(false)}
              className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-rose-500/10 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Set Your PIN</h2>
                <p className="text-[10px] text-gray-500">Protect sensitive actions</p>
              </div>
            </div>

            <form onSubmit={handleSetPin} className="space-y-3">
              {pinError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                  <p className="text-xs text-rose-200">{pinError}</p>
                </div>
              )}

              <div className="space-y-4">
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
                className="w-full px-3 py-2.5 bg-rose-600 hover:bg-rose-700 rounded-lg text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
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
          label="Total revenue"
          value={`₦${analytics.total_revenue?.toLocaleString() || 0}`}
          description="Gross earnings from all events"
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

      {/* Organizer Analytics Section */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 md:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 bg-white/5 rounded-lg">
             <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <h2 className="text-lg font-bold">Event Status Overview</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <SummaryBox label="Total created" value={eventStatusStats.total_events_created} color="text-white" />
          <SummaryBox label="Verified & live" value={eventStatusStats.verified_events} color="text-emerald-500" />
          <SummaryBox label="Pending review" value={eventStatusStats.pending_events} color="text-amber-500" />
          <SummaryBox label="Denied" value={eventStatusStats.denied_events} color="text-rose-500" />
        </div>
      </div>

      {/* Recent Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/5 rounded-lg">
              <Calendar className="w-4 h-4 text-rose-500" />
            </div>
            <h2 className="text-lg font-bold">Recent Events</h2>
          </div>
          <button
            onClick={() => router.push('/dashboard/org/my-event')}
            className="text-xs font-semibold text-gray-500 hover:text-white flex items-center gap-1 transition-colors group"
          >
            View All <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {recentEvents.length === 0 ? (
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl py-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
               <Calendar className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No events found</p>
            <p className="text-gray-600 text-sm mt-1">Start by creating your first event</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentEvents.map(event => (
              <div
                key={event.event_id}
                onClick={() => router.push(`/dashboard/org/my-event/${event.event_id}`)}
                className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 group cursor-pointer shadow-lg"
              >
                {/* Event Cover Image */}
                <div className="h-40 relative overflow-hidden bg-white/5">
                   <img
                      src={getImageUrl(event.image) || "/api/placeholder/400/200"}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.parentElement) {
                          e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                          e.target.parentElement.innerHTML = '<div class="text-gray-600 font-bold text-xs">No cover image</div>';
                        }
                      }}
                    />
                    <div className="absolute top-3 right-3">
                       <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md border ${
                          event.pricing_type === 'free' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                       }`}>
                          {event.pricing_type}
                       </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold line-clamp-1 mb-1 group-hover:text-rose-500 transition-colors tracking-tight">{event.name}</h3>
                    <div className="flex items-center text-gray-400 text-xs gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[120px]">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                     <div className="flex flex-col gap-3 flex-1">
                        {event.pricing_type !== 'free' && (
                          <div>
                             <p className="text-rose-500 font-bold text-sm">₦{(event.ticket_stats?.total_revenue || 0).toLocaleString()}</p>
                             <p className="text-[10px] text-gray-500 font-bold">Revenue</p>
                          </div>
                        )}
                        <div>
                           <p className="text-blue-500 font-bold text-sm">{event.ticket_stats?.confirmed_tickets || 0}</p>
                           <p className="text-[10px] text-gray-500 font-bold">Sold</p>
                        </div>
                        {/* Platform Fees */}
                        {(event.platform_fee_percentage !== null || event.platform_fee_fixed !== null) && (
                          <div className="pt-2 border-t border-white/5">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Platform Fees</p>
                            <div className="space-y-1">
                              {event.platform_fee_percentage !== null && (
                                <p className="text-[10px] text-amber-400">
                                  <span className="text-gray-500">Percentage:</span> {event.platform_fee_percentage}%
                                </p>
                              )}
                              {event.platform_fee_fixed !== null && (
                                <p className="text-[10px] text-amber-400">
                                  <span className="text-gray-500">Fixed:</span> ₦{parseFloat(event.platform_fee_fixed).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                     </div>
                     <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-rose-500 transition-colors ml-2 flex-shrink-0" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- UI Components ---------- */

function StatCard({ label, value, icon, description, trend, hideBalances, onToggleVisibility }) {
  const displayValue = hideBalances ? '₦••••••' : value;
  
  return (
    <div className="bg-[#0A0A0A] border border-white/5 p-5 rounded-2xl shadow-lg hover:border-white/10 transition-all group">
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
              onClick={onToggleVisibility}
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


