import api from "./axios";

export const adminService = {
  // Auth
  login: async (email, password) => {
    const response = await api.post("/api/admin/auth/login/", {
      email,
      password,
    });
    return response.data;
  },
  logout: async (refresh_token) => {
    const response = await api.post("/api/admin/auth/logout/", {
      refresh: refresh_token,
    });
    return response.data;
  },

  // Dashboard
  getAnalytics: async () => {
    const response = await api.get("/api/admin/dashboard/analytics/");
    return response.data.analytics;
  },
  getRecentEvents: async (limit = 10) => {
    const response = await api.get(
      `/api/admin/dashboard/recent-events/?limit=${limit}`,
    );
    return response.data.events;
  },

  // Events
  getAllEvents: async () => {
    const response = await api.get("/api/admin/events/");
    return response.data.events;
  },
  getEventDetails: async (eventId) => {
    // 1. Fetch public details (rich content: description, images, etc.)
    // This now includes tickets_sold and total_revenue from the backend
    const publicResponse = await api.get(`/events/${eventId}/details/`);
    const publicData = publicResponse.data;

    // 2. Fetch admin list to get internal details (organizer ID, status, flags)
    // This is necessary because the public endpoint might sanitize organizer ID, and there's no direct admin detail endpoint.
    let adminData = {};
    try {
      const adminResponse = await api.get("/api/admin/events/");
      const allEvents = adminResponse.data.events || [];
      const found = allEvents.find(
        (e) =>
          String(e.event_id) === String(eventId) ||
          String(e.id) === String(eventId),
      );
      if (found) adminData = found;
    } catch (e) {
      console.warn("Failed to fetch admin event list for enrichment", e);
    }

    // 3. Merge data
    return {
      ...publicData,
      ...adminData, // Admin data takes precedence for status and internal IDs

      // Normalize fields
      event_name:
        adminData.event_name || publicData.name || publicData.event_name,
      // Admin list usually has 'organisation_name'
      organisation_name:
        adminData.organisation_name ||
        publicData.organization_name ||
        publicData.organisation_name,
      // Public often has better image reference
      image_url:
        publicData.image || publicData.image_url || adminData.image_url,
      ticket_tiers:
        publicData.ticket_categories ||
        publicData.ticket_tiers ||
        adminData.ticket_tiers,

      // Ensure we have an ID for fetching user details if needed
      organizer:
        adminData.organizer || adminData.organizer_id || publicData.organizer,
      
      // Use ticket statistics from backend (now included in publicData)
      tickets_sold: publicData.tickets_sold || 0,
      revenue: publicData.total_revenue || 0, // Backend returns 'total_revenue', frontend expects 'revenue'
    };
  },
  updateEventStatus: async (eventId, status) => {
    const response = await api.patch(`/api/admin/events/${eventId}/status/`, {
      status,
    });
    return response.data;
  },
  toggleEventFeatured: async (eventId, isFeatured) => {
    const response = await api.patch(`/api/admin/events/${eventId}/featured/`, {
      is_featured: isFeatured,
    });
    return response.data;
  },
  deleteEvent: async (eventId) => {
    const response = await api.delete(`/api/admin/events/${eventId}/delete/`);
    return response.data;
  },

  // Users
  getAllUsers: async (params = {}) => {
    try {
      let url = "/api/admin/users/";
      const queryString = new URLSearchParams(params).toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      if (error.response?.status === 500 && params.role) {
        console.warn(
          "Backend 500 on role filter, attempting fallback client-side filter.",
        );
        const { role, ...fallbackParams } = params;
        const fallbackQuery = new URLSearchParams(fallbackParams).toString();
        const fallbackUrl = `/api/admin/users/${
          fallbackQuery ? `?${fallbackQuery}` : ""
        }`;

        try {
          const fallbackResponse = await api.get(fallbackUrl);
          const allUsers = fallbackResponse.data.users || [];
          const filteredUsers = allUsers.filter(
            (u) => u.role && u.role.toLowerCase() === role.toLowerCase(),
          );
          return { ...fallbackResponse.data, users: filteredUsers };
        } catch (fbError) {
          throw error;
        }
      }
      throw error;
    }
  },
  getUserDetails: async (userId, role) => {
    const response = await api.get(`/api/admin/users/${userId}/?role=${role}`);
    return response.data.user;
  },
  toggleUserStatus: async (userId, role, isActive) => {
    const response = await api.patch(
      `/api/admin/users/${userId}/status/?role=${role}`,
      {
        is_active: isActive,
      },
    );
    return response.data;
  },
  verifyOrganizer: async (organizerId, isVerified) => {
    const response = await api.patch(
      `/api/admin/users/${organizerId}/verify/`,
      {
        is_verified: isVerified,
      },
    );
    return response.data;
  },
  deleteUser: async (userId, role) => {
    const response = await api.delete(
      `/api/admin/users/${userId}/delete/?role=${role}`,
    );
    return response.data;
  },

  // Tickets
  getAllTickets: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/api/admin/tickets/?${queryString}`);
    return response.data;
  },

  // Payout Requests
  getPayoutRequests: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/api/admin/payout-requests/?${queryString}`,
    );
    return response.data;
  },
  updatePayoutRequestStatus: async (requestId, status, adminNotes = null) => {
    const body = { status };
    if (adminNotes) body.admin_notes = adminNotes;
    const response = await api.patch(
      `/api/admin/payout-requests/${requestId}/status/`,
      body,
    );
    return response.data;
  },
  getPayoutNotifications: async () => {
    const response = await api.get("/api/admin/notifications/payout-requests/");
    return response.data;
  },

  // Withdrawals (transactions from approved payout requests)
  getAllWithdrawals: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/api/admin/withdrawals/?${queryString}`);
    return response.data;
  },
  updateWithdrawalStatus: async (transactionId, status) => {
    const response = await api.patch(
      `/api/admin/withdrawals/${transactionId}/status/`,
      { status },
    );
    return response.data;
  },

  // Payment Transactions
  getPaymentTransactions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/api/admin/payment-transactions/?${queryString}`,
    );
    return response.data;
  },

  // System Settings
  getSystemSettings: async () => {
    const response = await api.get("/api/admin/settings/");
    return response.data.settings;
  },
  updateSystemSettings: async (settings) => {
    const response = await api.patch("/api/admin/settings/", settings);
    return response.data.settings;
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/api/admin/audit-logs/?${queryString}`);
    return response.data;
  },
};
