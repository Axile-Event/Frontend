# Radar Event Platform - Complete API Documentation

Complete API documentation for frontend developers. This document covers all endpoints, request/response formats, and implementation examples.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Health Check](#health-check-endpoint)
4. [Auth App Endpoints](#auth-app-endpoints)
5. [Event App Endpoints](#event-app-endpoints)
6. [Admin Endpoints](#admin-endpoints) ✨ UPDATED
7. [Ticket App Endpoints](#ticket-app-endpoints)
8. [Wallet Endpoints](#wallet-endpoints) ✨ NEW
9. [Analytics Endpoints](#analytics-endpoints) ✨ NEW
10. [Frontend Implementation Guide](#frontend-implementation-guide)
11. [Error Handling](#error-handling)
12. [Code Examples](#code-examples)
13. [Summary](#summary)
14. [Architecture Notes](#architecture-notes) ✨ NEW

---

## Overview

### Base URLs

```
Development: http://localhost:8000
Production: https://your-domain.onrender.com
```

### Response Format

All responses are in JSON format. Standard response structure:

**Success Response:**
```json
{
  "message": "Success message",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

**Validation Error:**
```json
{
  "field_name": ["Error message"]
}
```

### Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

---

## Authentication

### JWT Token Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Getting Tokens

Tokens are received after:
- Login (`POST /login/`)
- Registration (after OTP verification: `POST /verify-otp/`)
- Google Sign Up

### Token Structure

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

- **access**: Short-lived token (15 minutes) - use for API requests
- **refresh**: Long-lived token (7 days) - use to get new access token

### Frontend Token Storage

```javascript
// Store tokens after login
localStorage.setItem('access_token', response.access);
localStorage.setItem('refresh_token', response.refresh);

// Use in API requests
const token = localStorage.getItem('access_token');
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## Auth App Endpoints

### 1. Student Registration

**Endpoint:** `POST /student/register/`

**Description:** Register a new student account. Sends OTP to email for verification.

**Authentication:** Not required

**Request Body:**
```json
{
  "Firstname": "John",
  "Lastname": "Doe",
  "Email": "john.doe@student.oauife.edu.ng",
  "Password": "securepassword123"
}
```

**Note:** Email must be from the `@student.oauife.edu.ng` domain.

**Field Requirements:**
- `Firstname`: Required, string, max 100 characters
- `Lastname`: Required, string, max 100 characters
- `Email`: Required, valid email address (any domain accepted)
- `Password`: Required, string, max 100 characters

**Success Response (200 OK):**
```json
{
  "message": "OTP sent to email. Please verify to complete registration.",
  "email": "john.doe@student.oauife.edu.ng"
}
```

**Error Response (400 Bad Request):**
```json
{
  "Email": ["Email must be from the domain student.oauife.edu.ng"],
  "Firstname": ["This field is required."]
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Failed to send OTP email. Please try again."
}
```

**Frontend Implementation:**
```javascript
async function registerStudent(data) {
  const response = await fetch('http://localhost:8000/student/register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }
  
  return await response.json();
}
```

---

### 2. Organizer Registration

**Endpoint:** `POST /organizer/register/`

**Description:** Register a new organizer account. Sends OTP to email for verification.

**Authentication:** Not required

**Request Body:**
```json
{
  "Organization_Name": "Tech Events Inc",
  "Email": "contact@techevents.com",
  "Phone": "+2348012345678",
  "Password": "securepassword123"
}
```

**Field Requirements:**
- `Organization_Name`: Optional, string, max 200 characters
- `Email`: Required, valid email format, max 150 characters
- `Phone`: Optional, string, max 15 characters
- `Password`: Required, string, max 100 characters

**Success Response (200 OK):**
```json
{
  "message": "OTP sent to email. Please verify to complete registration.",
  "email": "contact@techevents.com"
}
```

**Error Response (400 Bad Request - Duplicate Email):**
```json
{
  "error": "Email already registered",
  "message": "An account with this email already exists. Please sign in instead."
}
```

**Error Response (500 Internal Server Error - Email Failed):**
```json
{
  "error": "Failed to send OTP email. Please try again.",
  "message": "Email service is currently unavailable. Please contact support."
}
```

**Frontend Implementation:**
```javascript
async function registerOrganizer(data) {
  const response = await fetch('http://localhost:8000/organizer/register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }
  
  return await response.json();
}
```

**Note:** After receiving the OTP email, use the [Verify OTP](#3-verify-otp) endpoint to complete registration.

---

### 3. Verify OTP

**Endpoint:** `POST /verify-otp/`

**Description:** Verify OTP sent to email to complete registration. Works for both students and organizers.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john.doe@student.oauife.edu.ng",
  "otp": "123456"
}
```

**Field Requirements:**
- `email`: Required, must match registration email
- `otp`: Required, 6-digit code

**Success Response (201 Created):**
```json
{
  "message": "Registration successful"
}
```

**Error Response (400 Bad Request - Invalid OTP):**
```json
{
  "error": "Invalid OTP"
}
```

**Error Response (400 Bad Request - Expired):**
```json
{
  "error": "Registration session expired or invalid email"
}
```

**Error Response (400 Bad Request - Already Registered):**
```json
{
  "error": "Email already registered",
  "message": "An account with this email already exists. Please sign in instead."
}
```

**Frontend Implementation:**
```javascript
async function verifyOTP(email, otp) {
  const response = await fetch('http://localhost:8000/verify-otp/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'OTP verification failed');
  }
  
  return await response.json();
}
```

---

### 4. Login

**Endpoint:** `POST /login/`

**Description:** Authenticate user and receive JWT tokens.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john.doe@student.oauife.edu.ng",
  "password": "securepassword123"
}
```

**Field Requirements:**
- `email`: Required, valid email
- `password`: Required, string

**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "user_id": 1,
  "email": "john.doe@student.oauife.edu.ng",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

**Frontend Implementation:**
```javascript
async function login(email, password) {
  const response = await fetch('http://localhost:8000/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const result = await response.json();
  
  if (response.ok) {
    // Store tokens
    localStorage.setItem('access_token', result.access);
    localStorage.setItem('refresh_token', result.refresh);
    return result;
  }
  
  throw new Error(result.error || 'Login failed');
}
```

---

### 5. Refresh Token

**Endpoint:** `POST /token/refresh/`

**Description:** Get a new access token using a refresh token. Access tokens expire after 15 minutes, so use this endpoint to get a new one without re-logging in.

**Authentication:** Not required (but refresh token needed in body)

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Error Response (401 Unauthorized):**
```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

**Frontend Implementation:**
```javascript
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await fetch('http://localhost:8000/token/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  
  const result = await response.json();
  
  if (response.ok) {
    // Update access token
    localStorage.setItem('access_token', result.access);
    return result.access;
  }
  
  // If refresh token is expired, user needs to login again
  if (response.status === 401) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Redirect to login
    window.location.href = '/login';
  }
  
  throw new Error(result.detail || 'Token refresh failed');
}

// Auto-refresh token before it expires
async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('access_token');
  
  const config = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  };
  
  let response = await fetch(url, config);
  
  // If token expired, try to refresh
  if (response.status === 401) {
    try {
      const newAccessToken = await refreshAccessToken();
      // Retry request with new token
      config.headers['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(url, config);
    } catch (error) {
      // Refresh failed, redirect to login
      window.location.href = '/login';
      throw error;
    }
  }
  
  return response;
}
```

---

### 6. Change Password

**Endpoint:** `POST /change-password/`

**Description:** Change password for authenticated users. Works for both students and organizers. Requires JWT authentication token.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "old_password": "currentpassword123",
  "new_password": "newsecurepassword123",
  "confirm_password": "newsecurepassword123"
}
```

**Field Requirements:**
- `old_password`: Required, current password
- `new_password`: Required, minimum 8 characters
- `confirm_password`: Required, must match `new_password`

**Success Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Authentication required. Please provide a valid JWT token."
}
```

**Error Response (400 Bad Request - Wrong old password):**
```json
{
  "error": "Old password is incorrect."
}
```

**Error Response (400 Bad Request - Passwords don't match):**
```json
{
  "confirm_password": ["New passwords must match."]
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "User account not found."
}
```

**Frontend Implementation:**
```javascript
async function changePassword(oldPassword, newPassword, confirmPassword) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/change-password/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
  });
  
  const result = await response.json();
  
  if (response.ok) {
    return result;
  }
  
  throw new Error(result.error || 'Password change failed');
}
```

---

### 7. Logout

**Endpoint:** `POST /logout/`

**Description:** Logout user by blacklisting refresh token.

**Authentication:** Not required (but token needed in body)

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

**Frontend Implementation:**
```javascript
async function logout() {
  const refreshToken = localStorage.getItem('refresh_token');
  
  const response = await fetch('http://localhost:8000/logout/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  
  // Clear tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  return await response.json();
}
```

---

### 8. Get Student Profile

**Endpoint:** `GET /student/profile/`

**Description:** Get student profile information.

**Authentication:** Optional (JWT token or email query param)

**Query Parameters (Testing):**
- `email`: Student email address

**Headers (Production):**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "message": "Profile retrieved successfully",
  "profile": {
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@student.oauife.edu.ng",
    "full_name": "John Doe",
    "Preferred_name": "Johnny",
    "Date_of_birth": "2000-01-15",
    "event_preferences": ["tech", "crypto", "academic"]
  }
}
```

**Frontend Implementation:**
```javascript
async function getStudentProfile() {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/student/profile/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return await response.json();
}
```

---

### 9. Update Student Profile (PATCH)

**Endpoint:** `PATCH /student/profile/`

**Description:** Partially update student profile (Preferred_name, Date_of_birth, event_preferences).

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "Preferred_name": "Johnny",
  "Date_of_birth": "2000-01-15",
  "event_preferences": ["tech", "crypto", "academic", "hackathon"]
}
```

**Field Requirements:**
- `Preferred_name`: Optional, string, max 30 characters
- `Date_of_birth`: Optional, date format (YYYY-MM-DD)
- `event_preferences`: Optional, array of event type values

**Success Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@student.oauife.edu.ng",
    "full_name": "John Doe",
    "Preferred_name": "Johnny",
    "Date_of_birth": "2000-01-15",
    "event_preferences": ["tech", "crypto", "academic", "hackathon"]
  }
}
```

**Frontend Implementation:**
```javascript
async function updateStudentProfile(data) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/student/profile/', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  return await response.json();
}
```

---

### 10. Get Organizer Profile

**Endpoint:** `GET /organizer/profile/`

**Description:** Get organizer profile information.

**Authentication:** Optional (JWT token or email query param)

**Success Response (200 OK):**
```json
{
  "message": "Profile retrieved successfully",
  "Org_profile": {
    "Organization_Name": "Tech Events Inc",
    "Email": "contact@techevents.com",
    "Phone": "+2348012345678",
    "has_pin": true
  }
}
```

**Field Descriptions:**
- `Organization_Name`: Organization name
- `Email`: Organizer email address
- `Phone`: Contact phone number
- `has_pin`: Boolean indicating if a PIN is set for this organizer account (used to determine if PIN modal should be shown)

---

### 11. Update Organizer Profile

**Endpoint:** `POST /organizer/profile/`

**Description:** Update organizer profile information (Organization Name, Email, Phone).

**Note:** To add or update bank account details for withdrawals, use the [Wallet Bank Account endpoint](#3-addupdate-bank-account) at `/wallet/bank-account/`.

**Authentication:** Optional (JWT token or email in body)

**Request Body:**
```json
{
  "email": "contact@techevents.com",
  "Organization_Name": "Tech Events Inc",
  "Phone": "+2348012345678"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "Org_profile": {
    "Organization_Name": "Tech Events Inc",
    "Email": "contact@techevents.com",
    "Phone": "+2348012345678",
    "has_pin": true
  }
}
```

---

### 12. Password Reset Request

**Endpoint:** `POST /password-reset/request/`

**Description:** Request password reset OTP.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "message": "OTP sent to email.",
  "email": "john.doe@example.com"
}
```

---

### 13. Verify Password Reset OTP

**Endpoint:** `POST /password-reset/verify/`

**Description:** Verify password reset OTP. Works for both students and organizers.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response (200 OK):**
```json
{
  "message": "OTP verified successfully"
}
```

---

### 14. Confirm Password Reset

**Endpoint:** `POST /password-reset/confirm/`

**Description:** Set new password after OTP verification. Works for both students and organizers.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "newsecurepassword123",
  "confirm_password": "newsecurepassword123"
}
```

**Field Requirements:**
- `email`: Required, registered email (student or organizer)
- `otp`: Required, 6-digit OTP code
- `new_password`: Required, minimum 8 characters
- `confirm_password`: Required, must match `new_password`

**Success Response (200 OK):**
```json
{
  "message": "Password reset successful"
}
```

**Error Response (400 Bad Request - Passwords don't match):**
```json
{
  "confirm_password": ["Passwords must match."]
}
```

**Error Response (400 Bad Request - Invalid OTP):**
```json
{
  "error": "Invalid or expired OTP"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "User not found"
}
```

---

### 15. PIN Management (Organizer Only)

PIN endpoints are for organizers to set and manage their PIN for secure operations.

#### 15.1. Set/Create PIN

**Endpoint:** `POST /pin/`

**Description:** Set or create a PIN for an organizer account. The PIN is used for secure operations.

**Authentication:** Not required

**Request Body:**
```json
{
  "Email": "contact@techevents.com",
  "pin": "1234"
}
```

**Field Requirements:**
- `Email`: Required, organizer email address
- `pin`: Required, PIN value (typically 4-6 digits)

**Success Response (201 Created):**
```json
{
  "Message": "PIN saved successfully!"
}
```

**Error Response (400 Bad Request - Organizer not found):**
```json
{
  "Message": "Organizer does not exist"
}
```

**Frontend Implementation:**
```javascript
async function setPin(email, pin) {
  const response = await fetch('http://localhost:8000/pin/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Email: email,
      pin: pin
    }),
  });
  
  return await response.json();
}
```

---

#### 15.2. Forgot PIN

**Endpoint:** `POST /forgot-pin/`

**Description:** Request a PIN change link via email. Sends an email with a link to change the PIN.

**Authentication:** Not required

**Request Body:**
```json
{
  "Email": "contact@techevents.com"
}
```

**Field Requirements:**
- `Email`: Required, organizer email address

**Success Response (200 OK):**
```json
{
  "message": "PIN change link sent to email.",
  "email": "contact@techevents.com"
}
```

**Error Response (400 Bad Request - Organizer not found):**
```json
{
  "Message": "Organizer does not exist"
}
```

**Error Response (500 Internal Server Error - Email failed):**
```json
{
  "error": "Failed to send PIN change email. Please try again."
}
```

**Frontend Implementation:**
```javascript
async function forgotPin(email) {
  const response = await fetch('http://localhost:8000/forgot-pin/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Email: email
    }),
  });
  
  return await response.json();
}
```

---

#### 15.3. Change PIN

**Endpoint:** `POST /change-pin/`

**Description:** Change an existing PIN. Requires email, new PIN, and confirmation PIN.

**Authentication:** Not required

**Request Body:**
```json
{
  "Email": "contact@techevents.com",
  "Pin": "5678",
  "ConfirmPin": "5678"
}
```

**Field Requirements:**
- `Email`: Required, organizer email address
- `Pin`: Required, new PIN value
- `ConfirmPin`: Required, must match `Pin`

**Success Response (201 Created):**
```json
{
  "Message": "New PIN saved successfully!"
}
```

**Error Response (400 Bad Request - Organizer not found):**
```json
{
  "Message": "Organizer does not exist"
}
```

**Error Response (400 Bad Request - PINs don't match):**
```json
{
  "Message": "New PIN and Confirm PIN do not match"
}
```

**Frontend Implementation:**
```javascript
async function changePin(email, newPin, confirmPin) {
  const response = await fetch('http://localhost:8000/change-pin/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Email: email,
      Pin: newPin,
      ConfirmPin: confirmPin
    }),
  });
  
  return await response.json();
}
```

**Note:** PIN endpoints are specifically for organizers. Students do not have PIN functionality.

---

#### 15.4. Verify PIN

**Endpoint:** `POST /verify-pin/`

**Description:** Verify if an entered PIN is correct for the authenticated organizer. This endpoint is used when a PIN modal is shown to the user and they enter their PIN.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "pin": "1234"
}
```

**Field Requirements:**
- `pin`: Required, the PIN value to verify

**Success Response (200 OK - PIN is correct):**
```json
{
  "message": "PIN verified successfully",
  "is_valid": true
}
```

**Error Response (400 Bad Request - PIN is incorrect):**
```json
{
  "error": "Invalid PIN",
  "is_valid": false
}
```

**Error Response (404 Not Found - PIN not set):**
```json
{
  "error": "PIN not set for this account",
  "is_valid": false
}
```

**Error Response (404 Not Found - Organizer not found):**
```json
{
  "error": "Organizer not found"
}
```

**Frontend Implementation:**
```javascript
async function verifyPin(enteredPin) {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:8000/verify-pin/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pin: enteredPin
    }),
  });
  
  const data = await response.json();
  
  if (data.is_valid) {
    // PIN is correct - proceed with action
    console.log('PIN verified!');
    return true;
  } else {
    // PIN is incorrect - show error
    alert(data.error || 'Invalid PIN');
    return false;
  }
}
```

**Usage Flow:**
1. Check organizer profile to see if `has_pin: true`
2. If true, show PIN modal when user needs to perform secure action
3. When user enters PIN, call `/verify-pin/` endpoint
4. If `is_valid: true`, proceed with the action
5. If `is_valid: false`, show error message

**Note:** PINs are hashed in the database for security. The actual PIN value is never returned in API responses.

---

### 16. Google Sign Up (Organizer)

**Endpoint:** `POST /organizer/google-signup/`

**Description:** Register/login organizer using Google OAuth. Accepts Google **access token** and fetches user info from Google UserInfo API.

**Authentication:** Not required

**Request Body:**
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

**Success Response (200 OK):**
```json
{
  "message": "Google login successful",
  "email": "organizer@example.com",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "is_new_user": true
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success message |
| `email` | string | User's email from Google |
| `access` | string | JWT access token for API calls |
| `refresh` | string | JWT refresh token |
| `is_new_user` | boolean | `true` if user needs to complete profile (missing Organization_Name or Phone) |

**Frontend Implementation:**
```typescript
import { useGoogleLogin } from '@react-oauth/google'

const googleLogin = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    const response = await fetch('/organizer/google-signup/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenResponse.access_token })
    })
    const data = await response.json()
    
    // Store tokens
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    
    // Redirect based on is_new_user
    if (data.is_new_user) {
      router.push('/complete-profile')
    } else {
      router.push('/dashboard')
    }
  }
})
```

---

## Event App Endpoints

### 1. Get Configuration

**Endpoint:** `GET /config/`

**Description:** Get all available choices for event types, pricing types, etc. Public endpoint.

**Authentication:** Not required

**Success Response (200 OK):**
```json
{
  "event_types": [
    {"value": "academic", "label": "Academic"},
    {"value": "tech", "label": "Technology"},
    {"value": "crypto", "label": "Crypto/Blockchain"},
    {"value": "cultural", "label": "Cultural"},
    {"value": "sports", "label": "Sports"},
    {"value": "music", "label": "Music/Entertainment"},
    {"value": "career", "label": "Career/Professional Development"},
    {"value": "religious", "label": "Religious"},
    {"value": "social", "label": "Social Gathering"},
    {"value": "entrepreneurship", "label": "Entrepreneurship/Business"},
    {"value": "health", "label": "Health/Wellness"},
    {"value": "arts", "label": "Arts & Creative"},
    {"value": "debate", "label": "Debate/Public Speaking"},
    {"value": "gaming", "label": "Gaming/Esports"},
    {"value": "fashion", "label": "Fashion Show"},
    {"value": "film", "label": "Film/Movie Screening"},
    {"value": "food", "label": "Food Festival"},
    {"value": "charity", "label": "Charity/Volunteer"},
    {"value": "political", "label": "Political/Activism"},
    {"value": "science", "label": "Science Fair/Exhibition"},
    {"value": "workshop", "label": "Workshop"},
    {"value": "seminar", "label": "Seminar"},
    {"value": "conference", "label": "Conference"},
    {"value": "hackathon", "label": "Hackathon"},
    {"value": "networking", "label": "Networking Event"},
    {"value": "other", "label": "Other"}
  ],
  "pricing_types": [
    {"value": "free", "label": "Free"},
    {"value": "paid", "label": "Paid"}
  ]
}
```

**Frontend Implementation:**
```javascript
async function getConfig() {
  const response = await fetch('http://localhost:8000/config/');
  return await response.json();
}

// Usage: Populate dropdowns with event types
const config = await getConfig();
const eventTypes = config.event_types; // Array of {value, label}
```

---

### 2. List All Events

**Endpoint:** `GET /event/`

**Description:** Get all events with preference-based prioritization. Events matching user preferences appear more frequently.

**Authentication:** Optional (for preference-based sorting)

**Success Response (200 OK):**
```json
[
  {
    "event_id": "event:TE-12345",
    "event_name": "Tech Conference 2024",
    "event_location": "OAU Campus",
    "event_date": "2024-12-15T10:00:00Z",
    "event_price": 5000.00,
    "event_image": "https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/radar/events/tech.jpg",
    "event_type": "tech",
    "pricing_type": "paid"
  },
  {
    "event_id": "event:CD-67890",
    "event_name": "Cultural Day",
    "event_location": "OAU Amphitheatre",
    "event_date": "2024-12-20T14:00:00Z",
    "event_price": 0.00,
    "event_image": null,
    "event_type": "cultural",
    "pricing_type": "free"
  }
]
```

**Frontend Implementation:**
```javascript
async function getAllEvents() {
  const token = localStorage.getItem('access_token');
  
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch('http://localhost:8000/event/', {
    method: 'GET',
    headers,
  });
  
  return await response.json();
}
```

---

### 3. Get Event Details

**Endpoint:** `GET /events/<event_id>/details/`

**Description:** Get detailed information about a specific event.

**Authentication:** Optional

**URL Parameters:**
- `event_id`: Event ID (e.g., "event:TE-12345")

**Success Response (200 OK):**
```json
{
  "name": "Tech Conference 2024",
  "description": "Annual tech conference featuring industry leaders",
  "pricing_type": "paid",
  "event_type": "tech",
  "location": "OAU Campus",
  "date": "2024-12-15T10:00:00Z",
  "capacity": 100,
  "price": 5000.00,
  "max_quantity_per_booking": 3,
  "image": "/media/event/images/tech.jpg",
  "ticket_categories": [
    {
      "category_id": "category:ABC12-XYZ34",
      "name": "Early Bird",
      "price": "4000.00",
      "description": "Limited early bird tickets",
      "is_active": true,
      "max_tickets": 50,
      "tickets_sold": 30,
      "available_tickets": 20,
      "is_sold_out": false
    },
    {
      "category_id": "category:QWE56-RTY78",
      "name": "VIP",
      "price": "15000.00",
      "description": "VIP access with premium benefits",
      "is_active": true,
      "max_tickets": 20,
      "tickets_sold": 15,
      "available_tickets": 5,
      "is_sold_out": false
    }
  ]
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Event not found"
}
```

**Frontend Implementation (without authentication):**
```javascript
async function getEventDetails(eventId) {
  const response = await fetch(
    `http://localhost:8000/events/${eventId}/details/`
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Event not found');
  }
  
  return await response.json();
}
```

**Frontend Implementation (with optional authentication):**
```javascript
async function getEventDetails(eventId) {
  const token = localStorage.getItem('access_token');
  
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(
    `http://localhost:8000/events/${eventId}/details/`,
    {
      headers
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Event not found');
  }
  
  return await response.json();
}
```

**Note:** This endpoint works with or without authentication. If you provide a valid token, it will be accepted but not required. Invalid tokens are ignored, and the request will still succeed.

---

### 4. Create Event

**Endpoint:** `POST /event/`

**Description:** Create a new event. Only organizers can create events.

**Authentication:** Required (JWT token, Organizer only)

**Content-Type:** `multipart/form-data` (use FormData) - **REQUIRED** when sending images

**⚠️ IMPORTANT: Data Format Requirements**

The backend expects specific data types. Sending incorrect formats (e.g., dictionaries/objects instead of primitives) will cause errors:

- ✅ **DO**: Send `price` as a number (e.g., `5000.00` or `"5000.00"`)
- ❌ **DON'T**: Send `price` as `{value: 5000}` or `{amount: 5000}`
- ✅ **DO**: Send `image` as a File object via FormData
- ❌ **DON'T**: Send `image` as `{data: "...", type: "..."}` or base64 string in JSON
- ✅ **DO**: Send all string fields as plain strings
- ❌ **DON'T**: Send string fields as objects/dictionaries

**Request Body (FormData):**

When using FormData, append each field with the correct type:

| Field | Type | Required | Example Value | Notes |
|-------|------|----------|---------------|-------|
| `name` | string | Yes | `"Tech Conference 2024"` | Max 200 characters |
| `description` | string | Yes | `"Annual tech conference..."` | Text field |
| `pricing_type` | string | Yes | `"paid"` or `"free"` | Must be exactly one of these |
| `event_type` | string | Yes | `"tech"` | See event types below |
| `location` | string | Yes | `"OAU Campus"` | Max 200 characters |
| `date` | string | Yes | `"2024-12-15T10:00:00Z"` | ISO 8601 datetime format |
| `capacity` | integer/string | No | `100` or `"100"` | Can be null/empty |
| `price` | number/string | Yes | `5000.00` or `"5000.00"` | Decimal, 0.00 for free events |
| `max_quantity_per_booking` | integer/string | No | `5` or `"5"` | Maximum tickets per booking. Defaults to 3 if not set |
| `image` | File | No | File object | Must be actual File, not dict/object |

**Event Type Values:**
`academic`, `tech`, `crypto`, `cultural`, `sports`, `music`, `career`, `religious`, `social`, `entrepreneurship`, `health`, `arts`, `debate`, `gaming`, `fashion`, `film`, `food`, `charity`, `political`, `science`, `workshop`, `seminar`, `conference`, `hackathon`, `networking`, `other`

**Example Request (with image):**
```javascript
// Create FormData
const formData = new FormData();

// Add all fields as strings/numbers (FormData converts them)
formData.append('name', 'Tech Conference 2024');
formData.append('description', 'Annual tech conference featuring industry leaders');
formData.append('pricing_type', 'paid');
formData.append('event_type', 'tech');
formData.append('location', 'OAU Campus');
formData.append('date', '2024-12-15T10:00:00Z'); // ISO 8601 format
formData.append('capacity', '100'); // Can be number or string
formData.append('price', '5000.00'); // Must be number or numeric string
formData.append('max_quantity_per_booking', '5'); // Optional, defaults to 3 if not set

// Add image file (if provided)
if (imageFile) {
  formData.append('image', imageFile); // imageFile must be a File object
}

// Send request
const response = await fetch('http://localhost:8000/event/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    // DO NOT set Content-Type header - browser will set it automatically with boundary
  },
  body: formData,
});
```

**Example Request (without image):**
```javascript
const formData = new FormData();
formData.append('name', 'Free Workshop');
formData.append('description', 'Learn new skills');
formData.append('pricing_type', 'free');
formData.append('event_type', 'workshop');
formData.append('location', 'Online');
formData.append('date', '2024-12-20T14:00:00Z');
formData.append('capacity', '50');
formData.append('price', '0.00'); // Must be 0.00 for free events
// image field omitted or set to null

const response = await fetch('http://localhost:8000/event/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});
```

**Success Response (201 Created):**
```json
{
  "name": "Tech Conference 2024",
  "description": "Annual tech conference featuring industry leaders",
  "pricing_type": "paid",
  "event_type": "tech",
  "location": "OAU Campus",
  "date": "2024-12-15T10:00:00Z",
  "capacity": 100,
  "price": "5000.00",
  "max_quantity_per_booking": 3,
  "image": "https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/radar/events/tech.jpg"
}
```

**Error Responses:**

**400 Bad Request (Validation Error):**
```json
{
  "name": ["This field is required."],
  "price": ["Price must be a number, not a dictionary."]
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication required. Please provide a valid JWT token."
}
```

**403 Forbidden:**
```json
{
  "error": "Organizer profile not found."
}
```

**500 Internal Server Error (Data Format Issue):**
```json
{
  "error": "Please check your request and try again",
  "detail": "expected string or bytes-like object, got 'dict'"
}
```

**Complete Frontend Implementation:**
```javascript
/**
 * Create a new event
 * @param {Object} eventData - Event data object
 * @param {string} eventData.name - Event name
 * @param {string} eventData.description - Event description
 * @param {string} eventData.pricing_type - "free" or "paid"
 * @param {string} eventData.event_type - Event type (see list above)
 * @param {string} eventData.location - Event location
 * @param {Date|string} eventData.date - Event date (Date object or ISO string)
 * @param {number} eventData.capacity - Event capacity (optional)
 * @param {number} eventData.price - Event price (required, 0.00 for free)
 * @param {number} eventData.max_quantity_per_booking - Maximum tickets per booking (optional, defaults to 3)
 * @param {File|null} eventData.image - Image file (optional)
 * @returns {Promise<Object>} Created event data
 */
async function createEvent(eventData) {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  // Create FormData - REQUIRED for file uploads
  const formData = new FormData();
  
  // Add required fields
  formData.append('name', String(eventData.name));
  formData.append('description', String(eventData.description));
  formData.append('pricing_type', String(eventData.pricing_type));
  formData.append('event_type', String(eventData.event_type));
  formData.append('location', String(eventData.location));
  
  // Handle date - convert Date object to ISO string if needed
  const dateValue = eventData.date instanceof Date 
    ? eventData.date.toISOString() 
    : String(eventData.date);
  formData.append('date', dateValue);
  
  // Add optional fields
  if (eventData.capacity !== undefined && eventData.capacity !== null) {
    formData.append('capacity', String(eventData.capacity));
  }
  
  if (eventData.max_quantity_per_booking !== undefined && eventData.max_quantity_per_booking !== null) {
    formData.append('max_quantity_per_booking', String(eventData.max_quantity_per_booking));
  }
  
  // Price must be a number or numeric string, NOT an object
  const priceValue = typeof eventData.price === 'number' 
    ? eventData.price.toString() 
    : String(eventData.price);
  formData.append('price', priceValue);
  
  // Add image file if provided (must be File object, not dict/object)
  if (eventData.image && eventData.image instanceof File) {
    formData.append('image', eventData.image);
  }
  // If image is null/undefined, don't append it (backend will use null)
  
  try {
  const response = await fetch('http://localhost:8000/event/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
        // DO NOT set Content-Type - browser sets it automatically with boundary
    },
    body: formData,
  });
  
    const data = await response.json();
    
    if (!response.ok) {
      // Handle error responses
      throw new Error(data.error || data.detail || 'Failed to create event');
    }
    
    return data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

// Example usage with image:
const imageFile = document.querySelector('input[type="file"]').files[0]; // File object

const eventData = {
  name: 'Tech Conference 2024',
  description: 'Annual tech conference featuring industry leaders',
  pricing_type: 'paid',
  event_type: 'tech',
  location: 'OAU Campus',
  date: new Date('2024-12-15T10:00:00Z'), // Date object or ISO string
  capacity: 100,
  price: 5000.00, // Number, NOT {value: 5000} or {amount: 5000}
  max_quantity_per_booking: 5, // Optional, defaults to 3 if not set
  image: imageFile // File object, NOT {data: "...", type: "..."}
};

try {
  const createdEvent = await createEvent(eventData);
  console.log('Event created:', createdEvent);
} catch (error) {
  console.error('Failed to create event:', error.message);
}

// Example usage without image:
const freeEventData = {
  name: 'Free Workshop',
  description: 'Learn new skills',
  pricing_type: 'free',
  event_type: 'workshop',
  location: 'Online',
  date: '2024-12-20T14:00:00Z', // ISO string
  capacity: 50,
  price: 0.00, // Must be 0.00 for free events
  // image omitted
};

await createEvent(freeEventData);
```

**Common Mistakes to Avoid:**

1. ❌ **Sending JSON instead of FormData:**
   ```javascript
   // WRONG - Don't send JSON when you have an image
   fetch('/event/', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json', // ❌ Wrong
       'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify(eventData) // ❌ Wrong
   });
   ```

2. ❌ **Sending image as base64 or dict:**
   ```javascript
   // WRONG - Don't send image as object/dict
   formData.append('image', {data: base64String, type: 'image/png'}); // ❌
   formData.append('image', JSON.stringify({data: base64String})); // ❌
   
   // CORRECT - Send actual File object
   formData.append('image', fileObject); // ✅
   ```

3. ❌ **Sending price as object:**
   ```javascript
   // WRONG
   formData.append('price', JSON.stringify({value: 5000})); // ❌
   
   // CORRECT
   formData.append('price', '5000.00'); // ✅
   formData.append('price', 5000.00); // ✅ (FormData converts to string)
   ```

4. ❌ **Setting Content-Type header manually:**
   ```javascript
   // WRONG - Don't set Content-Type for FormData
   headers: {
     'Content-Type': 'multipart/form-data', // ❌ Browser needs to set boundary
   }
   
   // CORRECT - Let browser set it automatically
   headers: {
     'Authorization': `Bearer ${token}`, // ✅ Only set Authorization
   }
   ```

**Note:** 
- Images are uploaded to Cloudinary and stored in the `radar/events/` folder
- The returned image URL will be a Cloudinary CDN URL
- If image is sent as a dict/object, it will be ignored (set to null)
- Always use FormData when creating events (even without images) for consistency

---

### 5. Get Organizer Events

**Endpoint:** `GET /organizer/events/`

**Description:** Get all events created by the authenticated organizer.

**Authentication:** Required (JWT token, Organizer only)

**Success Response (200 OK):**
```json
{
  "events": [
    {
      "event_id": "event:TE-12345",
      "name": "Tech Conference 2024",
      "description": "Annual tech conference",
      "event_type": "tech",
      "pricing_type": "paid",
      "location": "OAU Campus",
      "date": "2024-12-15T10:00:00Z",
      "capacity": 100,
      "price": 5000.00,
      "image": "/media/event/images/tech.jpg",
      "ticket_stats": {
        "total_tickets": 50,
        "confirmed_tickets": 45,
        "pending_tickets": 5,
        "total_revenue": 225000.00,
        "available_spots": 55
      }
    }
  ],
  "count": 1
}
```

**Frontend Implementation:**
```javascript
async function getOrganizerEvents() {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/organizer/events/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return await response.json();
}
```

---

## Ticket App Endpoints

### Ticket Response Fields

All ticket responses include the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `ticket_id` | string | Unique ticket identifier (e.g., "ticket:TC-12345") |
| `event_id` | string | Event ID (e.g., "event:TE-12345") |
| `event_name` | string | Name of the event |
| `event_date` | datetime | Event date and time (ISO 8601) |
| `event_location` | string | Event location |
| `student_email` | string | Student's email address |
| `student_full_name` | string | Student's full name (Firstname + Lastname) |
| `status` | string | Ticket status: `pending`, `confirmed`, `cancelled`, or `used` |
| `quantity` | integer | Number of tickets (always 1 for individual tickets) |
| `total_price` | string | Price per ticket (as string, e.g., "5000.00") |
| `qr_code` | string | QR code for check-in (e.g., "QR-ticket:TC-12345") - unique per ticket |
| `checked_in_at` | datetime/null | Check-in timestamp (null if not checked in) |
| `booking_id` | string | Groups tickets from the same purchase (present in booking responses) |
| `created_at` | datetime | Ticket creation timestamp |
| `updated_at` | datetime | Last update timestamp |

---

### 1. Book Ticket

**Endpoint:** `POST /tickets/book/`

**Description:** Book tickets for an event. For paid events, initiates Paystack payment. Can optionally select a ticket category (e.g., "Early Bird", "VIP") for custom pricing.

**Important:** 
- When booking multiple tickets (quantity > 1), the system creates **individual ticket records** - one for each person. Each ticket has its own `ticket_id` and `qr_code` for individual check-in. All tickets from the same purchase are grouped by a `booking_id`.
- The maximum number of tickets per booking is controlled by the event's `max_quantity_per_booking` field (defaults to 3 if not set by the organizer).

**Platform Fee (Paid Events Only):**
- Customer pays: `ticket_price + ₦80` (₦80 is an additional charge)
- Platform fee: `(ticket_price × 6%) + ₦80` (default, can be customized per event)
- Organizer receives: `ticket_price × 94%` (6% deducted from base price)
- Free events have no platform fees

**Authentication:** Required (JWT token, Student only)

**Request Body:**
```json
{
  "event_id": "event:TE-12345",
  "category_name": "Early Bird",
  "quantity": 2
}
```

**Field Requirements:**
- `event_id`: Required, valid event ID
- `category_name`: Optional, ticket category name (e.g., "Early Bird", "VIP", "Group of 4"). If not provided, uses event default price.
- `quantity`: Required, integer, min 1. Number of individual tickets to create (each person gets their own ticket).

**Note:** To see available ticket categories for an event, use `GET /tickets/categories/?event_id=<event_id>` or check the `ticket_categories` field in event details.

**Success Response - Free Event (201 Created):**
```json
{
  "message": "2 ticket(s) booked successfully",
  "tickets": [
    {
      "ticket_id": "ticket:TC-12345",
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference 2024",
      "event_date": "2024-12-15T10:00:00Z",
      "event_location": "OAU Campus",
      "student_email": "john.doe@student.oauife.edu.ng",
      "student_full_name": "John Doe",
      "status": "confirmed",
      "quantity": 1,
      "total_price": "0.00",
      "category_name": "Early Bird",
      "category_price": "5000.00",
      "qr_code": "QR-ticket:TC-12345",
      "checked_in_at": null,
      "created_at": "2024-12-10T10:00:00Z",
      "updated_at": "2024-12-10T10:00:00Z"
    },
    {
      "ticket_id": "ticket:TC-12346",
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference 2024",
      "event_date": "2024-12-15T10:00:00Z",
      "event_location": "OAU Campus",
      "student_email": "john.doe@student.oauife.edu.ng",
      "student_full_name": "John Doe",
      "status": "confirmed",
      "quantity": 1,
      "total_price": "0.00",
      "category_name": "Early Bird",
      "category_price": "5000.00",
      "qr_code": "QR-ticket:TC-12346",
      "checked_in_at": null,
      "created_at": "2024-12-10T10:00:00Z",
      "updated_at": "2024-12-10T10:00:00Z"
    }
  ],
  "booking_id": "booking:ABC-12345",
  "ticket_count": 2
}
```

**Success Response - Paid Event (200 OK):**
```json
{
  "message": "Payment initialized",
  "tickets": [
    {
      "ticket_id": "ticket:TC-12345",
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference 2024",
      "event_date": "2024-12-15T10:00:00Z",
      "event_location": "OAU Campus",
      "student_email": "john.doe@student.oauife.edu.ng",
      "student_full_name": "John Doe",
      "status": "pending",
      "quantity": 1,
      "total_price": "5000.00",
      "category_name": "Early Bird",
      "category_price": "5000.00",
      "qr_code": "QR-ticket:TC-12345",
      "checked_in_at": null,
      "created_at": "2024-12-10T10:00:00Z",
      "updated_at": "2024-12-10T10:00:00Z"
    },
    {
      "ticket_id": "ticket:TC-12346",
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference 2024",
      "event_date": "2024-12-15T10:00:00Z",
      "event_location": "OAU Campus",
      "student_email": "john.doe@student.oauife.edu.ng",
      "student_full_name": "John Doe",
      "status": "pending",
      "quantity": 1,
      "total_price": "5000.00",
      "category_name": "Early Bird",
      "category_price": "5000.00",
      "qr_code": "QR-ticket:TC-12346",
      "checked_in_at": null,
      "created_at": "2024-12-10T10:00:00Z",
      "updated_at": "2024-12-10T10:00:00Z"
    }
  ],
  "booking_id": "booking:ABC-12345",
  "ticket_count": 2,
  "payment_url": "https://paystack.com/pay/xxxxx",
  "payment_reference": "bookingABC-12345"
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `tickets` | array | Array of ticket objects (one for each ticket booked) |
| `booking_id` | string | Unique ID that groups all tickets from this purchase (e.g., "booking:ABC-12345") |
| `ticket_count` | integer | Number of tickets in this booking |
| `payment_url` | string | Paystack payment URL (paid events only) |
| `payment_reference` | string | Payment reference (sanitized booking_id, paid events only) |

**Note:** 
- Each ticket in the `tickets` array has `quantity: 1` (each ticket is for one person)
- Each ticket has its own unique `ticket_id` and `qr_code` for individual check-in
- All tickets share the same `booking_id` to group them together
- For paid events, the `total_price` shown is per ticket. The customer will be charged `(total_price × quantity) + ₦80` (platform fee) when redirected to Paystack
- The `payment_reference` uses the sanitized `booking_id` (special characters removed) for Paystack compatibility

**Error Response (400 Bad Request - Invalid Category):**
```json
{
  "error": "Invalid or inactive ticket category: 'Early Bird'"
}
```

**Error Response (400 Bad Request - Category Sold Out):**
```json
{
  "error": "Category 'Early Bird' is sold out"
}
```

**Error Response (400 Bad Request - Insufficient Tickets):**
```json
{
  "error": "Only 5 tickets available for category 'Early Bird'. Requested: 10"
}
```

**Error Response (400 Bad Request - Max Quantity Exceeded):**
```json
{
  "error": "Maximum 3 tickets allowed per booking for this event"
}
```

**Note:** The maximum tickets per booking is set at the event level (via `max_quantity_per_booking` field). If not set when creating the event, it defaults to 3 tickets per booking.

**Frontend Implementation:**
```javascript
async function bookTicket(eventId, quantity, categoryName = null) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/tickets/book/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      event_id: eventId,
      category_name: categoryName,  // Optional: e.g., "Early Bird", "VIP"
      quantity,
    }),
  });
  
  const result = await response.json();
  
  // Store booking info for later reference
  if (result.booking_id) {
    localStorage.setItem('last_booking_id', result.booking_id);
    localStorage.setItem('last_ticket_count', result.ticket_count);
  }
  
  // Store all ticket IDs and QR codes for individual check-in
  if (result.tickets && Array.isArray(result.tickets)) {
    result.tickets.forEach((ticket, index) => {
      localStorage.setItem(`ticket_${index}_id`, ticket.ticket_id);
      localStorage.setItem(`ticket_${index}_qr`, ticket.qr_code);
    });
  }
  
  // If paid event, redirect to payment URL
  if (result.payment_url) {
    window.location.href = result.payment_url;
  }
  
  return result;
}
```

---

### 2. Paystack Webhook (Automatic)

**Endpoint:** `POST /tickets/paystack-webhook/`

**Description:** Webhook endpoint for Paystack to automatically verify payments. This endpoint is called by Paystack when payment events occur. **Do not call this endpoint directly from the frontend.**

**Authentication:** Not required (CSRF exempt for Paystack)

**Note:** This endpoint is automatically called by Paystack. Configure the webhook URL in your Paystack dashboard:
- **Development:** `https://your-tunnel-url/tickets/paystack-webhook/`
- **Production:** `https://your-domain.com/tickets/paystack-webhook/`

**Webhook Events Handled:**
- `charge.success`: Updates ticket status to `confirmed`
- `charge.failed`: Logs failure (ticket remains `pending`)

**Success Response (200 OK):**
```json
{
  "message": "Webhook received"
}
```

**Security:** This endpoint verifies Paystack webhook signatures using HMAC SHA512 to ensure requests are from Paystack.

---

### 3. Verify Payment (Manual)

**Endpoint:** `POST /tickets/verify-payment/`

**Description:** Manually verify Paystack payment. Usually handled automatically by webhook, but can be used as a fallback. When multiple tickets were booked together, this endpoint verifies and confirms all tickets in the booking.

**Authentication:** Not required

**Request Body:**
```json
{
  "reference": "bookingABC-12345"
}
```

**Note:** The `reference` should be the payment reference returned from Paystack (sanitized booking_id). For backward compatibility, you can also use a ticket_id.

**Success Response (200 OK):**
```json
{
  "message": "Payment verified successfully. 2 ticket(s) confirmed.",
  "tickets": [
    {
      "ticket_id": "ticket:TC-12345",
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference 2024",
      "event_date": "2024-12-15T10:00:00Z",
      "event_location": "OAU Campus",
      "student_email": "john.doe@student.oauife.edu.ng",
      "student_full_name": "John Doe",
      "status": "confirmed",
      "quantity": 1,
      "total_price": "5000.00",
      "category_name": "Early Bird",
      "category_price": "5000.00",
      "qr_code": "QR-ticket:TC-12345",
      "checked_in_at": null,
      "created_at": "2024-12-10T10:00:00Z",
      "updated_at": "2024-12-10T10:00:00Z"
    },
    {
      "ticket_id": "ticket:TC-12346",
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference 2024",
      "event_date": "2024-12-15T10:00:00Z",
      "event_location": "OAU Campus",
      "student_email": "john.doe@student.oauife.edu.ng",
      "student_full_name": "John Doe",
      "status": "confirmed",
      "quantity": 1,
      "total_price": "5000.00",
      "category_name": "Early Bird",
      "category_price": "5000.00",
      "qr_code": "QR-ticket:TC-12346",
      "checked_in_at": null,
      "created_at": "2024-12-10T10:00:00Z",
      "updated_at": "2024-12-10T10:00:00Z"
    }
  ],
  "booking_id": "booking:ABC-12345",
  "ticket_count": 2
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Payment verification failed"
}
```

---

### 4. Get My Tickets

**Endpoint:** `GET /tickets/my-tickets/`

**Description:** Get all tickets for the authenticated student.

**Authentication:** Required (JWT token, Student only)

**Success Response (200 OK):**
```json
{
  "tickets": [
    {
      "ticket_id": "ticket:TC-12345",
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference 2024",
      "event_date": "2024-12-15T10:00:00Z",
      "event_location": "OAU Campus",
      "student_email": "john.doe@student.oauife.edu.ng",
      "student_full_name": "John Doe",
      "status": "confirmed",
      "quantity": 2,
      "total_price": "10000.00",
      "qr_code": "QR-ticket:TC-12345",
      "checked_in_at": null,
      "created_at": "2024-12-10T10:00:00Z",
      "updated_at": "2024-12-10T10:00:00Z"
    }
  ],
  "count": 1
}
```

**Frontend Implementation:**
```javascript
async function getMyTickets() {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/tickets/my-tickets/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return await response.json();
}
```

---

### 5. Get Organizer Tickets

**Endpoint:** `GET /tickets/organizer/tickets/`

**Description:** Get all tickets for events created by the authenticated organizer.

**Authentication:** Required (JWT token, Organizer only)

**Query Parameters:**
- `status`: Optional, filter by status (pending, confirmed, cancelled, used)

**Success Response (200 OK):**
```json
{
  "tickets": [
    {
      "ticket_id": "ticket:TC-12345",
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference 2024",
      "event_date": "2024-12-15T10:00:00Z",
      "event_location": "OAU Campus",
      "student_email": "john.doe@student.oauife.edu.ng",
      "student_full_name": "John Doe",
      "status": "confirmed",
      "quantity": 2,
      "total_price": "10000.00",
      "qr_code": "QR-ticket:TC-12345",
      "checked_in_at": null,
      "created_at": "2024-12-10T10:00:00Z",
      "updated_at": "2024-12-10T10:00:00Z"
    }
  ],
  "count": 50,
  "summary": {
    "confirmed": 45,
    "pending": 5,
    "cancelled": 0,
    "used": 10,
    "total_revenue": 225000.00
  }
}
```

**Frontend Implementation:**
```javascript
async function getOrganizerTickets(status = null) {
  const token = localStorage.getItem('access_token');
  
  let url = 'http://localhost:8000/tickets/organizer/tickets/';
  if (status) {
    url += `?status=${status}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return await response.json();
}
```

---

### 5. Get Event Tickets

**Endpoint:** `GET /tickets/organizer/<event_id>/tickets/`

**Description:** Get all tickets for a specific event.

**Authentication:** Required (JWT token, Organizer only)

**URL Parameters:**
- `event_id`: Event ID (e.g., "event:TE-12345")

**Query Parameters:**
- `status`: Optional, filter by status

**Success Response (200 OK):**
```json
{
  "event_id": "event:TE-12345",
  "event_name": "Tech Conference 2024",
  "tickets": [
    {
      "ticket_id": "ticket:TC-12345",
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference 2024",
      "event_date": "2024-12-15T10:00:00Z",
      "event_location": "OAU Campus",
      "student_email": "john.doe@student.oauife.edu.ng",
      "student_full_name": "John Doe",
      "status": "confirmed",
      "quantity": 2,
      "total_price": "10000.00",
      "qr_code": "QR-ticket:TC-12345",
      "checked_in_at": null,
      "created_at": "2024-12-10T10:00:00Z",
      "updated_at": "2024-12-10T10:00:00Z"
    }
  ],
  "count": 45,
  "statistics": {
    "confirmed": 45,
    "pending": 5,
    "cancelled": 0,
    "used": 10,
    "total_revenue": 225000.00,
    "available_spots": 55
  }
}
```

**Frontend Implementation:**
```javascript
async function getEventTickets(eventId, status = null) {
  const token = localStorage.getItem('access_token');
  
  let url = `http://localhost:8000/tickets/organizer/${eventId}/tickets/`;
  if (status) {
    url += `?status=${status}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return await response.json();
}
```

---

### 7. Get Ticket Categories

**Endpoint:** `GET /tickets/categories/?event_id=<event_id>`

**Description:** Get all active ticket categories for an event. Categories allow organizers to offer different ticket types with custom pricing (e.g., "Early Bird", "VIP", "Group of 4").

**Authentication:** Required (JWT token)

**Query Parameters:**
- `event_id`: Required, valid event ID

**Success Response (200 OK):**
```json
{
  "categories": [
    {
      "category_id": "category:ABC12-XYZ34",
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference 2024",
      "name": "Early Bird",
      "price": "5000.00",
      "description": "Limited early bird tickets at discounted price",
      "is_active": true,
      "max_tickets": 50,
      "tickets_sold": 30,
      "available_tickets": 20,
      "is_sold_out": false,
      "created_at": "2024-12-01T10:00:00Z",
      "updated_at": "2024-12-10T10:00:00Z"
    },
    {
      "category_id": "category:QWE56-RTY78",
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference 2024",
      "name": "VIP",
      "price": "15000.00",
      "description": "VIP access with premium benefits",
      "is_active": true,
      "max_tickets": 20,
      "tickets_sold": 20,
      "available_tickets": 0,
      "is_sold_out": true,
      "created_at": "2024-12-01T10:00:00Z",
      "updated_at": "2024-12-10T10:00:00Z"
    }
  ],
  "count": 2
}
```

**Response Fields:**
- `name`: Category name (e.g., "Early Bird", "VIP")
- `price`: Price per ticket in this category
- `max_tickets`: Maximum total tickets available for this category (null = unlimited)
- `tickets_sold`: Number of tickets already sold
- `available_tickets`: Number of tickets still available (null = unlimited)
- `is_sold_out`: Whether category is sold out

**Note:** Maximum tickets per booking is controlled at the event level via `max_quantity_per_booking` field (defaults to 3 if not set).

**Frontend Implementation:**
```javascript
async function getTicketCategories(eventId) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(
    `http://localhost:8000/tickets/categories/?event_id=${eventId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const data = await response.json();
  return data.categories;
}
```

---

### 8. Create Ticket Category

**Endpoint:** `POST /tickets/categories/create/`

**Description:** Create a new ticket category for an event. Only organizers can create categories for their own events.

**Authentication:** Required (JWT token, Organizer only)

**Request Body:**
```json
{
  "event_id": "event:TE-12345",
  "name": "Early Bird",
  "price": 5000.00,
  "description": "Limited early bird tickets at discounted price",
  "is_active": true,
  "max_tickets": 50
}
```

**Request Fields:**
- `event_id`: Required, event ID (must belong to authenticated organizer)
- `name`: Required, category name (e.g., "Early Bird", "VIP", "Group of 4")
- `price`: Required, price per ticket (must be >= 0)
- `description`: Optional, description of the category
- `is_active`: Optional, whether category is active (default: true)
- `max_tickets`: Optional, maximum total tickets available for this category (null = unlimited)

**Note:** Maximum tickets per booking is controlled at the event level via `max_quantity_per_booking` field (defaults to 3 if not set).

**Success Response (201 Created):**
```json
{
  "message": "Ticket category created successfully",
  "category": {
    "category_id": "category:ABC12-XYZ34",
    "event_id": "event:TE-12345",
    "event_name": "Tech Conference 2024",
    "name": "Early Bird",
    "price": "5000.00",
    "description": "Limited early bird tickets at discounted price",
    "is_active": true,
    "max_tickets": 50,
    "tickets_sold": 0,
    "available_tickets": 50,
    "is_sold_out": false,
    "created_at": "2024-12-10T10:00:00Z",
    "updated_at": "2024-12-10T10:00:00Z"
  }
}
```

**Error Response (400 Bad Request - Duplicate Name):**
```json
{
  "name": ["ticket category with this name already exists for this event."]
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "You don't have permission to create categories for this event"
}
```

---

### 9. Update Ticket Category

**Endpoint:** `PATCH /tickets/categories/<category_id>/`

**Description:** Update a ticket category. Only organizers can update categories for their own events. Use the alphanumeric `category_id` (e.g., `category:ABC12-XYZ34`).

**Authentication:** Required (JWT token, Organizer only)

**Request Body (all fields optional):**
```json
{
  "name": "Early Bird Special",
  "price": 4500.00,
  "description": "Updated description",
  "is_active": true,
  "max_tickets": 60
}
```

**Success Response (200 OK):**
```json
{
  "message": "Ticket category updated successfully",
  "category": {
    "category_id": "category:ABC12-XYZ34",
    "name": "Early Bird Special",
    "price": "4500.00",
    "max_tickets": 60,
    "tickets_sold": 30,
    "available_tickets": 30,
    "is_sold_out": false
  }
}
```

---

### 10. Delete Ticket Category

**Endpoint:** `DELETE /tickets/categories/<category_id>/`

**Description:** Delete (deactivate) a ticket category. Only organizers can delete categories for their own events. Use the alphanumeric `category_id` (e.g., `category:ABC12-XYZ34`). This is a soft delete - the category is deactivated but not removed from the database.

**Authentication:** Required (JWT token, Organizer only)

**Success Response (200 OK):**
```json
{
  "message": "Ticket category deleted successfully"
}
```

**Note:** Deleted categories are deactivated (`is_active = false`) and will not appear in category listings or be available for booking.

---

### 11. Check In Ticket

**Endpoint:** `POST /tickets/check-in/`

**Description:** Check in a ticket by ticket ID. The frontend will encode `ticket_id` into a QR code, and when scanned, it will decode back to `ticket_id` which is sent here. Only organizers can check in tickets.

**Authentication:** Required (JWT token, Organizer only)

**Request Body:**
```json
{
  "ticket_id": "ticket:TC-12345",
  "event_id": "event:TE-12345"
}
```

**Field Requirements:**
- `ticket_id`: Required, the ticket ID (decoded from QR code by frontend)
- `event_id`: Required, for verification

**How it works:**
1. Frontend receives `ticket_id` (e.g., `"ticket:TC-12345"`) from ticket booking
2. Frontend encodes `ticket_id` into a QR code
3. When QR code is scanned, frontend decodes it back to `ticket_id`
4. Frontend sends the decoded `ticket_id` to this endpoint

**Success Response (200 OK):**
```json
{
  "message": "Ticket checked in successfully",
  "ticket": {
    "ticket_id": "ticket:TC-12345",
    "event_id": "event:TE-12345",
    "event_name": "Tech Conference 2024",
    "event_date": "2024-12-15T10:00:00Z",
    "event_location": "OAU Campus",
    "student_email": "john.doe@student.oauife.edu.ng",
    "student_full_name": "John Doe",
    "status": "used",
    "quantity": 1,
    "total_price": "5000.00",
    "category_name": "Early Bird",
    "category_price": "5000.00",
    "qr_code": "QR-ticket:TC-12345",
    "checked_in_at": "2024-12-15T10:30:00Z",
    "created_at": "2024-12-10T10:00:00Z",
    "updated_at": "2024-12-15T10:30:00Z"
  }
}
```

**Error Response (400 Bad Request - Already Checked In):**
```json
{
  "error": "Ticket has already been checked in",
  "ticket": {
    "ticket_id": "ticket:TC-12345",
    "event_id": "event:TE-12345",
    "event_name": "Tech Conference 2024",
    "event_date": "2024-12-15T10:00:00Z",
    "event_location": "OAU Campus",
    "student_email": "john.doe@student.oauife.edu.ng",
    "student_full_name": "John Doe",
    "status": "used",
    "quantity": 1,
    "total_price": "5000.00",
    "category_name": "Early Bird",
    "category_price": "5000.00",
    "qr_code": "QR-ticket:TC-12345",
    "checked_in_at": "2024-12-15T09:00:00Z",
    "created_at": "2024-12-10T10:00:00Z",
    "updated_at": "2024-12-15T09:00:00Z"
  }
}
```

**Error Response (400 Bad Request - Pending Payment):**
```json
{
  "error": "Cannot check in a pending ticket. Payment must be confirmed first.",
  "ticket": {
    "ticket_id": "ticket:TC-12345",
    "event_id": "event:TE-12345",
    "event_name": "Tech Conference 2024",
    "student_email": "john.doe@student.oauife.edu.ng",
    "student_full_name": "John Doe",
    "status": "pending",
    ...
  }
}
```

**Frontend Implementation:**
```javascript
// QR Code encoding/decoding helper
function encodeTicketIdToQR(ticketId) {
  // Use a QR code library (e.g., qrcode.js) to encode ticket_id
  // The QR code should contain the ticket_id string
  return QRCode.toDataURL(ticketId);
}

function decodeQRToTicketId(qrCodeData) {
  // Use a QR code scanner library (e.g., jsQR) to decode
  // The decoded string should be the ticket_id
  return jsQR(qrCodeData);
}

// Check in ticket function
async function checkInTicket(ticketId, eventId) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/tickets/check-in/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      ticket_id: ticketId,  // Decoded ticket_id from QR code
      event_id: eventId,
    }),
  });
  
  return await response.json();
}

