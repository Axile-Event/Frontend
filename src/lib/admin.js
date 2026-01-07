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
    console.log("Analytics response raw:", response.data);
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

  // Organizers
  getAllOrganizers: async () => {
    const response = await api.get("/api/admin/organisers/");
    return response.data.organisers;
  },

  // Users
  getAllUsers: async (params = {}) => {
    try {
      let url = "/api/admin/users/";

      // Build query string for general users endpoint
      const queryString = new URLSearchParams(params).toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await api.get(url);

      return response.data;
    } catch (error) {
      // Fallback: If backend returns 500 when filtering by role, fetch all and filter client-side
      // This handles potential backend bugs with specific filters
      if (error.response?.status === 500 && params.role) {
        try {
          console.warn(
            `Backend 500 on role=${params.role}, failing back to client-side filtering.`
          );
          const { role, ...fallbackParams } = params;
          const fallbackQuery = new URLSearchParams(fallbackParams).toString();
          const fallbackUrl = `/api/admin/users/${
            fallbackQuery ? `?${fallbackQuery}` : ""
          }`;

          const fallbackResponse = await api.get(fallbackUrl);
          const allUsers = fallbackResponse.data.users || [];

          // Client-side filter
          const filteredUsers = allUsers.filter(
            (u) => u.role && u.role.toLowerCase() === role.toLowerCase()
          );

          return {
            ...fallbackResponse.data,
            users: filteredUsers,
          };
        } catch (fallbackError) {
          console.error("Fallback fetch also failed", fallbackError);
          throw error; // Throw original error
        }
      }
      // If 404, it might mean no users found for this filter
      if (error.response?.status === 404) {
        return { users: [] };
      }
      console.error("Failed to fetch users", error);
      throw error;
    }
  },
};
