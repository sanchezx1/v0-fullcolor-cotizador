'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, FileText, Mail, Edit, ArrowRight, Activity, ExternalLink, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getEventos } from '@/lib/admin-services'
import type { Evento, FiltrosEventos, TipoEvento } from '@/lib/admin-types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatDistanceToNow } from 'date-fns'

export default function EventosPage() {
  const router = useRouter()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [totalEventos, setTotalEventos] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null)

  // Filtros
  const [tipoEvento, setTipoEvento] = useState<string>('all')
  const [cotizacionId, setCotizacionId] = useState('')

  // Cargar eventos
  const loadEventos = useCallback(async () => {
    try {
      setLoading(true)
      const filtros: FiltrosEventos = {
        tipo: tipoEvento !== 'all' ? (tipoEvento as TipoEvento) : undefined,
        cotizacionId: cotizacionId ? parseInt(cotizacionId) : undefined,
        page,
        perPage: 50
      }

      const result = await getEventos(filtros)
      setEventos(result.data)
      setTotalEventos(result.total)
      setTotalPages(result.totalPages)
    } catch (error) {
      console.error('Error cargando eventos:', error)
      toast.error('Error al cargar eventos')
    } finally {
      setLoading(false)
    }
  }, [cotizacionId, page, tipoEvento])

  useEffect(() => {
    void loadEventos()
  }, [loadEventos])

  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        void loadEventos()
      } else {
        setPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [cotizacionId, loadEventos, page, tipoEvento])

  // Limpiar filtros
  const clearFilters = () => {
    setTipoEvento('all')
    setCotizacionId('')
  }

  // Obtener icono según tipo de evento
  const getEventIcon = (tipo: TipoEvento) => {
    switch (tipo) {
      case 'cotizacion_creada':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'pdf_generado':
        return <FileText className="h-5 w-5 text-purple-500" />
      case 'email_enviado':
        return <Mail className="h-5 w-5 text-green-500" />
      case 'estado_cambiado':
        return <ArrowRight className="h-5 w-5 text-orange-500" />
      case 'cotizacion_editada':
        return <Edit className="h-5 w-5 text-yellow-500" />
      case 'producto_creado':
      case 'producto_editado':
      case 'producto_eliminado':
        return <Activity className="h-5 w-5 text-gray-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  // Obtener color de badge según tipo
  const getTipoBadgeColor = (tipo: TipoEvento) => {
    switch (tipo) {
      case 'cotizacion_creada':
        return 'bg-blue-500'
      case 'pdf_generado':
        return 'bg-purple-500'
      case 'email_enviado':
        return 'bg-green-500'
      case 'estado_cambiado':
        return 'bg-orange-500'
      case 'cotizacion_editada':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Eventos del Sistema</h1>
          <p className="text-gray-600 mt-1">
            Historial de actividad y cambios
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Filtro por Tipo */}
            <div>
              <Select value={tipoEvento} onValueChange={setTipoEvento}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="cotizacion_creada">Cotización Creada</SelectItem>
                  <SelectItem value="cotizacion_editada">Cotización Editada</SelectItem>
                  <SelectItem value="estado_cambiado">Estado Cambiado</SelectItem>
                  <SelectItem value="pdf_generado">PDF Generado</SelectItem>
                  <SelectItem value="email_enviado">Email Enviado</SelectItem>
                  <SelectItem value="producto_creado">Producto Creado</SelectItem>
                  <SelectItem value="producto_editado">Producto Editado</SelectItem>
                  <SelectItem value="producto_eliminado">Producto Eliminado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Cotización */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="ID de Cotización"
                  value={cotizacionId}
                  onChange={(e) => setCotizacionId(e.target.value)}
                  className="pl-10"
                  type="number"
                />
              </div>
            </div>
          </div>

          {/* Botón limpiar filtros */}
          {(tipoEvento !== 'all' || cotizacionId) && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Eventos ({totalEventos} total{totalEventos !== 1 ? 'es' : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay eventos</h3>
              <p className="mt-1 text-sm text-gray-500">
                {tipoEvento !== 'all' || cotizacionId
                  ? 'No se encontraron eventos con los filtros aplicados.'
                  : 'No hay eventos registrados en el sistema.'}
              </p>
              {(tipoEvento !== 'all' || cotizacionId) && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Cotización</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventos.map((evento) => (
                      <React.Fragment key={evento.id}>
                        <TableRow>
                          <TableCell>
                            {getEventIcon(evento.tipo)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getTipoBadgeColor(evento.tipo)}>
                              {evento.tipo.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{evento.descripcion || 'Sin descripción'}</p>
                              {evento.metadata && Object.keys(evento.metadata).length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {Object.keys(evento.metadata).length} campo{Object.keys(evento.metadata).length !== 1 ? 's' : ''} adicional{Object.keys(evento.metadata).length !== 1 ? 'es' : ''}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {evento.cotizacion_id ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="font-mono text-sm"
                                onClick={() => router.push(`/admin/cotizaciones/${evento.cotizacion_id}`)}
                              >
                                #{evento.cotizacion_id}
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </Button>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">
                                {format(new Date(evento.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(evento.created_at), { addSuffix: true, locale: es })}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {evento.metadata && Object.keys(evento.metadata).length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedEvent(expandedEvent === evento.id ? null : evento.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                        {expandedEvent === evento.id && evento.metadata && (
                          <TableRow>
                            <TableCell colSpan={6} className="bg-gray-50">
                              <div className="p-4">
                                <h4 className="font-semibold mb-2">Metadata:</h4>
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                                  {JSON.stringify(evento.metadata, null, 2)}
                                </pre>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
