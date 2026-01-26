# Payment Form Management Documentation

## Overview

The Payment Form system handles manual bank transfer payment confirmations for ticket purchases. When users choose manual bank transfer instead of Paystack, they submit a payment confirmation form. Admins can then review and confirm or reject these payment confirmations.

## Architecture

The payment form functionality is integrated into the `ticket` app, as it's directly related to ticket payment processing. The system supports two payment methods:

1. **Paystack** - Automated payment processing via Paystack gateway
2. **Manual Bank Transfer** - Users transfer money manually and submit a confirmation form

## Model Structure

### PaymentForm Model

Located in `radar.ticket.models.PaymentForm`

```python
class PaymentForm(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('rejected', 'Rejected'),
    ]
    
    Firstname = models.CharField(max_length=150)
    Lastname = models.CharField(max_length=200)
    amount_sent = models.FloatField(blank=False)
    sent_at = models.DateTimeField(null=False, blank=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, null=True)
    confirmed_at = models.DateTimeField(blank=True, null=True)
    confirmed_by = models.CharField(max_length=255, blank=True, null=True)
```

### Fields

- **Firstname** (required): Customer's first name
- **Lastname** (required): Customer's last name
- **amount_sent** (required): Amount transferred by customer
- **sent_at** (required): Date and time when payment was sent
- **status** (default: 'pending'): Payment confirmation status
  - `pending`: Awaiting admin review
  - `confirmed`: Admin has confirmed the payment
  - `rejected`: Admin has rejected the payment
- **admin_notes** (optional): Notes added by admin during confirmation/rejection
- **confirmed_at** (auto-set): Timestamp when admin confirmed/rejected
- **confirmed_by** (auto-set): Email of admin who confirmed/rejected

## API Endpoints

### User Endpoints

#### Submit Payment Confirmation Form

**Endpoint:** `POST /tickets/confirm-payment/`

**Authentication:** Not required (public endpoint)

**Request Body:**
```json
{
  "Firstname": "John",
  "Lastname": "Doe",
  "amount_sent": 5000.00,
  "sent_at": "2024-01-15T10:30:00Z"
}
```

**Response (201 Created):**
```json
{
  "message": "Payment confirmation submitted successfully.",
  "data": {
    "Firstname": "John",
    "Lastname": "Doe",
    "amount_sent": 5000.00,
    "sent_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid data.",
  "message": "Form not filled properly.",
  "details": {
    "amount_sent": ["This field is required."]
  }
}
```

**Notes:**
- Users cannot set the `status` field - it defaults to `'pending'`
- The form is automatically created with `status='pending'` for admin review

---

### Admin Endpoints

#### List Payment Forms

**Endpoint:** `GET /api/admin/payment-forms/`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `page_size` (optional, default: 20, max: 100): Items per page
- `status` (optional): Filter by status (`pending`, `confirmed`, `rejected`)
- `date_from` (optional): Filter from date (YYYY-MM-DD)
- `date_to` (optional): Filter to date (YYYY-MM-DD)
- `min_amount` (optional): Minimum amount filter
- `max_amount` (optional): Maximum amount filter

**Example Request:**
```
GET /api/admin/payment-forms/?page=1&page_size=20&status=pending&date_from=2024-01-01
```

**Response (200 OK):**
```json
{
  "payment_forms": [
    {
      "id": 1,
      "Firstname": "John",
      "Lastname": "Doe",
      "amount_sent": 5000.00,
      "sent_at": "2024-01-15T10:30:00Z",
      "status": "pending",
      "admin_notes": null,
      "confirmed_at": null,
      "confirmed_by": null
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 100,
    "page_size": 20,
    "has_next": true,
    "has_previous": false
  },
  "filters": {
    "status": "pending",
    "date_from": "2024-01-01",
    "date_to": null,
    "min_amount": null,
    "max_amount": null
  },
  "message": "Payment forms retrieved successfully"
}
```

---

#### Update Payment Form Status

**Endpoint:** `PATCH /api/admin/payment-forms/<form_id>/status/`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "status": "confirmed",
  "admin_notes": "Payment verified. Bank transfer confirmed."
}
```

**Status Options:**
- `confirmed`: Admin confirms the payment
- `rejected`: Admin rejects the payment

**Response (200 OK):**
```json
{
  "message": "Payment form confirmed successfully",
  "payment_form": {
    "id": 1,
    "Firstname": "John",
    "Lastname": "Doe",
    "amount_sent": 5000.00,
    "sent_at": "2024-01-15T10:30:00Z",
    "status": "confirmed",
    "admin_notes": "Payment verified. Bank transfer confirmed.",
    "confirmed_at": "2024-01-16T14:20:00Z",
    "confirmed_by": "admin@example.com"
  }
}
```

**Error Responses:**

**400 Bad Request - Invalid Status:**
```json
{
  "error": "Invalid status. Must be 'confirmed' or 'rejected'"
}
```

**400 Bad Request - Form Not Found:**
```json
{
  "error": "Payment form with ID 999 not found"
}
```

**Notes:**
- When status is updated, `confirmed_at` is automatically set to current timestamp
- `confirmed_by` is automatically set to the admin's email
- An audit log entry is created for the status change

---

## Status Workflow

```
┌─────────────┐
│   User      │
│  Submits    │
│   Form      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  PENDING    │ ← Default status
│  (Awaiting  │
│   Review)   │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│ CONFIRMED   │   │  REJECTED   │
│ (Admin      │   │  (Admin     │
│  Approved)  │   │  Rejected)  │
└─────────────┘   └─────────────┘
```

### Status Transitions

1. **Pending → Confirmed**
   - Admin verifies payment and confirms
   - `confirmed_at` and `confirmed_by` are set
   - Admin can add notes

2. **Pending → Rejected**
   - Admin rejects the payment (e.g., amount mismatch, no payment found)
   - `confirmed_at` and `confirmed_by` are set
   - Admin should add notes explaining rejection

3. **Confirmed/Rejected → (No further changes)**
   - Once confirmed or rejected, status cannot be changed
   - This ensures audit trail integrity

---

## Integration with Ticket System

### Payment Methods

The ticket booking system supports two payment methods:

1. **Paystack Payment** (`/tickets/book/`)
   - Automatic payment processing
   - Tickets are confirmed immediately upon successful payment
   - No manual intervention required

2. **Manual Bank Transfer** (`/tickets/confirm-payment/`)
   - User books ticket (status: `pending`)
   - User transfers money to bank account
   - User submits payment confirmation form
   - Admin reviews and confirms payment
   - Tickets are then confirmed (status: `confirmed`)

### Workflow Example

```
1. User books ticket → Ticket created with status='pending'
2. User receives payment instructions (bank account details)
3. User transfers money
4. User submits payment form → PaymentForm created with status='pending'
5. Admin reviews payment form
6. Admin confirms payment → PaymentForm status='confirmed'
7. Admin manually confirms ticket → Ticket status='confirmed'
   (or implement automatic ticket confirmation on payment form confirmation)
