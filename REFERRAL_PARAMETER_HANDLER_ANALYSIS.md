# Referral Parameter Handler Analysis

## Overview
This document outlines how referral parameters ("ref", "refer", "referral_code") are currently captured and handled in the codebase.

---

## 1. REFERRAL PARAMETER CAPTURE

### ✅ Protected/Dashboard Event Page (IMPLEMENTED)
**File:** [src/app/(protected)/dashboard/user/events/[event_id]/page.jsx](src/app/(protected)/dashboard/user/events/[event_id]/page.jsx)

**How it works:**
- Uses `useSearchParams()` hook from Next.js navigation
- Captures the "ref" query parameter: `?ref=abc123`
- Stores referral code in Zustand store via `setReferral()`

**Code location:** [Lines 113-133](src/app/(protected)/dashboard/user/events/[event_id]/page.jsx#L113-L133)

```jsx
const { setReferral, getValidReferral, clearReferral } = useReferral();
const searchParams = useSearchParams();

// Capture referral from URL query param (?ref=abc123)
useEffect(() => {
  const ref = searchParams.get("ref");
  const id = event?.event_id || eventId || slug;
  
  if (ref && id) {
    setReferral(ref, cleanEventId(id));
  }
}, [searchParams, event?.event_id, eventId, slug, setReferral]);
```

### ❌ Public Event Details Page (NOT IMPLEMENTED)
**File:** [src/app/events/[event_id]/EventDetailsClient.jsx](src/app/events/[event_id]/EventDetailsClient.jsx)

**Status:** Currently does NOT capture referral parameters from URL.

**Variables initialized but not used:**
- Line 52: `const [referralSource, setReferralSource] = useState("");` (appears to be for manual input only)
- Line 53: `const [otherReferral, setOtherReferral] = useState("");`

**What's needed:** Implementation should:
1. Import `useSearchParams` from "next/navigation"
2. Import `useReferral` hook
3. Add effect to capture "ref" query parameter
4. Store referral code in persistent store

---

## 2. REFERRAL STORE & PERSISTENCE

**File:** [src/store/referralStore.js](src/store/referralStore.js)

**Key Features:**
- Zustand store with persistence middleware
- Stores: `referralCode`, `eventId`, `timestamp`
- Auto-expiration: 7 days (604,800,000 ms)
- Methods:
  - `setReferral(code, eventId)` - Save referral code
  - `getValidReferral(currentEventId)` - Retrieve if valid and not expired
  - `clearReferral()` - Clear stored data
  - Auto-rehydrates from localStorage on app load

**Validation Logic:**
1. Checks if code exists
2. Checks timestamp (not expired)
3. Validates event ID match (with ID cleaning)
4. Returns null if any check fails

---

## 3. REFERRAL HOOK

**File:** [src/hooks/useReferral.js](src/hooks/useReferral.js)

**Exports:**
- `useReferral()` - Main hook consuming the store
- `cleanEventId()` - Utility to clean event IDs (removes "event:" prefix)

**Exports from hook:**
- `referralCode` - Current code
- `setReferral(code, eventId)` - Set referral
- `getValidReferral(eventId)` - Get valid code
- `clearReferral()` - Clear code
- `isExpired()` - Check expiration
- `isHydrated` - Check store hydration state

---

## 4. REFERRAL LINK CONSTRUCTION

### Event Share Links
**Files where referral links are constructed:**

1. **Dashboard Event Page** - [Line 140](src/app/(protected)/dashboard/user/events/[event_id]/page.jsx#L140)
   ```jsx
   setShareUrl(`${window.location.origin}/events/${encodeURIComponent(identifier)}`);
   ```

2. **Protected Dashboard Student** - [src/app/(protected)/dashboard/student/events/[event_id]/page.jsx](src/app/(protected)/dashboard/student/events/[event_id]/page.jsx#L140)

3. **Organizer Dashboard** - [src/app/(protected)/dashboard/org/my-event/page.jsx](src/app/(protected)/dashboard/org/my-event/page.jsx#L119)

4. **Public Event Page** - [src/app/events/[event_id]/EventDetailsClient.jsx](src/app/events/[event_id]/EventDetailsClient.jsx#L80)

**Current Issues:**
- Share URLs do NOT include referral code parameter
- No mechanism to append "?ref=" to generated shares
- Organizers need way to generate personal referral links

**Example of what should be generated:**
```
/events/event-slug-123?ref=username123
/events/EV-12345?ref=organizer-code
```

---

## 5. REFERRAL CONFIGURATION (ORGANIZER)

**Files:**
- [src/components/organizer/ReferralConfigFields.jsx](src/components/organizer/ReferralConfigFields.jsx)
- [src/components/organizer/ReferralToggle.jsx](src/components/organizer/ReferralToggle.jsx)
- [src/components/organizer/ReferralStatsTable.jsx](src/components/organizer/ReferralStatsTable.jsx)

**What's configured:**
- `use_referral` - Enable/disable referral rewards
- `referral_reward_type` - "flat" or "percentage"
- `referral_reward_amount` - Fixed amount in ₦
- `referral_reward_percentage` - Percentage of ticket price

**Data sent to backend:**
```
POST /organizer/{event_id}/create-event/
FormData: {
  use_referral: true,
  referral_reward_type: "flat|percentage",
  referral_reward_amount: "500",
  referral_reward_percentage: "5"
}
```

---

## 6. REFERRAL STATS & DISPLAY

**Referrals Dashboard** - [src/app/(protected)/dashboard/org/referrals/[eventId]/page.jsx](src/app/(protected)/dashboard/org/referrals/[eventId]/page.jsx)

**Available referral data from API:**
- `GET /organizer/{event_id}/referral-stats/`
- Shows: referee username, tickets sold, gross sales, commission, net revenue
- Table displays per-referee breakdown
- CSV download available

**Backend Model fields used:**
- `username` / `referral_name` - Referee identifier
- `referral_revenue` - Commission earned
- `referral_payout` - Net payout amount

---

## 7. REFERRAL VALIDATION

**File:** [src/lib/referral.js](src/lib/referral.js#L79-L140)

**Function:** `validateReferralConfig(referralConfig, pricingType, categories)`

**Validation rules:**
1. Cannot enable referral on free events
2. Reward type must be selected if enabled
3. For flat rewards:
   - Amount must be > 0
   - Cannot exceed lowest ticket price
4. For percentage rewards:
   - Percentage must be > 0
   - Maximum 100%

---

## 8. CURRENT IMPLEMENTATION GAPS

### ❌ Missing Features:

1. **Public Event Page Referral Capture**
   - EventDetailsClient doesn't capture "ref" from URL
   - No integration with useReferral hook
   - Referral data won't persist when purchasing

2. **Referral Link Generation**
   - No automatic appending of "?ref=USERNAME" to event links
   - Share buttons don't include referral parameter
   - Organizers/referrers can't generate personal links

3. **Referral Code Validation**
   - No endpoint to validate if a referral code exists
   - No check if referrer is authorized for this event
   - No prevention of self-referrals

4. **Query Parameter Standards**
   - Using "ref" but documentation might expect "refer" or "referral_code"
   - No standardization documented

5. **Middleware Handling**
   - [src/middleware.js](src/middleware.js) doesn't handle referral parameters
   - Could strip or preserve referral data across routes

6. **Checkout/Payment Flow**
   - No confirmation that referral code is being sent to backend
   - No display of referral discount/credit at checkout

---

## 9. WHERE REFERRAL SHOULD BE CAPTURED

### Priority 1 - Must Fix:
- **Public Event Page** ([EventDetailsClient.jsx](src/app/events/[event_id]/EventDetailsClient.jsx))
  - Add query parameter capture from URL
  - Integrate with useReferral hook
  - Store referral code for booking

### Priority 2 - Should Implement:
- **Referral Link Generation**
  - Function to append "?ref=" to event URLs
  - Personal referral link generator for organizers
  
- **Payment/Booking Flow**
  - Verify referral code is sent to backend
  - Display referral benefits at checkout

### Priority 3 - Nice to Have:
- **Referral Link Shortener**
- **QR Code Generation**
- **Social Media Link Preview Optimization**

---

## 10. INTEGRATION CHECKLIST

- [ ] Add referral capture to `EventDetailsClient.jsx`
- [ ] Generate referral links with "?ref=" parameter
- [ ] Validate referral codes before booking
- [ ] Display referral code in booking request to backend
- [ ] Test referral persistence across redirects
- [ ] Test referral expiration (7 days)
- [ ] Verify correct event ID matching
- [ ] Add referral parameter to share buttons/links

