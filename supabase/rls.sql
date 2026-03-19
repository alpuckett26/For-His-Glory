-- For His Glory — Row Level Security Policies
-- Run this after schema.sql

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table collections enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table supplier_products enable row level security;
alter table supplier_variants enable row level security;
alter table supplier_orders enable row level security;
alter table bulk_inquiries enable row level security;
alter table contact_messages enable row level security;
alter table webhook_logs enable row level security;
alter table site_settings enable row level security;

-- Helper function to check admin role
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  );
end;
$$ language plpgsql security definer;

-- =====================
-- PROFILES
-- =====================
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select
  using (public.is_admin());

-- =====================
-- COLLECTIONS
-- =====================
create policy "Anyone can view active collections"
  on collections for select
  using (active = true);

create policy "Admins can manage collections"
  on collections for all
  using (public.is_admin());

-- =====================
-- PRODUCTS
-- =====================
create policy "Anyone can view active products"
  on products for select
  using (active = true);

create policy "Admins can manage products"
  on products for all
  using (public.is_admin());

-- =====================
-- PRODUCT VARIANTS
-- =====================
create policy "Anyone can view active variants"
  on product_variants for select
  using (active = true);

create policy "Admins can manage variants"
  on product_variants for all
  using (public.is_admin());

-- =====================
-- PRODUCT IMAGES
-- =====================
create policy "Anyone can view product images"
  on product_images for select
  using (true);

create policy "Admins can manage product images"
  on product_images for all
  using (public.is_admin());

-- =====================
-- ORDERS
-- =====================
create policy "Users can view own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on orders for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Admins can view all orders"
  on orders for all
  using (public.is_admin());

-- =====================
-- ORDER ITEMS
-- =====================
create policy "Users can view own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Admins can manage order items"
  on order_items for all
  using (public.is_admin());

-- =====================
-- SUPPLIER PRODUCTS
-- =====================
create policy "Admins can manage supplier products"
  on supplier_products for all
  using (public.is_admin());

-- =====================
-- SUPPLIER VARIANTS
-- =====================
create policy "Admins can manage supplier variants"
  on supplier_variants for all
  using (public.is_admin());

-- =====================
-- SUPPLIER ORDERS
-- =====================
create policy "Admins can manage supplier orders"
  on supplier_orders for all
  using (public.is_admin());

-- =====================
-- BULK INQUIRIES
-- =====================
create policy "Anyone can submit bulk inquiries"
  on bulk_inquiries for insert
  with check (true);

create policy "Admins can manage bulk inquiries"
  on bulk_inquiries for all
  using (public.is_admin());

-- =====================
-- CONTACT MESSAGES
-- =====================
create policy "Anyone can submit contact messages"
  on contact_messages for insert
  with check (true);

create policy "Admins can manage contact messages"
  on contact_messages for all
  using (public.is_admin());

-- =====================
-- WEBHOOK LOGS
-- =====================
create policy "Admins can manage webhook logs"
  on webhook_logs for all
  using (public.is_admin());

-- =====================
-- SITE SETTINGS
-- =====================
create policy "Anyone can read site settings"
  on site_settings for select
  using (true);

create policy "Admins can manage site settings"
  on site_settings for all
  using (public.is_admin());
