# Radar Authentication API Documentation

This document provides comprehensive documentation for all authentication endpoints in the Radar application.

## Base URL

```
Production: https://your-render-app.onrender.com
Development: http://localhost:8000
```

## Authentication

Most endpoints use JWT (JSON Web Token) authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format

All responses are in JSON format. Success responses typically include a `message` field, while error responses include an `error` field.

---

## Table of Contents

1. [Student Registration](#student-registration)
2. [Organizer Registration](#organizer-registration)
3. [OTP Verification](#otp-verification)
4. [Login](#login)
5. [Logout](#logout)
6. [Password Reset](#password-reset)
7. [Google Sign Up](#google-sign-up)
8. [Student Profile](#student-profile)
9. [Organizer Profile](#organizer-profile)

---

## Student Registration

### Register Student (Step 1: Request OTP)

Register a new student account. This endpoint sends an OTP to the student's email for verification.

**Endpoint:** `POST /student/register/`

**Request Body:**
```json
{
  "Firstname": "John",
  "Lastname": "Doe",
  "Email": "john.doe@student.oauife.edu.ng",
  "Password": "securepassword123"
}
```

**Field Requirements:**
- `Firstname`: Required, string, max 100 characters
- `Lastname`: Required, string, max 100 characters
- `Email`: Required, must be from domain `@student.oauife.edu.ng`
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

---

## Organizer Registration

### Register Organizer

Register a new organizer account. This endpoint creates the account immediately without OTP verification.

**Endpoint:** `POST /organizer/register/`

**Request Body:**
```json
{
  "Organization_Name": "Tech Events Inc",
  "Email": "contact@techevents.com",
  "Phone": "+1234567890",
  "Password": "securepassword123"
}
```

**Field Requirements:**
- `Organization_Name`: Optional, string, max 200 characters
- `Email`: Required, valid email format, max 150 characters
- `Phone`: Optional, string, max 15 characters
- `Password`: Required, string, max 100 characters

**Success Response (201 Created):**
```json
{
  "message": "Organizer registration successful",
  "email": "contact@techevents.com",
  "organization_name": "Tech Events Inc",
  "phone": "+1234567890",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Error Response (400 Bad Request):**
```json
{
  "Email": ["Enter a valid email address."],
  "Password": ["This field is required."]
}
```

---

## OTP Verification

### Verify OTP and Complete Student Registration

Verify the OTP sent to the student's email to complete registration.

**Endpoint:** `POST /verify-otp/`

**Request Body:**
```json
{
  "email": "john.doe@student.oauife.edu.ng",
  "otp": "123456"
}
```

**Field Requirements:**
- `email`: Required, must match the email used in registration
- `otp`: Required, 6-digit code sent to email

**Success Response (201 Created):**
```json
{
  "message": "Registration successful"
}
```

**Error Response (400 Bad Request):**
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

---

## Login

### User Login

Authenticate a user and receive JWT tokens.

**Endpoint:** `POST /login/`

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

**Error Response (400 Bad Request):**
```json
{
  "error": "Please provide both email and password"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

---

## Logout

### User Logout

Logout a user by blacklisting their refresh token.

**Endpoint:** `POST /logout/`

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Field Requirements:**
- `refresh`: Required, valid refresh token

**Success Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Refresh token is required"
}
```

**Error Response (400 Bad Request - Invalid Token):**
```json
{
  "error": "Invalid or expired token"
}
```

---

## Password Reset

### Request Password Reset OTP

Request a password reset OTP to be sent to the user's email.

**Endpoint:** `POST /password-reset/request/`

**Request Body:**
```json
{
  "email": "john.doe@student.oauife.edu.ng"
}
```

**Field Requirements:**
- `email`: Required, must be a registered student email

**Success Response (200 OK):**
```json
{
  "message": "OTP sent to email.",
  "email": "john.doe@student.oauife.edu.ng"
}
```

**Error Response (400 Bad Request):**
```json
{
  "email": ["User with this email does not exist."]
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Failed to send OTP email. Please try again."
}
```

---

### Verify Password Reset OTP

Verify the OTP sent for password reset.

**Endpoint:** `POST /password-reset/verify/`

**Request Body:**
```json
{
  "email": "john.doe@student.oauife.edu.ng",
  "otp": "123456"
}
```

**Field Requirements:**
- `email`: Required, valid email
- `otp`: Required, 6-digit code

**Success Response (200 OK):**
```json
{
  "message": "OTP verified successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid or expired OTP"
}
```

---

### Confirm Password Reset

Set a new password after OTP verification.

**Endpoint:** `POST /password-reset/confirm/`

**Request Body:**
```json
{
  "email": "john.doe@student.oauife.edu.ng",
  "otp": "123456",
  "new_password": "newsecurepassword123",
  "confirm_password": "newsecurepassword123"
}
```

**Field Requirements:**
- `email`: Required, valid email
- `otp`: Required, 6-digit code
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

## Google Sign Up

### Student Google Sign Up

Register or login a student using Google OAuth.

**Endpoint:** `POST /student/google-signup/`

**Request Body:**
```json
{
  "token": "google_oauth_id_token_here"
}
```

**Field Requirements:**
- `token`: Required, Google OAuth ID token

**Success Response (200 OK):**
```json
{
  "message": "Google login successful",
  "user_id": 1,
  "email": "john.doe@gmail.com",
  "student_id": 1,
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "is_new_user": false
}
```

**Response Fields:**
- `is_new_user`: `true` if profile needs to be completed, `false` otherwise

**Error Response (400 Bad Request):**
```json
{
  "error": "No token provided"
}
```

**Error Response (400 Bad Request - Invalid Token):**
```json
{
  "error": "Invalid token"
}
```

---

### Organizer Google Sign Up

Register or login an organizer using Google OAuth.

**Endpoint:** `POST /organizer/google-signup/`

**Request Body:**
```json
{
  "token": "google_oauth_id_token_here"
}
```

**Field Requirements:**
- `token`: Required, Google OAuth ID token

**Success Response (200 OK):**
```json
{
  "message": "Google login successful",
  "user_id": 1,
  "email": "contact@techevents.com",
  "organizer_id": 1,
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "is_new_user": true
}
```

**Response Fields:**
- `is_new_user`: `true` if Organization_Name or Phone is missing, `false` otherwise

**Error Response (400 Bad Request):**
```json
{
  "error": "No token provided"
}
```

**Error Response (400 Bad Request - Invalid Token):**
```json
{
  "error": "Invalid token"
}
```

---

## Student Profile

### Get Student Profile

Retrieve student profile information.

**Endpoint:** `GET /student/profile/`

**Authentication:** Optional (JWT token in header or email as query parameter for testing)

**Query Parameters (Testing Mode):**
- `email`: Student email address

**Headers (Production Mode):**
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
    "Date_of_birth": "2000-01-15"
  },
  "is_new_profile": false
}
```

**Response Fields:**
- `is_new_profile`: `true` if profile was just created, `false` if it already existed

**Error Response (400 Bad Request):**
```json
{
  "error": "Email parameter is required or you must be authenticated"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Student not found"
}
```

---

### Create/Update Student Profile

Create or update student profile information.

**Endpoint:** `POST /student/profile/`

**Authentication:** Optional (JWT token in header or email in body for testing)

**Request Body:**
```json
{
  "email": "john.doe@student.oauife.edu.ng",
  "firstname": "John",
  "lastname": "Doe",
  "Preferred_name": "Johnny",
  "Date_of_birth": "2000-01-15"
}
```

**Field Requirements:**
- `email`: Required (if not authenticated), valid email
- `firstname`: Optional, string
- `lastname`: Optional, string
- `Preferred_name`: Optional, string, max 30 characters
- `Date_of_birth`: Optional, date format (YYYY-MM-DD)

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
    "Date_of_birth": "2000-01-15"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Email is required or you must be authenticated"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Student not found. Please register first."
}
```

---

## Organizer Profile

### Get Organizer Profile

Retrieve organizer profile information.

**Endpoint:** `GET /organizer/profile/`

**Authentication:** Optional (JWT token in header or email as query parameter for testing)

**Query Parameters (Testing Mode):**
- `email`: Organizer email address

**Headers (Production Mode):**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "message": "Profile retrieved successfully",
  "Org_profile": {
    "Organization_Name": "Tech Events Inc",
    "Email": "contact@techevents.com",
    "Phone": "+1234567890"
  },
  "is_new_profile": false
}
```

**Response Fields:**
- `is_new_profile`: `true` if profile was just created, `false` if it already existed

**Error Response (400 Bad Request):**
```json
{
  "error": "Email parameter is required or you must be authenticated"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Organizer not found"
}
```

---

### Create/Update Organizer Profile

Create or update organizer profile information.

**Endpoint:** `POST /organizer/profile/`

**Authentication:** Optional (JWT token in header or email in body for testing)

**Request Body:**
```json
{
  "email": "contact@techevents.com",
  "Organization_Name": "Tech Events Inc",
  "Phone": "+1234567890"
}
```

**Field Requirements:**
- `email`: Required (if not authenticated), valid email
- `Organization_Name`: Optional, string, max 200 characters
- `Phone`: Optional, string, max 15 characters

**Success Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "Org_profile": {
    "Organization_Name": "Tech Events Inc",
    "Email": "contact@techevents.com",
    "Phone": "+1234567890"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Email is required or you must be authenticated"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Organizer not found. Please register first."
}
```

---

## Error Codes Summary

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation errors, missing fields) |
| 401 | Unauthorized (invalid credentials) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Internal Server Error (server-side error) |

---

## Frontend Integration Examples

### Using Fetch API

```javascript
// Login Example
async function login(email, password) {
  const response = await fetch('https://your-api.com/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store tokens
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    return data;
  } else {
    throw new Error(data.error || 'Login failed');
  }
}

// Authenticated Request Example
async function getStudentProfile() {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('https://your-api.com/student/profile/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  return await response.json();
}
```

### Using Axios

```javascript
import axios from 'axios';

// Setup axios instance
const api = axios.create({
  baseURL: 'https://your-api.com',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
async function login(email, password) {
  const response = await api.post('/login/', { email, password });
  localStorage.setItem('access_token', response.data.access);
  localStorage.setItem('refresh_token', response.data.refresh);
  return response.data;
}

// Get Profile
async function getStudentProfile() {
  const response = await api.get('/student/profile/');
  return response.data;
}
```

---

## Notes

1. **JWT Tokens**: Access tokens are short-lived. Use refresh tokens to get new access tokens when they expire.

2. **Email Domain**: Student registration requires emails from `@student.oauife.edu.ng` domain.

3. **OTP Expiration**: OTPs expire after 10 minutes (600 seconds).

4. **Password Hashing**: All passwords are automatically hashed before storage.

5. **Google OAuth**: Ensure you have configured `CLIENT_ID` in your environment variables for Google sign-up to work.

6. **Testing Mode**: Profile endpoints support testing mode with email parameters. In production, use JWT authentication.

---

## Support

For issues or questions, please contact the development team.
