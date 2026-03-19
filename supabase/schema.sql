-- For His Glory — Supabase Schema
-- Run this in your Supabase SQL editor

-- Profiles (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'customer' check (role in ('customer', 'admin', 'super_admin')),
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Collections
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  featured boolean default false,
  active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  long_description text,
  brand_message text,
  price decimal(10,2) not null,
  compare_at_price decimal(10,2),
  collection_id uuid references collections(id),
  featured boolean default false,
  active boolean default true,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Product Variants
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  size text,
  color text,
  color_hex text,
  sku text,
  price decimal(10,2),
  inventory_count int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- Product Images
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order int default 0,
  is_primary boolean default false,
  created_at timestamptz default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  stripe_payment_intent_id text unique,
  stripe_session_id text,
  status text default 'pending' check (status in ('pending','paid','processing','fulfilled','shipped','delivered','cancelled','refunded')),
  subtotal decimal(10,2),
  shipping decimal(10,2) default 0,
  tax decimal(10,2) default 0,
  total decimal(10,2),
  shipping_address jsonb,
  email text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order Items
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  variant_id uuid references product_variants(id),
  quantity int not null,
  unit_price decimal(10,2) not null,
  title text,
  size text,
  color text,
  created_at timestamptz default now()
);

-- Supplier Products
create table if not exists supplier_products (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  supplier text not null check (supplier in ('printful','printify','apliiq','gelato')),
  supplier_product_id text not null,
  supplier_data jsonb,
  synced_at timestamptz,
  created_at timestamptz default now()
);

-- Supplier Variants
create table if not exists supplier_variants (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid references product_variants(id) on delete cascade,
  supplier text not null,
  supplier_variant_id text not null,
  supplier_data jsonb,
  created_at timestamptz default now()
);

-- Supplier Orders
create table if not exists supplier_orders (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  supplier text not null,
  supplier_order_id text,
  status text default 'pending',
  tracking_number text,
  tracking_url text,
  error_message text,
  retry_count int default 0,
  last_attempted_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bulk Inquiries
create table if not exists bulk_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  organization text,
  phone text,
  inquiry_type text check (inquiry_type in ('church','ministry','conference','youth_group','event','family_reunion','other')),
  quantity_estimate int,
  shirt_type text,
  timeline text,
  artwork_url text,
  notes text,
  status text default 'new' check (status in ('new','reviewing','quoted','confirmed','completed','declined')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contact Messages
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text default 'unread' check (status in ('unread','read','replied')),
  created_at timestamptz default now()
);

-- Webhook Logs
create table if not exists webhook_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('stripe','printful','printify','apliiq','gelato')),
  event_type text,
  payload jsonb,
  processed boolean default false,
  error_message text,
  created_at timestamptz default now()
);

-- Site Settings
create table if not exists site_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_products_collection_id on products(collection_id);
create index if not exists idx_products_active on products(active);
create index if not exists idx_products_featured on products(featured);
create index if not exists idx_product_variants_product_id on product_variants(product_id);
create index if not exists idx_product_images_product_id on product_images(product_id);
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_supplier_orders_order_id on supplier_orders(order_id);
create index if not exists idx_bulk_inquiries_status on bulk_inquiries(status);
create index if not exists idx_contact_messages_status on contact_messages(status);
