export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  role: 'customer' | 'admin' | 'super_admin'
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  featured: boolean
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  title: string
  slug: string
  description: string | null
  long_description: string | null
  brand_message: string | null
  price: number
  compare_at_price: number | null
  collection_id: string | null
  featured: boolean
  active: boolean
  tags: string[] | null
  created_at: string
  updated_at: string
  collection?: Collection
  variants?: ProductVariant[]
  images?: ProductImage[]
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string | null
  color: string | null
  color_hex: string | null
  sku: string | null
  price: number | null
  inventory_count: number
  active: boolean
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  sort_order: number
  is_primary: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string | null
  stripe_payment_intent_id: string | null
  stripe_session_id: string | null
  status: 'pending' | 'paid' | 'processing' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  subtotal: number | null
  shipping: number
  tax: number
  total: number | null
  shipping_address: ShippingAddress | null
  email: string | null
  notes: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
  supplier_orders?: SupplierOrder[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  quantity: number
  unit_price: number
  title: string | null
  size: string | null
  color: string | null
  created_at: string
}

export interface ShippingAddress {
  name: string
  email: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  country: string
}

export interface SupplierOrder {
  id: string
  order_id: string
  supplier: 'printful' | 'printify' | 'apliiq' | 'gelato'
  supplier_order_id: string | null
  status: string
  tracking_number: string | null
  tracking_url: string | null
  error_message: string | null
  retry_count: number
  last_attempted_at: string | null
  submitted_at: string | null
  created_at: string
  updated_at: string
}

export interface BulkInquiry {
  id: string
  name: string
  email: string
  organization: string | null
  phone: string | null
  inquiry_type: 'church' | 'ministry' | 'conference' | 'youth_group' | 'event' | 'family_reunion' | 'other' | null
  quantity_estimate: number | null
  shirt_type: string | null
  timeline: string | null
  artwork_url: string | null
  notes: string | null
  status: 'new' | 'reviewing' | 'quoted' | 'confirmed' | 'completed' | 'declined'
  created_at: string
  updated_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  status: 'unread' | 'read' | 'replied'
  created_at: string
}

export interface CartItem {
  productId: string
  variantId: string
  title: string
  size: string
  color: string
  price: number
  quantity: number
  imageUrl: string
  slug: string
}

export interface SiteSettings {
  announcement_bar?: string
  shipping_threshold?: number
  tax_rate?: number
}
