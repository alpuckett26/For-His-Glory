-- For His Glory — Seed Data
-- Run this after schema.sql and rls.sql

-- =====================
-- COLLECTIONS
-- =====================
insert into collections (id, name, slug, description, featured, active, sort_order) values
  (
    'a1b2c3d4-0001-0000-0000-000000000001',
    'Faith Over Fear',
    'faith-over-fear',
    'Wear your faith boldly. When fear knocks, let faith answer the door. This collection is for those who choose trust over worry, every single day.',
    true,
    true,
    1
  ),
  (
    'a1b2c3d4-0002-0000-0000-000000000002',
    'Grace & Truth',
    'grace-and-truth',
    'Rooted in the Word, wrapped in grace. These pieces carry the weight of truth and the lightness of grace in every thread.',
    true,
    true,
    2
  ),
  (
    'a1b2c3d4-0003-0000-0000-000000000003',
    'Prayer Changes Things',
    'prayer-changes-things',
    'Before the plan. Before the panic. This collection is a reminder to seek first — in every season, every struggle, every blessing.',
    true,
    true,
    3
  ),
  (
    'a1b2c3d4-0004-0000-0000-000000000004',
    'Kingdom Mindset',
    'kingdom-mindset',
    'You were made with purpose and called with intention. This collection speaks to those walking in their God-given identity.',
    true,
    true,
    4
  ),
  (
    'a1b2c3d4-0005-0000-0000-000000000005',
    'Church & Ministry',
    'church-ministry',
    'For the churches, ministries, and movements making a difference. Perfect for events, volunteer teams, and youth groups.',
    false,
    true,
    5
  );

-- =====================
-- PRODUCTS
-- =====================
insert into products (id, title, slug, description, long_description, brand_message, price, compare_at_price, collection_id, featured, active, tags) values
  (
    'b1c2d3e4-0001-0000-0000-000000000001',
    'Faith Over Fear Tee',
    'faith-over-fear-tee',
    'Premium heavyweight tee. Designed for the one who chooses faith when fear knocks.',
    'Crafted from 100% ring-spun cotton, this heavyweight tee is built for the long haul — just like your faith. The relaxed, vintage-inspired fit feels broken-in from day one, while the bold ''Faith Over Fear'' graphic speaks without saying a word. Wear it as a conversation starter, a daily reminder, or a declaration to yourself.',
    'Fear has no hold on those who walk in faith.',
    34.99,
    42.00,
    'a1b2c3d4-0001-0000-0000-000000000001',
    true,
    true,
    ARRAY['faith', 'bestseller', 'heavyweight', 'tee']
  ),
  (
    'b1c2d3e4-0002-0000-0000-000000000002',
    'Grace Wins Tee',
    'grace-wins-tee',
    'A soft, lived-in tee for the one who knows grace always has the final word.',
    'Every time. Without fail. This vintage-washed tee carries a message that is both a declaration and a comfort. Made from a premium cotton blend with a garment-washed finish for instant softness. The minimalist typographic design lets the message do the speaking.',
    'Every time. Without fail. Grace wins.',
    34.99,
    null,
    'a1b2c3d4-0002-0000-0000-000000000002',
    true,
    true,
    ARRAY['grace', 'truth', 'vintage', 'tee']
  ),
  (
    'b1c2d3e4-0003-0000-0000-000000000003',
    'Pray First Tee',
    'pray-first-tee',
    'A daily reminder stitched in cotton: prayer first, everything else second.',
    'Before the to-do list. Before the stress. Before the panic sets in. Pray first. This simple two-word command carries the weight of a thousand answered prayers. This natural-tone tee pairs effortlessly with everything in your wardrobe while carrying a message that changes how you start every day.',
    'Before the plan. Before the panic. Pray first.',
    32.99,
    null,
    'a1b2c3d4-0003-0000-0000-000000000003',
    true,
    true,
    ARRAY['prayer', 'faith', 'daily', 'tee']
  ),
  (
    'b1c2d3e4-0004-0000-0000-000000000004',
    'Made With Purpose Tee',
    'made-with-purpose-tee',
    'For those walking in their God-given identity and refusing to settle for less.',
    'You were not an accident. You were architected. This tee speaks to the one who is stepping into purpose, shedding self-doubt, and choosing to walk in the fullness of who God designed them to be. Clean lines, editorial typography, and a fit that feels intentional — because you are.',
    'You were not an accident. You were architected.',
    34.99,
    null,
    'a1b2c3d4-0004-0000-0000-000000000004',
    true,
    true,
    ARRAY['purpose', 'identity', 'kingdom', 'tee']
  ),
  (
    'b1c2d3e4-0005-0000-0000-000000000005',
    'Peace Be Still Tee',
    'peace-be-still-tee',
    'Three words that stopped a storm. Let them quiet yours.',
    'In the middle of the chaos, the deadline, the diagnosis, the unknown — He still speaks. Peace. Be. Still. This garment-dyed tee carries those three words in a clean, understated design that works as a reminder and a witness. Soft, breathable, and made for every season of life.',
    'Three words that stopped a storm. Let them still yours.',
    34.99,
    null,
    'a1b2c3d4-0002-0000-0000-000000000002',
    false,
    true,
    ARRAY['peace', 'grace', 'calm', 'tee']
  );

