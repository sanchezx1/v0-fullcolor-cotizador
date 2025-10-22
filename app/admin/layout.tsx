import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Toaster } from '@/components/ui/sonner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden ml-64">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}
