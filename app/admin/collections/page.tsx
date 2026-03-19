import { createClient } from '@/lib/supabase/server'
import { AdminTable } from '@/components/admin/AdminTable'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Collections | Admin',
}

export default async function AdminCollectionsPage() {
  const supabase = await createClient()

  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .order('sort_order')

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-charcoal mb-1">Collections</h1>
        <p className="font-body text-sm text-charcoal/50">{collections?.length ?? 0} collections</p>
      </div>

      <div className="bg-white border border-warm-gray">
        <AdminTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'slug', label: 'Slug' },
            {
              key: 'featured',
              label: 'Featured',
              render: (row) => (
                <span>{row.featured ? '✓' : '—'}</span>
              ),
            },
            {
              key: 'active',
              label: 'Status',
              render: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${row.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {row.active ? 'Active' : 'Inactive'}
                </span>
              ),
            },
            { key: 'sort_order', label: 'Order' },
            {
              key: 'created_at',
              label: 'Created',
              render: (row) => <span>{formatDate(row.created_at)}</span>,
            },
            {
              key: 'actions',
              label: '',
              render: (row) => (
                <a
                  href={`/collections/${row.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-xs text-gold hover:text-gold-light transition-colors"
                >
                  View →
                </a>
              ),
            },
          ]}
          data={collections ?? []}
          emptyMessage="No collections yet."
        />
      </div>
    </div>
  )
}
