# Radar - Modern Event Ticketing Platform

Radar is a comprehensive event ticketing platform designed to streamline event management and ticket purchasing. Built with modern web technologies, it provides a seamless experience for event organizers, students, and administrators.

## 🚀 Tech Stack

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

## 📂 Project Structure

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

## 👥 Contributors

- [Lupoetn](https://github.com/lupoetn)
- [Abraham123-dev](https://github.com/abraham123-dev)
- [samkiell](https://github.com/samkiell)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the Radar Team**