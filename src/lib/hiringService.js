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
 * Sends JSON payload only (no resume).
 *
 * @param {Object} data
 * @param {string} data.full_name
 * @param {string} data.email
 * @param {string} data.phone
 * @param {string} data.role_type
 * @param {string} data.position
 * @param {string} data.cover_message
 * @returns {Promise<{message: string, application_id: number}>}
 */
export async function submitApplication(data) {
  const isStudent = data.are_you_student === "yes";
  
  const payload = {
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    role_type: data.role_type,
    position: data.position,
    cover_message: data.cover_message,
    is_student: isStudent,
  };

  // Only include student fields if they are a student
  if (isStudent) {
    payload.university = data.university;
    payload.department = data.department;
    payload.level = data.level;
  }

  return (await api.post("/hiring/apply/", payload)).data;
}
