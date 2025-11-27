'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { Lead } from '@/lib/admin-types'

// Schema de validación
const leadSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  empresa: z.string().optional(),
  ruc_cedula: z.string().optional(),
  ciudad: z.string().optional(),
  notas: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
})

type LeadFormData = z.infer<typeof leadSchema>

interface LeadFormProps {
  initialData?: Lead
  onSubmit: (data: LeadFormData) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

export default function LeadForm({ initialData, onSubmit, onCancel, isEditing = false }: LeadFormProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: initialData ? {
      nombre: initialData.nombre,
      email: initialData.email,
      telefono: initialData.telefono || '',
      empresa: initialData.empresa || '',
      ruc_cedula: initialData.ruc_cedula || '',
      ciudad: initialData.ciudad || '',
      notas: initialData.notas || '',
    } : {
      nombre: '',
      email: '',
      telefono: '',
      empresa: '',
      ruc_cedula: '',
      ciudad: '',
      notas: '',
    }
  })

  const ciudad = watch('ciudad')
  const notas = watch('notas')

  const handleFormSubmit = async (data: LeadFormData) => {
    setLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              {...register('nombre')}
              placeholder="Juan Pérez"
              className={errors.nombre ? 'border-red-500' : ''}
            />
            {errors.nombre && (
              <p className="text-sm text-red-500">{errors.nombre.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="juan@ejemplo.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              {...register('telefono')}
              placeholder="+595 981 123456"
              className={errors.telefono ? 'border-red-500' : ''}
            />
            {errors.telefono && (
              <p className="text-sm text-red-500">{errors.telefono.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Empresa */}
          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa</Label>
            <Input
              id="empresa"
              {...register('empresa')}
              placeholder="Empresa S.A."
              className={errors.empresa ? 'border-red-500' : ''}
            />
            {errors.empresa && (
              <p className="text-sm text-red-500">{errors.empresa.message}</p>
            )}
          </div>

          {/* RUC/Cédula */}
          <div className="space-y-2">
            <Label htmlFor="ruc_cedula">RUC / Cédula</Label>
            <Input
              id="ruc_cedula"
              {...register('ruc_cedula')}
              placeholder="80012345-6"
              className={errors.ruc_cedula ? 'border-red-500' : ''}
            />
            {errors.ruc_cedula && (
              <p className="text-sm text-red-500">{errors.ruc_cedula.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubicación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ciudad */}
          <div className="space-y-2">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Select
              value={ciudad || ''}
              onValueChange={(value) => setValue('ciudad', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar ciudad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin especificar</SelectItem>
                <SelectItem value="Asunción">Asunción</SelectItem>
                <SelectItem value="Ciudad del Este">Ciudad del Este</SelectItem>
                <SelectItem value="Encarnación">Encarnación</SelectItem>
                <SelectItem value="San Lorenzo">San Lorenzo</SelectItem>
                <SelectItem value="Luque">Luque</SelectItem>
                <SelectItem value="Fernando de la Mora">Fernando de la Mora</SelectItem>
                <SelectItem value="Lambaré">Lambaré</SelectItem>
                <SelectItem value="Otra">Otra</SelectItem>
              </SelectContent>
            </Select>
            {errors.ciudad && (
              <p className="text-sm text-red-500">{errors.ciudad.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas Adicionales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              {...register('notas')}
              placeholder="Información adicional sobre el lead..."
              rows={4}
              className={errors.notas ? 'border-red-500' : ''}
            />
            <div className="flex justify-between items-center">
              {errors.notas && (
                <p className="text-sm text-red-500">{errors.notas.message}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {notas?.length || 0}/500 caracteres
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-[#0066a1] hover:bg-[#0066a1]/90"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Guardar Cambios' : 'Crear Lead'}
        </Button>
      </div>
    </form>
  )
}
