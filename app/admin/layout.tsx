import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/')
  }

  // Fetch badge counts for sidebar
  const [{ count: unreadMessages }, { count: newBulkInquiries }] = await Promise.all([
    supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'unread'),
    supabase
      .from('bulk_inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new'),
  ])

  return (
    <div className="flex min-h-screen bg-ivory">
      <AdminSidebar
        badgeCounts={{
          messages: unreadMessages ?? 0,
          bulkInquiries: newBulkInquiries ?? 0,
        }}
      />
      <div className="flex-1 overflow-auto min-w-0">
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  )
}
