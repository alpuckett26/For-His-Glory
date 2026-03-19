import { createClient } from '@/lib/supabase/server'
import { AdminTable } from '@/components/admin/AdminTable'
import { formatDate } from '@/lib/utils'
import { BULK_INQUIRY_STATUSES } from '@/lib/constants'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bulk Inquiries | Admin',
}

export default async function AdminBulkInquiriesPage() {
  const supabase = await createClient()

  const { data: inquiries } = await supabase
    .from('bulk_inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  const getStatusStyle = (status: string) => {
    return BULK_INQUIRY_STATUSES.find((s) => s.value === status)?.color ?? 'bg-gray-100 text-gray-600'
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-charcoal mb-1">Bulk Inquiries</h1>
        <p className="font-body text-sm text-charcoal/50">{inquiries?.length ?? 0} inquiries</p>
      </div>

      <div className="bg-white border border-warm-gray">
        <AdminTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'organization', label: 'Organization' },
            { key: 'inquiry_type', label: 'Type' },
            {
              key: 'quantity_estimate',
              label: 'Qty',
              render: (row) => <span>{row.quantity_estimate ?? '—'}</span>,
            },
            { key: 'timeline', label: 'Timeline' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${getStatusStyle(row.status)}`}>
                  {row.status}
                </span>
              ),
            },
            {
              key: 'created_at',
              label: 'Date',
              render: (row) => <span>{formatDate(row.created_at)}</span>,
            },
          ]}
          data={inquiries ?? []}
          emptyMessage="No bulk inquiries yet."
        />
      </div>
    </div>
  )
}