-- =====================
-- PRODUCT VARIANTS
-- =====================
-- Faith Over Fear Tee variants
insert into product_variants (product_id, size, color, color_hex, sku, price, inventory_count) values
  ('b1c2d3e4-0001-0000-0000-000000000001', 'S', 'Vintage Black', '#2D2D2D', 'FOF-BLK-S', 34.99, 25),
  ('b1c2d3e4-0001-0000-0000-000000000001', 'M', 'Vintage Black', '#2D2D2D', 'FOF-BLK-M', 34.99, 50),
  ('b1c2d3e4-0001-0000-0000-000000000001', 'L', 'Vintage Black', '#2D2D2D', 'FOF-BLK-L', 34.99, 50),
  ('b1c2d3e4-0001-0000-0000-000000000001', 'XL', 'Vintage Black', '#2D2D2D', 'FOF-BLK-XL', 34.99, 30),
  ('b1c2d3e4-0001-0000-0000-000000000001', '2XL', 'Vintage Black', '#2D2D2D', 'FOF-BLK-2XL', 34.99, 20),
  ('b1c2d3e4-0001-0000-0000-000000000001', 'S', 'Ivory', '#FAF8F4', 'FOF-IVY-S', 34.99, 20),
  ('b1c2d3e4-0001-0000-0000-000000000001', 'M', 'Ivory', '#FAF8F4', 'FOF-IVY-M', 34.99, 40),
  ('b1c2d3e4-0001-0000-0000-000000000001', 'L', 'Ivory', '#FAF8F4', 'FOF-IVY-L', 34.99, 40),
  ('b1c2d3e4-0001-0000-0000-000000000001', 'XL', 'Ivory', '#FAF8F4', 'FOF-IVY-XL', 34.99, 25),
  ('b1c2d3e4-0001-0000-0000-000000000001', '2XL', 'Ivory', '#FAF8F4', 'FOF-IVY-2XL', 34.99, 15),
  ('b1c2d3e4-0001-0000-0000-000000000001', 'S', 'Washed Olive', '#6B7A5E', 'FOF-OLV-S', 34.99, 15),
  ('b1c2d3e4-0001-0000-0000-000000000001', 'M', 'Washed Olive', '#6B7A5E', 'FOF-OLV-M', 34.99, 30),
  ('b1c2d3e4-0001-0000-0000-000000000001', 'L', 'Washed Olive', '#6B7A5E', 'FOF-OLV-L', 34.99, 30),
  ('b1c2d3e4-0001-0000-0000-000000000001', 'XL', 'Washed Olive', '#6B7A5E', 'FOF-OLV-XL', 34.99, 20),
  ('b1c2d3e4-0001-0000-0000-000000000001', '2XL', 'Washed Olive', '#6B7A5E', 'FOF-OLV-2XL', 34.99, 10);

