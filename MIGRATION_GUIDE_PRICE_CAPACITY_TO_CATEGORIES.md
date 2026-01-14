# Migration Guide: Event Price & Capacity → Ticket Categories

## Overview

We've migrated from **event-level pricing and capacity** to **category-level pricing and capacity**. This is a **breaking change** that requires frontend updates.

### What Changed

**Before:**
- Events had `price` and `capacity` fields directly
- Tickets could be booked without specifying a category (used event default price)
- Capacity was validated at the event level

**After:**
- Events **no longer have** `price` or `capacity` fields
- **All events must have at least one ticket category**
- Tickets **must** specify a category when booking
- Pricing and capacity are now managed at the category level

---

## Key Changes Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Event Price** | `event.price` (required) | Removed - use `category.price` |
| **Event Capacity** | `event.capacity` (optional) | Removed - use `category.max_tickets` |
| **Ticket Booking** | `category_name` optional | `category_name` **REQUIRED** |
| **Event Creation** | Include `price` and `capacity` | Remove these fields, create categories separately |
| **Display Price** | `event.price` | Calculate min price from `event.ticket_categories` |

---

## Affected Endpoints

### 1. Create Event (`POST /event/`)

#### ❌ REMOVED Fields
```json
{
  "price": 5000.00,        // ❌ REMOVED
  "capacity": 100          // ❌ REMOVED
}
```

#### ✅ New Flow
1. **Create event** without `price` or `capacity`
2. **Create ticket categories** using `POST /tickets/categories/` endpoint
3. Each category has its own `price` and `max_tickets`

**Example:**
```javascript
// Step 1: Create event
const eventData = {
  name: 'Tech Conference 2024',
  description: 'Annual tech conference',
  pricing_type: 'paid',  // or 'free'
  event_type: 'tech',
  location: 'OAU Campus',
  date: '2024-12-15T10:00:00Z',
  max_quantity_per_booking: 5,
  // NO price or capacity fields
};

const eventResponse = await fetch('/event/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData, // FormData with eventData
});

const event = await eventResponse.json();

// Step 2: Create categories
const categories = [
  {
    event_id: event.event_id,
    name: 'Early Bird',
    price: 4000.00,
    max_tickets: 50,
    is_active: true
  },
  {
    event_id: event.event_id,
    name: 'General',
    price: 5000.00,
    max_tickets: 100,
    is_active: true
  },
  {
    event_id: event.event_id,
    name: 'VIP',
    price: 10000.00,
    max_tickets: 20,
    is_active: true
  }
];

for (const category of categories) {
  await fetch('/tickets/categories/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  });
}
```

---

### 2. Get Event Details (`GET /event/{event_id}/`)

#### Response Changes

**Before:**
```json
{
  "event_id": "event:TE-12345",
  "name": "Tech Conference",
  "price": 5000.00,           // ❌ REMOVED
  "capacity": 100,            // ❌ REMOVED
  "ticket_categories": [...]
}
```

**After:**
```json
{
  "event_id": "event:TE-12345",
  "name": "Tech Conference",
  "pricing_type": "paid",
  "ticket_categories": [
    {
      "category_id": "category:ABC-12345",
      "name": "Early Bird",
      "price": "4000.00",
      "max_tickets": 50,
      "is_active": true,
      "tickets_sold": 25,
      "available_tickets": 25,
      "is_sold_out": false
    },
    {
      "category_id": "category:XYZ-67890",
      "name": "General",
      "price": "5000.00",
      "max_tickets": 100,
      "is_active": true,
      "tickets_sold": 60,
      "available_tickets": 40,
      "is_sold_out": false
    }
  ]
}
```

#### Frontend Updates Needed

1. **Remove price/capacity display** from event details
2. **Display categories** with their prices and availability
3. **Calculate display price** as minimum category price:
   ```javascript
   const minPrice = Math.min(...event.ticket_categories.map(c => parseFloat(c.price)));
   ```
4. **Calculate total capacity** as sum of category capacities:
   ```javascript
   const totalCapacity = event.ticket_categories
     .filter(c => c.max_tickets !== null)
     .reduce((sum, c) => sum + c.max_tickets, 0);
   ```

