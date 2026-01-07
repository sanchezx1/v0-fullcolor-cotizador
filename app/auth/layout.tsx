import { Toaster } from '@/components/ui/sonner'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen max-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0066a1] to-[#002a4d] p-4 lg:p-0">
      {children}
      <Toaster />
    </div>
  )
}
