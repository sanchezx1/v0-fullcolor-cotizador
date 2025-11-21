import { Toaster } from '@/components/ui/sonner'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0066a1] to-[#002a4d] p-4">
      {children}
      <Toaster />
    </div>
  )
}
