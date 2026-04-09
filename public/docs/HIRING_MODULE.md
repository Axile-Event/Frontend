# Hiring Module Documentation

## Overview

The Hiring module handles career/hiring applications (full-time, intern, part-time, contract). Applicants submit a form; admins review applications in the admin API or Django Admin and update status. **An email is sent to the applicant whenever their application status changes** (including the initial "application received" email).

## Architecture

- **App:** `radar.hiring`
- **Public API:** Submit application and get role-type options (no authentication).
- **Admin API:** List, detail, and update status (admin JWT required). Same base path as other admin endpoints: `/api/admin/`.
- **Email:** Gmail (same as event/ticket notifications). Templates are defined in `radar.hiring.utils`.

---

## Model Structure

### HiringApplication

**Location:** `radar.hiring.models.HiringApplication`

| Field           | Type           | Required | Description |
|----------------|----------------|----------|-------------|
| `full_name`    | CharField(200) | Yes      | Applicant full name |
| `email`        | EmailField     | Yes      | Applicant email (notifications sent here) |
| `phone`        | CharField(20)  | No       | Phone number |
| `role_type`    | CharField(20)  | Yes      | One of: `full_time`, `intern`, `part_time`, `contract` |
| `position`     | CharField(200) | Yes      | Role applied for (e.g. "Software Engineer", "Marketing Intern") |
| `resume`       | CloudinaryField (raw) | No  | Resume/CV file (PDF preferred), stored in `radar/hiring/resumes` |
| `cover_message`| TextField      | No       | Cover letter or message |
| `status`       | CharField(20)  | Yes      | See status choices below (default: `new`) |
| `created_at`   | DateTimeField  | Auto     | Submission time |
| `updated_at`   | DateTimeField  | Auto     | Last update time |

### Role type choices

| Value       | Label     |
|------------|-----------|
| `full_time` | Full-time |
| `intern`    | Intern    |
| `part_time` | Part-time |
| `contract`  | Contract  |

### Status choices

| Value        | Label      | When email is sent |
|-------------|------------|---------------------|
| `new`       | New        | On form submit      |
| `reviewed`  | Reviewed   | When admin sets to Reviewed |
| `shortlisted` | Shortlisted | When admin sets to Shortlisted |
| `rejected`  | Rejected   | When admin sets to Rejected |
| `hired`     | Hired      | When admin sets to Hired |

---

## Public API Endpoints

Base URL is the same as the rest of the backend (e.g. `https://api.example.com/`). No authentication required.

### Submit hiring application

**Endpoint:** `POST /hiring/apply/`

**Authentication:** None (public).

**Content-Type:** `multipart/form-data` (with optional file) or `application/json`.

**Request body (form-data or JSON):**

| Field          | Type   | Required | Description |
|----------------|--------|----------|-------------|
| `full_name`    | string | Yes      | Applicant full name |
| `email`        | string | Yes      | Valid email |
| `role_type`    | string | Yes      | One of: `full_time`, `intern`, `part_time`, `contract` |
| `position`     | string | Yes      | Role applied for |
| `phone`        | string | No       | Phone number |
| `cover_message`| string | No       | Cover letter / message |
| `resume`       | file or string | No | Resume file (multipart) or Cloudinary URL (JSON) |

**Example (multipart/form-data):**

```bash
curl -X POST https://api.example.com/hiring/apply/ \
  -F "full_name=Jane Doe" \
  -F "email=jane@example.com" \
  -F "role_type=intern" \
  -F "position=Marketing Intern" \
  -F "resume=@/path/to/resume.pdf"
```

**Example (JSON, no file):**

```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "role_type": "intern",
  "position": "Marketing Intern",
  "phone": "+1234567890",
  "cover_message": "I am very interested in this role."
}
```

**Response (201 Created):**

```json
{
  "message": "Application submitted successfully. We will get back to you soon.",
  "application_id": 42
}
```

**Error (400 Bad Request):**

```json
{
  "full_name": ["Full name is required."],
  "email": ["This field is required."]
}
```

**Notes:**

- On success, an **"application received"** email is sent to the applicant (status `new`).
- Resumes are stored in Cloudinary with `resource_type='raw'` (e.g. PDFs).

---

### Get role types

**Endpoint:** `GET /hiring/role-types/`

**Authentication:** None.

**Response (200 OK):**

```json
{
  "role_types": [
    { "value": "full_time", "label": "Full-time" },
    { "value": "intern", "label": "Intern" },
    { "value": "part_time", "label": "Part-time" },
    { "value": "contract", "label": "Contract" }
  ]
}
```

Use this to build the role-type dropdown on the hiring form.

---

## Admin API Endpoints

Base URL: `/api/admin/`. All require **admin JWT** (same as other admin endpoints).

### List hiring applications

**Endpoint:** `GET /api/admin/hiring-applications/`

**Authentication:** Required (Admin JWT).

**Query parameters:**

| Parameter   | Type   | Default | Description |
|------------|--------|---------|-------------|
| `page`     | int    | 1       | Page number |
| `page_size`| int    | 20      | Items per page (max 100) |
| `status`   | string | —       | Filter: `new`, `reviewed`, `shortlisted`, `rejected`, `hired` |
| `role_type`| string | —       | Filter: `full_time`, `intern`, `part_time`, `contract` |
| `date_from`| string | —       | YYYY-MM-DD, applications from this date |
| `date_to`  | string | —       | YYYY-MM-DD, applications until this date |

**Example:**