---

### 3. List Events (`GET /event/`)

#### Response Changes

**Before:**
```json
[
  {
    "event_id": "event:TE-12345",
    "event_name": "Tech Conference",
    "event_price": 5000.00,    // ❌ REMOVED
    "event_location": "OAU Campus",
    "event_date": "2024-12-15T10:00:00Z"
  }
]
```

**After:**
```json
[
  {
    "event_id": "event:TE-12345",
    "event_name": "Tech Conference",
    "event_price": 4000.00,    // ✅ Minimum from categories (for display)
    "event_location": "OAU Campus",
    "event_date": "2024-12-15T10:00:00Z",
    "pricing_type": "paid"
  }
]
```

**Note:** `event_price` is now calculated as the **minimum price** from all active categories. This is for display purposes only.

#### Frontend Updates Needed

- **Display logic remains the same** - `event_price` still exists but is calculated from categories
- Consider showing price range: "From ₦4,000" or "₦4,000 - ₦10,000"

---

### 4. Book Ticket (`POST /tickets/book/`)

#### ⚠️ BREAKING CHANGE: `category_name` is now REQUIRED

**Before:**
```json
{
  "event_id": "event:TE-12345",
  "category_name": "Early Bird",  // Optional
  "quantity": 2
}
```

**After:**
```json
{
  "event_id": "event:TE-12345",
  "category_name": "Early Bird",  // ✅ REQUIRED - cannot be omitted
  "quantity": 2
}
```

#### Error Response (if category_name missing)
```json
{
  "error": "category_name is required. Events must have ticket categories."
}
```

#### Frontend Updates Needed

1. **Always require category selection** before booking
2. **Show category selector** with prices and availability:
   ```javascript
   // Get categories from event details
   const categories = event.ticket_categories.filter(c => c.is_active);
   
   // Display selector
   <select name="category_name" required>
     {categories.map(cat => (
       <option value={cat.name} disabled={cat.is_sold_out}>
         {cat.name} - ₦{cat.price} 
         {cat.available_tickets !== null && ` (${cat.available_tickets} left)`}
       </option>
     ))}
   </select>
   ```
3. **Validate category availability** before submitting
4. **Show error** if category is sold out or invalid

---

### 5. Get Ticket Categories (`GET /tickets/categories/?event_id={event_id}`)

#### No Changes - This endpoint works the same

**Response:**
```json
[
  {
    "category_id": "category:ABC-12345",
    "event_id": "event:TE-12345",
    "event_name": "Tech Conference",
    "name": "Early Bird",
    "price": "4000.00",
    "max_tickets": 50,
    "is_active": true,
    "tickets_sold": 25,
    "available_tickets": 25,
    "is_sold_out": false,
    "description": "Early bird pricing",
    "created_at": "2024-12-01T10:00:00Z",
    "updated_at": "2024-12-01T10:00:00Z"
  }
]
```

---

### 6. Organizer Events (`GET /event/organizer/events/`)

#### Response Changes

**Before:**
```json
{
  "events": [
    {
      "event_id": "event:TE-12345",
      "name": "Tech Conference",
      "price": 5000.00,        // ❌ REMOVED
      "capacity": 100,          // ❌ REMOVED
      "ticket_stats": {
        "available_spots": 50
      }
    }
  ]
}
```

**After:**
```json
{
  "events": [
    {
      "event_id": "event:TE-12345",
      "name": "Tech Conference",
      "ticket_stats": {
        "total_tickets": 85,
        "confirmed_tickets": 80,
        "pending_tickets": 5,
        "total_revenue": 400000.00,
        "available_spots": 90  // Calculated from categories
      }
    }
  ]
}
```

#### Frontend Updates Needed

- **Remove price/capacity** from organizer dashboard
- **Use `ticket_stats.available_spots`** for capacity display (calculated from categories)
- **Display revenue** from `ticket_stats.total_revenue`

---

### 7. Analytics Endpoints

