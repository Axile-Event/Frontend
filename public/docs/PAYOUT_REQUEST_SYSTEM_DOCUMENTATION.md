# Payout Request System Documentation

## Overview

The payout request system allows organizers to request payouts from their wallet balance. Instead of automatic withdrawals, organizers submit payout requests that are reviewed and processed by administrators. This provides better control and oversight over fund disbursements.

## Key Changes

### 1. **Removed 7-Day Holding Period**
- Money from ticket sales now goes directly to `available_balance`
- No more `pending_balance` holding period
- Organizers can request payouts immediately after ticket sales

### 2. **Manual Payout Approval**
- Organizers submit payout requests (not automatic withdrawals)
- Admins review and approve/reject requests
- **Admin transfers money manually** (not via Paystack)
- Admin marks transaction as completed after manual transfer

### 3. **Email Notifications**
- Organizers receive confirmation emails when they submit requests
- Admins receive notification emails for new payout requests
- Admin dashboard shows pending payout requests count

### 4. **Request Validation**
- Prevents duplicate requests (same amount, same bank account within 1 hour)
- Validates total pending requests don't exceed available balance
- Clear error messages guide organizers

---

## System Flow

```
Ticket Sale → Money Credited to available_balance → Organizer Requests Payout → 
Admin Reviews → Admin Approves → Wallet Debited → Transaction Created (pending) → 
Admin Transfers Money Manually → Admin Marks Transaction Completed → 
PayoutRequest Status → completed → Shows in Payout Transactions
```

---

## Organizer Endpoints

### 1. Request Payout

**Endpoint:** `POST /wallet/withdraw/`

**Description:** Submit a payout request. Creates a pending payout request that admin will review.

**Authentication:** Required (JWT token, Organizer only)

**Request Body:**
```json
{
  "amount": 5000.00,
  "bank_account_number": "0123456789",  // Optional if already saved
  "bank_name": "Access Bank",           // Optional if already saved
  "account_name": "John Doe",          // Optional if already saved
  "bank_code": "044"                   // Optional if already saved
}
```

**Request Fields:**
- `amount` (required): Payout amount (must be ≥ ₦1,000 and ≤ available balance)
- `bank_account_number` (optional): Bank account number (uses saved if not provided)
- `bank_name` (optional): Bank name (uses saved if not provided)
- `account_name` (optional): Account holder name (uses saved if not provided)
- `bank_code` (optional): Paystack bank code (uses saved if not provided)

