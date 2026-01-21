# Axile - Modern Event Ticketing Platform

Axile is a comprehensive event ticketing platform designed to streamline event management and ticket purchasing. Built with modern web technologies, it provides a seamless experience for event organizers, students, and administrators.

The PIN module provides functionality for managing Personal Identification Numbers (PINs) for organizers in the Axile system. It handles PIN creation, storage, and recovery operations with secure password hashing.

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **Language:** React 19.2
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components:** Custom components + [Radix UI](https://www.radix-ui.com/) primitives
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **HTTP Client:** [Axios](https://axios-http.com/) with interceptors for auth
- **Authentication:** Google OAuth + JWT
- **Forms:** [React Hook Form](https://react-hook-form.com/)
- **Notifications:** [React Hot Toast](https://react-hot-toast.com/)
- **Theme:** Dark/Light mode with [next-themes](https://github.com/pacocoursey/next-themes)

**Features:**
- Automatic password hashing on save using Django's `make_password`
- Prevents double-hashing by checking if PIN is already hashed
- String representation returns email and PIN

**Example:**
```python
from Axile.PIN.models import Pin

# Create a new PIN
pin = Pin.objects.create(
    Email='organizer@example.com',
    pin='1234'
)
# PIN is automatically hashed before saving
```

## API Endpoints

### 1. Create/Set PIN

**Endpoint:** `POST /pin/`

**Description:** Creates or updates a PIN for an organizer. The organizer must exist in the system.

**Request Body:**
```json
{
    "Email": "organizer@example.com",
    "pin": "1234"
}
```

**Success Response (201 Created):**
```json
{
    "Message": "PIN saved successfully!"
}
```

**Error Responses:**
- `400 Bad Request`: If organizer does not exist or validation fails
  ```json
  {
      "Message": "Organizer does not exist"
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:8000/pin/ \
  -H "Content-Type: application/json" \
  -d '{"Email": "organizer@example.com", "pin": "1234"}'
```

---

### 2. Forgot PIN

**Endpoint:** `POST /forgot-pin/`

**Description:** Initiates the PIN recovery process by sending a PIN change link to the organizer's email.

**Request Body:**
```json
{
    "Email": "organizer@example.com"
}
```

**Success Response (200 OK):**
```json
{
    "message": "PIN change link sent to email.",
    "email": "organizer@example.com"
}
```

**Error Responses:**
- `400 Bad Request`: If organizer does not exist
  ```json
  {
      "Message": "Organizer does not exist"
  }
  ```
- `500 Internal Server Error`: If email sending fails
  ```json
  {
      "error": "Failed to send PIN change email. Please try again."
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:8000/forgot-pin/ \
  -H "Content-Type: application/json" \
  -d '{"Email": "organizer@example.com"}'
```

**Notes:**
- Sends an email with a redirect link to the change-pin endpoint
- Uses OTP generation (6-digit random number)
- Logs email sending status for debugging

---

### 3. Change PIN

**Endpoint:** `POST /change-pin/`

**Description:** Changes an existing PIN for an organizer. Requires both new PIN and confirmation.

**Request Body:**
```json
{
    "Email": "organizer@example.com",
    "Pin": "5678",
    "ConfirmPin": "5678"
}
```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes (login, signup, verify-otp)
│   ├── (protected)/              # Protected routes (dashboards)
│   │   └── dashboard/
│   │       ├── org/              # Organizer dashboard
│   │       │   ├── create-event/
│   │       │   ├── my-event/
│   │       │   ├── qr-scanner/
│   │       │   └── settings/
│   │       └── student/          # Student dashboard
│   │           ├── events/
│   │           └── my-tickets/
│   ├── events/                   # Public events pages
│   ├── contact/                  # Contact page
│   ├── terms/                    # Terms of service
│   ├── privacy/                  # Privacy policy
│   ├── lighthouse/               # Admin panel
│   ├── layout.jsx                # Root layout with providers
│   ├── page.jsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components (buttons, inputs, etc.)
│   ├── admin/                    # Admin-specific components
│   ├── organizersDashboardComponents/
│   ├── studentDashboardComponents/
│   ├── ErrorBoundary.jsx         # Error boundary for error handling
│   ├── Header.jsx                # Main navigation
│   └── Footer.jsx                # Footer
├── lib/                          # Utilities and configurations
│   ├── axios.js                  # Axios instance with auth interceptors
│   ├── utils.js                  # Utility functions (cn, getImageUrl, etc.)
│   └── admin.js                  # Admin utilities
└── store/                        # Zustand state stores
    ├── authStore.js              # Authentication state
    └── orgStore.js               # Organizer state
```

## 🔑 Key Features

### For Event Organizers
- Create and manage events
- Track ticket sales and revenue
- QR code scanner for ticket validation
- Payout management
- Event analytics dashboard

### For Students
- Browse and discover events
- Purchase tickets
- Manage purchased tickets
- View ticket QR codes

### For Admins
- User management
- Event verification and moderation
- Platform analytics
- System administration

## 🔐 Security Features

- JWT-based authentication with automatic token refresh
- Protected routes with authentication middleware
- Security headers (CSP, X-Frame-Options, etc.)
- Input validation and sanitization
- Error boundaries for graceful error handling

## 🎨 Design System

The app uses a custom design system with:
- CSS custom properties for theming
- Dark/light mode support
- Consistent color palette (primary: Rose-600 #e11d48)
- Custom fonts: Plus Jakarta Sans (body), Geist Mono (code)
- Responsive design for mobile, tablet, and desktop

## 📊 State Management

- **Zustand** for global state (auth, org data)
- **React Hook Form** for form state
- **URL state** for filters and pagination
- **Server state** cached via Next.js

## 🚦 Route Protection

Routes are protected based on user roles:
- Public routes: `/`, `/events`, `/login`, `/signup`
- Student routes: `/dashboard/student/*`
- Organizer routes: `/dashboard/org/*`
- Admin routes: `/lighthouse/*`

## 🧪 Performance Optimizations

- Next.js Image component for optimized images
- Code splitting with dynamic imports
- Route prefetching
- Optimized bundle with tree shaking

## URL Configuration

The PIN URLs are configured in `urls.py`:
- `/pin/` → `PinView`
- `/forgot-pin/` → `ForgotPinView`
- `/change-pin/` → `ChangePinView`

Make sure these URLs are included in your main `urls.py` configuration.

This project is proprietary and confidential. All rights reserved.

---

**Built with ❤️ by the Axile Team**