-- Grace Wins Tee variants
insert into product_variants (product_id, size, color, color_hex, sku, price, inventory_count) values
  ('b1c2d3e4-0002-0000-0000-000000000002', 'S', 'Washed Cream', '#F5F0E8', 'GW-CRM-S', 34.99, 20),
  ('b1c2d3e4-0002-0000-0000-000000000002', 'M', 'Washed Cream', '#F5F0E8', 'GW-CRM-M', 34.99, 40),
  ('b1c2d3e4-0002-0000-0000-000000000002', 'L', 'Washed Cream', '#F5F0E8', 'GW-CRM-L', 34.99, 40),
  ('b1c2d3e4-0002-0000-0000-000000000002', 'XL', 'Washed Cream', '#F5F0E8', 'GW-CRM-XL', 34.99, 25),
  ('b1c2d3e4-0002-0000-0000-000000000002', 'S', 'Faded Charcoal', '#4A4A4A', 'GW-CHR-S', 34.99, 20),
  ('b1c2d3e4-0002-0000-0000-000000000002', 'M', 'Faded Charcoal', '#4A4A4A', 'GW-CHR-M', 34.99, 40),
  ('b1c2d3e4-0002-0000-0000-000000000002', 'L', 'Faded Charcoal', '#4A4A4A', 'GW-CHR-L', 34.99, 40),
  ('b1c2d3e4-0002-0000-0000-000000000002', 'XL', 'Faded Charcoal', '#4A4A4A', 'GW-CHR-XL', 34.99, 25),
  ('b1c2d3e4-0002-0000-0000-000000000002', 'S', 'Dusty Rose', '#C9A0A0', 'GW-RSE-S', 34.99, 20),
  ('b1c2d3e4-0002-0000-0000-000000000002', 'M', 'Dusty Rose', '#C9A0A0', 'GW-RSE-M', 34.99, 35),
  ('b1c2d3e4-0002-0000-0000-000000000002', 'L', 'Dusty Rose', '#C9A0A0', 'GW-RSE-L', 34.99, 30),
  ('b1c2d3e4-0002-0000-0000-000000000002', 'XL', 'Dusty Rose', '#C9A0A0', 'GW-RSE-XL', 34.99, 20);

-- Pray First Tee variants
insert into product_variants (product_id, size, color, color_hex, sku, price, inventory_count) values
  ('b1c2d3e4-0003-0000-0000-000000000003', 'S', 'Natural', '#E8E0D0', 'PF-NAT-S', 32.99, 20),
  ('b1c2d3e4-0003-0000-0000-000000000003', 'M', 'Natural', '#E8E0D0', 'PF-NAT-M', 32.99, 40),
  ('b1c2d3e4-0003-0000-0000-000000000003', 'L', 'Natural', '#E8E0D0', 'PF-NAT-L', 32.99, 40),
  ('b1c2d3e4-0003-0000-0000-000000000003', 'XL', 'Natural', '#E8E0D0', 'PF-NAT-XL', 32.99, 25),
  ('b1c2d3e4-0003-0000-0000-000000000003', 'S', 'Slate Blue', '#7B9BB5', 'PF-SLT-S', 32.99, 15),
  ('b1c2d3e4-0003-0000-0000-000000000003', 'M', 'Slate Blue', '#7B9BB5', 'PF-SLT-M', 32.99, 30),
  ('b1c2d3e4-0003-0000-0000-000000000003', 'L', 'Slate Blue', '#7B9BB5', 'PF-SLT-L', 32.99, 30),
  ('b1c2d3e4-0003-0000-0000-000000000003', 'XL', 'Slate Blue', '#7B9BB5', 'PF-SLT-XL', 32.99, 20),
  ('b1c2d3e4-0003-0000-0000-000000000003', 'S', 'Charcoal', '#1C1C1E', 'PF-CHR-S', 32.99, 15),
  ('b1c2d3e4-0003-0000-0000-000000000003', 'M', 'Charcoal', '#1C1C1E', 'PF-CHR-M', 32.99, 30),
  ('b1c2d3e4-0003-0000-0000-000000000003', 'L', 'Charcoal', '#1C1C1E', 'PF-CHR-L', 32.99, 30),
  ('b1c2d3e4-0003-0000-0000-000000000003', 'XL', 'Charcoal', '#1C1C1E', 'PF-CHR-XL', 32.99, 20);

