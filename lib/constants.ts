export const BRAND_NAME = 'For His Glory'
export const BRAND_TAGLINE = 'Deo Gloria — For His Glory, Worn Daily'
export const BRAND_EMAIL = 'hello@forhisglory.com'

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']

export const INQUIRY_TYPES = [
  { value: 'church', label: 'Church' },
  { value: 'ministry', label: 'Ministry' },
  { value: 'conference', label: 'Conference' },
  { value: 'youth_group', label: 'Youth Group' },
  { value: 'event', label: 'Event' },
  { value: 'family_reunion', label: 'Family Reunion' },
  { value: 'other', label: 'Other' },
] as const

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'paid', label: 'Paid', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
  { value: 'fulfilled', label: 'Fulfilled', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
] as const

export const BULK_INQUIRY_STATUSES = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'reviewing', label: 'Reviewing', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'quoted', label: 'Quoted', color: 'bg-purple-100 text-purple-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-600' },
  { value: 'declined', label: 'Declined', color: 'bg-red-100 text-red-800' },
] as const

export const FREE_SHIPPING_THRESHOLD = 75
export const TAX_RATE = 0.0875

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/forhisgloryapparel',
  tiktok: 'https://tiktok.com/@forhisgloryapparel',
  pinterest: 'https://pinterest.com/forhisgloryapparel',
} as const

export const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/collections', label: 'Collections' },
  { href: '/design', label: 'Design Yours' },
  { href: '/about', label: 'About' },
  { href: '/bulk-orders', label: 'Bulk Orders' },
] as const
