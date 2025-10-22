'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LeadForm from '@/components/admin/LeadForm'
import { getLead, updateLead } from '@/lib/admin-services'
import type { Lead } from '@/lib/admin-types'

export default function EditarLeadPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = parseInt(params.id as string)

  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLead()
  }, [leadId])

  const loadLead = async () => {
    try {
      setLoading(true)
      const data = await getLead(leadId)
      setLead(data)
    } catch (error) {
      console.error('Error cargando lead:', error)
      toast.error('Error al cargar el lead')
      router.push('/admin/leads')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      await updateLead(leadId, data)
      toast.success('Lead actualizado exitosamente')
      router.push(`/admin/leads/${leadId}`)
    } catch (error: any) {
      console.error('Error actualizando lead:', error)
      toast.error(error.message || 'Error al actualizar el lead')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/admin/leads/${leadId}`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-gray-100 rounded animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Lead no encontrado</p>
        <Button className="mt-4" onClick={() => router.push('/admin/leads')}>
          Volver a Leads
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/admin/leads/${leadId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Lead</h1>
          <p className="text-gray-600 mt-1">{lead.nombre}</p>
        </div>
      </div>

      {/* Form */}
      <LeadForm 
        initialData={lead}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditing={true}
      />
    </div>
  )
}
