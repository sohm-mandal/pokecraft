# Pokemon Crochet Shop — Design Spec

**Date:** 2026-08-20  
**Author:** sohamm@zenoti.com  

---

## Context

Soham sells handmade Pokemon crochet figures and has ~10k Instagram followers. The goal is a branded e-commerce site where customers (India-based) can browse, buy, and receive shipped products. Each crochet is handmade so inventory is limited and must be tracked accurately.

**Constraints:** Zero monthly cost. Tech-comfortable owner (can edit config files and deploy from GitHub).

---

## Tech Stack

| Layer | Tool | Cost |
|---|---|---|
| Frontend + API | Next.js 15 (App Router) | Free (Vercel) |
| Hosting | Vercel free tier | ₹0 |
| Database | Neon PostgreSQL (serverless) | ₹0 |
| Payments | Razorpay | ~2% per transaction |
| Email notifications | Resend free tier (3000/month) | ₹0 |
| Images | Stored in repo (`/public/images`) | ₹0 |

---

## Pages

| Route | Purpose |
|---|---|
| `/` | Hero banner + featured products + link to shop |
| `/shop` | Full product grid with stock badges |
| `/shop/[slug]` | Product detail — photos, description, price, stock, Add to Cart |
| `/cart` | Cart contents (localStorage) + proceed to checkout |
| `/checkout` | Shipping + contact form → Razorpay payment |
| `/order/[id]` | Order confirmation shown after successful payment |

---

## Database Schema

### `products`
```sql
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  pokemon_name TEXT NOT NULL,
  description TEXT,
  price       INTEGER NOT NULL,        -- in paise (₹ × 100)
  stock_count INTEGER NOT NULL DEFAULT 0,
  images      TEXT[] NOT NULL DEFAULT '{}'
);
```

### `orders`
```sql
CREATE TYPE order_status AS ENUM ('placed', 'shipped', 'delivered', 'cancelled', 'returned');

CREATE TABLE orders (
  id                   SERIAL PRIMARY KEY,
  razorpay_payment_id  TEXT UNIQUE,
  razorpay_order_id    TEXT,
  buyer_name           TEXT NOT NULL,
  buyer_email          TEXT NOT NULL,
  buyer_phone          TEXT NOT NULL,
  shipping_address     JSONB NOT NULL,   -- {line1, line2, city, state, pincode}
  items                JSONB NOT NULL,   -- [{product_id, name, price, quantity}]
  total_amount         INTEGER NOT NULL, -- in paise
  status               order_status NOT NULL DEFAULT 'placed',
  created_at           TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Stock Rules

| Event | Stock change |
|---|---|
| Payment confirmed (webhook) | Decrement by quantity ordered |
| Order cancelled | Increment back |
| Order returned | Increment back |

Stock decrement happens **only inside the Razorpay webhook handler**, after signature verification — never on checkout form submission. This prevents ghost decrements from failed payments.

---

## Payment & Order Flow

1. User fills checkout form: name, email, phone, shipping address
2. Frontend calls `/api/orders/create` → creates a Razorpay order, returns `order_id`
3. Razorpay modal opens client-side with the `order_id`
4. On payment success, Razorpay fires POST to `/api/webhook/razorpay`
5. Webhook handler:
   - Verifies Razorpay signature (HMAC-SHA256)
   - Saves order to `orders` table
   - Decrements `stock_count` on each ordered product
   - Sends email to seller via Resend with full order details
6. Frontend redirects to `/order/[id]` confirmation page

---

## Products Management

Products are seeded into the DB via a script (`scripts/seed-products.ts`). To add or update a product, edit the seed data and re-run the script. No admin UI needed for 10 products.

---

## Error Handling

- **Out of stock:** `/shop/[slug]` shows "Out of Stock" and disables Add to Cart when `stock_count === 0`
- **Payment failure:** Razorpay modal handles this; user sees failure inline, no order is saved
- **Webhook retry:** Razorpay retries failed webhooks; the handler uses `razorpay_payment_id` as a unique key to prevent duplicate order inserts
- **Race condition on last item:** Stock decrement uses a DB-level check: `UPDATE products SET stock_count = stock_count - 1 WHERE id = $1 AND stock_count > 0 RETURNING id` — if it returns no rows, the webhook rejects and Razorpay refund is triggered

---

## Verification

1. Seed DB with test products, confirm they appear on `/shop`
2. Add item to cart, go to checkout, fill form — confirm Razorpay modal opens
3. Use Razorpay test mode — complete a payment, verify: order in DB, stock decremented, email received
4. Manually set an order to `cancelled` — verify stock increments
5. Set `stock_count = 0` on a product — verify "Out of Stock" shows and checkout is blocked
6. Trigger the same webhook twice (duplicate) — verify only one order is created