**Success Response (200 OK):**
```json
{
  "message": "Payout request submitted successfully",
  "request_id": "payout:ABC12-XYZ34",
  "amount": "5000.00",
  "status": "pending",
  "current_wallet_balance": "15000.00",
  "note": "Your payout request is being reviewed. You will receive a confirmation email once it's processed."
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

**Multiple Pending Requests Exceed Balance (400 Bad Request):**
```json
{
  "error": "Insufficient balance. You have pending payout requests that exceed your available balance.",
  "available_balance": "10000.00",
  "total_pending_requests": "8000.00",
  "requested_amount": "5000.00",
  "total_if_approved": "13000.00"
}
```

**Duplicate Request (400 Bad Request):**
```json
{
  "error": "A similar payout request was submitted recently. Please wait before submitting again.",
  "message": "Duplicate request prevented"
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
async function requestPayout(amount, bankDetails = null) {
  const token = localStorage.getItem('access_token');
  
  const body = {
    amount: amount
  };
  
  // Optionally include bank details if not already saved
  if (bankDetails) {
    body.bank_account_number = bankDetails.accountNumber;
    body.bank_name = bankDetails.bankName;
    body.account_name = bankDetails.accountName;
    body.bank_code = bankDetails.bankCode;
  }
  
  const response = await fetch('http://localhost:8000/wallet/withdraw/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  const data = await response.json();
  return data;
}
```

---

### 2. Get Bank Account Details

**Endpoint:** `GET /wallet/bank-account/`

**Description:** Get saved bank account details (can be used to pre-fill payout form).

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

---

### 3. Update Bank Account Details

**Endpoint:** `POST /wallet/bank-account/`

**Description:** Save or update bank account details for future payout requests.

**Authentication:** Required (JWT token, Organizer only)

**Request Body:**
```json
{
  "bank_account_number": "0123456789",
  "bank_name": "Access Bank",
  "account_name": "John Doe",
  "bank_code": "044"
}
```

---

## Admin Endpoints

### 1. List All Payout Requests

**Endpoint:** `GET /api/admin/payout-requests/`

**Description:** Get all payout requests with pagination and filtering.

**Authentication:** Required (Admin)

**Query Parameters:**
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | Integer | 1 | - | Page number |
| `page_size` | Integer | 20 | 100 | Items per page |
| `status` | String | null | - | Filter by status (`pending`, `approved`, `rejected`, `completed`) |

**Example Request:**
```
GET /api/admin/payout-requests/?status=pending&page=1&page_size=20
```

**Success Response (200 OK):**
```json
{
  "payout_requests": [
    {
      "request_id": "payout:ABC12-XYZ34",
      "organizer_email": "organizer@example.com",
      "organizer_name": "TechOrg Ltd",
      "amount": "50000.00",
      "current_wallet_balance": "75000.00",
      "bank_account_number": "0123456789",
      "bank_name": "GTBank",
      "account_name": "TechOrg Limited",
      "bank_code": "058",
      "status": "pending",
      "transfer_reference": null,
      "admin_notes": null,
      "created_at": "2026-01-19T18:00:00Z",
      "updated_at": "2026-01-19T18:00:00Z",
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
    "status": "pending"
  },
  "message": "Payout requests retrieved successfully"
}
```

---

### 2. Approve/Reject Payout Request

**Endpoint:** `PATCH /api/admin/payout-requests/<request_id>/status/`

**Description:** Approve or reject a payout request. When approved, debits wallet and creates Transaction record. Admin will transfer money manually (not via Paystack).

**Authentication:** Required (Admin)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `request_id` | String | Payout request ID (e.g., `payout:ABC12-XYZ34`) |

**Request Body:**
```json
{
  "status": "approved",
  "admin_notes": "Payment processed successfully"
}
```

**Request Fields:**
- `status` (required): `"approved"` or `"rejected"`
- `admin_notes` (optional): Notes for approval/rejection

**Success Response (200 OK):**
```json
{
  "message": "Payout request approved successfully",
  "request_id": "payout:ABC12-XYZ34",
  "organizer_email": "organizer@example.com",
  "organizer_name": "TechOrg Ltd",
  "amount": "50000.00",
  "status": "approved",
  "transfer_reference": null
}
```

**Error Responses:**

**Invalid Status (400 Bad Request):**
```json
{
  "error": "Cannot update payout request with status 'approved'"
}
```

**Insufficient Balance (400 Bad Request):**
```json
{
  "error": "Insufficient balance. Available: 30000.00, Requested: 50000.00"
}
```

**Notes:**
- Only `pending` payout requests can be updated
- Approving a request:
  - Debits organizer's wallet immediately
  - Creates Transaction record with `pending` status
  - Updates payout request status to `approved`
  - **Admin must transfer money manually** to the organizer's bank account
  - Admin can update Transaction status to `completed` after manual transfer using `PATCH /api/admin/withdrawals/<transaction_id>/status/`
- Rejecting a request:
  - Updates status to `rejected`
  - Does NOT debit wallet
  - Admin can add notes explaining rejection

---

### 3. Mark Transaction as Completed

**Endpoint:** `PATCH /api/admin/withdrawals/<transaction_id>/status/`

**Description:** Mark a withdrawal transaction as completed after manual transfer. Also updates related PayoutRequest status to `completed`.

**Authentication:** Required (Admin)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `transaction_id` | String | Transaction ID (e.g., `transaction:ABC12-XYZ34`) |

**Request Body:**
```json
{
  "status": "completed"
}
```

**Valid Status Values:**
- `completed` - Mark transaction as completed (after manual transfer)
- `failed` - Mark transaction as failed (refunds wallet)

**Success Response (200 OK):**
```json
{
  "message": "Withdrawal approved successfully",
  "transaction_id": "transaction:ABC12-XYZ34",
  "status": "completed",
  "amount": "50000.00"
}
```

**Notes:**
- Updates Transaction status to `completed`
- Automatically updates related PayoutRequest status to `completed`
- Sets `completed_at` timestamp
- If status is `failed`, refunds amount back to wallet

---

### 4. View Payout Transactions

**Endpoint:** `GET /api/admin/withdrawals/`

**Description:** Get all payout transactions (from approved payout requests).

**Authentication:** Required (Admin)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | 1 | Page number |
| `page_size` | Integer | 20 | Items per page |
| `status` | String | null | Filter by status (`pending`, `completed`, `failed`) |

**Success Response (200 OK):**
```json
{
  "withdrawals": [
    {
      "transaction_id": "transaction:XYZ12-ABC34",
      "organizer_email": "organizer@example.com",
      "organizer_name": "TechOrg Ltd",
      "amount": "50000.00",
      "status": "completed",
      "bank_name": "GTBank",
      "account_name": "TechOrg Limited",
      "transfer_reference": "TRF_abc123def456",
      "created_at": "2026-01-19T18:30:00Z",
      "completed_at": "2026-01-19T18:35:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "total_count": 1,
    "page_size": 20,
    "has_next": false,
    "has_previous": false
  },
  "filters": {
    "status": "completed"
  },
  "message": "Withdrawals retrieved successfully"
}
```

---

### 5. Get Payout Request Notifications

**Endpoint:** `GET /api/admin/notifications/payout-requests/`

**Description:** Get payout request notifications for admin dashboard. Returns count of pending requests and recent requests.

**Authentication:** Required (Admin)

**Success Response (200 OK):**
```json
{
  "pending_count": 5,
  "has_pending": true,
  "recent_requests": [
    {
      "request_id": "payout:ABC12-XYZ34",
      "organizer_name": "TechOrg Ltd",
      "organizer_email": "organizer@example.com",
      "amount": 50000.00,
      "created_at": "2026-01-19T18:00:00Z"
    }
  ],
  "message": "Payout request notifications retrieved successfully"
}
```

**Response Fields:**
- `pending_count`: Total number of pending payout requests
- `has_pending`: Boolean flag (true if count > 0)
- `recent_requests`: Array of 5 most recent pending requests

**Frontend Implementation:**
```javascript
async function getPayoutNotifications() {
  const token = localStorage.getItem('admin_access_token');
  
  const response = await fetch(
    'http://localhost:8000/api/admin/notifications/payout-requests/',
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const data = await response.json();
  
  // Show notification badge if has_pending is true
  if (data.has_pending) {
    showNotificationBadge(data.pending_count);
  }
  
  return data;
}
```

---

### 6. Dashboard Analytics (Updated)

**Endpoint:** `GET /api/admin/dashboard/analytics/`

**Description:** Get dashboard analytics including pending payout requests count.

**Authentication:** Required (Admin)

**Success Response (200 OK):**
```json
{
  "analytics": {
    "total_users": 150,
    "total_students": 120,
    "total_organisers": 30,
    "total_events": 45,
    "total_revenue": 125000.00,
    "pending_payout_requests": 5
  },
  "message": "Dashboard analytics retrieved successfully"
}
```

**New Field:**
- `pending_payout_requests`: Number of pending payout requests requiring admin attention

---

## Database Models

### PayoutRequest Model

**Fields:**
- `request_id` (String, unique): Auto-generated ID (e.g., `payout:ABC12-XYZ34`)
- `wallet` (ForeignKey): Reference to organizer's wallet
- `amount` (Decimal): Requested payout amount
- `current_wallet_balance` (Decimal): Wallet balance at time of request
- `bank_account_number` (String): Bank account number
- `bank_name` (String): Bank name
- `account_name` (String): Account holder name
- `bank_code` (String): Bank code (optional)
- `status` (String): `pending`, `approved`, `rejected`, or `completed`
- `transaction` (OneToOneField): Related Transaction (created when approved)
- `transfer_reference` (String): Manual transfer reference (can be added by admin)
- `admin_notes` (Text): Admin notes for approval/rejection
- `created_at` (DateTime): Request creation timestamp
- `updated_at` (DateTime): Last update timestamp
- `processed_at` (DateTime): When request was processed

**Status Flow:**
```
pending → approved → Transaction created (pending) → Admin transfers manually → 
Admin marks Transaction completed → PayoutRequest → completed
pending → rejected
```

---

## Email Notifications

### Organizer Email

Sent when organizer submits a payout request.

**Subject:** `Payout Request Received - ₦{amount}`

**Content:**
- Confirmation that request was received
- Request ID
- Amount requested
- Note that payment will be processed soon

### Admin Email

Sent to admin when organizer submits a payout request.

**Subject:** `New Payout Request: ₦{amount} from {organizer_name}`

**Content:**
- Organizer name and email
- Request ID
- Amount requested
- Current wallet balance
- Link to admin panel

**Admin Email Configuration:**
The admin email is configured in System Settings (`support_email` field). Default: `support@radar.app`

---

## Migration Guide

### Running Migrations

```bash
python manage.py migrate wallet
```

This will create the `PayoutRequest` table.

### Data Migration

**No data migration needed** - existing withdrawal transactions remain unchanged. New payout requests will be created going forward.

### Code Updates Required

1. **Frontend:** Update withdrawal form to submit payout requests instead of expecting immediate processing
2. **Frontend:** Update UI to show payout request status (pending, approved, rejected)
3. **Admin Panel:** Add payout request management interface

---

## Example Workflows

### Workflow 1: Organizer Requests Payout with Saved Bank Details

1. Organizer navigates to wallet page
2. Clicks "Request Payout"
3. Enters amount (e.g., ₦50,000)
4. System validates:
   - No duplicate request (same amount, same bank account within 1 hour)
   - Total pending requests + new amount don't exceed balance
   - Sufficient available balance
5. System uses saved bank account details
6. Payout request created with status `pending`
7. Organizer receives confirmation email
8. Admin receives notification email
9. Admin sees notification in dashboard (pending count)
10. Admin reviews request in admin panel
11. Admin approves request
12. Wallet debited immediately
13. Transaction created with `pending` status
14. PayoutRequest status → `approved`
15. Admin transfers money manually to organizer's bank account
16. Admin marks transaction as `completed` via `PATCH /api/admin/withdrawals/<transaction_id>/status/`
17. Transaction status → `completed`
18. PayoutRequest status → `completed` (automatically updated)
19. Transaction appears in payout transactions list

### Workflow 2: Organizer Requests Payout with New Bank Details

1. Organizer navigates to wallet page
2. Clicks "Request Payout"
3. Enters amount and bank details
4. System validates (same as Workflow 1)
5. System saves bank details to wallet (if not already saved)
6. Payout request created
7. (Rest same as Workflow 1)

### Workflow 3: Duplicate Request Prevention

1. Organizer submits payout request for ₦5,000
2. Organizer accidentally clicks submit again (or network retry)
3. System detects duplicate (same amount, same bank account within 1 hour)
4. Request rejected with error message
5. Original request remains pending

### Workflow 4: Multiple Pending Requests Validation

1. Organizer has wallet balance: ₦10,000
2. Organizer submits Request 1: ₦8,000 (pending)
3. Organizer tries to submit Request 2: ₦5,000
4. System calculates: ₦8,000 (pending) + ₦5,000 (new) = ₦13,000 > ₦10,000 (balance)
5. Request 2 rejected with detailed error showing pending total
6. Organizer can wait for Request 1 to be approved, or reduce amount

### Workflow 5: Admin Rejects Payout Request

1. Admin reviews payout request
2. Admin rejects request (e.g., insufficient documentation)
3. Admin adds rejection notes
4. Payout request status updated to `rejected`
5. Wallet balance remains unchanged
6. Organizer can submit new request

### Workflow 6: Admin Completes Manual Transfer

1. Admin approves payout request
2. Wallet debited, Transaction created with `pending` status
3. Admin transfers money manually to organizer's bank account
4. Admin marks transaction as completed: `PATCH /api/admin/withdrawals/<transaction_id>/status/` with `{"status": "completed"}`
5. Transaction status → `completed`
6. PayoutRequest status → `completed` (automatically updated)
7. Both appear in payout transactions list

---

## Security Considerations

1. **Balance Validation:** Wallet balance is checked both when creating request and when approving
2. **Multiple Pending Requests Validation:** Total pending requests are validated to prevent exceeding balance
3. **Duplicate Prevention:** Prevents duplicate requests within 1 hour window
4. **Race Condition Prevention:** Database locks prevent concurrent withdrawals
5. **Admin Authorization:** Only admins can approve/reject requests
6. **Audit Trail:** All admin actions are logged in audit logs
7. **Email Verification:** Emails sent to verified organizer and admin addresses

---

## Error Handling

### Common Errors

1. **Insufficient Balance**
   - Checked at request creation
   - Re-checked at approval (in case balance changed)
   - Returns clear error message with available balance

2. **Multiple Pending Requests Exceed Balance**
   - Validates total pending requests + new amount
   - Returns detailed error with pending total and available balance
   - Helps organizer understand why request was rejected

3. **Duplicate Request**
   - Detects same amount + same bank account within 1 hour
   - Returns clear error message
   - Prevents accidental double-submission

4. **Bank Account Not Configured**
   - Organizer must provide bank details (either saved or in request)
   - Clear error message guides organizer

5. **Invalid Status Updates**
   - Cannot update non-pending requests
   - Clear error messages

---

## Testing Checklist

### Organizer Features
- [ ] Organizer can request payout with saved bank details
- [ ] Organizer can request payout with new bank details
- [ ] Bank details are saved when provided in request
- [ ] Duplicate request prevention works (same request within 1 hour)
- [ ] Multiple pending requests validation works
- [ ] Insufficient balance is caught at request creation
- [ ] Error messages are clear and helpful

### Admin Features
- [ ] Admin can list all payout requests
- [ ] Admin can filter payout requests by status
- [ ] Admin can approve payout request
- [ ] Admin can reject payout request
- [ ] Admin can mark transaction as completed
- [ ] Approved requests debit wallet
- [ ] Approved requests create Transaction record
- [ ] Rejected requests don't debit wallet
- [ ] Transaction completion updates PayoutRequest status
- [ ] Dashboard analytics shows pending count
- [ ] Notifications endpoint returns pending requests

### Validation & Security
- [ ] Insufficient balance is caught at approval
- [ ] Multiple pending requests validation prevents exceeding balance
- [ ] Duplicate requests are prevented
- [ ] Race conditions are prevented (database locks)
- [ ] Only admins can approve/reject requests

### Notifications
- [ ] Email sent to organizer on request
- [ ] Email sent to admin on request
- [ ] Dashboard shows pending count
- [ ] Notifications endpoint works correctly

### Tracking
- [ ] Payout transactions appear in withdrawals list
- [ ] Audit logs created for admin actions
- [ ] Status updates work correctly (pending → approved → completed)

---

## API Summary

### Organizer Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/wallet/withdraw/` | Organizer | Request payout (with duplicate & balance validation) |
| GET | `/wallet/bank-account/` | Organizer | Get bank details |
| POST | `/wallet/bank-account/` | Organizer | Update bank details |

### Admin Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/payout-requests/` | Admin | List payout requests |
| PATCH | `/api/admin/payout-requests/<id>/status/` | Admin | Approve/reject request |
| GET | `/api/admin/withdrawals/` | Admin | View payout transactions |
| PATCH | `/api/admin/withdrawals/<id>/status/` | Admin | Mark transaction as completed |
| GET | `/api/admin/notifications/payout-requests/` | Admin | Get payout request notifications |
| GET | `/api/admin/dashboard/analytics/` | Admin | Dashboard analytics (includes pending count) |

---

## Validation Features

### 1. Duplicate Request Prevention
- Prevents same request (same amount + same bank account) within 1 hour
- Helps prevent accidental double-submission
- Returns clear error message

### 2. Multiple Pending Requests Validation
- Validates total pending requests + new amount don't exceed balance
- Returns detailed error with pending total and available balance
- Helps organizers understand why request was rejected

### 3. Balance Validation
- Checks available balance at request creation
- Re-checks balance at approval (in case it changed)
- Prevents race conditions with database locks

## Admin Notifications

### Dashboard Integration
- Dashboard analytics endpoint includes `pending_payout_requests` count
- Admin can see pending count at a glance
- Cached for 2 minutes for performance

### Notifications Endpoint
- Dedicated endpoint for payout request notifications
- Returns pending count, has_pending flag, and recent 5 requests
- Can be polled periodically for real-time updates
- Useful for showing notification badges in admin UI

## Support

For issues or questions:
- Check audit logs for admin actions
- Review payout request status in admin panel
- Check dashboard analytics for pending count
- Use notifications endpoint for detailed pending requests
- Verify wallet balance matches expectations

---

**Last Updated:** January 19, 2026
**Version:** 2.0.0

**Recent Updates:**
- Removed Paystack integration (manual transfers only)
- Added duplicate request prevention
- Added multiple pending requests validation
- Added admin dashboard notifications
- Updated transaction completion workflow

