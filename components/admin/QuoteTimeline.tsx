'use client'

import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  FileText,
  Mail,
  Edit,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import type { Evento } from '@/lib/admin-types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface QuoteTimelineProps {
  eventos: Evento[]
}

export function QuoteTimeline({ eventos }: QuoteTimelineProps) {
  const [expandedEventos, setExpandedEventos] = useState<Set<number>>(new Set())

  function getIconForEvento(tipo: string) {
    switch (tipo) {
      case 'cotizacion_creada':
        return <FileText className="h-4 w-4" />
      case 'pdf_generado':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'email_enviado':
        return <Mail className="h-4 w-4 text-green-600" />
      case 'estado_cambiado':
        return <ArrowRight className="h-4 w-4 text-purple-600" />
      case 'cotizacion_editada':
        return <Edit className="h-4 w-4 text-orange-600" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  function toggleEventMetadata(eventoId: number) {
    setExpandedEventos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(eventoId)) {
        newSet.delete(eventoId)
      } else {
        newSet.add(eventoId)
      }
      return newSet
    })
  }

  if (eventos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay eventos registrados para esta cotización
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {eventos.map((evento, index) => (
        <div key={evento.id} className="flex gap-3">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-muted p-2">
              {getIconForEvento(evento.tipo)}
            </div>
            {index < eventos.length - 1 && (
              <div className="w-0.5 h-full bg-muted mt-2" />
            )}
          </div>

          {/* Event content */}
          <div className="flex-1 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{evento.descripcion || evento.tipo}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(evento.created_at), {
                    locale: es,
                    addSuffix: true
                  })}
                  {' '}
                  ({format(new Date(evento.created_at), 'dd MMM yyyy HH:mm', { locale: es })})
                </p>
              </div>
            </div>

            {/* Metadata (collapsible) */}
            {evento.metadata && Object.keys(evento.metadata).length > 0 && (
              <div className="mt-2">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => toggleEventMetadata(evento.id)}
                  className="h-auto p-0 text-xs"
                >
                  {expandedEventos.has(evento.id) ? 'Ocultar' : 'Ver'} detalles
                </Button>
                {expandedEventos.has(evento.id) && (
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(evento.metadata, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
