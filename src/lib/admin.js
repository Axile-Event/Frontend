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
      `/api/admin/dashboard/recent-events/?limit=${limit}`
    );
    return response.data.events;
  },

  // Events
  getAllEvents: async () => {
    const response = await api.get("/api/admin/events/");
    return response.data.events;
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
          "Backend 500 on role filter, attempting fallback client-side filter."
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
            (u) => u.role && u.role.toLowerCase() === role.toLowerCase()
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
      }
    );
    return response.data;
  },
  verifyOrganizer: async (organizerId, isVerified) => {
    const response = await api.patch(
      `/api/admin/users/${organizerId}/verify/`,
      {
        is_verified: isVerified,
      }
    );
    return response.data;
  },
  deleteUser: async (userId, role) => {
    const response = await api.delete(
      `/api/admin/users/${userId}/delete/?role=${role}`
    );
    return response.data;
  },

  // Tickets
  getAllTickets: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/api/admin/tickets/?${queryString}`);
    return response.data;
  },

  // Withdrawals
  getAllWithdrawals: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/api/admin/withdrawals/?${queryString}`);
    return response.data;
  },
  updateWithdrawalStatus: async (transactionId, status) => {
    const response = await api.patch(
      `/api/admin/withdrawals/${transactionId}/status/`,
      {
        status,
      }
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