```
GET /api/admin/hiring-applications/?page=1&page_size=20&status=new&role_type=intern
```

**Response (200 OK):**

```json
{
  "hiring_applications": [
    {
      "id": 42,
      "full_name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "role_type": "intern",
      "position": "Marketing Intern",
      "resume_url": "https://res.cloudinary.com/...",
      "cover_message": "I am very interested.",
      "status": "new",
      "created_at": "2025-02-20T14:30:00Z",
      "updated_at": "2025-02-20T14:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 92,
    "page_size": 20,
    "has_next": true,
    "has_previous": false
  },
  "filters": {
    "status": "new",
    "role_type": "intern",
    "date_from": null,
    "date_to": null
  },
  "message": "Hiring applications retrieved successfully"
}
```

---

### Get single hiring application

**Endpoint:** `GET /api/admin/hiring-applications/<application_id>/`

**Authentication:** Required (Admin JWT).

**Example:** `GET /api/admin/hiring-applications/42/`

**Response (200 OK):**

```json
{
  "id": 42,
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "role_type": "intern",
  "position": "Marketing Intern",
  "resume_url": "https://res.cloudinary.com/...",
  "cover_message": "I am very interested.",
  "status": "new",
  "created_at": "2025-02-20T14:30:00Z",
  "updated_at": "2025-02-20T14:30:00Z"
}
```

**Error (404 Not Found):**

```json
{
  "error": "Hiring application with ID 999 not found"
}
```

---

### Update hiring application status

**Endpoint:** `PATCH /api/admin/hiring-applications/<application_id>/status/`

**Authentication:** Required (Admin JWT).

**Behavior:** Updates the application status and **sends the corresponding status email** to the applicant.

**Request body:**

```json
{
  "status": "shortlisted"
}
```

Allowed values: `new`, `reviewed`, `shortlisted`, `rejected`, `hired`.

**Example:**

```bash
curl -X PATCH https://api.example.com/api/admin/hiring-applications/42/status/ \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "shortlisted"}'
```

**Response (200 OK):**

```json
{
  "message": "Status updated and applicant notified by email",
  "hiring_application": {
    "id": 42,
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "role_type": "intern",
    "position": "Marketing Intern",
    "resume_url": "https://res.cloudinary.com/...",
    "cover_message": "I am very interested.",
    "status": "shortlisted",
    "created_at": "2025-02-20T14:30:00Z",
    "updated_at": "2025-02-23T10:00:00Z"
  }
}
```

**Error (400 Bad Request):**

```json
{
  "error": "Invalid status. Must be one of: ['new', 'reviewed', 'shortlisted', 'rejected', 'hired']"
}
```

---

## Email Notifications

An email is sent to the applicant’s `email` in these cases:

1. **Form submit** – When they submit the form, the "application received" email is sent (status `new`).
2. **Admin API** – When an admin updates status via `PATCH .../status/`, the email for that status is sent.
3. **Django Admin** – When an admin changes the status in Django Admin and saves, the email for the new status is sent.

### Status email subjects and content

| Status       | Email subject                               | Purpose |
|-------------|---------------------------------------------|---------|
| `new`       | We received your application               | Confirm receipt |
| `reviewed`  | Application update: Under review            | Inform that application was reviewed |
| `shortlisted` | Congratulations – you have been shortlisted | Invite to next stage |
| `rejected`  | Update on your application                  | Polite rejection |
| `hired`     | Congratulations – you have been hired       | Offer / onboarding |

Templates are HTML + plain-text and use the applicant’s name and position. They are defined in `radar.hiring.utils.STATUS_EMAIL_CONTENT`. Sending uses the same Gmail setup as the rest of the app (`radar.auth.gmail_utils.get_gmail_service`).

---

## Django Admin

The model is registered in Django Admin:

- **Path:** Admin → Hiring / Careers → Hiring applications
- **List:** full_name, email, role_type, position, status, created_at
- **Filters:** role_type, status
- **Search:** full_name, email, position
- **Behavior:** Changing and saving the status triggers the same status email as the admin API.

---

## File Reference

| File | Purpose |
|------|---------|
| `radar/hiring/models.py` | `HiringApplication` model |
| `radar/hiring/serializers.py` | Public submit + admin serializers |
| `radar/hiring/views.py` | Public `POST /hiring/apply/`, `GET /hiring/role-types/` |
| `radar/hiring/utils.py` | `send_hiring_status_email`, status email content |
| `radar/hiring/admin.py` | Django Admin + `save_model` email on status change |
| `radar/hiring/urls.py` | Public URL routes |
| `radar/admin/views.py` | `HiringApplicationsListView`, `HiringApplicationDetailView`, `HiringApplicationStatusView` |
| `radar/admin/services.py` | `get_all_hiring_applications`, `get_hiring_application_by_id`, `update_hiring_application_status` |
| `radar/admin/urls.py` | Admin routes for hiring-applications |
| `radar/admin/serializers.py` | `HiringApplicationSerializer`, `HiringApplicationStatusUpdateSerializer` |

---

## Quick reference

| Action | Method | Endpoint | Auth |
|--------|--------|----------|------|
| Submit application | POST | `/hiring/apply/` | None |
| Get role types | GET | `/hiring/role-types/` | None |
| List applications | GET | `/api/admin/hiring-applications/` | Admin |
| Get one application | GET | `/api/admin/hiring-applications/<id>/` | Admin |
| Update status (and send email) | PATCH | `/api/admin/hiring-applications/<id>/status/` | Admin |
