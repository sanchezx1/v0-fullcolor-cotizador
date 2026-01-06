'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ArrowLeft,
  Download,
  FileText,
  Mail,
  Trash2,
  ExternalLink,
  User,
  Building,
  MapPin,
  Phone,
  Mail as MailIcon,
  ChevronDown,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { QuoteTimeline } from '@/components/admin/QuoteTimeline'
import {
  getCotizacion,
  getEventosCotizacion,
  cambiarEstadoCotizacion,
  deleteCotizacion
} from '@/lib/admin-services'
import { pdfGenerationService } from '@/src/services/pdfGenerationService'
import { getLeadEmail, sendQuoteStatusEmail } from '@/src/services/emailService'
import type { CotizacionCompleta, Evento, EstadoCotizacion } from '@/lib/admin-types'
import { ESTADO_LABELS } from '@/lib/admin-types'
import { toast } from 'sonner'

export default function CotizacionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = parseInt(params.id as string)

  const [cotizacion, setCotizacion] = useState<CotizacionCompleta | null>(null)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAction, setLoadingAction] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const loadCotizacion = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getCotizacion(id)
      if (data) {
        setCotizacion(data)
      } else {
        toast.error('Cotización no encontrada')
        router.push('/admin/cotizaciones')
      }
    } catch (error) {
      console.error('Error al cargar cotización:', error)
      toast.error('Error al cargar cotización')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  const loadEventos = useCallback(async () => {
    try {
      const data = await getEventosCotizacion(id)
      setEventos(data)
    } catch (error) {
      console.error('Error al cargar eventos:', error)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      void loadCotizacion()
      void loadEventos()
    }
  }, [id, loadCotizacion, loadEventos])

  async function handleCambiarEstado(nuevoEstado: EstadoCotizacion) {
    if (!cotizacion) return

    try {
      setLoadingAction(true)
      await cambiarEstadoCotizacion(id, nuevoEstado)
      const estadoLabel = ESTADO_LABELS[nuevoEstado] || nuevoEstado
      toast.success(`Estado cambiado a ${estadoLabel}`)

      if (nuevoEstado !== 'enviada') {
        try {
          const leadEmail = await getLeadEmail(id)
          if (leadEmail) {
            await sendQuoteStatusEmail(id, nuevoEstado, leadEmail, {
              quoteToken: cotizacion?.access_token,
            })
          }
        } catch (error) {
          console.warn('No se pudo enviar email de cambio de estado:', error)
        }
      }

      await loadCotizacion()
      await loadEventos()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error('Error al cambiar estado')
    } finally {
      setLoadingAction(false)
    }
  }

  const handleOpenPdf = async () => {
    if (!cotizacion) return
    if (!cotizacion.pdf_url || !cotizacion.access_token) {
      toast.error('PDF no disponible para esta cotización')
      return
    }
    try {
      setPdfLoading(true)
      const signedUrl = await pdfGenerationService.getExistingPDFUrl(cotizacion.id, {
        quoteToken: cotizacion.access_token
      })
      if (!signedUrl) {
        toast.error('No se pudo obtener el PDF')
        return
      }
      window.open(signedUrl, '_blank')
    } catch (error) {
      console.error('Error abriendo PDF:', error)
      toast.error('Error al abrir el PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  async function handleEliminar() {
    if (!cotizacion) return

    try {
      setLoadingAction(true)
      await deleteCotizacion(id)
      toast.success('Cotización eliminada')
      router.push('/admin/cotizaciones')
    } catch (error) {
      console.error('Error al eliminar cotización:', error)
      toast.error('Error al eliminar cotización')
    } finally {
      setLoadingAction(false)
      setShowDeleteDialog(false)
    }
  }

  function getEstadoColor(estado: string): string {
    switch (estado) {
      case 'aprobada':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'enviada':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      case 'en_revision':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100'
      case 'rechazada':
        return 'bg-red-100 text-red-800 hover:bg-red-100'
      case 'borrador':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
      case 'vencida':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  if (loading || !cotizacion) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
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
            size="sm"
            onClick={() => router.push('/admin/cotizaciones')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{cotizacion.numero}</h1>
            <p className="text-muted-foreground">
              Creada el {cotizacion.created_at ? format(new Date(cotizacion.created_at), 'dd MMMM yyyy', { locale: es }) : 'Fecha no disponible'}
            </p>
          </div>
          <Badge className={getEstadoColor(cotizacion.estado)}>
            {ESTADO_LABELS[cotizacion.estado] || cotizacion.estado}
          </Badge>
        </div>
      </div>

      {/* Layout 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda (70%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              {!cotizacion.lead ? (
                <p className="text-muted-foreground">No hay información del cliente disponible</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre</p>
                      <p className="font-medium">{cotizacion.lead.nombre}</p>
                    </div>
                  </div>

                  {cotizacion.lead.empresa && (
                    <div className="flex items-start gap-3">
                      <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Empresa</p>
                        <p className="font-medium">{cotizacion.lead.empresa}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <MailIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${cotizacion.lead.email}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {cotizacion.lead.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <a
                        href={`tel:${cotizacion.lead.telefono}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {cotizacion.lead.telefono}
                      </a>
                    </div>
                  </div>

                  {cotizacion.lead.ciudad && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Ciudad</p>
                        <p className="font-medium">{cotizacion.lead.ciudad}</p>
                      </div>
                    </div>
                  )}

                  {cotizacion.lead.ruc_cedula && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">RUC/Cédula</p>
                        <p className="font-medium">{cotizacion.lead.ruc_cedula}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {cotizacion.lead && (
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="link"
                    onClick={() => router.push(`/admin/leads/${cotizacion.lead_id}`)}
                    className="h-auto p-0"
                  >
                    Ver historial completo del cliente →
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Productos Cotizados */}
          <Card>
            <CardHeader>
              <CardTitle>Productos Cotizados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">P. Unitario</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">IVA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cotizacion.items.map((item) => {
                    // Calcular valores seguros
                    const precioUnitario = item.precio_unitario || 0
                    const subtotal = item.subtotal || 0
                    const ivaCalculado = subtotal * 0.15
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.producto.imagen_url && (
                              <img
                                src={item.producto.imagen_url}
                                alt={item.producto.nombre}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.producto.nombre}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.producto.categoria}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.cantidad || 0}</TableCell>
                        <TableCell className="text-right">
                          ${precioUnitario.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${subtotal.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          ${ivaCalculado.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Totales */}
              <div className="mt-6 space-y-2 border-t pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>${(cotizacion.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>IVA 15%:</span>
                  <span>${(cotizacion.iva || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${(cotizacion.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Archivos */}
          <Card>
            <CardHeader>
              <CardTitle>Archivos</CardTitle>
            </CardHeader>
            <CardContent>
              {cotizacion.pdf_url ? (
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Cotización PDF</p>
                    <p className="text-sm text-muted-foreground">
                      Generado el {cotizacion.updated_at ? format(new Date(cotizacion.updated_at), 'dd MMM yyyy', { locale: es }) : 'Fecha no disponible'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleOpenPdf}
                      disabled={pdfLoading}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleOpenPdf}
                      disabled={pdfLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>PDF no generado aún</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha (30%) */}
        <div className="space-y-6">
          {/* Gestión de Estado */}
          <Card className="overflow-hidden shadow-sm border border-gray-200">
            <CardHeader className="bg-gray-50/50 pb-4 border-b">
               <div className="flex items-center justify-between">
                <div>
                   <CardTitle className="text-base font-semibold text-gray-900">Estado de la cotización</CardTitle>
                   <CardDescription className="text-xs mt-1">
                     Gestiona el ciclo de vida de este documento.
                   </CardDescription>
                </div>
                <Badge className={`px-3 py-1 text-xs font-semibold shadow-sm transition-colors ${getEstadoColor(cotizacion.estado)}`}>
                  {ESTADO_LABELS[cotizacion.estado] || cotizacion.estado}
                </Badge>
               </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-3">
                 <label className="text-xs font-medium uppercase tracking-wider text-gray-500 flex items-center gap-2">
                   Cambiar Estado
                 </label>
                 <Select
                    value={cotizacion.estado}
                    onValueChange={(value) => handleCambiarEstado(value as EstadoCotizacion)}
                    disabled={loadingAction}
                  >
                    <SelectTrigger className="h-10 border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en_revision">
                         <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            <span>En revisión</span>
                         </div>
                      </SelectItem>
                      <SelectItem value="aprobada">
                         <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            <span>Aprobada</span>
                         </div>
                      </SelectItem>
                      <SelectItem value="rechazada">
                         <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            <span>Rechazada</span>
                         </div>
                      </SelectItem>
                      <SelectItem value="vencida">
                         <div className="flex items-center gap-2">
                           <span className="h-2 w-2 rounded-full bg-slate-500" />
                           <span>Vencida</span>
                         </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
              </div>

               <div className="rounded-md bg-blue-50 border border-blue-100 p-3">
                 <div className="flex gap-3">
                   <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                   <div className="text-sm text-blue-800">
                     <p className="font-semibold mb-1">Notificación Automática</p>
                     <p className="text-blue-700/80 text-xs leading-relaxed">
                       Al cambiar el estado a <strong>En Revisión, Aprobada, Rechazada o Vencida</strong>, se enviará un correo de notificación al cliente con la plantilla correspondiente.
                     </p>
                   </div>
                 </div>
               </div>
            </CardContent>
          </Card>

          {/* Acciones Peligrosas */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-sm text-destructive">Zona de peligro</CardTitle>
              <CardDescription className="text-xs">
                Esta acción es irreversible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteDialog(true)}
                disabled={loadingAction}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar cotización
              </Button>
            </CardContent>
          </Card>

          {/* Timeline de Eventos */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline de Eventos</CardTitle>
              <CardDescription>
                Historial de cambios y acciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuoteTimeline eventos={eventos} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás por eliminar la cotización <strong>{cotizacion.numero}</strong>. 
              Esta acción no se puede deshacer y se eliminarán todos los datos asociados 
              (items, eventos, PDF).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


