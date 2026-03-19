import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings | Admin',
}

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-charcoal mb-1">Settings</h1>
        <p className="font-body text-sm text-charcoal/50">Configure your store settings.</p>
      </div>

      <div className="bg-white border border-warm-gray p-6 max-w-2xl">
        <h2 className="font-display text-xl text-charcoal mb-4">Site Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
              Announcement Bar Text
            </label>
            <input
              type="text"
              defaultValue="Free shipping on orders over $75 | Use code GLORY10 for 10% off your first order"
              className="w-full px-4 py-3 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
              readOnly
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
                Free Shipping Threshold ($)
              </label>
              <input
                type="number"
                defaultValue={75}
                className="w-full px-4 py-3 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
                readOnly
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
                Tax Rate (%)
              </label>
              <input
                type="number"
                defaultValue={8.75}
                className="w-full px-4 py-3 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
                readOnly
              />
            </div>
          </div>
          <p className="font-body text-xs text-charcoal/40">
            Settings management coming in Phase 2.
          </p>
        </div>
      </div>
    </div>
  )
}
