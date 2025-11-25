'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Mail, Phone, Building, MapPin, Eye, Pencil, Trash2, User } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getLeads, deleteLead } from '@/lib/admin-services'
import type { LeadConEstadisticas, FiltrosLeads } from '@/lib/admin-types'

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<LeadConEstadisticas[]>([])
  const [loading, setLoading] = useState(true)
  const [totalLeads, setTotalLeads] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filtros
  const [search, setSearch] = useState('')
  const [ciudad, setCiudad] = useState<string>('all')

  // Cargar leads
  const loadLeads = useCallback(async () => {
    try {
      setLoading(true)
      const filtros: FiltrosLeads = {
        search: search || undefined,
        ciudad: ciudad !== 'all' ? ciudad : undefined,
        page,
        perPage: 20
      }

      const result = await getLeads(filtros)
      setLeads(result.data)
      setTotalLeads(result.total)
      setTotalPages(result.totalPages)
    } catch (error) {
      console.error('Error cargando leads:', error)
      toast.error('Error al cargar leads')
    } finally {
      setLoading(false)
    }
  }, [ciudad, page, search])

  useEffect(() => {
    void loadLeads()
  }, [loadLeads])

  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        void loadLeads()
      } else {
        setPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [ciudad, loadLeads, page, search])

  // Limpiar filtros
  const clearFilters = () => {
    setSearch('')
    setCiudad('all')
  }

  // Confirmar eliminación
  const handleDeleteClick = (id: number) => {
    setLeadToDelete(id)
    setShowDeleteDialog(true)
  }

  // Eliminar lead
  const handleDeleteLead = async () => {
    if (!leadToDelete) return

    try {
      await deleteLead(leadToDelete)
      toast.success('Lead eliminado correctamente')
      setShowDeleteDialog(false)
      setLeadToDelete(null)
      void loadLeads()
    } catch (error: any) {
      console.error('Error eliminando lead:', error)
      toast.error(error.message || 'Error al eliminar el lead')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus clientes potenciales
          </p>
        </div>
        <Button asChild className="bg-[#0066a1] hover:bg-[#0066a1]/90">
          <Link href="/admin/leads/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Lead
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Ocultar' : 'Mostrar'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Búsqueda */}
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email, empresa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por Ciudad */}
            <div>
              <Select value={ciudad} onValueChange={setCiudad}>
                <SelectTrigger>
                  <SelectValue placeholder="Ciudad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ciudades</SelectItem>
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
            </div>
          </div>

          {/* Botón limpiar filtros */}
          {(search || ciudad !== 'all') && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Leads */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Leads ({totalLeads} total{totalLeads !== 1 ? 'es' : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay leads</h3>
              <p className="mt-1 text-sm text-gray-500">
                {search || ciudad !== 'all'
                  ? 'No se encontraron leads con los filtros aplicados.'
                  : 'Comienza agregando tu primer lead.'}
              </p>
              {(search || ciudad !== 'all') && (
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
                      <TableHead>Nombre</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Ciudad</TableHead>
                      <TableHead className="text-right">Cotizaciones</TableHead>
                      <TableHead className="text-right">Total Ventas</TableHead>
                      <TableHead className="text-right">Conversión</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-[#0066a1]/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-[#0066a1]" />
                            </div>
                            <div>
                              <p className="font-medium">{lead.nombre}</p>
                              {lead.ruc_cedula && (
                                <p className="text-xs text-gray-500">{lead.ruc_cedula}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <a 
                                href={`mailto:${lead.email}`}
                                className="text-[#0066a1] hover:underline"
                              >
                                {lead.email}
                              </a>
                            </div>
                            {lead.telefono && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <a href={`tel:${lead.telefono}`} className="hover:underline">
                                  {lead.telefono}
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.empresa && (
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{lead.empresa}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.ciudad && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{lead.ciudad}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">
                            {lead.total_cotizaciones}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${lead.total_ventas.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant={lead.tasa_conversion >= 30 ? 'default' : 'secondary'}
                            className={lead.tasa_conversion >= 30 ? 'bg-green-500' : ''}
                          >
                            {lead.tasa_conversion.toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/admin/leads/${lead.id}`)}
                              title="Ver detalle"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/admin/leads/${lead.id}/editar`)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(lead.id)}
                              title="Eliminar"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
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
            <Button variant="destructive" onClick={handleDeleteLead}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