// Example with QR scanner
function handleQRScan(qrCodeData, eventId) {
  // Decode QR code to get ticket_id
  const ticketId = decodeQRToTicketId(qrCodeData);
  
  if (!ticketId) {
    alert('Failed to decode QR code');
    return;
  }
  
  // Send decoded ticket_id to backend
  checkInTicket(ticketId, eventId)
    .then(result => {
      if (result.message) {
        alert('Ticket checked in successfully!');
      }
    })
    .catch(error => {
      alert(error.error || 'Check-in failed');
    });
}

// Example: Generate QR code for a ticket
function generateTicketQRCode(ticketId) {
  // Encode ticket_id into QR code
  const qrCodeImage = encodeTicketIdToQR(ticketId);
  // Display or save the QR code image
  return qrCodeImage;
}
```

---

## Frontend Implementation Guide

### API Client Setup

Create a centralized API client:

```javascript
// api/client.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('access_token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Auth methods
  async login(email, password) {
    return this.request('/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async registerStudent(data) {
    return this.request('/student/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Event methods
  async getEvents() {
    return this.request('/event/');
  }

  async getEventDetails(eventId) {
    return this.request(`/events/${eventId}/details/`);
  }

  // Ticket methods
  async bookTicket(data) {
    return this.request('/tickets/book/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyTickets() {
    return this.request('/tickets/my-tickets/');
  }
}

export default new ApiClient();
```

### React Hook Example

```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';
import apiClient from '../api/client';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Verify token and get user info
      // Implementation depends on your auth flow
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const result = await apiClient.login(email, password);
    localStorage.setItem('access_token', result.access);
    localStorage.setItem('refresh_token', result.refresh);
    setUser(result);
    return result;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    await apiClient.request('/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return { user, loading, login, logout };
}
```

### TypeScript Types

```typescript
// types/api.ts
export interface Event {
  event_id: string;
  event_name: string;
  event_location: string;
  event_date: string;
  event_price: number;
  event_image: string | null; // Cloudinary CDN URL
  event_type: string;
  pricing_type: 'free' | 'paid';
}

export interface Ticket {
  ticket_id: string;
  event: number;
  event_name: string;
  event_date: string;
  event_location: string;
  student: number;
  student_email: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'used';
  quantity: number;
  total_price: number;
  qr_code: string;
  checked_in_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingRequest {
  event_id: string;
  quantity: number;
}

export interface BookingResponse {
  message: string;
  tickets: Ticket[];  // Array of tickets (one for each ticket booked)
  booking_id?: string;  // Groups all tickets from the same purchase
  ticket_count?: number;  // Number of tickets in the booking
  payment_url?: string;  // Paystack payment URL (paid events only)
  payment_reference?: string;  // Payment reference (sanitized booking_id)
}
```

---

## Error Handling

### Custom Exception System ✨ NEW

The API now uses a professional custom exception system that provides clear, consistent error messages.

### Standard Error Response Format

```json
{
  "error": "Error message here"
}
```

### Validation Error Format

```json
{
  "field_name": ["Error message 1", "Error message 2"]
}
```

### Frontend Error Handler

```javascript
async function handleApiCall(apiFunction) {
  try {
    const result = await apiFunction();
    return { success: true, data: result };
  } catch (error) {
    if (error.response) {
      // API returned error
      const errorData = await error.response.json();
      return {
        success: false,
        error: errorData.error || 'An error occurred',
        validationErrors: errorData,
      };
    } else {
      // Network or other error
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }
}
```

---

## Code Examples

### Complete Booking Flow

```javascript
async function completeBookingFlow(eventId, quantity, categoryName = null) {
  try {
    // 1. Book ticket
    const bookingResult = await apiClient.bookTicket({
      event_id: eventId,
      quantity,
      category_name: categoryName,
    });

    // 2. If paid event, redirect to payment
    if (bookingResult.payment_url) {
      window.location.href = bookingResult.payment_url;
      return;
    }

    // 3. If free event, show success
    if (bookingResult.tickets && bookingResult.tickets.length > 0) {
      alert(`${bookingResult.ticket_count || bookingResult.tickets.length} ticket(s) booked successfully!`);
      // Store booking info
      if (bookingResult.booking_id) {
        localStorage.setItem('last_booking_id', bookingResult.booking_id);
      }
      return bookingResult.tickets;  // Return array of tickets
    }
  } catch (error) {
    console.error('Booking failed:', error);
    alert(error.message || 'Booking failed');
  }
}
```

### Payment Verification After Redirect

```javascript
// After user returns from Paystack payment page
async function verifyPaymentAfterRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  const reference = urlParams.get('reference');

  if (reference) {
    try {
      const result = await apiClient.request('/tickets/verify-payment/', {
        method: 'POST',
        body: JSON.stringify({ reference }),
      });

      if (result.message === 'Payment verified successfully') {
        alert('Payment successful! Your ticket is confirmed.');
        // Redirect to tickets page
        window.location.href = '/my-tickets';
      }
    } catch (error) {
      alert('Payment verification failed. Please contact support.');
    }
  }
}
```

---

---

## Image Upload Details

### Cloudinary Integration

All event images are uploaded to **Cloudinary** and served via their CDN. This provides:
- **Fast CDN delivery** globally
- **Automatic optimization** (format, quality, size)
- **On-the-fly transformations** (resize, crop, etc.)
- **Scalable storage** without managing files

### Image URL Format

Images are stored in the `radar/events/` folder and URLs follow this format:
```
https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/radar/events/{filename}.{ext}
```

### Image Upload Requirements

- **Supported formats:** JPEG, PNG, GIF, WebP
- **Max file size:** 10MB (Cloudinary default)
- **Storage location:** `radar/events/` folder in Cloudinary
- **Content-Type:** `multipart/form-data` (use FormData)

### Example Image Response

```json
{
  "image": "https://res.cloudinary.com/dyup8vl0j/image/upload/v1766324617/radar/events/fsz2wfyxpd2p6ayefwud.png"
}
```

---

## Payment Integration Details

### Paystack Payment Flow

1. **Book Ticket** (`POST /tickets/book/`)
   - For paid events, returns `payment_url` and `payment_reference`
   - Ticket status is set to `pending`

2. **Redirect to Paystack**
   - User is redirected to `payment_url`
   - User completes payment on Paystack

3. **Automatic Verification (Webhook)**
   - Paystack calls `/tickets/paystack-webhook/` automatically
   - Ticket status updated to `confirmed` on successful payment
   - **Organizer wallet automatically credited** with earnings (after platform fee)

4. **Manual Verification (Fallback)**
   - If webhook fails, use `POST /tickets/verify-payment/`
   - Pass `reference` (ticket_id) to verify payment

### Webhook Configuration

Configure webhook URL in Paystack Dashboard:
- **Development:** Use ngrok or localtunnel: `https://your-tunnel-url/tickets/paystack-webhook/`
- **Production:** `https://your-domain.com/tickets/paystack-webhook/`

**Webhook Events:**
- `charge.success` → Ticket status → `confirmed` + **Wallet credited automatically**
- `charge.failed` → Ticket remains `pending`

**Wallet Integration:**
- When payment succeeds, organizer wallet is automatically credited
- Platform fee (6% + ₦80 default) is calculated and deducted
- Earnings go to `pending_balance` (7-day holding period)
- After holding period, moves to `available_balance` for withdrawal
- **Fee Structure:** Customer pays `ticket_price + ₦80`, organizer gets `ticket_price × 94%`

---

## Wallet Endpoints ✨ NEW

The wallet system allows organizers to track earnings from ticket sales and withdraw funds to their bank accounts.

### Overview

- **Base URL:** `/wallet/`
- **Authentication:** Required (JWT token, Organizer only)
- **Purpose:** Manage organizer earnings, view transactions, and process withdrawals

### Wallet System Flow

```
Ticket Sold → Payment Confirmed → Wallet Credited (Pending) → 
After 7 Days → Available for Withdrawal → Withdraw to Bank Account
```

### 1. Get Wallet Balance

**Endpoint:** `GET /wallet/balance/`

**Description:** Get current wallet balance for the authenticated organizer. Shows available balance, pending balance, total earnings, and withdrawal history.

**Authentication:** Required (JWT token, Organizer only)

**Success Response (200 OK):**
```json
{
  "available_balance": "5000.00",
  "pending_balance": "2000.00",
  "total_balance": "7000.00",
  "total_earnings": "15000.00",
  "total_withdrawn": "8000.00",
  "bank_account_number": "0123456789",
  "bank_name": "Access Bank",
  "account_name": "John Doe",
  "has_bank_account": true,
  "created_at": "2024-12-01T10:00:00Z",
  "updated_at": "2024-12-30T10:00:00Z"
}
```

**Response Fields:**
- `available_balance`: Money ready for withdrawal (₦)
- `pending_balance`: Money in holding period (7 days) (₦)
- `total_balance`: Sum of available + pending (₦)
- `total_earnings`: Lifetime total earnings (₦)
- `total_withdrawn`: Lifetime total withdrawals (₦)
- `has_bank_account`: Whether bank account is configured (boolean)
- `bank_account_number`: Bank account number (if configured)
- `bank_name`: Bank name (if configured)
- `account_name`: Account holder name (if configured)

**Frontend Implementation:**
```javascript
async function getWalletBalance() {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/wallet/balance/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('Available Balance:', data.available_balance);
    console.log('Pending Balance:', data.pending_balance);
    console.log('Total Earnings:', data.total_earnings);
  }
  
  return data;
}
```

---

### 2. Get Transaction History

**Endpoint:** `GET /wallet/transactions/`

**Description:** Get transaction history for the authenticated organizer. Includes ticket sales, withdrawals, refunds, and fees.

**Authentication:** Required (JWT token, Organizer only)

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)
- `type` (optional): Filter by transaction type (`ticket_sale`, `withdrawal`, `refund`, `fee`)

**Success Response (200 OK):**
```json
{
  "transactions": [
    {
      "transaction_id": "transaction:ABC12-XYZ34",
      "transaction_type": "ticket_sale",
      "transaction_type_display": "Ticket Sale",
      "amount": "1080.00",
      "status": "completed",
      "status_display": "Completed",
      "platform_fee": "140.00",
      "organizer_earnings": "940.00",
      "ticket_id": "ticket:TC-12345",
      "event_name": "Tech Conference",
      "paystack_reference": "ref_123456",
      "transfer_reference": null,
      "description": "Ticket sale for Tech Conference",
      "created_at": "2024-12-10T10:00:00Z",
      "completed_at": "2024-12-10T10:00:01Z"
    },
    {
      "transaction_id": "transaction:QWE56-RTY78",
      "transaction_type": "withdrawal",
      "transaction_type_display": "Withdrawal",
      "amount": "5000.00",
      "status": "completed",
      "status_display": "Completed",
      "platform_fee": "0.00",
      "organizer_earnings": "-5000.00",
      "ticket_id": null,
      "event_name": null,
      "paystack_reference": null,
      "transfer_reference": "TRF_abc123",
      "description": "Withdrawal to Access Bank - John Doe",
      "created_at": "2024-12-15T14:00:00Z",
      "completed_at": "2024-12-17T10:30:00Z"
    }
  ],
  "count": 25,
  "limit": 50,
  "offset": 0
}
```

**Transaction Types:**
- `ticket_sale`: Money earned from ticket sales
- `withdrawal`: Money withdrawn to bank account
- `refund`: Refund for cancelled tickets
- `fee`: Platform fees (if applicable)

**Transaction Status:**
- `pending`: Transaction is pending
- `completed`: Transaction completed successfully
- `failed`: Transaction failed
- `cancelled`: Transaction was cancelled

**Frontend Implementation:**
```javascript
async function getTransactionHistory(limit = 50, offset = 0, type = null) {
  const token = localStorage.getItem('access_token');
  
  let url = `http://localhost:8000/wallet/transactions/?limit=${limit}&offset=${offset}`;
  if (type) {
    url += `&type=${type}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  return data;
}
```

---

### 3. Get Bank Account Details

**Endpoint:** `GET /wallet/bank-account/`

**Description:** Get current bank account details for the authenticated organizer.

**Authentication:** Required (JWT token, Organizer only)

**Success Response (200 OK):**
```json
{
  "bank_account_number": "0123456789",
  "bank_name": "Access Bank",
  "account_name": "John Doe",
  "bank_code": "044",
  "has_bank_account": true
}
```

**Response when no bank account configured:**
```json
{
  "bank_account_number": null,
  "bank_name": null,
  "account_name": null,
  "bank_code": null,
  "has_bank_account": false
}
```

**Frontend Implementation:**
```javascript
async function getBankAccount() {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/wallet/bank-account/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  return data;
}
```

---

### 4. Add/Update Bank Account

**Endpoint:** `POST /wallet/bank-account/`

**Description:** Add or update bank account details for withdrawals. **This is where organizers input their bank details.** Required before making withdrawal requests.

**Authentication:** Required (JWT token, Organizer only)

**Where to add bank details:** Organizers should use this endpoint (`POST /wallet/bank-account/`) to add their bank account information. This is separate from the organizer profile endpoint.

**Request Body:**
```json
{
  "bank_account_number": "0123456789",
  "bank_name": "Access Bank",
  "account_name": "John Doe",
  "bank_code": "044"
}
```

**Request Fields:**
- `bank_account_number` (required): Bank account number (10+ digits, numbers only)
- `bank_name` (required): Bank name (e.g., "Access Bank", "GTBank")
- `account_name` (required): Account holder name
- `bank_code` (optional): Paystack bank code (e.g., "044" for Access Bank)

**Success Response (200 OK):**
```json
{
  "message": "Bank account updated successfully",
  "wallet": {
    "available_balance": "5000.00",
    "pending_balance": "2000.00",
    "total_balance": "7000.00",
    "total_earnings": "15000.00",
    "total_withdrawn": "8000.00",
    "bank_account_number": "0123456789",
    "bank_name": "Access Bank",
    "account_name": "John Doe",
    "has_bank_account": true,
    "created_at": "2024-12-01T10:00:00Z",
    "updated_at": "2024-12-30T10:00:00Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "bank_account_number": ["Bank account number must contain only digits"],
  "bank_account_number": ["Bank account number must be at least 10 digits"]
}
```

**Frontend Implementation:**
```javascript
async function updateBankAccount(bankAccountNumber, bankName, accountName, bankCode = null) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/wallet/bank-account/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bank_account_number: bankAccountNumber,
      bank_name: bankName,
      account_name: accountName,
      bank_code: bankCode,
    }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('Bank account updated successfully');
  } else {
    console.error('Error:', data);
  }
  
  return data;
}
```

---

### 5. Request Withdrawal

**Endpoint:** `POST /wallet/withdraw/`

**Description:** Request withdrawal from available balance to bank account. Uses Paystack Transfer API to send money to organizer's bank account.

**Authentication:** Required (JWT token, Organizer only)

**Prerequisites:**
- Bank account must be configured (use `/wallet/bank-account/`)
- Available balance must be sufficient
- Minimum withdrawal: ₦1,000

**Request Body:**
```json
{
  "amount": 5000.00
}
```

**Request Fields:**
- `amount` (required): Withdrawal amount (must be ≥ ₦1,000 and ≤ available balance)

**Success Response (200 OK):**
```json
{
  "message": "Withdrawal initiated successfully",
  "transaction_id": "transaction:ABC12-XYZ34",
  "transfer_reference": "TRF_abc123def456",
  "status": "pending",
  "amount": "5000.00",
  "estimated_arrival": "1-3 business days"
}
```

**Error Responses:**

**Insufficient Balance (400 Bad Request):**
```json
{
  "error": "Insufficient balance",
  "available_balance": "3000.00",
  "requested_amount": "5000.00"
}
```

**Bank Account Not Configured (400 Bad Request):**
```json
{
  "error": "Bank account not configured. Please add bank account details first."
}
```

**Amount Too Low (400 Bad Request):**
```json
{
  "amount": ["Minimum withdrawal amount is ₦1,000.00"]
}
```

**Frontend Implementation:**
```javascript
async function requestWithdrawal(amount) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/wallet/withdraw/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount,
    }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('Withdrawal initiated:', data.transfer_reference);
    console.log('Estimated arrival:', data.estimated_arrival);
  } else {
    console.error('Withdrawal failed:', data.error);
  }
  
  return data;
}
```

---

### 6. Get Withdrawal History

**Endpoint:** `GET /wallet/withdrawals/`

**Description:** Get withdrawal transaction history for the authenticated organizer.

**Authentication:** Required (JWT token, Organizer only)

**Query Parameters:**
- `limit` (optional): Number of withdrawals to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Success Response (200 OK):**
```json
{
  "withdrawals": [
    {
      "transaction_id": "transaction:ABC12-XYZ34",
      "transaction_type": "withdrawal",
      "transaction_type_display": "Withdrawal",
      "amount": "5000.00",
      "status": "completed",
      "status_display": "Completed",
      "platform_fee": "0.00",
      "organizer_earnings": "-5000.00",
      "ticket_id": null,
      "event_name": null,
      "paystack_reference": null,
      "transfer_reference": "TRF_abc123",
      "description": "Withdrawal to Access Bank - John Doe",
      "created_at": "2024-12-15T14:00:00Z",
      "completed_at": "2024-12-17T10:30:00Z"
    }
  ],
  "count": 5,
  "limit": 50,
  "offset": 0
}
```

**Frontend Implementation:**
```javascript
async function getWithdrawalHistory(limit = 50, offset = 0) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(
    `http://localhost:8000/wallet/withdrawals/?limit=${limit}&offset=${offset}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const data = await response.json();
  return data;
}
```

---

### Wallet System Details

#### Platform Fee (Paid Events Only)

- **Default Fee Structure:** 6% of ticket price + ₦80 per ticket
- **Configurable:** Can be customized per event via admin panel
- **Fee Breakdown:**
  - **Customer pays:** `ticket_price + ₦80` (₦80 is an additional charge)
  - **Platform gets:** `(ticket_price × 6%) + ₦80`
  - **Organizer gets:** `ticket_price × 94%` (6% deducted from base price)
- **Example:** ₦1,000 ticket
  - Customer pays: ₦1,000 + ₦80 = **₦1,080**
  - Platform fee: (₦1,000 × 6%) + ₦80 = ₦60 + ₦80 = **₦140**
  - Organizer earnings: ₦1,000 × 94% = **₦940**
- **Note:** Free events have no platform fees

#### Holding Period

- **Duration:** 7 days (configurable)
- **Purpose:** Protection against refunds/chargebacks
- **Flow:** 
  1. Ticket sold → Money goes to `pending_balance`
  2. After 7 days → Moves to `available_balance`
  3. Organizer can withdraw from `available_balance`

#### Withdrawal Process

1. **Organizer requests withdrawal** → `POST /wallet/withdraw/`
2. **System validates:**
   - Bank account configured
   - Sufficient available balance
   - Amount ≥ minimum (₦1,000)
3. **Paystack Transfer initiated:**
   - Creates transfer recipient (if not exists)
   - Initiates transfer to bank account
   - Returns transfer reference
4. **Transaction created:**
   - Status: `pending`
   - Wallet debited immediately
5. **Paystack webhook updates status:**
   - `transfer.success` → Status: `completed`
   - `transfer.failed` → Status: `failed` (wallet credited back)

#### Complete Wallet Flow Example

```javascript
// 1. Get wallet balance
const balance = await getWalletBalance();
console.log('Available:', balance.available_balance);

// 2. Add bank account (first time only)
await updateBankAccount('0123456789', 'Access Bank', 'John Doe', '044');

// 3. Request withdrawal
const withdrawal = await requestWithdrawal(5000.00);
console.log('Withdrawal ID:', withdrawal.transaction_id);

// 4. Check withdrawal status
const withdrawals = await getWithdrawalHistory();
console.log('Latest withdrawal:', withdrawals.withdrawals[0]);

// 5. View all transactions
const transactions = await getTransactionHistory();
console.log('Total transactions:', transactions.count);
```

---

## Analytics Endpoints ✨ NEW

Analytics endpoints for organizers to view statistics and reports about their events and tickets.

### Base URL

```
/analytics/
```

### Authentication

All analytics endpoints require:
1. **JWT Token** in `Authorization: Bearer <token>` header
2. **Organizer Permission** - User must be an organizer

---

### 1. Global Analytics

**Endpoint:** `GET /analytics/global/`

**Description:** Get global analytics for the authenticated organizer across all events. Shows statistics like total revenue, tickets sold, events created, etc.

**Authentication:** Required (JWT token, Organizer only)

**Success Response (200 OK):**
```json
{
  "analytics": {
    "total_revenue": 150000.00,
    "total_tickets_sold": 150,
    "total_pending_tickets": 10,
    "total_cancelled_tickets": 5,
    "total_used_tickets": 120,
    "total_events_created": 12,
    "pending_events": 2,
    "verified_events": 8,
    "denied_events": 2
  },
  "message": "Global analytics retrieved successfully"
}
```

**Response Fields:**
- `total_revenue`: Total revenue from all confirmed tickets (float)
- `total_tickets_sold`: Total confirmed tickets across all events (integer)
- `total_pending_tickets`: Tickets with pending payment status (integer)
- `total_cancelled_tickets`: Cancelled tickets count (integer)
- `total_used_tickets`: Tickets that have been checked in (integer)
- `total_events_created`: Total events created by organizer (integer)
- `pending_events`: Events awaiting verification (integer)
- `verified_events`: Verified events count (integer)
- `denied_events`: Denied events count (integer)

**Frontend Implementation:**
```javascript
async function getGlobalAnalytics() {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/analytics/global/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  return data.analytics;
}
```

---

### 2. Event Analytics

**Endpoint:** `GET /analytics/event/<event_id>/`

**Description:** Get detailed analytics for a specific event. Includes event information, statistics, and a detailed list of all tickets.

**Authentication:** Required (JWT token, Organizer only)

**URL Parameters:**
- `event_id`: Event ID (e.g., `event:TE-12345`)

**Success Response (200 OK):**
```json
{
  "analytics": {
    "event_info": {
      "event_id": "event:TE-12345",
      "name": "Tech Conference 2024",
      "location": "OAU Campus",
      "date": "2024-12-15T10:00:00Z",
      "pricing_type": "paid",
      "price": 5000.00,
      "capacity": 100,
      "status": "verified"
    },
    "statistics": {
      "total_tickets_sold": 75,
      "pending_tickets": 5,
      "cancelled_tickets": 2,
      "used_tickets": 60,
      "total_revenue": 375000.00,
      "available_spots": 25
    },
    "tickets_list": [
      {
        "ticket_id": "ticket:TC-12345",
        "student_email": "john.doe@student.oauife.edu.ng",
        "student_full_name": "John Doe",
        "status": "confirmed",
        "quantity": 1,
        "total_price": "5000.00",
        "created_at": "2024-12-10T10:00:00Z",
        "checked_in_at": null
      }
    ]
  },
  "message": "Event analytics retrieved successfully"
}
```

**Response Structure:**
- `event_info`: Basic event information
- `statistics`: Event statistics (tickets sold, revenue, etc.)
- `tickets_list`: Detailed list of all tickets for this event

**Frontend Implementation:**
```javascript
async function getEventAnalytics(eventId) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(
    `http://localhost:8000/analytics/event/${eventId}/`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const data = await response.json();
  return data.analytics;
}
```

---

### 3. Events Summary

**Endpoint:** `GET /analytics/events-summary/`

**Description:** Get summary of all events with basic statistics. Useful for dashboard overview showing all events at a glance.

**Authentication:** Required (JWT token, Organizer only)

**Success Response (200 OK):**
```json
{
  "events": [
    {
      "event_id": "event:TE-12345",
      "name": "Tech Conference 2024",
      "date": "2024-12-15T10:00:00Z",
      "status": "verified",
      "total_tickets_sold": 75,
      "total_revenue": 375000.00,
      "pending_tickets": 5
    },
    {
      "event_id": "event:CD-67890",
      "name": "Cultural Day",
      "date": "2024-12-20T14:00:00Z",
      "status": "pending",
      "total_tickets_sold": 0,
      "total_revenue": 0.00,
      "pending_tickets": 0
    }
  ],
  "count": 2,
  "message": "Events summary retrieved successfully"
}
```

**Response Fields (per event):**
- `event_id`: Event ID
- `name`: Event name
- `date`: Event date/time
- `status`: Event status (pending, verified, denied)
- `total_tickets_sold`: Number of confirmed tickets sold
- `total_revenue`: Total revenue from confirmed tickets
- `pending_tickets`: Number of tickets with pending payment

**Frontend Implementation:**
```javascript
async function getEventsSummary() {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/analytics/events-summary/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  return data.events;
}
```

**Note:** Analytics endpoints are for organizers only. They provide insights into event performance, ticket sales, and revenue across all events or for specific events.

---

## Health Check Endpoint

### Health Check

**Endpoint:** `GET /health/`

**Description:** Check if the API is running and database is accessible. No authentication required.

**Authentication:** Not required

**Success Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-30T10:00:00Z",
  "service": "Radar API",
  "database": "connected"
}
```

**Degraded Response (503 Service Unavailable):**
```json
{
  "status": "degraded",
  "timestamp": "2024-12-30T10:00:00Z",
  "service": "Radar API",
  "database": "disconnected",
  "database_error": "Connection timeout"
}
```

**Frontend Implementation:**
```javascript
async function checkHealth() {
  const response = await fetch('http://localhost:8000/health/');
  const data = await response.json();
  
  if (data.status === 'healthy') {
    console.log('API is healthy');
  } else {
    console.warn('API is degraded:', data.database_error);
  }
  
  return data;
}
```

---

## Admin Endpoints

Admin endpoints for managing the platform. All admin endpoints are prefixed with `/api/admin/` and require admin authentication.

### Base URL

```
/api/admin/
```

### Authentication

Admin endpoints require:
1. **JWT Token** in `Authorization: Bearer <token>` header
2. **Admin Permission** - User must have `is_staff=True` in Django User model

### 1. Admin Login

**Endpoint:** `POST /api/admin/auth/login/`

**Description:** Authenticate admin user and receive JWT tokens.

**Authentication:** Not required (public endpoint)

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin_password"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "email": "admin@example.com",
  "is_staff": true,
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials or insufficient permissions"
}
```

**Frontend Implementation:**
```javascript
async function adminLogin(email, password) {
  const response = await fetch('http://localhost:8000/api/admin/auth/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('admin_access_token', data.access);
    localStorage.setItem('admin_refresh_token', data.refresh);
  }
  
  return data;
}
```

---

### 2. Admin Logout

**Endpoint:** `POST /api/admin/auth/logout/`

**Description:** Logout admin user (blacklist refresh token if needed).

**Authentication:** Required (JWT token, Admin only)

**Success Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

---

### 3. Dashboard Analytics

**Endpoint:** `GET /api/admin/dashboard/analytics/`

**Description:** Get comprehensive dashboard analytics including total users, students, organisers, events, and platform revenue.

**Authentication:** Required (JWT token, Admin only)

**Success Response (200 OK):**
```json
{
  "analytics": {
    "total_users": 150,
    "total_students": 120,
    "total_organisers": 30,
    "total_events": 45,
    "total_revenue": 125000.50
  },
  "message": "Dashboard analytics retrieved successfully"
}
```

**Response Fields:**
- `total_users`: Total number of User accounts
- `total_students`: Total number of students registered
- `total_organisers`: Total number of organisers registered
- `total_events`: Total number of events created
- `total_revenue`: Total platform revenue (from platform fees on confirmed tickets)

**Frontend Implementation:**
```javascript
async function getDashboardAnalytics() {
  const token = localStorage.getItem('admin_access_token');
  
  const response = await fetch('http://localhost:8000/api/admin/dashboard/analytics/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  return data.analytics;
}
```

---

### 4. Recent Events

**Endpoint:** `GET /api/admin/dashboard/recent-events/`

**Description:** Get recent events for dashboard display.

**Authentication:** Required (JWT token, Admin only)

**Query Parameters:**
- `limit` (optional): Number of events to return (default: 10, max: 100)

**Success Response (200 OK):**
```json
{
  "events": [
    {
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference 2024",
      "organisation_name": "Tech Org",
      "date": "2024-12-15T10:00:00Z",
      "status": "pending",
      "event_type": "tech",
      "location": "OAU Campus",
      "pricing_type": "paid",
      "price": 5000.00,
      "created_at": "2024-12-10T10:00:00Z"
    }
  ],
  "count": 10,
  "message": "Recent events retrieved successfully"
}
```

**Frontend Implementation:**
```javascript
async function getRecentEvents(limit = 10) {
  const token = localStorage.getItem('admin_access_token');
  
  const response = await fetch(
    `http://localhost:8000/api/admin/dashboard/recent-events/?limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const data = await response.json();
  return data.events;
}
```

---

### 5. Get All Events

**Endpoint:** `GET /api/admin/events/`

**Description:** Get all events in the system with complete information for admin management.

**Authentication:** Required (JWT token, Admin only)

**Success Response (200 OK):**
```json
{
  "events": [
    {
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference 2024",
      "organisation_name": "Tech Org",
      "date": "2024-12-15T10:00:00Z",
      "status": "pending",
      "event_type": "tech",
      "location": "OAU Campus",
      "pricing_type": "paid",
      "price": 5000.00,
      "capacity": 100,
      "created_at": "2024-12-10T10:00:00Z"
    }
  ],
  "count": 45,
  "message": "All events retrieved successfully"
}
```

**Frontend Implementation:**
```javascript
async function getAllEvents() {
  const token = localStorage.getItem('admin_access_token');
  
  const response = await fetch('http://localhost:8000/api/admin/events/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  return data.events;
}
```

---

### 6. Update Event Status

**Endpoint:** `PATCH /api/admin/events/<event_id>/status/`

**Description:** Update the status of an event (pending/verified/denied). Only accessible to admin users.

**Authentication:** Required (JWT token, Admin only)

**URL Parameters:**
- `event_id`: Event ID (e.g., `event:TE-12345`)

**Request Body:**
```json
{
  "status": "verified"
}
```

**Valid Status Values:**
- `pending` - Event is pending review (default)
- `verified` - Event has been verified and approved (visible to users)
- `denied` - Event has been denied/rejected (not visible to users)

**Success Response (200 OK):**
```json
{
  "message": "Event status updated to verified",
  "event_id": "event:TE-12345",
  "event_name": "Tech Conference 2024",
  "status": "verified"
}
```

**Error Responses:**

**Invalid Status (400 Bad Request):**
```json
{
  "status": ["Invalid status. Choose from: ['pending', 'verified', 'denied']"]
}
```

**Event Not Found (400 Bad Request):**
```json
{
  "error": "Event not found"
}
```

**Frontend Implementation:**
```javascript
async function updateEventStatus(eventId, newStatus) {
  const token = localStorage.getItem('admin_access_token');
  
  const response = await fetch(
    `http://localhost:8000/api/admin/events/${eventId}/status/`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    }
  );
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('Event status updated:', data.message);
  } else {
    console.error('Error:', data.error || data);
  }
  
  return data;
}
```

---

### 7. Get All Users (with Filtering & Pagination)

**Endpoint:** `GET /api/admin/users/`

**Description:** Get all users (students and organizers) with server-side filtering and pagination.

**Authentication:** Required (JWT token, Admin only)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `page_size` | integer | 20 | Items per page (max: 100) |
| `role` | string | null | Filter by role: `student`, `organizer`, or omit for all |

**Example Requests:**
```
GET /api/admin/users/                           # All users, page 1, 20 per page
GET /api/admin/users/?page=2                    # All users, page 2
GET /api/admin/users/?role=student              # Only students
GET /api/admin/users/?role=organizer            # Only organizers
GET /api/admin/users/?role=student&page=3&page_size=10  # Students, page 3, 10 per page
```

**Success Response (200 OK):**
```json
{
  "users": [
    {
      "id": "organiser:ABC12-XYZ34",
      "email": "organizer@techorg.com",
      "role": "organizer",
      "name": "Tech Org",
      "phone": "+2348012345678",
      "created_at": "2024-11-01T10:00:00Z",
      "total_events": 5,
      "event_preferences": null
    },
    {
      "id": "123",
      "email": "john.doe@student.edu",
      "role": "student",
      "name": "John Doe",
      "phone": null,
      "created_at": "2024-11-02T14:30:00Z",
      "total_events": null,
      "event_preferences": ["tech", "music", "career"]
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 95,
    "page_size": 20,
    "has_next": true,
    "has_previous": false
  },
  "filters": {
    "role": null
  },
  "message": "Users retrieved successfully"
}
```

**Response Fields:**

*User Object:*
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique user ID |
| `email` | string | User email address |
| `role` | string | `student` or `organizer` |
| `name` | string | Full name (student) or organization name (organizer) |
| `phone` | string/null | Phone number (organizers only) |
| `created_at` | datetime/null | Account creation date |
| `total_events` | integer/null | Number of events (organizers only) |
| `event_preferences` | array/null | Event preferences (students only) |

*Pagination Object:*
| Field | Type | Description |
|-------|------|-------------|
| `current_page` | integer | Current page number |
| `total_pages` | integer | Total number of pages |
| `total_count` | integer | Total number of users matching filter |
| `page_size` | integer | Items per page |
| `has_next` | boolean | Whether there's a next page |
| `has_previous` | boolean | Whether there's a previous page |

**Error Responses:**

*Invalid role (400 Bad Request):*
```json
{
  "error": "Invalid role. Must be 'student', 'organizer', or omit for all."
}
```

**Frontend Implementation:**
```javascript
async function getUsers({ page = 1, pageSize = 20, role = null } = {}) {
  const token = localStorage.getItem('admin_access_token');
  
  // Build query string
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('page_size', pageSize);
  if (role) {
    params.append('role', role);
  }
  
  const response = await fetch(
    `http://localhost:8000/api/admin/users/?${params.toString()}`,
    {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    }
  );
  
  const data = await response.json();
  return data;
}

// Usage examples:
// Get all users (first page)
const allUsers = await getUsers();

// Get students only
const students = await getUsers({ role: 'student' });

// Get organizers, page 2
const organizers = await getUsers({ role: 'organizer', page: 2 });

// Get 50 users per page
const moreUsers = await getUsers({ pageSize: 50 });
```

**React Component Example:**
```tsx
function UsersTable() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [roleFilter, setRoleFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter]);

  const fetchUsers = async () => {
    const data = await getUsers({ 
      page: currentPage, 
      role: roleFilter 
    });
    setUsers(data.users);
    setPagination(data.pagination);
  };

  return (
    <div>
      {/* Role Filter */}
      <select onChange={(e) => {
        setRoleFilter(e.target.value || null);
        setCurrentPage(1); // Reset to page 1 when filter changes
      }}>
        <option value="">All Users</option>
        <option value="student">Students</option>
        <option value="organizer">Organizers</option>
      </select>

      {/* Users Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && (
        <div>
          <button 
            disabled={!pagination.has_previous}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Previous
          </button>
          <span>Page {pagination.current_page} of {pagination.total_pages}</span>
          <button 
            disabled={!pagination.has_next}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </button>
          <span>Total: {pagination.total_count} users</span>
        </div>
      )}
    </div>
  );
}
```

---

### 8. Get User Details

**Endpoint:** `GET /api/admin/users/<user_id>/`

**Description:** Get detailed information about a specific user (student or organizer).

**Authentication:** Required (JWT token, Admin only)

**URL Parameters:**
- `user_id`: User ID (e.g., `organiser:ABC12-XYZ34` for organizers, or numeric ID for students)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string | Yes | User role: `student` or `organizer` |

**Example Requests:**
```
GET /api/admin/users/organiser:ABC12-XYZ34/?role=organizer
GET /api/admin/users/123/?role=student
```

**Success Response (200 OK) - Organizer:**
```json
{
  "user": {
    "id": "organiser:ABC12-XYZ34",
    "email": "organizer@techorg.com",
    "role": "organizer",
    "name": "Tech Org",
    "phone": "+2348012345678",
    "created_at": "2024-11-01T10:00:00Z",
    "total_events": 5,
    "is_active": true,
    "is_verified": true,
    "events": [
      {
        "event_id": "event:TE-12345",
        "event_name": "Tech Conference 2024",
        "status": "verified",
        "date": "2024-12-15T10:00:00Z"
      }
    ]
  },
  "message": "User details retrieved successfully"
}
```

**Success Response (200 OK) - Student:**
```json
{
  "user": {
    "id": "123",
    "email": "john.doe@student.edu",
    "role": "student",
    "name": "John Doe",
    "created_at": "2024-11-02T14:30:00Z",
    "is_active": true,
    "event_preferences": ["tech", "music", "career"],
    "tickets_count": 10
  },
  "message": "User details retrieved successfully"
}
```

**Error Responses:**

*Missing role parameter (400 Bad Request):*
```json
{
  "error": "Role parameter is required. Must be 'student' or 'organizer'."
}
```

*User not found (404 Not Found):*
```json
{
  "error": "User not found"
}
```

**Frontend Implementation:**
```javascript
async function getUserDetails(userId, role) {
  const token = localStorage.getItem('admin_access_token');
  
  const response = await fetch(
    `http://localhost:8000/api/admin/users/${userId}/?role=${role}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const data = await response.json();
  return data;
}
```

---

### 9. Enable/Disable User

**Endpoint:** `PATCH /api/admin/users/<user_id>/status/`

**Description:** Enable or disable a user account. Disabled users cannot log in or perform actions.

**Authentication:** Required (JWT token, Admin only)

**URL Parameters:**
- `user_id`: User ID

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string | Yes | User role: `student` or `organizer` |

**Request Body:**
```json
{
  "is_active": false
}
```

**Success Response (200 OK):**
```json
{
  "message": "User disabled successfully",
  "user_id": "organiser:ABC12-XYZ34",
  "is_active": false
}
```

**Error Responses:**

*Missing is_active field (400 Bad Request):*
```json
{
  "error": "is_active field is required"
}
```

*User not found (404 Not Found):*
```json
{
  "error": "User not found"
}
```

**Frontend Implementation:**
```javascript
async function toggleUserStatus(userId, role, isActive) {
  const token = localStorage.getItem('admin_access_token');
  
  const response = await fetch(
    `http://localhost:8000/api/admin/users/${userId}/status/?role=${role}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_active: isActive,
      }),
    }
  );
  
  return await response.json();
}

// Disable a user
await toggleUserStatus('organiser:ABC12-XYZ34', 'organizer', false);

// Enable a user
await toggleUserStatus('organiser:ABC12-XYZ34', 'organizer', true);
```

---

### 10. Verify/Unverify Organizer

**Endpoint:** `PATCH /api/admin/users/<organiser_id>/verify/`

**Description:** Mark an organizer as verified (trusted) or unverified. Verified organizers display a verification badge.

**Authentication:** Required (JWT token, Admin only)

**URL Parameters:**
- `organiser_id`: Organizer ID (e.g., `organiser:ABC12-XYZ34`)

**Request Body:**
```json
{
  "is_verified": true
}
```

**Success Response (200 OK):**
```json
{
  "message": "Organizer verified successfully",
  "organiser_id": "organiser:ABC12-XYZ34",
  "is_verified": true
}
```

**Error Responses:**

*Missing is_verified field (400 Bad Request):*
```json
{
  "error": "is_verified field is required"
}
```

*Organizer not found (404 Not Found):*
```json
{
  "error": "Organizer not found"
}
```

**Frontend Implementation:**
```javascript
async function toggleOrganizerVerification(organiserId, isVerified) {
  const token = localStorage.getItem('admin_access_token');
  
  const response = await fetch(
    `http://localhost:8000/api/admin/users/${organiserId}/verify/`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_verified: isVerified,
      }),
    }
  );
  
  return await response.json();
}

// Verify an organizer
await toggleOrganizerVerification('organiser:ABC12-XYZ34', true);
```

---

### 11. Delete User

**Endpoint:** `DELETE /api/admin/users/<user_id>/delete/`

**Description:** Permanently delete a user account. This action cannot be undone.

**Authentication:** Required (JWT token, Admin only)

**URL Parameters:**
- `user_id`: User ID

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string | Yes | User role: `student` or `organizer` |

**Example Request:**
```
DELETE /api/admin/users/organiser:ABC12-XYZ34/delete/?role=organizer
```

**Success Response (200 OK):**
```json
{
  "message": "User deleted successfully",
  "user_id": "organiser:ABC12-XYZ34"
}
```

**Error Responses:**

*User not found (404 Not Found):*
```json
{
  "error": "User not found"
}
```

**Frontend Implementation:**
```javascript
async function deleteUser(userId, role) {
  const token = localStorage.getItem('admin_access_token');
  
  const response = await fetch(
    `http://localhost:8000/api/admin/users/${userId}/delete/?role=${role}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  return await response.json();
}

// Usage with confirmation
if (confirm('Are you sure you want to delete this user?')) {
  await deleteUser('organiser:ABC12-XYZ34', 'organizer');
}
```

---

### 12. Feature/Unfeature Event

**Endpoint:** `PATCH /api/admin/events/<event_id>/featured/`

**Description:** Mark an event as featured (for homepage promotion) or remove from featured.

**Authentication:** Required (JWT token, Admin only)

**URL Parameters:**
- `event_id`: Event ID (e.g., `event:TE-12345`)

**Request Body:**
```json
{
  "is_featured": true
}
```

**Success Response (200 OK):**
```json
{
  "message": "Event featured successfully",
  "event_id": "event:TE-12345",
  "is_featured": true
}
```

**Error Responses:**

*Missing is_featured field (400 Bad Request):*
```json
{
  "error": "is_featured field is required"
}
```

*Event not found (404 Not Found):*
```json
{
  "error": "Event not found"
}
```

**Frontend Implementation:**
```javascript
async function toggleEventFeatured(eventId, isFeatured) {
  const token = localStorage.getItem('admin_access_token');
  
  const response = await fetch(
    `http://localhost:8000/api/admin/events/${eventId}/featured/`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_featured: isFeatured,
      }),
    }
  );
  
  return await response.json();
}

// Feature an event
await toggleEventFeatured('event:TE-12345', true);

// Unfeature an event
await toggleEventFeatured('event:TE-12345', false);
```

---

### 13. Delete Event

**Endpoint:** `DELETE /api/admin/events/<event_id>/delete/`

**Description:** Permanently delete an event. This action cannot be undone.

**Authentication:** Required (JWT token, Admin only)

**URL Parameters:**
- `event_id`: Event ID (e.g., `event:TE-12345`)

**Success Response (200 OK):**
```json
{
  "message": "Event deleted successfully",
  "event_id": "event:TE-12345"
}
```

**Error Responses:**

*Event not found (404 Not Found):*
```json
{
  "error": "Event not found"
}
```

**Frontend Implementation:**
```javascript
async function deleteEvent(eventId) {
  const token = localStorage.getItem('admin_access_token');
  
  const response = await fetch(
    `http://localhost:8000/api/admin/events/${eventId}/delete/`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  return await response.json();
}

// Usage with confirmation
if (confirm('Are you sure you want to delete this event?')) {
  await deleteEvent('event:TE-12345');
}
```

---

### 14. Get/Update Event Platform Fee

**Endpoint:** `GET /api/admin/events/<event_id>/platform-fee/`  
**Endpoint:** `PATCH /api/admin/events/<event_id>/platform-fee/`

**Description:** Get or update platform fee settings for a specific event. Platform fees are only applicable for paid events. Free events have no platform fees.

**Authentication:** Required (JWT token, Admin only)

**URL Parameters:**
- `event_id`: Event ID (e.g., `event:TE-12345`)

**Request Body (PATCH - all fields optional):**
```json
{
  "platform_fee_percentage": 0.08,
  "platform_fee_fixed": 100.00
}
```

**Field Descriptions:**
- `platform_fee_percentage`: Custom fee percentage (0.08 = 8%). Set to `null` to use system default (6%).
- `platform_fee_fixed`: Custom fixed fee in Naira. Set to `null` to use system default (₦80).

**Success Response - GET (200 OK):**
```json
{
  "platform_fee": {
    "event_id": "event:TE-12345",
    "event_name": "Tech Conference 2024",
    "pricing_type": "paid",
    "platform_fee_percentage": null,
    "platform_fee_fixed": null,
    "effective_fee_percentage": 0.06,
    "effective_fee_fixed": 80.00,
    "using_system_default": true,
    "system_default_percentage": 0.06,
    "system_default_fixed": 80.00
  },
  "message": "Event platform fee retrieved successfully"
}
```

**Success Response - PATCH (200 OK):**
```json
{
  "platform_fee": {
    "event_id": "event:TE-12345",
    "event_name": "Tech Conference 2024",
    "pricing_type": "paid",
    "platform_fee_percentage": 0.08,
    "platform_fee_fixed": 100.00,
    "effective_fee_percentage": 0.08,
    "effective_fee_fixed": 100.00,
    "using_system_default": false
  },
  "message": "Event platform fee updated successfully"
}
```

**Success Response - Free Event (200 OK):**
```json
{
  "platform_fee": {
    "event_id": "event:TE-12345",
    "event_name": "Free Workshop",
    "pricing_type": "free",
    "platform_fee_percentage": null,
    "platform_fee_fixed": null,
    "effective_fee_percentage": 0,
    "effective_fee_fixed": 0,
    "message": "Free events have no platform fees"
  },
  "message": "Event platform fee retrieved successfully"
}
```

**Error Responses:**

*Free event (400 Bad Request):*
```json
{
  "error": "Platform fees are only applicable for paid events"
}
```

*Event not found (404 Not Found):*
```json
{
  "error": "Event with ID event:TE-12345 not found"
}
```

**Frontend Implementation:**
```javascript
// Get event platform fee
async function getEventPlatformFee(eventId) {
  const token = localStorage.getItem('admin_access_token');
  
  const response = await fetch(
    `http://localhost:8000/api/admin/events/${eventId}/platform-fee/`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  return await response.json();
}

// Update event platform fee
async function updateEventPlatformFee(eventId, feeData) {
  const token = localStorage.getItem('admin_access_token');
  
  const response = await fetch(
    `http://localhost:8000/api/admin/events/${eventId}/platform-fee/`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feeData),
    }
  );
  
  return await response.json();
}

// Example: Set custom fee (8% + ₦100)
await updateEventPlatformFee('event:TE-12345', {
  platform_fee_percentage: 0.08,
  platform_fee_fixed: 100.00
});

// Example: Reset to system default
await updateEventPlatformFee('event:TE-12345', {
  platform_fee_percentage: null,
  platform_fee_fixed: null
});

// Example: Only change percentage, keep fixed fee at system default
await updateEventPlatformFee('event:TE-12345', {
  platform_fee_percentage: 0.10,
  platform_fee_fixed: null
});
```

**Platform Fee Calculation:**
- **Customer pays:** `ticket_price + fixed_fee` (e.g., ₦1,000 + ₦80 = ₦1,080)
- **Platform gets:** `(ticket_price × percentage) + fixed_fee` (e.g., (₦1,000 × 6%) + ₦80 = ₦140)
- **Organizer gets:** `ticket_price × (1 - percentage)` (e.g., ₦1,000 × 94% = ₦940)

---

### 15. Get All Tickets (with Filtering & Pagination)

**Endpoint:** `GET /api/admin/tickets/`

**Description:** Get all tickets in the system with server-side filtering and pagination.

**Authentication:** Required (JWT token, Admin only)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `page_size` | integer | 20 | Items per page (max: 100) |
| `status` | string | null | Filter by status: `pending`, `confirmed`, `cancelled` |
| `event_id` | string | null | Filter by event ID |

**Example Requests:**
```
GET /api/admin/tickets/                                    # All tickets
GET /api/admin/tickets/?status=confirmed                   # Confirmed tickets only
GET /api/admin/tickets/?event_id=event:TE-12345            # Tickets for specific event
GET /api/admin/tickets/?status=pending&page=2&page_size=10 # Pending tickets, page 2
```

**Success Response (200 OK):**
```json
{
  "tickets": [
    {
      "ticket_id": "TKT-ABC123",
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference 2024",
      "student_email": "john.doe@student.edu",
      "student_name": "John Doe",
      "category": "VIP",
      "price": 5000.00,
      "status": "confirmed",
      "payment_reference": "PAY-XYZ789",
      "created_at": "2024-12-10T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_count": 195,
    "page_size": 20,
    "has_next": true,
    "has_previous": false
  },
  "filters": {
    "status": null,
    "event_id": null
  },
  "message": "Tickets retrieved successfully"
}
```

**Frontend Implementation:**
```javascript
async function getTickets({ page = 1, pageSize = 20, status = null, eventId = null } = {}) {
  const token = localStorage.getItem('admin_access_token');
  
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('page_size', pageSize);
  if (status) params.append('status', status);
  if (eventId) params.append('event_id', eventId);
  
  const response = await fetch(
    `http://localhost:8000/api/admin/tickets/?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  return await response.json();
}

// Get all confirmed tickets
const confirmedTickets = await getTickets({ status: 'confirmed' });

// Get tickets for a specific event
const eventTickets = await getTickets({ eventId: 'event:TE-12345' });
```

---

### 16. Get All Withdrawals (with Filtering & Pagination)

**Endpoint:** `GET /api/admin/withdrawals/`

**Description:** Get all withdrawal requests with server-side filtering and pagination.

**Authentication:** Required (JWT token, Admin only)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `page_size` | integer | 20 | Items per page (max: 100) |
| `status` | string | null | Filter by status: `pending`, `completed`, `failed` |

**Example Requests:**
```
GET /api/admin/withdrawals/                    # All withdrawals
GET /api/admin/withdrawals/?status=pending     # Pending withdrawals only
GET /api/admin/withdrawals/?status=completed&page=2
```

**Success Response (200 OK):**
```json
{
  "withdrawals": [
    {
      "transaction_id": "WDR-ABC123",
      "organiser_id": "organiser:ABC12-XYZ34",
      "organiser_name": "Tech Org",
      "organiser_email": "organizer@techorg.com",
      "amount": 50000.00,
      "bank_name": "First Bank",
      "account_number": "1234567890",
      "account_name": "Tech Org Ltd",
      "status": "pending",
      "requested_at": "2024-12-10T10:00:00Z",
      "processed_at": null
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_count": 45,
    "page_size": 20,
    "has_next": true,
    "has_previous": false
  },
  "filters": {
    "status": null
  },
  "message": "Withdrawals retrieved successfully"
}
```

**Frontend Implementation:**
```javascript
async function getWithdrawals({ page = 1, pageSize = 20, status = null } = {}) {
  const token = localStorage.getItem('admin_access_token');
  
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('page_size', pageSize);
  if (status) params.append('status', status);
  
  const response = await fetch(
    `http://localhost:8000/api/admin/withdrawals/?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  return await response.json();
}

// Get pending withdrawals
const pendingWithdrawals = await getWithdrawals({ status: 'pending' });
```

---

### 16. Approve/Reject Withdrawal

**Endpoint:** `PATCH /api/admin/withdrawals/<transaction_id>/status/`

**Description:** Approve or reject a withdrawal request.

**Authentication:** Required (JWT token, Admin only)

**URL Parameters:**
- `transaction_id`: Withdrawal transaction ID (e.g., `WDR-ABC123`)

**Request Body:**
```json
{
  "status": "completed",
  "admin_note": "Approved and processed"
}
```

**Valid Status Values:**
- `completed` - Approve and mark as completed
- `failed` - Reject the withdrawal

**Success Response (200 OK):**
```json
{
  "message": "Withdrawal approved successfully",
  "transaction_id": "WDR-ABC123",
  "status": "completed",
  "processed_at": "2024-12-11T15:30:00Z"
}
```

**Error Responses:**

*Invalid status (400 Bad Request):*
```json
{
  "error": "Invalid status. Must be 'completed' or 'failed'."
}
```

*Withdrawal not found (404 Not Found):*
```json
{
  "error": "Withdrawal not found"
}
```

*Already processed (400 Bad Request):*
```json
{
  "error": "Withdrawal has already been processed"
}
```

**Frontend Implementation:**
```javascript
async function processWithdrawal(transactionId, status, adminNote = '') {
  const token = localStorage.getItem('admin_access_token');
  
  const response = await fetch(
    `http://localhost:8000/api/admin/withdrawals/${transactionId}/status/`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: status,
        admin_note: adminNote,
      }),
    }
  );
  
  return await response.json();
}

// Approve a withdrawal
await processWithdrawal('WDR-ABC123', 'completed', 'Verified and approved');

// Reject a withdrawal
await processWithdrawal('WDR-ABC123', 'failed', 'Invalid bank details');
```

---

### 17. Get System Settings

**Endpoint:** `GET /api/admin/settings/`

**Description:** Get current system-wide settings including platform fees, maintenance mode, registration settings, etc.

**Authentication:** Required (JWT token, Admin only)

**Success Response (200 OK):**
```json
{
  "settings": {
    "platform_fee_percentage": "0.0600",
    "platform_fee_fixed": "80.00",
    "maintenance_mode": false,
    "maintenance_message": "We're currently performing maintenance. Please check back soon.",
    "allow_student_registration": true,
    "allow_organizer_registration": true,
    "require_event_approval": true,
    "max_events_per_organizer": 50,
    "min_withdrawal_amount": "1000.00",
    "max_withdrawal_amount": "1000000.00",
    "support_email": "support@radar.app",
    "updated_at": "2024-12-15T10:00:00Z",
    "updated_by": "admin@example.com"
  },
  "message": "System settings retrieved successfully"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `platform_fee_percentage` | decimal | Default platform fee percentage as decimal (0.06 = 6%) |
| `platform_fee_fixed` | decimal | Default fixed platform fee in Naira (added per ticket, e.g., 80.00) |
| `maintenance_mode` | boolean | When true, only admins can access the platform |
| `maintenance_message` | string | Message shown during maintenance |
| `allow_student_registration` | boolean | Allow new student sign-ups |
| `allow_organizer_registration` | boolean | Allow new organizer sign-ups |
| `require_event_approval` | boolean | Require admin approval for new events |
| `max_events_per_organizer` | integer | Maximum events per organizer |
| `min_withdrawal_amount` | decimal | Minimum withdrawal amount (Naira) |
| `max_withdrawal_amount` | decimal | Maximum withdrawal amount (Naira) |
| `support_email` | email | Support contact email |
| `updated_at` | datetime | Last update timestamp |
| `updated_by` | string | Email of admin who last updated |

**Frontend Implementation:**
```javascript
async function getSystemSettings() {
  const token = localStorage.getItem('admin_access_token');
  
  const response = await fetch('http://localhost:8000/api/admin/settings/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  return data.settings;
}
```

---

### 18. Update System Settings

**Endpoint:** `PATCH /api/admin/settings/`

**Description:** Update system settings. Only provided fields will be updated.

**Authentication:** Required (JWT token, Admin only)

**Request Body (all fields optional):**
```json
{
  "platform_fee_percentage": 0.06,
  "platform_fee_fixed": 80.00,
  "maintenance_mode": false,
  "maintenance_message": "We'll be back soon!",
  "allow_student_registration": true,
  "allow_organizer_registration": true,
  "require_event_approval": true,
  "max_events_per_organizer": 50,
  "min_withdrawal_amount": 1000.00,
  "max_withdrawal_amount": 1000000.00,
  "support_email": "support@radar.app"
}
```

**Success Response (200 OK):**
```json
{
  "settings": {
    "platform_fee_percentage": "0.0600",
    "platform_fee_fixed": "80.00",
    "maintenance_mode": false,
    "maintenance_message": "We'll be back soon!",
    "allow_student_registration": true,
    "allow_organizer_registration": true,
    "require_event_approval": true,
    "max_events_per_organizer": 50,
    "min_withdrawal_amount": "1000.00",
    "max_withdrawal_amount": "1000000.00",
    "support_email": "support@radar.app",
    "updated_at": "2024-12-15T11:00:00Z",
    "updated_by": "admin@example.com"
  },
  "message": "System settings updated successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "platform_fee_percentage": ["Ensure this value is less than or equal to 1."]
}
```

**Frontend Implementation:**
```javascript
async function updateSystemSettings(settingsData) {
  const token = localStorage.getItem('admin_access_token');
  
  const response = await fetch('http://localhost:8000/api/admin/settings/', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settingsData),
  });
  
  return await response.json();
}

// Example: Update platform fee to 7% + ₦100
await updateSystemSettings({ 
  platform_fee_percentage: 0.07,
  platform_fee_fixed: 100.00
});

// Example: Enable maintenance mode
await updateSystemSettings({
  maintenance_mode: true,
  maintenance_message: "Scheduled maintenance in progress. Back at 3 PM."
});

// Example: Disable new registrations
await updateSystemSettings({
  allow_student_registration: false,
  allow_organizer_registration: false
});
```

---

### 19. Get Audit Logs

**Endpoint:** `GET /api/admin/audit-logs/`

**Description:** Get audit logs of admin actions for tracking and accountability.

**Authentication:** Required (JWT token, Admin only)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `page_size` | integer | 20 | Items per page (max: 100) |
| `action` | string | null | Filter by action type |
| `admin_email` | string | null | Filter by admin email |

**Valid Action Types:**
- `settings_update` - Settings Updated
- `user_disable` - User Disabled
- `user_enable` - User Enabled
- `user_delete` - User Deleted
- `organizer_verify` - Organizer Verified
- `organizer_unverify` - Organizer Unverified
- `event_approve` - Event Approved
- `event_deny` - Event Denied
- `event_feature` - Event Featured
- `event_unfeature` - Event Unfeatured
- `event_delete` - Event Deleted
- `withdrawal_approve` - Withdrawal Approved
- `withdrawal_reject` - Withdrawal Rejected

**Example Requests:**
```
GET /api/admin/audit-logs/                              # All logs
GET /api/admin/audit-logs/?action=settings_update       # Settings changes only
GET /api/admin/audit-logs/?admin_email=admin@example.com # Specific admin's actions
GET /api/admin/audit-logs/?page=2&page_size=50          # Paginated
```

**Success Response (200 OK):**
```json
{
  "logs": [
    {
      "id": 1,
      "admin_email": "admin@example.com",
      "action": "settings_update",
      "target_type": "settings",
      "target_id": "system_settings",
      "details": {
        "changes": {
          "platform_fee_percentage": {
            "old": "0.0600",
            "new": "0.0700"
          },
          "platform_fee_fixed": {
            "old": "80.00",
            "new": "100.00"
          }
        }
      },
      "ip_address": "192.168.1.1",
      "created_at": "2024-12-15T11:00:00Z"
    },
    {
      "id": 2,
      "admin_email": "admin@example.com",
      "action": "user_disable",
      "target_type": "user",
      "target_id": "organiser:ABC12-XYZ34",
      "details": {
        "reason": "Terms violation"
      },
      "ip_address": "192.168.1.1",
      "created_at": "2024-12-15T10:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 95,
    "page_size": 20,
    "has_next": true,
    "has_previous": false
  },
  "filters": {
    "action": null,
    "admin_email": null
  },
  "message": "Audit logs retrieved successfully"
}
```

**Frontend Implementation:**
```javascript
async function getAuditLogs({ page = 1, pageSize = 20, action = null, adminEmail = null } = {}) {
  const token = localStorage.getItem('admin_access_token');
  
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('page_size', pageSize);
  if (action) params.append('action', action);
  if (adminEmail) params.append('admin_email', adminEmail);
  
  const response = await fetch(
    `http://localhost:8000/api/admin/audit-logs/?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  return await response.json();
}

// Get all logs
const allLogs = await getAuditLogs();

// Get settings changes only
const settingsLogs = await getAuditLogs({ action: 'settings_update' });

// Get specific admin's actions
const adminLogs = await getAuditLogs({ adminEmail: 'admin@example.com' });
```

---

### Admin Dashboard Flow Example

```javascript
// 1. Admin login
const loginResult = await adminLogin('admin@example.com', 'password');
// Store tokens: loginResult.access, loginResult.refresh

// 2. Get dashboard analytics
const analytics = await getDashboardAnalytics();
console.log('Total Revenue:', analytics.total_revenue);

// 3. Get recent events
const recentEvents = await getRecentEvents(10);
console.log('Recent Events:', recentEvents.length);

// 4. Get all events for management
const allEvents = await getAllEvents();
console.log('Total Events:', allEvents.length);

// 5. Update event status
await updateEventStatus('event:TE-12345', 'verified');

// 6. Get all users with pagination
const usersData = await getUsers({ page: 1, pageSize: 20 });
console.log('Total Users:', usersData.pagination.total_count);

// 7. Filter users by role
const students = await getUsers({ role: 'student' });
const organizers = await getUsers({ role: 'organizer' });
```

---

## Summary

### All Endpoints Quick Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **Health Check** |
| GET | `/health/` | No | Health check |
| **Authentication** |
| POST | `/student/register/` | No | Register student (sends OTP) |
| POST | `/organizer/register/` | No | Register organizer (sends OTP) |
| POST | `/verify-otp/` | No | Verify OTP (works for both students and organizers) |
| POST | `/login/` | No | Login |
| POST | `/logout/` | No | Logout |
| POST | `/token/refresh/` | No | Refresh access token |
| POST | `/change-password/` | Yes | Change password |
| POST | `/organizer/google-signup/` | No | Google sign up (organizer) |
| **Password Reset** |
| POST | `/password-reset/request/` | No | Request password reset OTP |
| POST | `/password-reset/verify/` | No | Verify password reset OTP |
| POST | `/password-reset/confirm/` | No | Confirm new password |
| **Profiles** |
| GET | `/student/profile/` | Optional | Get student profile |
| POST | `/student/profile/` | Optional | Update student profile |
| PATCH | `/student/profile/` | Yes | Partially update student profile |
| GET | `/organizer/profile/` | Optional | Get organizer profile |
| POST | `/organizer/profile/` | Optional | Update organizer profile |
| **Events** |
| GET | `/config/` | No | Get configuration (event types, etc.) |
| GET | `/event/` | Optional | List all events |
| POST | `/event/` | Yes (Org) | Create event |
| GET | `/events/<event_id>/details/` | Optional | Get event details |
| GET | `/organizer/events/` | Yes (Org) | Get organizer events |
| **Admin - Authentication** |
| POST | `/api/admin/auth/login/` | No | Admin login |
| POST | `/api/admin/auth/logout/` | Yes (Admin) | Admin logout |
| **Admin - Dashboard** |
| GET | `/api/admin/dashboard/analytics/` | Yes (Admin) | Dashboard analytics |
| GET | `/api/admin/dashboard/recent-events/` | Yes (Admin) | Recent events |
| **Admin - User Management** |
| GET | `/api/admin/users/` | Yes (Admin) | Get all users (filtering & pagination) |
| GET | `/api/admin/users/<user_id>/` | Yes (Admin) | Get user details |
| PATCH | `/api/admin/users/<user_id>/status/` | Yes (Admin) | Enable/disable user |
| PATCH | `/api/admin/users/<organiser_id>/verify/` | Yes (Admin) | Verify/unverify organizer |
| DELETE | `/api/admin/users/<user_id>/delete/` | Yes (Admin) | Delete user account |
| **Admin - Event Management** |
| GET | `/api/admin/events/` | Yes (Admin) | Get all events |
| PATCH | `/api/admin/events/<event_id>/status/` | Yes (Admin) | Update event status |
| PATCH | `/api/admin/events/<event_id>/featured/` | Yes (Admin) | Feature/unfeature event |
| GET | `/api/admin/events/<event_id>/platform-fee/` | Yes (Admin) | Get event platform fee |
| PATCH | `/api/admin/events/<event_id>/platform-fee/` | Yes (Admin) | Update event platform fee |
| DELETE | `/api/admin/events/<event_id>/delete/` | Yes (Admin) | Delete event |
| **Admin - Ticket Management** |
| GET | `/api/admin/tickets/` | Yes (Admin) | Get all tickets (filtering & pagination) |
| **Admin - Withdrawal Management** |
| GET | `/api/admin/withdrawals/` | Yes (Admin) | Get all withdrawals (filtering & pagination) |
| PATCH | `/api/admin/withdrawals/<transaction_id>/status/` | Yes (Admin) | Approve/reject withdrawal |
| **Admin - System Settings** |
| GET | `/api/admin/settings/` | Yes (Admin) | Get system settings |
| PATCH | `/api/admin/settings/` | Yes (Admin) | Update system settings |
| GET | `/api/admin/audit-logs/` | Yes (Admin) | Get audit logs |
| **Tickets** |
| POST | `/tickets/book/` | Yes (Student) | Book ticket |
| POST | `/tickets/verify-payment/` | No | Verify payment |
| POST | `/tickets/paystack-webhook/` | No | Paystack webhook (automatic) |
| GET | `/tickets/my-tickets/` | Yes (Student) | Get my tickets |
| GET | `/tickets/organizer/tickets/` | Yes (Org) | Get organizer tickets |
| GET | `/tickets/organizer/<event_id>/tickets/` | Yes (Org) | Get event tickets |
| GET | `/tickets/categories/` | Yes | Get ticket categories |
| POST | `/tickets/categories/create/` | Yes (Org) | Create ticket category |
| PATCH | `/tickets/categories/<category_id>/` | Yes (Org) | Update ticket category |
| DELETE | `/tickets/categories/<category_id>/` | Yes (Org) | Delete ticket category |
| POST | `/tickets/check-in/` | Yes (Org) | Check in ticket |
| **Wallet** |
| GET | `/wallet/balance/` | Yes (Org) | Get wallet balance |
| GET | `/wallet/transactions/` | Yes (Org) | Get transaction history |
| POST | `/wallet/bank-account/` | Yes (Org) | Add/update bank account |
| POST | `/wallet/withdraw/` | Yes (Org) | Request withdrawal |
| GET | `/wallet/withdrawals/` | Yes (Org) | Get withdrawal history |
| **PIN Management** |
| POST | `/pin/` | No | Set/create PIN (organizer) |
| POST | `/forgot-pin/` | No | Request PIN change link |
| POST | `/change-pin/` | No | Change PIN (organizer) |
| POST | `/verify-pin/` | Yes | Verify PIN (organizer) |
| **Analytics** |
| GET | `/analytics/global/` | Yes (Org) | Global analytics |
| GET | `/analytics/event/<event_id>/` | Yes (Org) | Event analytics |
| GET | `/analytics/events-summary/` | Yes (Org) | Events summary |

---

## Recent Updates

### Event-Level Maximum Tickets Per Booking

**Updated:** Maximum tickets per booking is now controlled at the event level only.

**Changes:**
- ✅ Removed `max_quantity_per_booking` from ticket categories
- ✅ Added `max_quantity_per_booking` field to Event model
- ✅ Defaults to 3 tickets per booking if not set by organizer
- ✅ Applies to all ticket categories for the event

**Usage:**
- When creating an event, organizers can optionally set `max_quantity_per_booking`
- If not set, defaults to 3 tickets per booking
- This limit applies to all bookings regardless of ticket category

**Example:**
```json
{
  "name": "Tech Conference",
  "max_quantity_per_booking": 5,  // Custom limit
  // If not set, defaults to 3
}
```

### PIN Management - Profile Integration and Verification

**Updated:** PIN functionality has been enhanced with profile integration and verification endpoint.

**New Features:**
- ✅ Organizer profile now includes `has_pin` field to check if PIN is set
- ✅ New `/verify-pin/` endpoint for PIN verification in modals
- ✅ Profile cache automatically invalidates when PIN is created/changed

**Usage:**
1. Check `has_pin` in organizer profile to determine if PIN modal should be shown
2. Use `/verify-pin/` endpoint when user enters PIN in modal
3. PINs are securely hashed - actual PIN value is never returned

**Example:**
```json
{
  "Org_profile": {
    "Organization_Name": "...",
    "Email": "...",
    "Phone": "...",
    "has_pin": true  // ← New field
  }
}
```

### Ticket Responses - Student Name Field

**Updated:** All ticket responses now include `student_full_name` field for better identification during check-in and ticket management.

**Example:**
```json
{
  "ticket": {
    "student_email": "john.doe@student.oauife.edu.ng",
    "student_full_name": "John Doe",  // ✨ New field
    ...
  }
}
```

**Available in:**
- ✅ Book ticket response
- ✅ Check-in response
- ✅ Get my tickets
- ✅ Get organizer tickets
- ✅ Get event tickets
- ✅ Verify payment response

---

## Important Notes

### Data Format Requirements

1. **Event Creation**: Must use `FormData` (multipart/form-data) when sending images
2. **Price Field**: Must be a number or numeric string, NOT an object/dict
3. **Image Field**: Must be a File object, NOT a dict/base64 string
4. **Ticket Status**: Only `confirmed` tickets can be checked in

### CORS Configuration

- **Development**: All origins allowed when `DEBUG=True`
- **Production**: Set `CORS_ALLOWED_ORIGINS` environment variable with frontend URL(s)

### Authentication

- Most endpoints require JWT token in `Authorization: Bearer <token>` header
- Tokens expire after 15 minutes (access) or 7 days (refresh)
- Use `/token/refresh/` to get new access token

---

---

## Architecture Notes ✨ NEW

### Professional Architecture

The API follows professional Django/DRF best practices:

#### 1. **Fat Services, Thin Views**
- All business logic is in service layers
- Views only validate requests, call services, and return responses
- Services are reusable and testable

#### 2. **Custom Exceptions**
- Clean error handling with custom exceptions
- Automatic HTTP status code mapping
- Consistent error responses

#### 3. **Service Layer Structure**
- `TicketService` - Ticket business logic
- `PaymentService` - Paystack payment logic
- `EventService` - Event operations
- `AuthService` - Authentication operations
- `AnalyticsService` - Analytics and reporting
- `WalletService` - Wallet and transaction management

#### 4. **Model Architecture**
- Models are "dumb" - only data structure and basic validation
- Business logic moved to services
- ID generation kept in models (acceptable pattern)

#### 5. **Serializer Architecture**
- Serializers only validate data format
- No business logic in serializers
- Clean separation of concerns

### Benefits

✅ **Maintainable** - Logic centralized in services  
✅ **Testable** - Services can be tested independently  
✅ **Reusable** - Services can be used across modules  
✅ **Professional** - Industry-standard architecture  
✅ **Scalable** - Easy to add new features  

---

## Recent Updates

### Wallet System ✨ NEW (Latest)

**Added:** Complete wallet system for organizer earnings management:
- Automatic wallet crediting when tickets are sold
- Platform fee calculation (6% + ₦80 default, customizable per event)
- Transaction history tracking
- Bank account management
- Withdrawal system via Paystack Transfer

**Endpoints:**
- `GET /wallet/balance/` - Get wallet balance
- `GET /wallet/transactions/` - Get transaction history
- `POST /wallet/bank-account/` - Add/update bank account
- `POST /wallet/withdraw/` - Request withdrawal
- `GET /wallet/withdrawals/` - Get withdrawal history

**Features:**
- ✅ Automatic wallet creation for organizers
- ✅ Platform fee calculation (6% + ₦80 default, configurable per event)
- ✅ 7-day holding period for refund protection
- ✅ Paystack Transfer integration for withdrawals
- ✅ Complete transaction audit trail

**See:** [Wallet Endpoints](#wallet-endpoints-new) section for details.

---

### Analytics System ✨ NEW

**Added:** Complete analytics system with dedicated endpoints:
- Global analytics for dashboard overview
- Event-based analytics with detailed ticket lists
- Events summary for quick overview

**Endpoints:**
- `GET /analytics/global/` - Global statistics
- `GET /analytics/event/<event_id>/` - Event analytics
- `GET /analytics/events-summary/` - Events summary

**See:** [Analytics Endpoints](#analytics-endpoints-new) section for details.

---

### Professional Refactoring ✨ NEW

**Updated:** Entire codebase refactored to professional standards:
- Service layer architecture implemented
- Custom exception system
- Thin views pattern
- Clean separation of concerns

**Benefits:**
- Better maintainability
- Easier testing
- Professional code structure
- Industry best practices

---

### Ticket Responses - Student Name Field

**Updated:** All ticket responses now include `student_full_name` field for better identification during check-in and ticket management.

**Example:**
```json
{
  "ticket": {
    "student_email": "john.doe@student.oauife.edu.ng",
    "student_full_name": "John Doe",  // ✨ New field
    ...
  }
}
```

**Available in:**
- ✅ Book ticket response
- ✅ Check-in response
- ✅ Get my tickets
- ✅ Get organizer tickets
- ✅ Get event tickets
- ✅ Verify payment response
- ✅ Analytics ticket lists

---

This documentation covers all endpoints with request/response examples and frontend implementation guides. Use this as your reference for frontend development! 🚀
