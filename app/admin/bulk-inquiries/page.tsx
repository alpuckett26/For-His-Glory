'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Eye } from 'lucide-react'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminDrawer } from '@/components/admin/AdminDrawer'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatDate } from '@/lib/utils'
import { BULK_INQUIRY_STATUSES } from '@/lib/constants'
import type { BulkInquiry } from '@/types'

const STATUS_OPTIONS = BULK_INQUIRY_STATUSES.map((s) => s.value)

export default function AdminBulkInquiriesPage() {
  const [inquiries, setInquiries] = useState<BulkInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<BulkInquiry | null>(null)
  const [filterStatus, setFilterStatus] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/bulk-inquiries')
    const data = await res.json()
    setInquiries(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = filterStatus
    ? inquiries.filter((i) => i.status === filterStatus)
    : inquiries

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-charcoal mb-1">Bulk Inquiries</h1>
        <p className="font-body text-sm text-charcoal/50">{inquiries.length} inquiries</p>
      </div>

      {/* Filter */}
      <div className="mb-5">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
        >
          <option value="">All Statuses</option>
          {BULK_INQUIRY_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-warm-gray">
        <AdminTable
          loading={loading}
          data={filtered}
          emptyMessage="No bulk inquiries yet."
          columns={[
            { key: 'name', label: 'Name' },
            {
              key: 'email',
              label: 'Email',
              render: (row) => (
                <span className="truncate block max-w-[160px]">{row.email}</span>
              ),
            },
            {
              key: 'organization',
              label: 'Organization',
              render: (row) => <span>{row.organization ?? '—'}</span>,
            },
            {
              key: 'inquiry_type',
              label: 'Type',
              render: (row) => (
                <span className="capitalize">{row.inquiry_type?.replace('_', ' ') ?? '—'}</span>
              ),
            },
            {
              key: 'quantity_estimate',
              label: 'Qty',
              render: (row) => <span>{row.quantity_estimate ?? '—'}</span>,
            },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: 'created_at',
              label: 'Date',
              render: (row) => (
                <span className="text-xs text-charcoal/50">{formatDate(row.created_at)}</span>
              ),
            },
            {
              key: 'actions',
              label: '',
              render: (row) => (
                <button
                  onClick={() => { setSelected(row); setDrawerOpen(true) }}
                  className="p-1.5 text-charcoal/40 hover:text-charcoal transition-colors"
                  title="View"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              ),
            },
          ]}
        />
      </div>

      <AdminDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Inquiry Detail"
      >
        {selected && (
          <InquiryDetail
            inquiry={selected}
            onStatusChange={(updated) => {
              setSelected(updated)
              setInquiries((prev) =>
                prev.map((i) => (i.id === updated.id ? updated : i))
              )
            }}
          />
        )}
      </AdminDrawer>
    </div>
  )
}

// ─── Inquiry Detail ────────────────────────────────────────────────────────────

function InquiryDetail({
  inquiry,
  onStatusChange,
}: {
  inquiry: BulkInquiry
  onStatusChange: (updated: BulkInquiry) => void
}) {
  const [status, setStatus] = useState(inquiry.status)
  const [notes, setNotes] = useState(inquiry.notes ?? '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const res = await fetch(`/api/admin/bulk-inquiries?id=${inquiry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes: notes || null }),
    })
    setSaving(false)
    if (!res.ok) return toast.error('Failed to save')
    const updated = await res.json()
    toast.success('Inquiry updated')
    onStatusChange(updated)
  }

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="py-2 border-b border-warm-gray last:border-0">
      <span className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal/40 block mb-0.5">
        {label}
      </span>
      <span className="font-body text-sm text-charcoal">{value || '—'}</span>
    </div>
  )

  return (
    <div className="space-y-6 font-body text-sm text-charcoal">
      <div className="space-y-0">
        <Row label="Name" value={inquiry.name} />
        <Row label="Email" value={<a href={`mailto:${inquiry.email}`} className="text-gold hover:text-gold-light">{inquiry.email}</a>} />
        <Row label="Organization" value={inquiry.organization} />
        <Row label="Phone" value={inquiry.phone} />
        <Row label="Type" value={inquiry.inquiry_type?.replace('_', ' ')} />
        <Row label="Quantity Estimate" value={inquiry.quantity_estimate} />
        <Row label="Shirt Type" value={inquiry.shirt_type} />
        <Row label="Timeline" value={inquiry.timeline} />
        <Row label="Submitted" value={formatDate(inquiry.created_at)} />
        {inquiry.artwork_url && (
          <div className="py-2 border-b border-warm-gray">
            <span className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal/40 block mb-0.5">
              Artwork
            </span>
            <a
              href={inquiry.artwork_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gold hover:text-gold-light"
            >
              View artwork →
            </a>
          </div>
        )}
      </div>

      {/* Status update */}
      <div>
        <label className="block font-body text-sm font-medium text-charcoal mb-2">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as BulkInquiry['status'])}
          className="w-full px-3 py-2.5 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
        >
          {BULK_INQUIRY_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block font-body text-sm font-medium text-charcoal mb-2">
          Internal Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-3 py-2.5 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
          placeholder="Add notes about this inquiry…"
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-charcoal text-ivory font-body text-sm font-medium py-3 hover:bg-charcoal/80 transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )
}
