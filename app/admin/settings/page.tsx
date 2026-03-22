'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-body text-sm font-medium text-charcoal mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold transition-colors"
    />
  )
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-warm-gray p-6 max-w-2xl">
      <div className="mb-5">
        <h2 className="font-display text-xl text-charcoal">{title}</h2>
        {description && <p className="font-body text-sm text-charcoal/50 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── Site Settings Section ─────────────────────────────────────────────────────

function SiteSettingsSection() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((rows: { key: string; value: string }[]) => {
        const map: Record<string, string> = {}
        rows.forEach(({ key, value }) => { map[key] = value })
        setSettings(map)
      })
  }, [])

  const set = (key: string, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }))

  const save = async () => {
    setSaving(true)
    try {
      const rows = Object.entries(settings).map(([key, value]) => ({ key, value }))
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Settings saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SectionCard
      title="Site Settings"
      description="Core brand and store configuration."
    >
      <div className="space-y-4">
        <FieldGroup label="Brand Name">
          <TextInput
            value={settings['brand_name'] ?? ''}
            onChange={(v) => set('brand_name', v)}
            placeholder="For His Glory"
          />
        </FieldGroup>
        <FieldGroup label="Tagline">
          <TextInput
            value={settings['tagline'] ?? ''}
            onChange={(v) => set('tagline', v)}
            placeholder="Deo Gloria — For His Glory, Worn Daily"
          />
        </FieldGroup>
        <FieldGroup label="Contact Email">
          <TextInput
            value={settings['contact_email'] ?? ''}
            onChange={(v) => set('contact_email', v)}
            placeholder="hello@forhisglory.com"
          />
        </FieldGroup>
        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-charcoal text-ivory font-body text-sm font-medium py-3 hover:bg-charcoal/80 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Site Settings'}
        </button>
      </div>
    </SectionCard>
  )
}

// ─── Homepage Content Section ──────────────────────────────────────────────────

function HomepageContentSection() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((rows: { key: string; value: string }[]) => {
        const keys = ['hero_headline', 'hero_subheadline', 'hero_cta']
        const map: Record<string, string> = {}
        rows.filter((r) => keys.includes(r.key)).forEach(({ key, value }) => { map[key] = value })
        setSettings(map)
      })
  }, [])

  const set = (key: string, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }))

  const save = async () => {
    setSaving(true)
    try {
      const rows = Object.entries(settings).map(([key, value]) => ({ key, value }))
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Homepage content saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SectionCard
      title="Homepage Content"
      description="Hero section text shown on the storefront."
    >
      <div className="space-y-4">
        <FieldGroup label="Hero Headline">
          <TextInput
            value={settings['hero_headline'] ?? ''}
            onChange={(v) => set('hero_headline', v)}
            placeholder="Wear Your Faith"
          />
        </FieldGroup>
        <FieldGroup label="Hero Subheadline">
          <TextInput
            value={settings['hero_subheadline'] ?? ''}
            onChange={(v) => set('hero_subheadline', v)}
            placeholder="Premium Christian apparel designed to inspire…"
          />
        </FieldGroup>
        <FieldGroup label="Hero CTA Label">
          <TextInput
            value={settings['hero_cta'] ?? ''}
            onChange={(v) => set('hero_cta', v)}
            placeholder="Shop the Collection"
          />
        </FieldGroup>
        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-charcoal text-ivory font-body text-sm font-medium py-3 hover:bg-charcoal/80 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Homepage Content'}
        </button>
      </div>
    </SectionCard>
  )
}

// ─── Supplier Config Section ───────────────────────────────────────────────────

function SupplierConfigSection() {
  const [testing, setTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'ok' | 'fail'>('idle')
  const printfulKeySet = !!process.env.NEXT_PUBLIC_PRINTFUL_KEY_HINT // just a hint; real key is server-side

  const testConnection = async () => {
    setTesting(true)
    setConnectionStatus('idle')
    try {
      const res = await fetch('/api/admin/test-printful')
      if (res.ok) setConnectionStatus('ok')
      else setConnectionStatus('fail')
    } catch {
      setConnectionStatus('fail')
    } finally {
      setTesting(false)
    }
  }

  return (
    <SectionCard
      title="Supplier Configuration"
      description="Print-on-demand fulfillment settings."
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between p-4 border border-warm-gray">
          <div>
            <p className="font-body text-sm font-medium text-charcoal">Printful</p>
            <p className="font-body text-xs text-charcoal/50 mt-0.5">
              Active print-on-demand supplier
            </p>
          </div>
          <div className="flex items-center gap-2">
            {connectionStatus === 'ok' && (
              <span className="flex items-center gap-1 text-xs text-green-700 font-body">
                <CheckCircle className="h-4 w-4" /> Connected
              </span>
            )}
            {connectionStatus === 'fail' && (
              <span className="flex items-center gap-1 text-xs text-red-600 font-body">
                <XCircle className="h-4 w-4" /> Failed
              </span>
            )}
            <button
              onClick={testConnection}
              disabled={testing}
              className="flex items-center gap-1.5 font-body text-xs font-medium px-3 py-1.5 border border-charcoal/20 text-charcoal hover:bg-charcoal/5 transition-colors disabled:opacity-50"
            >
              {testing && <Loader2 className="h-3 w-3 animate-spin" />}
              Test Connection
            </button>
          </div>
        </div>
        <p className="font-body text-xs text-charcoal/40">
          API keys are configured via environment variables. Contact your developer to update
          credentials.
        </p>
      </div>
    </SectionCard>
  )
}

// ─── Admin Users Section ───────────────────────────────────────────────────────

function AdminUsersSection() {
  const [admins, setAdmins] = useState<{ id: string; email: string; full_name: string | null; role: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [currentRole, setCurrentRole] = useState<string | null>(null)

  const fetchAdmins = useCallback(async () => {
    const res = await fetch('/api/admin/users')
    if (!res.ok) { setLoading(false); return }
    const data = await res.json()
    setCurrentRole(data.currentRole ?? null)
    setAdmins(data.admins ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAdmins() }, [fetchAdmins])

  const updateRole = async (userId: string, role: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    if (!res.ok) return toast.error('Failed to update role')
    toast.success('Role updated')
    fetchAdmins()
  }

  if (currentRole !== 'super_admin') return null

  return (
    <SectionCard
      title="Admin Users"
      description="Manage admin access. Only visible to super admins."
    >
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 bg-charcoal/5 rounded animate-pulse" />
          ))}
        </div>
      ) : admins.length === 0 ? (
        <p className="font-body text-sm text-charcoal/40">No admins found.</p>
      ) : (
        <div className="divide-y divide-warm-gray border border-warm-gray">
          {admins.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-body text-sm font-medium text-charcoal">
                  {admin.full_name ?? admin.email ?? 'Unknown'}
                </p>
                <p className="font-body text-xs text-charcoal/50">{admin.email}</p>
              </div>
              <select
                value={admin.role}
                onChange={(e) => updateRole(admin.id, e.target.value)}
                className="px-2 py-1.5 border border-charcoal/20 font-body text-xs focus:outline-none focus:border-gold"
              >
                <option value="customer">Customer (demote)</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

// Note: metadata must be exported from a server component, so we skip it here
// and rely on the page title from the browser tab via the layout.

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-charcoal mb-1">Settings</h1>
        <p className="font-body text-sm text-charcoal/50">Configure your store.</p>
      </div>

      <div className="space-y-8">
        <SiteSettingsSection />
        <HomepageContentSection />
        <SupplierConfigSection />
        <AdminUsersSection />
      </div>
    </div>
  )
}
