import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) redirect('/')
  if (!['admin', 'super_admin'].includes(session.user.role ?? '')) redirect('/')

  const [unreadRows, bulkRows] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM contact_messages WHERE status = 'unread'`,
    sql`SELECT COUNT(*)::int AS count FROM bulk_inquiries WHERE status = 'new'`,
  ])

  const unreadMessages = unreadRows[0]?.count ?? 0
  const newBulkInquiries = bulkRows[0]?.count ?? 0

  return (
    <div className="flex min-h-screen bg-ivory">
      <AdminSidebar
        badgeCounts={{
          messages: unreadMessages,
          bulkInquiries: newBulkInquiries,
        }}
      />
      <div className="flex-1 overflow-auto min-w-0">
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  )
}
