# Backend Requirements for Google Authentication

## Student Google Signup/Login Endpoint

### Required Endpoint
**Endpoint:** `POST /student/google-signup/`

**Description:** Register/login student using Google OAuth. Accepts Google **access token** and fetches user info from Google UserInfo API.

**Authentication:** Not required

### Request Body
```json
{
  "token": "ya29.A0ARrdaM..."
}
```

Or alternatively:
```json
{
  "access_token": "ya29.A0ARrdaM..."
}
```

**Note:** The token should be the Google **access token** (starts with `ya29.`), NOT the ID token.

### Success Response (200 OK)
```json
{
  "message": "Google login successful",
  "user_id": "123",
  "email": "student@student.oauife.edu.ng",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "role": "Student",
  "is_new_user": true
}
```

### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success message |
| `user_id` | string | User's ID in the system |
| `email` | string | User's email from Google |
| `access` | string | JWT access token for API calls |
| `refresh` | string | JWT refresh token |
| `role` | string | User role (should be "Student") |
| `is_new_user` | boolean | `true` if this is a new user registration, `false` if existing user login |

### Implementation Notes
1. The endpoint should accept Google access tokens
2. Validate the token with Google's UserInfo API
3. Check if the user already exists in the database
4. If new user, create a student account with Google email
5. Generate JWT access and refresh tokens
6. Return user information with proper role field set to "Student"

### Frontend Integration
The frontend is already configured to:
- Send Google access token to this endpoint
- Handle both new user registration and existing user login
- Automatically redirect to the appropriate dashboard based on role
- Support callback URL redirection after authentication

### Error Responses
The endpoint should return appropriate error messages for:
- Invalid or expired Google tokens
- Email domain validation failures (if enforcing @student.oauife.edu.ng)
- Server errors
- Duplicate account errors

Example error response:
```json
{
  "error": "Invalid Google token"
}
```

## Role Detection and Dashboard Redirection

The frontend now properly handles role detection using the following priority:
1. `role` field from API response
2. `role` or `user_type` from JWT token payload
3. `is_organizer` boolean flag from JWT token payload
4. Fallback to the role selected during login/signup

All responses should include a `role` field that returns either:
- `"Student"` for student users
- `"Organizer"` for organizer users

This ensures proper redirection to:
- `/dashboard/student` for students
- `/dashboard/org` for organizers
