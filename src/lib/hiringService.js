import api from "./axios";

/**
 * Fetch available role types for the hiring dropdown.
 * GET /hiring/role-types/
 * @returns {Promise<{role_types: Array<{value: string, label: string}>}>}
 */
export async function fetchRoleTypes() {
  const response = await api.get("/hiring/role-types/");
  return response.data;
}

/**
 * Submit a hiring application.
 * POST /hiring/apply/
 * Sends multipart/form-data when a resume file is included, otherwise JSON.
 *
 * @param {Object} data
 * @param {string} data.full_name
 * @param {string} data.email
 * @param {string} data.role_type
 * @param {string} data.position
 * @param {string} [data.phone]
 * @param {string} [data.cover_message]
 * @param {File}   [data.resume]
 * @returns {Promise<{message: string, application_id: number}>}
 */
export async function submitApplication(data) {
  const hasFile = data.resume instanceof File;

  if (hasFile) {
    const formData = new FormData();
    formData.append("full_name", data.full_name);
    formData.append("email", data.email);
    formData.append("role_type", data.role_type);
    formData.append("position", data.position);
    if (data.phone) formData.append("phone", data.phone);
    if (data.cover_message)
      formData.append("cover_message", data.cover_message);
    formData.append("resume", data.resume);

    return (await api.post("/hiring/apply/", formData)).data;
  }

  // No file — send as JSON
  const payload = {
    full_name: data.full_name,
    email: data.email,
    role_type: data.role_type,
    position: data.position,
  };
  if (data.phone) payload.phone = data.phone;
  if (data.cover_message) payload.cover_message = data.cover_message;

  return (await api.post("/hiring/apply/", payload)).data;
}
