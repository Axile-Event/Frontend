any update


# Referral (Referee) & Event Referral Rewards — Frontend Guide

This document covers **referee authentication**, **referee-only event APIs**, and **organizer event fields** for referral rewards. All paths are relative to your API base URL.

---

## 1. Two user types (do not mix tokens)

| App | User | Auth |
|-----|------|------|
| **Referee app** | `SignUp` (referree) | JWT from `login/` or Google referee flow |
| **Organizer app** | Organizer + Django `User` | JWT from organizer auth |

Referee JWT uses Django `User.username` = referee **email**. Use the correct token per screen.

---

## 2. Referee authentication

### 2.1 Email/password signup

1. **POST** `/signup/` — `Username`, `Firstname`, `Lastname`, `Phone` (optional), `Email`, `Password`
2. **POST** `/verify-otp/` — `Email`, `otp` → **201**: `user`, `referree_id`

### 2.2 Login

**POST** `/login/` — `{ "email", "password" }` → `access`, `refresh`

```http
Authorization: Bearer <access_token>
```

### 2.3 Google (referee)

**POST** `/referee/google-signup/` — `{ "token": "<google_access_token>" }` or `access_token`

### 2.4 Other

- **POST** `/logout/` — `{ "refresh" }`
- **GET/PATCH** `/referee/profile/` — profile
- Password reset: `/password/reset/`, etc.
- Referee password change (authenticated): **POST** `/password/change/`
- Referee PIN:
  - **POST** `/referee/pin/`
  - **POST** `/referee/verify-pin/`
  - **POST** `/referee/forgot-pin/`
  - **POST** `/referee/change-pin/`

---

## 3. Referee events (`use_referral: true`)

Active referee JWT required (`SignUp` match + `is_active`).

| Method | Path |
|--------|------|
| **GET** | `/referee/events/` |
| **GET** | `/referee/events/<identifier>/` (`event_id` or `event_slug`) |

### Reward fields (API uses **0–100** for percentage)

| Field | Meaning |
|-------|---------|
| `use_referral` | Event offers referral rewards |
| `referral_reward_type` | `"flat"` or `"percentage"` |
| `referral_reward_amount` | Flat payout (currency) when type is `flat` |
| `referral_reward_percentage` | **0–100** when type is `percentage` |

### List example

```json
{
  "events": [{
    "event_id": "event:AB-12345",
    "event_slug": "summer-fest",
    "name": "Summer Fest",
    "event_type": "music",
    "pricing_type": "paid",
    "location": "Lagos",
    "date": "2025-06-01T18:00:00Z",
    "image": "https://...",
    "use_referral": true,
    "referral_reward_type": "percentage",
    "referral_reward_amount": null,
    "referral_reward_percentage": 7.5
  }],
  "count": 1
}
```

Detail adds `description`, `max_quantity_per_booking`, `ticket_categories`.

---

## 4. Organizer: referral rewards on events

**POST** `/event/` · **PATCH** `/events/<event_id>/update/`

| Field | Rules |
|-------|--------|
| `use_referral` | Boolean |
| `referral_reward_type` | If `use_referral`: `"flat"` \| `"percentage"` |
| `referral_reward_amount` | Required for `flat` (positive) |
| `referral_reward_percentage` | Required for `percentage`: **0–100** |

If `use_referral` is false, reward fields are cleared.

**GET** `/organizer/events/` — includes reward block above.

**GET** `/config/` — `referral_reward_types` for dropdowns:

```json
"referral_reward_types": [
  { "value": "flat", "label": "Flat amount" },
  { "value": "percentage", "label": "Percentage" }
]
```

---

## 5. Public vs referee

| Endpoint | Referral reward fields |
|----------|------------------------|
| **GET** `/events/<id>/details/` | **Hidden** |
| **GET** `/event/` (list) | **Hidden** |
| **GET** `/referee/events/` … | **Shown** |

---

## 6. Organizer referral stats endpoint

Organizer JWT required.

| Method | Path | Purpose |
|--------|------|---------|
| **POST** | `/organiser/<event_id>/referral-stats/` | Bulk stats for referral IDs passed in body |

### Response fields

| Field | Meaning |
|-------|---------|
| `referral_name` | Referee display name (Firstname + Lastname fallback to Username) |
| `tickets_sold` | Count of tickets sold by this referee for this event |
| `referral_revenue` | Sum of `total_price` for those sold tickets |

### How backend computes stats

Request body format:

```json
{
  "referrals": [
    { "referee_id": "organiser:abc123" },
    { "referee_id": "organiser:def456" }
  ]
}
```

Tickets are filtered by all of these:

- `Ticket.event = <event_id>`
- `Ticket.referral = <referee_id>` (for each requested body item)
- `Ticket.status in ('confirmed', 'used')`

Then:

- `tickets_sold` = count of filtered tickets
- `referral_revenue` = sum of filtered `total_price`

---

## 7. Referee self stats endpoint

Referee JWT required (active referee only).

| Method | Path | Purpose |
|--------|------|---------|
| **GET** | `/referee/<event_id>/stats/` | Referee sees all sold tickets for own referral id in event |

Returns:

- `referral_name`
- `referral_revenue` (organizer revenue basis from tickets sold via this referee id)
- `tickets_sold`
- `tickets` (full ticket list via `TicketSerializer`, includes category/ticket type fields like `category_name`, `category_price`, buyer details, status, etc.)

---

## 8. Unique referral registration flow

When referral is used during ticket booking:

1. Referral id is saved on each ticket as `Ticket.referral`.
2. On confirmation (free immediately, paid via webhook/verify-payment), backend registers that id into `Event.referral_referee_ids`.
3. `Event.referral_referee_ids` behaves like a set:
   - same `referee_id` is stored once per event
   - repeated sales do not duplicate it

This field is internal and not exposed in normal public event payloads.

---

## 9. Backend reference

| Piece | Location |
|-------|----------|
| `referral_reward_fields_for_api()` | `radar/event/models.py` |
| Organizer serializer | `radar/event/serializers.py` |
| Referee event serializers | `radar/referral_app/serializers.py` |
| Referee-event stats view | `radar/referral_app/views.py` |
| Event referral set field | `radar/event/models.py` (`referral_referee_ids`) |

Run migrations after deploy: `referral_commission_*` columns renamed to `referral_reward_*`.
