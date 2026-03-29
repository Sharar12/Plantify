# Database Schema & Entity Relationships

The Plantify schema models commerce transactions, multi-role user authentications, and botanical care workflows.

## 🗃 Relational Map
```
users (roles: customer, specialist, admin, delivery)
 ├── orders ── order_items ── plants ── plant_care_guides
 ├── wishlists ── plants
 ├── reviews ── plants
 └── specialist_consultations ── consultation_photos
```

## 📋 Key Constraints
- `plants.category_id`: Foreign key referencing `categories.id` with restrict on delete.
- `orders.delivery_staff_id`: Nullable foreign key referencing `users.id` (where role = 'delivery').
- `specialist_consultations.specialist_id`: Nullable foreign key referencing `users.id` (where role = 'specialist').