#### Global Analytics (`GET /analytics/global/`)

**No changes** - Revenue calculations remain the same (based on ticket prices)

#### Event Analytics (`GET /analytics/event/?event_id={event_id}`)

**Response Changes:**

**Before:**
```json
{
  "analytics": {
    "event_info": {
      "event_id": "event:TE-12345",
      "price_per_ticket": 5000.00,  // ❌ REMOVED
      "capacity": 100                // ❌ REMOVED
    },
    "statistics": {
      "available_spots": 50
    }
  }
}
```

**After:**
```json
{
  "analytics": {
    "event_info": {
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference",
      "pricing_type": "paid",
      "status": "verified"
      // No price_per_ticket or capacity
    },
    "statistics": {
      "total_tickets_sold": 80,
      "total_revenue": 400000.00,
      "available_spots": 90  // Calculated from categories
    },
    "tickets_list": [
      {
        "ticket_id": "ticket:TC-12345",
        "category_name": "Early Bird",
        "price_per_ticket": 4000.00,  // From category
        "total_price": 4000.00
      }
    ]
  }
}
```

#### Frontend Updates Needed

- **Remove price/capacity** from event info display
- **Show category breakdown** in tickets list
- **Use `available_spots`** from statistics (calculated from categories)

---

### 8. Admin Endpoints

#### Recent Events (`GET /api/admin/dashboard/recent-events/`)

**Response:**
```json
{
  "events": [
    {
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference",
      "price": 4000.00,  // Minimum from categories (for display)
      "created_at": "2024-12-01T10:00:00Z"
    }
  ]
}
```

**Note:** `price` is calculated as minimum from categories - display logic remains the same.

#### All Events (`GET /api/admin/events/`)

**Response:**
```json
{
  "events": [
    {
      "event_id": "event:TE-12345",
      "event_name": "Tech Conference",
      "price": 4000.00,      // Minimum from categories
      "capacity": 170,       // Sum of category max_tickets
      "created_at": "2024-12-01T10:00:00Z"
    }
  ]
}
```

**Note:** Both `price` and `capacity` are calculated from categories - display logic remains the same.

---

## Frontend Migration Checklist

### ✅ Required Changes

- [ ] **Event Creation Form**
  - Remove `price` and `capacity` input fields
  - Add category creation step after event creation
  - Validate that at least one category is created

- [ ] **Ticket Booking Form**
  - Make `category_name` field **required**
  - Add category selector dropdown
  - Show category prices and availability
  - Validate category availability before booking

- [ ] **Event Details Page**
  - Remove direct price/capacity display
  - Display categories with prices
  - Show price range: "From ₦X" or "₦X - ₦Y"
  - Calculate and display total capacity from categories

- [ ] **Event List/Cards**
  - Update to use calculated `event_price` (minimum from categories)
  - Consider showing price range instead of single price

- [ ] **Organizer Dashboard**
  - Remove price/capacity columns from event tables
  - Use `ticket_stats.available_spots` for capacity display
  - Show category breakdown in event details

- [ ] **Analytics Pages**
  - Remove price/capacity from event info
  - Show category breakdown in ticket lists
  - Use calculated `available_spots` from statistics

### ✅ Optional Improvements

- [ ] **Category Management UI**
  - Add category creation/editing interface
  - Show category availability in real-time
  - Allow organizers to activate/deactivate categories

- [ ] **Price Display**
  - Show price range: "₦4,000 - ₦10,000"
  - Highlight cheapest category: "From ₦4,000"
  - Show category-specific pricing in booking flow

- [ ] **Capacity Display**
  - Show per-category availability
  - Calculate and display total event capacity
  - Show "X of Y tickets sold" per category

---

## Example Frontend Code Updates

### Event Creation

