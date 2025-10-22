'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Phone, Building, MapPin, FileText, Edit, Trash2, TrendingUp, DollarSign, Target, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getLeadConEstadisticas, deleteLead, getCotizaciones } from '@/lib/admin-services'
import type { LeadConEstadisticas, CotizacionConRelaciones } from '@/lib/admin-types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = parseInt(params.id as string)

  const [lead, setLead] = useState<LeadConEstadisticas | null>(null)
  const [cotizaciones, setCotizaciones] = useState<CotizacionConRelaciones[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    loadData()
  }, [leadId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [leadData, cotizacionesData] = await Promise.all([
        getLeadConEstadisticas(leadId),
        getCotizaciones({ leadId, page: 1, perPage: 100 })
      ])
      
      setLead(leadData)
      setCotizaciones(cotizacionesData.data)
    } catch (error) {
      console.error('Error cargando lead:', error)
      toast.error('Error al cargar el lead')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteLead(leadId)
      toast.success('Lead eliminado correctamente')
      router.push('/admin/leads')
    } catch (error: any) {
      console.error('Error eliminando lead:', error)
      toast.error(error.message || 'Error al eliminar el lead')
    }
  }

  const getEstadoBadge = (estado: string) => {
    const colors = {
      aprobada: 'bg-green-500',
      enviada: 'bg-blue-500',
      rechazada: 'bg-red-500',
      borrador: 'bg-gray-500',
      pendiente: 'bg-yellow-500'
    }
    return colors[estado as keyof typeof colors] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-gray-100 rounded animate-pulse" />
        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-100 rounded animate-pulse" />
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/leads')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{lead.nombre}</h1>
            {lead.empresa && (
              <p className="text-gray-600 mt-1">{lead.empresa}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/leads/${leadId}/editar`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cotizaciones</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lead.total_cotizaciones}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${lead.total_ventas.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <Target className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lead.tasa_conversion.toFixed(0)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cliente desde</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {lead.primera_cotizacion 
                ? format(new Date(lead.primera_cotizacion), 'dd MMM yyyy', { locale: es })
                : 'Sin cotizaciones'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Datos del Lead */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a 
                    href={`mailto:${lead.email}`}
                    className="text-[#0066a1] hover:underline"
                  >
                    {lead.email}
                  </a>
                </div>
              </div>

              {lead.telefono && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <a href={`tel:${lead.telefono}`} className="hover:underline">
                      {lead.telefono}
                    </a>
                  </div>
                </div>
              )}

              {lead.empresa && (
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Empresa</p>
                    <p>{lead.empresa}</p>
                  </div>
                </div>
              )}

              {lead.ciudad && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Ciudad</p>
                    <p>{lead.ciudad}</p>
                  </div>
                </div>
              )}

              {lead.ruc_cedula && (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">RUC/Cédula</p>
                    <p>{lead.ruc_cedula}</p>
                  </div>
                </div>
              )}

              {lead.direccion && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Dirección</p>
                    <p>{lead.direccion}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {lead.notas && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{lead.notas}</p>
              </CardContent>
            </Card>
          )}

          {/* Historial de Cotizaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Cotizaciones ({cotizaciones.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {cotizaciones.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay cotizaciones registradas
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nº</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cotizaciones.map((cotizacion) => (
                        <TableRow key={cotizacion.id}>
                          <TableCell className="font-mono text-sm">
                            #{cotizacion.id}
                          </TableCell>
                          <TableCell>
                            {format(new Date(cotizacion.created_at), 'dd MMM yyyy', { locale: es })}
                          </TableCell>
                          <TableCell>
                            <Badge className={getEstadoBadge(cotizacion.estado)}>
                              {cotizacion.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${cotizacion.total.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/cotizaciones/${cotizacion.id}`)}
                            >
                              Ver detalle
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Acciones Rápidas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full bg-[#0066a1] hover:bg-[#0066a1]/90"
                onClick={() => {
                  // TODO: Crear nueva cotización con este lead preseleccionado
                  router.push(`/admin/cotizaciones/nuevo?lead=${leadId}`)
                }}
              >
                Nueva Cotización
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = `mailto:${lead.email}`}
              >
                <Mail className="mr-2 h-4 w-4" />
                Enviar Email
              </Button>
              {lead.telefono && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = `tel:${lead.telefono}`}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Llamar
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar lead?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todas las cotizaciones asociadas a este lead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
