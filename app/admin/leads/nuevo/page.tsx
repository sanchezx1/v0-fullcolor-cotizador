'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LeadForm from '@/components/admin/LeadForm'
import { createLead } from '@/lib/admin-services'

export default function NuevoLeadPage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      const newLead = await createLead(data)
      toast.success('Lead creado exitosamente')
      router.push(`/admin/leads/${newLead.id}`)
    } catch (error: any) {
      console.error('Error creando lead:', error)
      toast.error(error.message || 'Error al crear el lead')
      throw error
    }
  }

  const handleCancel = () => {
    router.push('/admin/leads')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/leads')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Lead</h1>
          <p className="text-gray-600 mt-1">
            Agrega un nuevo cliente potencial
          </p>
        </div>
      </div>

      {/* Form */}
      <LeadForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  )
}
