'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Eye, Check, Reply } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminDrawer } from '@/components/admin/AdminDrawer'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { ContactMessage } from '@/types'

export default function AdminContactMessagesPage() {
  const supabase = createClient()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<ContactMessage | null>(null)
  const [filterStatus, setFilterStatus] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    setMessages(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateStatus = async (id: string, status: ContactMessage['status']) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id)
    if (error) return toast.error('Failed to update')
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s)
    toast.success(`Marked as ${status}`)
  }

  const viewMessage = async (msg: ContactMessage) => {
    setSelected(msg)
    setDrawerOpen(true)
    if (msg.status === 'unread') {
      await updateStatus(msg.id, 'read')
    }
  }

  const filtered = filterStatus
    ? messages.filter((m) => m.status === filterStatus)
    : messages

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-charcoal mb-1">Contact Messages</h1>
        <p className="font-body text-sm text-charcoal/50">{messages.length} messages</p>
      </div>

      {/* Filter */}
      <div className="mb-5">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
        >
          <option value="">All Statuses</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      <div className="bg-white border border-warm-gray">
        <AdminTable
          loading={loading}
          data={filtered}
          emptyMessage="No contact messages yet."
          columns={[
            {
              key: 'name',
              label: 'Name',
              render: (row) => (
                <span className={row.status === 'unread' ? 'font-semibold' : ''}>{row.name}</span>
              ),
            },
            {
              key: 'email',
              label: 'Email',
              render: (row) => (
                <span className="truncate block max-w-[160px]">{row.email}</span>
              ),
            },
            {
              key: 'subject',
              label: 'Subject',
              render: (row) => (
                <span className="truncate block max-w-[180px]">{row.subject ?? '—'}</span>
              ),
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
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => viewMessage(row)}
                    className="p-1.5 text-charcoal/40 hover:text-charcoal transition-colors"
                    title="View"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  {row.status !== 'read' && row.status !== 'replied' && (
                    <button
                      onClick={() => updateStatus(row.id, 'read')}
                      className="p-1.5 text-charcoal/40 hover:text-green-600 transition-colors"
                      title="Mark read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {row.status !== 'replied' && (
                    <button
                      onClick={() => updateStatus(row.id, 'replied')}
                      className="p-1.5 text-charcoal/40 hover:text-blue-600 transition-colors"
                      title="Mark replied"
                    >
                      <Reply className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      <AdminDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Message Detail"
      >
        {selected && (
          <MessageDetail
            message={selected}
            onStatusChange={(status) => updateStatus(selected.id, status)}
          />
        )}
      </AdminDrawer>
    </div>
  )
}

// ─── Message Detail ────────────────────────────────────────────────────────────

function MessageDetail({
  message,
  onStatusChange,
}: {
  message: ContactMessage
  onStatusChange: (status: ContactMessage['status']) => void
}) {
  return (
    <div className="space-y-6 font-body text-sm text-charcoal">
      <div className="space-y-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/40">From</span>
          <p className="mt-0.5">{message.name} — <a href={`mailto:${message.email}`} className="text-gold hover:text-gold-light">{message.email}</a></p>
        </div>
        {message.subject && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/40">Subject</span>
            <p className="mt-0.5 font-medium">{message.subject}</p>
          </div>
        )}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/40">Received</span>
          <p className="mt-0.5 text-charcoal/60">{formatDate(message.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/40">Status</span>
          <StatusBadge status={message.status} />
        </div>
      </div>

      {/* Message body */}
      <div className="bg-ivory border border-warm-gray p-4">
        <p className="whitespace-pre-wrap leading-relaxed">{message.message}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <a
          href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject ?? 'Your Message')}`}
          onClick={() => onStatusChange('replied')}
          className="flex-1 flex items-center justify-center gap-2 bg-charcoal text-ivory font-body text-sm font-medium py-2.5 hover:bg-charcoal/80 transition-colors text-center"
        >
          <Reply className="h-4 w-4" />
          Reply via Email
        </a>
        {message.status !== 'replied' && (
          <button
            onClick={() => onStatusChange('replied')}
            className="px-4 border border-charcoal/20 font-body text-sm text-charcoal hover:bg-charcoal/5 transition-colors"
          >
            Mark Replied
          </button>
        )}
      </div>
    </div>
  )
}
