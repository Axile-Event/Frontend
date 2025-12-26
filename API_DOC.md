# Radar Event Platform - Complete API Documentation

Complete API documentation for frontend developers. This document covers all endpoints, request/response formats, and implementation examples.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Auth App Endpoints](#auth-app-endpoints)
4. [Event App Endpoints](#event-app-endpoints)
5. [Ticket App Endpoints](#ticket-app-endpoints)
6. [Frontend Implementation Guide](#frontend-implementation-guide)
7. [Error Handling](#error-handling)
8. [Code Examples](#code-examples)

---

## Overview

### Base URLs

```
Development: http://localhost:8000
Production: https://radar-ufvb.onrender.com/
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
- Registration (`POST /organizer/register/`)
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
  "Email": "john.doe@example.com",
  "Password": "securepassword123"
}
```

**Note:** Any valid email address is accepted. The previous restriction to `@student.oauife.edu.ng` has been removed.

**Field Requirements:**
- `Firstname`: Required, string, max 100 characters
- `Lastname`: Required, string, max 100 characters
- `Email`: Required, valid email address (any domain accepted)
- `Password`: Required, string, max 100 characters

**Success Response (200 OK):**
```json
{
  "message": "OTP sent to email. Please verify to complete registration.",
  "email": "john.doe@example.com"
}
```

**Error Response (400 Bad Request):**
```json
{
  "Email": ["Enter a valid email address."],
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

**Description:** Register a new organizer account. Account is created immediately.

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

**Success Response (201 Created):**
```json
{
  "message": "Organizer registration successful",
  "email": "contact@techevents.com",
  "organization_name": "Tech Events Inc",
  "phone": "+2348012345678",
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
  
  const result = await response.json();
  
  if (response.ok) {
    // Store tokens
    localStorage.setItem('access_token', result.access);
    localStorage.setItem('refresh_token', result.refresh);
    return result;
  }
  
  throw new Error(result.error || 'Registration failed');
}
```

---

### 3. Verify OTP

**Endpoint:** `POST /verify-otp/`

**Description:** Verify OTP sent to student email to complete registration.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john.doe@example.com",
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

### 4. Login

**Endpoint:** `POST /login/`

**Description:** Authenticate user and receive JWT tokens.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john.doe@example.com",
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
  "email": "john.doe@example.com",
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

### 5. Logout

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

### 6. Get Student Profile

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
    "email": "john.doe@example.com",
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

### 7. Update Student Profile (PATCH)

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
    "email": "john.doe@example.com",
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

### 8. Get Organizer Profile

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
    "Phone": "+2348012345678"
  }
}
```

---

### 9. Update Organizer Profile

**Endpoint:** `POST /organizer/profile/`

**Description:** Update organizer profile information.

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
    "Phone": "+2348012345678"
  }
}
```

---

### 10. Password Reset Request

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

### 11. Verify Password Reset OTP

**Endpoint:** `POST /password-reset/verify/`

**Description:** Verify password reset OTP.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john.doe@example.com",
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

### 12. Confirm Password Reset

**Endpoint:** `POST /password-reset/confirm/`

**Description:** Set new password after OTP verification.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "otp": "123456",
  "new_password": "newsecurepassword123",
  "confirm_password": "newsecurepassword123"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Password reset successful"
}
```

---

### 13. Google Sign Up (Student)

**Endpoint:** `POST /student/google-signup/`

**Description:** Register student using Google OAuth.

**Authentication:** Not required

**Request Body:**
```json
{
  "token": "google_oauth_token_here"
}
```

**Success Response (201 Created):**
```json
{
  "message": "Registration successful",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

### 14. Google Sign Up (Organizer)

**Endpoint:** `POST /organizer/google-signup/`

**Description:** Register organizer using Google OAuth.

**Authentication:** Not required

**Request Body:**
```json
{
  "token": "google_oauth_token_here"
}
```

**Success Response (201 Created):**
```json
{
  "message": "Registration successful",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
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

**Endpoint:** `GET /create-event/`

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
  
  const response = await fetch('http://localhost:8000/create-event/', {
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
  "image": "/media/event/images/tech.jpg",
  "allows_seat_selection": true,
  "available_seats": ["1", "3", "5", "7", "10", "12"]
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Event not found"
}
```

**Frontend Implementation:**
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

---

### 4. Create Event

**Endpoint:** `POST /create-event/`

**Description:** Create a new event. Only organizers can create events.

**Authentication:** Required (JWT token, Organizer only)

**Request Body:**
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
  "image": null,
  "allows_seat_selection": true
}
```

**Field Requirements:**
- `name`: Required, string, max 200 characters
- `description`: Required, text
- `pricing_type`: Required, "free" or "paid"
- `event_type`: Required, one of the event type values
- `location`: Required, string, max 200 characters
- `date`: Required, ISO 8601 datetime format
- `capacity`: Optional, integer
- `price`: Required, decimal (0.00 for free events)
- `image`: Optional, image file
- `allows_seat_selection`: Optional, boolean, default false

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
  "price": 5000.00,
  "image": "https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/radar/events/tech.jpg",
  "allows_seat_selection": true,
  "available_seats": []
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "Organizer profile not found."
}
```

**Frontend Implementation:**
```javascript
async function createEvent(eventData) {
  const token = localStorage.getItem('access_token');
  
  // Use FormData for multipart/form-data (required for image uploads)
  const formData = new FormData();
  Object.keys(eventData).forEach(key => {
    if (key === 'image' && eventData[key]) {
      // Append image file
      formData.append('image', eventData[key]);
    } else if (key === 'date' && eventData[key] instanceof Date) {
      // Convert Date to ISO string
      formData.append(key, eventData[key].toISOString());
    } else {
      formData.append(key, eventData[key]);
    }
  });
  
  const response = await fetch('http://localhost:8000/create-event/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type - browser will set it with boundary for FormData
    },
    body: formData,
  });
  
  return await response.json();
}

// Example usage:
const eventData = {
  name: 'Tech Conference 2024',
  description: 'Annual tech conference',
  pricing_type: 'paid',
  event_type: 'tech',
  location: 'OAU Campus',
  date: new Date('2024-12-15T10:00:00Z'),
  capacity: 100,
  price: 5000.00,
  allows_seat_selection: true,
  image: imageFile // File object from input[type="file"]
};

await createEvent(eventData);
```

**Note:** Images are uploaded to Cloudinary and stored in the `radar/events/` folder. The returned image URL will be a Cloudinary CDN URL.

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
      "allows_seat_selection": true,
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

### 6. Get Organizer Analytics

**Endpoint:** `GET /organizer/analytics/`

**Description:** Get analytics for the authenticated organizer.

**Authentication:** Required (JWT token, Organizer only)

**Success Response (200 OK):**
```json
{
  "total_events": 5,
  "total_tickets_sold": 150,
  "total_tickets_pending": 10,
  "total_revenue": 750000.00,
  "revenue_by_event": [
    {
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference 2024",
      "tickets_sold": 45,
      "revenue": 225000.00
    },
    {
      "event_id": "event:CD-67890",
      "event_name": "Cultural Day",
      "tickets_sold": 30,
      "revenue": 150000.00
    }
  ],
  "average_revenue_per_event": 150000.00
}
```

**Frontend Implementation:**
```javascript
async function getOrganizerAnalytics() {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/organizer/analytics/', {
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

### 1. Book Ticket

**Endpoint:** `POST /tickets/book/`

**Description:** Book tickets for an event. For paid events, initiates Paystack payment.

**Authentication:** Required (JWT token, Student only)

**Request Body:**
```json
{
  "event_id": "event:TE-12345",
  "quantity": 2,
  "seat_number": "A12"
}
```

**Field Requirements:**
- `event_id`: Required, valid event ID
- `quantity`: Required, integer, min 1
- `seat_number`: Optional, required if event allows seat selection

**Success Response - Free Event (201 Created):**
```json
{
  "message": "Ticket booked successfully",
  "ticket": {
    "ticket_id": "ticket:TC-12345",
    "event": 1,
    "event_name": "Tech Conference 2024",
    "event_date": "2024-12-15T10:00:00Z",
    "event_location": "OAU Campus",
    "student": 1,
    "student_email": "john.doe@example.com",
    "status": "confirmed",
    "quantity": 2,
    "total_price": 0.00,
    "qr_code": "QR-ticket:TC-12345",
    "seat_number": "A12",
    "created_at": "2024-12-10T10:00:00Z",
    "updated_at": "2024-12-10T10:00:00Z"
  }
}
```

**Success Response - Paid Event (200 OK):**
```json
{
  "message": "Payment initialized",
  "ticket": {
    "ticket_id": "ticket:TC-12345",
    "status": "pending",
    ...
  },
  "payment_url": "https://paystack.com/pay/xxxxx",
  "payment_reference": "ticket:TC-12345"
}
```

**Error Response (400 Bad Request):**
```json
{
  "seat_number": ["Seat A12 is already booked"]
}
```

**Frontend Implementation:**
```javascript
async function bookTicket(eventId, quantity, seatNumber = null) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/tickets/book/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      event_id: eventId,
      quantity,
      seat_number: seatNumber,
    }),
  });
  
  const result = await response.json();
  
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

**Description:** Manually verify Paystack payment. Usually handled automatically by webhook, but can be used as a fallback.

**Authentication:** Not required

**Request Body:**
```json
{
  "reference": "ticket:TC-12345"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Payment verified successfully",
  "ticket": {
    "ticket_id": "ticket:TC-12345",
    "status": "confirmed",
    ...
  }
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
      "event": 1,
      "event_name": "Tech Conference 2024",
      "event_date": "2024-12-15T10:00:00Z",
      "event_location": "OAU Campus",
      "student": 1,
      "student_email": "john.doe@example.com",
      "status": "confirmed",
      "quantity": 2,
      "total_price": 10000.00,
      "qr_code": "QR-ticket:TC-12345",
      "seat_number": "A12",
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
      "event_name": "Tech Conference 2024",
      "student_email": "john.doe@example.com",
      "status": "confirmed",
      "quantity": 2,
      "total_price": 10000.00,
      "qr_code": "QR-ticket:TC-12345",
      "seat_number": "A12",
      "created_at": "2024-12-10T10:00:00Z"
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
      "student_email": "john.doe@example.com",
      "status": "confirmed",
      "quantity": 2,
      "total_price": 10000.00,
      "qr_code": "QR-ticket:TC-12345",
      "seat_number": "A12",
      "checked_in_at": null,
      "created_at": "2024-12-10T10:00:00Z"
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

### 7. Check In Ticket

**Endpoint:** `POST /tickets/check-in/`

**Description:** Check in a ticket by scanning QR code. Only organizers can check in tickets.

**Authentication:** Required (JWT token, Organizer only)

**Request Body:**
```json
{
  "qr_code": "QR-ticket:TC-12345",
  "event_id": "event:TE-12345"
}
```

**Alternative (using ticket_id):**
```json
{
  "ticket_id": "ticket:TC-12345",
  "event_id": "event:TE-12345"
}
```

**Field Requirements:**
- `qr_code` OR `ticket_id`: Required (one of them)
- `event_id`: Required, for verification

**Success Response (200 OK):**
```json
{
  "message": "Ticket checked in successfully",
  "ticket": {
    "ticket_id": "ticket:TC-12345",
    "status": "used",
    "checked_in_at": "2024-12-15T10:30:00Z",
    ...
  },
  "checked_in_at": "2024-12-15T10:30:00Z"
}
```

**Error Response (400 Bad Request - Already Checked In):**
```json
{
  "error": "Ticket has already been checked in",
  "ticket": {...},
  "checked_in_at": "2024-12-15T09:00:00Z"
}
```

**Error Response (400 Bad Request - Pending Payment):**
```json
{
  "error": "Cannot check in a pending ticket. Payment must be confirmed first.",
  "ticket": {...}
}
```

**Frontend Implementation:**
```javascript
async function checkInTicket(qrCode, eventId) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/tickets/check-in/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      qr_code: qrCode,
      event_id: eventId,
    }),
  });
  
  return await response.json();
}

// Example with QR scanner
function handleQRScan(qrCode, eventId) {
  checkInTicket(qrCode, eventId)
    .then(result => {
      if (result.message) {
        alert('Ticket checked in successfully!');
      }
    })
    .catch(error => {
      alert(error.error || 'Check-in failed');
    });
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
    return this.request('/create-event/');
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
  allows_seat_selection?: boolean;
  available_seats?: string[];
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
  seat_number: string | null;
  checked_in_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingRequest {
  event_id: string;
  quantity: number;
  seat_number?: string | null;
}

export interface BookingResponse {
  message: string;
  ticket?: Ticket;
  payment_url?: string;
  payment_reference?: string;
}
```

---

## Error Handling

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
async function completeBookingFlow(eventId, quantity, seatNumber) {
  try {
    // 1. Book ticket
    const bookingResult = await apiClient.bookTicket({
      event_id: eventId,
      quantity,
      seat_number: seatNumber,
    });

    // 2. If paid event, redirect to payment
    if (bookingResult.payment_url) {
      window.location.href = bookingResult.payment_url;
      return;
    }

    // 3. If free event, show success
    if (bookingResult.ticket) {
      alert('Ticket booked successfully!');
      return bookingResult.ticket;
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

4. **Manual Verification (Fallback)**
   - If webhook fails, use `POST /tickets/verify-payment/`
   - Pass `reference` (ticket_id) to verify payment

### Webhook Configuration

Configure webhook URL in Paystack Dashboard:
- **Development:** Use ngrok or localtunnel: `https://your-tunnel-url/tickets/paystack-webhook/`
- **Production:** `https://your-domain.com/tickets/paystack-webhook/`

**Webhook Events:**
- `charge.success` → Ticket status → `confirmed`
- `charge.failed` → Ticket remains `pending`

---

## Summary

### All Endpoints Quick Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/student/register/` | No | Register student |
| POST | `/organizer/register/` | No | Register organizer |
| POST | `/verify-otp/` | No | Verify OTP |
| POST | `/login/` | No | Login |
| POST | `/logout/` | No | Logout |
| GET | `/student/profile/` | Optional | Get student profile |
| PATCH | `/student/profile/` | Yes | Update student profile |
| GET | `/organizer/profile/` | Optional | Get organizer profile |
| POST | `/organizer/profile/` | Optional | Update organizer profile |
| GET | `/config/` | No | Get configuration |
| GET | `/create-event/` | Optional | List all events |
| GET | `/events/<id>/details/` | Optional | Get event details |
| POST | `/create-event/` | Yes (Org) | Create event |
| GET | `/organizer/events/` | Yes (Org) | Get organizer events |
| GET | `/organizer/analytics/` | Yes (Org) | Get organizer analytics |
| POST | `/tickets/book/` | Yes (Student) | Book ticket |
| POST | `/tickets/verify-payment/` | No | Verify payment |
| GET | `/tickets/my-tickets/` | Yes (Student) | Get my tickets |
| GET | `/tickets/organizer/tickets/` | Yes (Org) | Get organizer tickets |
| GET | `/tickets/organizer/<id>/tickets/` | Yes (Org) | Get event tickets |
| POST | `/tickets/check-in/` | Yes (Org) | Check in ticket |

---

This documentation covers all endpoints with request/response examples and frontend implementation guides. Use this as your reference for frontend development! 🚀