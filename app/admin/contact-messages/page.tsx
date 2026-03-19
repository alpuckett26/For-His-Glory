import { createClient } from '@/lib/supabase/server'
import { AdminTable } from '@/components/admin/AdminTable'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Messages | Admin',
}

export default async function AdminContactMessagesPage() {
  const supabase = await createClient()

  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800'
      case 'read': return 'bg-gray-100 text-gray-600'
      case 'replied': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-charcoal mb-1">Contact Messages</h1>
        <p className="font-body text-sm text-charcoal/50">{messages?.length ?? 0} messages</p>
      </div>

      <div className="bg-white border border-warm-gray">
        <AdminTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'subject', label: 'Subject' },
            {
              key: 'message',
              label: 'Message',
              render: (row) => (
                <span className="truncate block max-w-[200px]" title={row.message}>
                  {row.message?.slice(0, 60)}...
                </span>
              ),
            },
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
          data={messages ?? []}
          emptyMessage="No contact messages yet."
        />
      </div>
    </div>
  )
}
