'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/AdminHeader'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Search, Edit, DollarSign, Trash2, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getProductos, deleteProducto } from '@/lib/admin-services'
import { ProductoConPrecios, CATEGORIAS_PRODUCTO } from '@/lib/admin-types'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

export default function ProductosPage() {
  const [productos, setProductos] = useState<ProductoConPrecios[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState<string>('all')
  const [activo, setActivo] = useState<string>('all')
  const [productoAEliminar, setProductoAEliminar] = useState<number | null>(null)
  const [eliminando, setEliminando] = useState(false)

  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 20,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    loadProductos()
  }, [search, categoria, activo, pagination.page])

  const loadProductos = async () => {
    try {
      setLoading(true)
      const result = await getProductos({
        search,
        categoria: categoria === 'all' ? undefined : categoria,
        activo: activo === 'all' ? 'all' : activo === 'true',
        page: pagination.page,
        perPage: pagination.perPage
      })

      setProductos(result.data)
      setPagination(prev => ({
        ...prev,
        total: result.total,
        totalPages: result.totalPages
      }))
    } catch (error) {
      console.error('Error cargando productos:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async () => {
    if (!productoAEliminar) return

    try {
      setEliminando(true)
      await deleteProducto(productoAEliminar)
      toast.success('Producto eliminado exitosamente')
      setProductoAEliminar(null)
      loadProductos()
    } catch (error) {
      console.error('Error eliminando producto:', error)
      toast.error('Error al eliminar producto')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <>
      <AdminHeader
        title="Productos"
        subtitle="Gestiona el catálogo de productos"
        action={
          <Link href="/admin/productos/nuevo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </Link>
        }
      />

      <div className="p-8 space-y-6">
        {/* Filtros */}
        <div className="bg-white rounded-lg border p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categoría */}
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {CATEGORIAS_PRODUCTO.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Estado */}
            <Select value={activo} onValueChange={setActivo}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Activos</SelectItem>
                <SelectItem value="false">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio Base</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Cargando productos...
                  </TableCell>
                </TableRow>
              ) : productos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="text-gray-500">
                      <p className="font-medium">No se encontraron productos</p>
                      <p className="text-sm mt-1">Intenta cambiar los filtros o crear uno nuevo</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                productos.map((producto) => (
                  <TableRow key={producto.id}>
                    {/* Imagen */}
                    <TableCell>
                      {producto.imagen_url ? (
                        <Image
                          src={producto.imagen_url}
                          alt={producto.nombre}
                          width={48}
                          height={48}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>

                    {/* Nombre */}
                    <TableCell className="font-medium">{producto.nombre}</TableCell>

                    {/* SKU */}
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {producto.sku}
                      </code>
                    </TableCell>

                    {/* Categoría */}
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {producto.categoria}
                      </span>
                    </TableCell>

                    {/* Precio Base */}
                    <TableCell>
                      {producto.precio_base ? (
                        <span className="font-semibold">
                          {formatCurrency(producto.precio_base)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Sin precio</span>
                      )}
                    </TableCell>

                    {/* Estado */}
                    <TableCell>
                      <Badge
                        variant={producto.activo ? 'default' : 'secondary'}
                      >
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/productos/${producto.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/productos/${producto.id}/precios`}>
                          <Button variant="ghost" size="sm">
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setProductoAEliminar(producto.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="border-t p-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {((pagination.page - 1) * pagination.perPage) + 1} - {Math.min(pagination.page * pagination.perPage, pagination.total)} de {pagination.total} productos
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={!!productoAEliminar} onOpenChange={() => setProductoAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto y todos sus precios escalonados serán eliminados permanentemente.
              {productos.find(p => p.id === productoAEliminar)?.veces_cotizado && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Este producto ha sido usado en cotizaciones. Al eliminarlo, esas cotizaciones seguirán mostrando el nombre del producto pero no podrás usarlo en nuevas cotizaciones.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={eliminando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              disabled={eliminando}
              className="bg-red-600 hover:bg-red-700"
            >
              {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
