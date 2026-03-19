# For His Glory — Christian Apparel Ecommerce

**Deo Gloria — For His Glory, Worn Daily.**

Premium Christian apparel brand built on Next.js 15, Supabase, Stripe, and Printful.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe Checkout |
| Fulfillment | Printful (print-on-demand) |
| State | Zustand (cart) |
| Forms | React Hook Form + Zod |
| Deployment | Vercel |

---

## Local Development

### Prerequisites
- Node.js 18+
- Supabase CLI
- Stripe CLI (for webhook testing)

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd for-his-glory

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
# Fill in all values (see Environment Variables below)

# 4. Run the development server
npm run dev
```

---

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Navigate to **SQL Editor**
3. Run the schema files in order:

```sql
-- Step 1: Create tables
\i supabase/schema.sql

-- Step 2: Enable RLS policies
\i supabase/rls.sql

-- Step 3: Seed demo data
\i supabase/seed.sql
```

4. Enable **Email Auth** in Authentication > Providers
5. Copy your project URL and anon key to `.env.local`

### Make yourself an admin

After creating an account:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Stripe Setup

1. Create an account at [stripe.com](https://stripe.com)
2. Copy your publishable key and secret key
3. Set up a webhook endpoint at `https://yourdomain.com/api/webhooks/stripe`
4. Add these events to the webhook:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret

**Local webhook testing with Stripe CLI:**

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Printful Setup

1. Create a store at [printful.com](https://printful.com)
2. Go to **Settings > API** and generate an API key
3. Copy your store ID from the dashboard URL
4. Add products in Printful and link them via supplier_products table

**Printful Webhook:**

Add a webhook endpoint in Printful:
- URL: `https://yourdomain.com/api/webhooks/printful`
- Events: `package_shipped`, `order_failed`, `order_updated`

---

## Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# Settings > Environment Variables
```

All environment variables from `.env.example` must be set in Vercel.

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key (server only) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `PRINTFUL_API_KEY` | Printful API key |
| `PRINTFUL_STORE_ID` | Printful store ID |
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g. https://forhisglory.com) |
| `NEXT_PUBLIC_BRAND_NAME` | Brand name |
| `NEXT_PUBLIC_BRAND_TAGLINE` | Brand tagline |

---

## Folder Structure

```
/app                    — Next.js App Router pages
  /api                  — API route handlers
    /checkout           — Stripe checkout creation
    /webhooks           — Stripe + Printful webhooks
  /admin                — Admin dashboard (role-protected)
  /account              — Customer account pages
  /products             — Product detail pages
  /collections          — Collection pages
  /shop                 — Shop with filters
/components             — React components
  /layout               — Navbar, Footer, MobileMenu
  /home                 — Homepage sections
  /shop                 — Product grid, filter, sort
  /product              — Product detail components
  /cart                 — Cart UI
  /admin                — Admin UI components
  /shared               — Shared utility components
/lib                    — Library code
  /supabase             — Supabase clients
  /stripe               — Stripe client + webhooks
  /suppliers            — Supplier adapter pattern
  /store                — Zustand cart store
/hooks                  — Custom React hooks
/types                  — TypeScript type definitions
/supabase               — Database schema + seed files
/public                 — Static assets
```

---

## Adding a New Supplier

The supplier system uses an adapter pattern. To add a new supplier:

1. Create `/lib/suppliers/yoursupplier.ts` implementing `SupplierAdapter`
2. Add it to the registry in `/lib/suppliers/index.ts`
3. Add the supplier to the `check` constraint in `schema.sql`

```typescript
// Example: Implementing the SupplierAdapter interface
export class YourSupplierAdapter implements SupplierAdapter {
  readonly name = 'yoursupplier'

  async createProduct(data: Partial<SupplierProduct>): Promise<SupplierProduct> {
    // Your implementation
  }
  // ... implement remaining methods
}
```

---

## Brand Guidelines

- **Colors:** Ivory `#FAF8F4`, Charcoal `#1C1C1E`, Gold `#B8973A`, Olive `#6B7A5E`, Sage `#A8B59A`
- **Headings:** Cormorant Garamond (serif, editorial)
- **Body:** DM Sans (clean, modern)
- **Aesthetic:** Premium, peaceful, bold in faith — never cheesy or dated

---

*Made for His glory, built with excellence.*