```

---

## Database Indexes

The `PaymentForm` model includes an index for efficient querying:

```python
indexes = [
    models.Index(fields=['status', '-sent_at'], name='paymentform_status_sent_idx'),
]
```

This index optimizes queries that filter by status and order by sent_at (most recent first).

---

## Admin Features

### Filtering Options

Admins can filter payment forms by:

- **Status**: `pending`, `confirmed`, `rejected`
- **Date Range**: `date_from` and `date_to`
- **Amount Range**: `min_amount` and `max_amount`

### Pagination

All list endpoints support pagination:
- Default: 20 items per page
- Maximum: 100 items per page
- Page numbers start at 1

### Audit Trail

Every status change is logged:
- Admin email who made the change
- Timestamp of the change
- Status before and after
- Optional admin notes

---

## Error Handling

### Common Errors

1. **Invalid Status**
   - Only `confirmed` or `rejected` are allowed for updates
   - `pending` cannot be set manually

2. **Form Not Found**
   - Returns 400 Bad Request with error message

3. **Invalid Parameters**
   - Date format must be YYYY-MM-DD
   - Amounts must be valid numbers
   - Status must be one of the valid choices

---

## Best Practices

### For Users

1. **Submit Accurate Information**
   - Ensure amount matches the ticket price
   - Use correct date/time when payment was sent
   - Double-check name spelling

2. **Submit Promptly**
   - Submit the form as soon as payment is made
   - This helps admins process confirmations faster

### For Admins

1. **Review Thoroughly**
   - Verify payment amount matches ticket price
   - Check bank records for payment confirmation
   - Add notes for any discrepancies

2. **Use Notes Effectively**
   - Add notes when confirming (e.g., "Payment verified in bank statement")
   - Add notes when rejecting (e.g., "Amount mismatch: expected 5000, received 4500")

3. **Filter Efficiently**
   - Use status filter to focus on pending forms
   - Use date filters to review forms from specific periods

---

## Future Enhancements

Potential improvements to consider:

1. **Automatic Ticket Confirmation**
   - When payment form is confirmed, automatically confirm related tickets
   - Link payment forms to specific tickets/booking IDs

2. **Email Notifications**
   - Notify users when payment is confirmed
   - Notify users when payment is rejected (with reason)

3. **Payment Matching**
   - Automatically match payment forms to tickets based on amount and date
   - Suggest matches for admin review

4. **Bulk Operations**
   - Allow admins to confirm/reject multiple forms at once

5. **Payment Receipt Upload**
   - Allow users to upload bank transfer receipt/screenshot
   - Store receipt images for verification

---

## Migration Guide

### Creating Migrations

After model changes, create and apply migrations:

```bash
python manage.py makemigrations ticket
python manage.py migrate
```

### Data Migration (if needed)

If you have existing `PaymentForm` records without status:

```python
# In a data migration
from django.db import migrations

def set_default_status(apps, schema_editor):
    PaymentForm = apps.get_model('ticket', 'PaymentForm')
    PaymentForm.objects.filter(status__isnull=True).update(status='pending')

class Migration(migrations.Migration):
    dependencies = [
        ('ticket', 'XXXX_add_status_to_paymentform'),
    ]

    operations = [
        migrations.RunPython(set_default_status),
    ]
```

---

## API Testing Examples

### cURL Examples

**Submit Payment Form:**
```bash
curl -X POST http://localhost:8000/tickets/confirm-payment/ \
  -H "Content-Type: application/json" \
  -d '{
    "Firstname": "John",
    "Lastname": "Doe",
    "amount_sent": 5000.00,
    "sent_at": "2024-01-15T10:30:00Z"
  }'
```

**List Pending Payment Forms (Admin):**
```bash
curl -X GET "http://localhost:8000/api/admin/payment-forms/?status=pending&page=1" \
  -H "Authorization: Bearer <admin_token>"
```

**Confirm Payment Form (Admin):**
```bash
curl -X PATCH http://localhost:8000/api/admin/payment-forms/1/status/ \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed",
    "admin_notes": "Payment verified in bank statement"
  }'
```

---

## Related Documentation

- [Ticket Booking API](./TICKET_BOOKING.md)
- [Admin API Documentation](./ADMIN_API.md)
- [Payment Service Documentation](./PAYMENT_SERVICE.md)

---

## Support

For issues or questions:
- Check the API error responses for specific error messages
- Review the audit logs for status change history
- Contact the development team for assistance

---

**Last Updated:** 2024-01-16  
**Version:** 1.0.0