```javascript
// ❌ OLD WAY
const createEvent = async (eventData) => {
  const formData = new FormData();
  formData.append('name', eventData.name);
  formData.append('price', eventData.price);        // ❌ REMOVE
  formData.append('capacity', eventData.capacity);  // ❌ REMOVE
  // ... other fields
  
  const response = await fetch('/event/', {
    method: 'POST',
    body: formData
  });
  return response.json();
};

// ✅ NEW WAY
const createEvent = async (eventData) => {
  const formData = new FormData();
  formData.append('name', eventData.name);
  // NO price or capacity fields
  // ... other fields
  
  const eventResponse = await fetch('/event/', {
    method: 'POST',
    body: formData
  });
  const event = await eventResponse.json();
  
  // Create categories
  for (const category of eventData.categories) {
    await fetch('/tickets/categories/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        event_id: event.event_id,
        name: category.name,
        price: category.price,
        max_tickets: category.max_tickets,
        is_active: true
      })
    });
  }
  
  return event;
};
```

### Ticket Booking

```javascript
// ❌ OLD WAY
const bookTicket = async (eventId, quantity) => {
  const response = await fetch('/tickets/book/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      event_id: eventId,
      category_name: categoryName,  // Optional
      quantity: quantity
    })
  });
  return response.json();
};

// ✅ NEW WAY
const bookTicket = async (eventId, categoryName, quantity) => {
  // Validate categoryName is provided
  if (!categoryName) {
    throw new Error('Category name is required');
  }
  
  const response = await fetch('/tickets/book/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      event_id: eventId,
      category_name: categoryName,  // ✅ REQUIRED
      quantity: quantity
    })
  });
  return response.json();
};
```

### Display Event Price

```javascript
// ❌ OLD WAY
const EventCard = ({ event }) => {
  return (
    <div>
      <h3>{event.event_name}</h3>
      <p>Price: ₦{event.price}</p>  {/* ❌ event.price doesn't exist */}
    </div>
  );
};

// ✅ NEW WAY
const EventCard = ({ event }) => {
  // Calculate min price from categories
  const minPrice = event.ticket_categories && event.ticket_categories.length > 0
    ? Math.min(...event.ticket_categories
        .filter(c => c.is_active)
        .map(c => parseFloat(c.price)))
    : 0;
  
  // Or use event_price if available (calculated by backend)
  const displayPrice = event.event_price || minPrice;
  
  return (
    <div>
      <h3>{event.event_name}</h3>
      <p>From ₦{displayPrice.toLocaleString()}</p>
    </div>
  );
};
```

---

## Backward Compatibility

### Migration Strategy

The backend migration automatically:
1. Creates default "General" categories for existing events
2. Migrates existing tickets to reference these categories
3. Preserves existing data

### Existing Events

- All existing events will have a "General" category created
- Existing tickets will be linked to this category
- No data loss occurs

### API Compatibility

- **Event list endpoints** still return `event_price` (calculated from categories)
- **Admin endpoints** still return `price` and `capacity` (calculated from categories)
- **Display logic** can remain mostly the same for read-only operations

---

## Testing Checklist

### Event Creation
- [ ] Create event without price/capacity
- [ ] Create categories for the event
- [ ] Verify event appears in list with calculated price

### Ticket Booking
- [ ] Book ticket with category_name (should succeed)
- [ ] Book ticket without category_name (should fail with error)
- [ ] Book ticket with invalid category (should fail)
- [ ] Book ticket when category is sold out (should fail)

### Display
- [ ] Event list shows calculated prices
- [ ] Event details show categories
- [ ] Booking form requires category selection
- [ ] Analytics show category breakdown

---

## Support

If you encounter any issues during migration, please:
1. Check this guide first
2. Review the API documentation: `API_COMPLETE_DOCUMENTATION.md`
3. Contact the backend team

---

## Summary

**Key Takeaways:**
1. ✅ Events no longer have `price` or `capacity` fields
2. ✅ All events must have ticket categories
3. ✅ `category_name` is **required** when booking tickets
4. ✅ Price/capacity are calculated from categories for display
5. ✅ Existing events are automatically migrated with default categories

**Priority Updates:**
1. **HIGH**: Update ticket booking to require `category_name`
2. **HIGH**: Update event creation to remove `price`/`capacity` fields
3. **MEDIUM**: Update event display to show categories
4. **LOW**: Update analytics to show category breakdown

