'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Search, 
  Filter, 
  Eye, 
  MoreVertical,
  Download,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { getCotizaciones } from '@/lib/admin-services'
import type { CotizacionConRelaciones, EstadoCotizacion, FiltrosCotizaciones } from '@/lib/admin-types'
import { toast } from 'sonner'

export default function CotizacionesListPage() {
  const router = useRouter()
  const [cotizaciones, setCotizaciones] = useState<CotizacionConRelaciones[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Filtros
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState<EstadoCotizacion | 'all'>('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [montoMin, setMontoMin] = useState('')
  const [montoMax, setMontoMax] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Load cotizaciones
  useEffect(() => {
    loadCotizaciones()
  }, [page, debouncedSearch, estado])

  async function loadCotizaciones() {
    try {
      setLoading(true)
      
      const filtros: FiltrosCotizaciones = {
        page,
        perPage: 20,
        search: debouncedSearch || undefined,
        estado: estado !== 'all' ? estado : undefined,
        montoMin: montoMin ? parseFloat(montoMin) : undefined,
        montoMax: montoMax ? parseFloat(montoMax) : undefined,
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      }

      const response = await getCotizaciones(filtros)
      setCotizaciones(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Error al cargar cotizaciones:', error)
      toast.error('Error al cargar cotizaciones')
    } finally {
      setLoading(false)
    }
  }

  function handleApplyAdvancedFilters() {
    setPage(1)
    loadCotizaciones()
  }

  function handleClearFilters() {
    setSearch('')
    setEstado('all')
    setMontoMin('')
    setMontoMax('')
    setFechaInicio('')
    setFechaFin('')
    setPage(1)
    setShowAdvancedFilters(false)
    loadCotizaciones()
  }

  function getEstadoColor(estado: EstadoCotizacion): string {
    switch (estado) {
      case 'aprobada':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'enviada':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      case 'rechazada':
        return 'bg-red-100 text-red-800 hover:bg-red-100'
      case 'borrador':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cotizaciones</h1>
          <p className="text-muted-foreground">
            Gestiona todas las cotizaciones del sistema
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por número de cotización..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Estado Filter */}
          <Select value={estado} onValueChange={(value) => setEstado(value as EstadoCotizacion | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="borrador">Borrador</SelectItem>
              <SelectItem value="enviada">Enviada</SelectItem>
              <SelectItem value="aprobada">Aprobada</SelectItem>
              <SelectItem value="rechazada">Rechazada</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
            </SelectContent>
          </Select>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avanzados
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Monto Mínimo</label>
                <Input
                  type="number"
                  placeholder="$0.00"
                  value={montoMin}
                  onChange={(e) => setMontoMin(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Monto Máximo</label>
                <Input
                  type="number"
                  placeholder="$9999.99"
                  value={montoMax}
                  onChange={(e) => setMontoMax(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Fecha Inicio</label>
                <Input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Fecha Fin</label>
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApplyAdvancedFilters}>
                Aplicar Filtros
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Mostrando {cotizaciones.length} de {total} cotizaciones
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº Cotización</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : cotizaciones.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-muted-foreground">No se encontraron cotizaciones</p>
                    {(search || estado !== 'all') && (
                      <Button variant="link" onClick={handleClearFilters}>
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              cotizaciones.map((cotizacion) => (
                <TableRow key={cotizacion.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/cotizaciones/${cotizacion.id}`}
                      className="text-primary hover:underline"
                    >
                      {cotizacion.numero}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{cotizacion.lead.nombre}</div>
                      {cotizacion.lead.empresa && (
                        <div className="text-sm text-muted-foreground">
                          {cotizacion.lead.empresa}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(cotizacion.created_at), 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Badge className={getEstadoColor(cotizacion.estado)}>
                      {cotizacion.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${(cotizacion.total || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/admin/cotizaciones/${cotizacion.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {cotizacion.pdf_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(cotizacion.pdf_url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/admin/cotizaciones/${cotizacion.id}`)}>
                            Ver Detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/cotizaciones/${cotizacion.id}/editar`)}>
                            Editar
                          </DropdownMenuItem>
                          {cotizacion.pdf_url && (
                            <DropdownMenuItem onClick={() => window.open(cotizacion.pdf_url, '_blank')}>
                              Descargar PDF
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
