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
  getAllUsers: async () => {
    try {
      const response = await api.get("/api/admin/users/");
      return response.data;
    } catch (error) {
      console.warn(
        "Failed to fetch /api/admin/users/, trying /api/admin/students/"
      );
      try {
        const response = await api.get("/api/admin/students/");
        return response.data;
      } catch (e) {
        console.error("Failed to fetch users/students", e);
        return [];
      }
    }
  },
};