-- Made With Purpose Tee variants
insert into product_variants (product_id, size, color, color_hex, sku, price, inventory_count) values
  ('b1c2d3e4-0004-0000-0000-000000000004', 'S', 'Ivory', '#FAF8F4', 'MWP-IVY-S', 34.99, 20),
  ('b1c2d3e4-0004-0000-0000-000000000004', 'M', 'Ivory', '#FAF8F4', 'MWP-IVY-M', 34.99, 40),
  ('b1c2d3e4-0004-0000-0000-000000000004', 'L', 'Ivory', '#FAF8F4', 'MWP-IVY-L', 34.99, 40),
  ('b1c2d3e4-0004-0000-0000-000000000004', 'XL', 'Ivory', '#FAF8F4', 'MWP-IVY-XL', 34.99, 25),
  ('b1c2d3e4-0004-0000-0000-000000000004', 'S', 'Washed Black', '#2D2D2D', 'MWP-BLK-S', 34.99, 20),
  ('b1c2d3e4-0004-0000-0000-000000000004', 'M', 'Washed Black', '#2D2D2D', 'MWP-BLK-M', 34.99, 40),
  ('b1c2d3e4-0004-0000-0000-000000000004', 'L', 'Washed Black', '#2D2D2D', 'MWP-BLK-L', 34.99, 40),
  ('b1c2d3e4-0004-0000-0000-000000000004', 'XL', 'Washed Black', '#2D2D2D', 'MWP-BLK-XL', 34.99, 25),
  ('b1c2d3e4-0004-0000-0000-000000000004', 'S', 'Earth Tan', '#C4A882', 'MWP-TAN-S', 34.99, 15),
  ('b1c2d3e4-0004-0000-0000-000000000004', 'M', 'Earth Tan', '#C4A882', 'MWP-TAN-M', 34.99, 30),
  ('b1c2d3e4-0004-0000-0000-000000000004', 'L', 'Earth Tan', '#C4A882', 'MWP-TAN-L', 34.99, 30),
  ('b1c2d3e4-0004-0000-0000-000000000004', 'XL', 'Earth Tan', '#C4A882', 'MWP-TAN-XL', 34.99, 20);

-- Peace Be Still Tee variants
insert into product_variants (product_id, size, color, color_hex, sku, price, inventory_count) values
  ('b1c2d3e4-0005-0000-0000-000000000005', 'S', 'Seafoam', '#9EC8C0', 'PBS-SFM-S', 34.99, 15),
  ('b1c2d3e4-0005-0000-0000-000000000005', 'M', 'Seafoam', '#9EC8C0', 'PBS-SFM-M', 34.99, 30),
  ('b1c2d3e4-0005-0000-0000-000000000005', 'L', 'Seafoam', '#9EC8C0', 'PBS-SFM-L', 34.99, 30),
  ('b1c2d3e4-0005-0000-0000-000000000005', 'XL', 'Seafoam', '#9EC8C0', 'PBS-SFM-XL', 34.99, 20),
  ('b1c2d3e4-0005-0000-0000-000000000005', 'S', 'Vintage White', '#F8F5EE', 'PBS-WHT-S', 34.99, 20),
  ('b1c2d3e4-0005-0000-0000-000000000005', 'M', 'Vintage White', '#F8F5EE', 'PBS-WHT-M', 34.99, 35),
  ('b1c2d3e4-0005-0000-0000-000000000005', 'L', 'Vintage White', '#F8F5EE', 'PBS-WHT-L', 34.99, 35),
  ('b1c2d3e4-0005-0000-0000-000000000005', 'XL', 'Vintage White', '#F8F5EE', 'PBS-WHT-XL', 34.99, 20),
  ('b1c2d3e4-0005-0000-0000-000000000005', 'S', 'Charcoal', '#1C1C1E', 'PBS-CHR-S', 34.99, 15),
  ('b1c2d3e4-0005-0000-0000-000000000005', 'M', 'Charcoal', '#1C1C1E', 'PBS-CHR-M', 34.99, 30),
  ('b1c2d3e4-0005-0000-0000-000000000005', 'L', 'Charcoal', '#1C1C1E', 'PBS-CHR-L', 34.99, 30),
  ('b1c2d3e4-0005-0000-0000-000000000005', 'XL', 'Charcoal', '#1C1C1E', 'PBS-CHR-XL', 34.99, 20);

-- =====================
-- SITE SETTINGS
-- =====================
insert into site_settings (key, value) values
  ('announcement_bar', '"Free shipping on orders over $75 | Use code GLORY10 for 10% off your first order"'),
  ('shipping_threshold', '75'),
  ('tax_rate', '0.0875');
