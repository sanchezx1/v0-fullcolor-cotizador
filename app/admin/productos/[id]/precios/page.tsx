'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  getProducto,
  getPreciosEscalonados,
  createPrecioEscalonado,
  updatePrecioEscalonado,
  deletePrecioEscalonado
} from '@/lib/admin-services'
import type { ProductoConPrecios, PrecioEscalonado } from '@/lib/admin-types'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { Plus, Edit, Trash2, ArrowLeft, Loader2, Percent } from 'lucide-react'
import Link from 'next/link'

export default function PreciosEscalonadosPage() {
  const params = useParams()
  const router = useRouter()
  const productoId = Number(params.id)

  const [producto, setProducto] = useState<ProductoConPrecios | null>(null)
  const [precios, setPrecios] = useState<PrecioEscalonado[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPrecio, setEditingPrecio] = useState<PrecioEscalonado | null>(null)
  const [precioAEliminar, setPrecioAEliminar] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    cantidad_min: '',
    precio_unitario: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [productoData, preciosData] = await Promise.all([
        getProducto(productoId),
        getPreciosEscalonados(productoId)
      ])
      setProducto(productoData)
      setPrecios(preciosData)
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error al cargar datos')
      router.push('/admin/productos')
    } finally {
      setLoading(false)
    }
  }, [productoId, router])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const openDialog = (precio?: PrecioEscalonado) => {
    if (precio) {
      setEditingPrecio(precio)
      setFormData({
        cantidad_min: precio.cantidad_min.toString(),
        precio_unitario: precio.precio_unitario.toString()
      })
    } else {
      setEditingPrecio(null)
      setFormData({
        cantidad_min: '',
        precio_unitario: ''
      })
    }
    setFormErrors({})
    setDialogOpen(true)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    const cantidadMin = parseInt(formData.cantidad_min)
    const precioUnitario = parseFloat(formData.precio_unitario)

    if (!formData.cantidad_min || isNaN(cantidadMin) || cantidadMin < 1) {
      errors.cantidad_min = 'La cantidad mínima debe ser mayor a 0'
    } else {
      // Verificar que no exista otro tramo con la misma cantidad_min
      const existe = precios.some(
        p => p.cantidad_min === cantidadMin && p.id !== editingPrecio?.id
      )
      if (existe) {
        errors.cantidad_min = 'Ya existe un tramo con esta cantidad mínima'
      }
    }

    if (!formData.precio_unitario || isNaN(precioUnitario) || precioUnitario <= 0) {
      errors.precio_unitario = 'El precio debe ser mayor a 0'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    try {
      setSaving(true)

      const data = {
        producto_id: productoId,
        cantidad_min: parseInt(formData.cantidad_min),
        precio_unitario: parseFloat(formData.precio_unitario)
      }

      if (editingPrecio) {
        await updatePrecioEscalonado(editingPrecio.id, data)
        toast.success('Tramo de precio actualizado')
      } else {
        await createPrecioEscalonado(data)
        toast.success('Tramo de precio creado')
      }

      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('Error guardando precio:', error)
      toast.error('Error al guardar precio')
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async () => {
    if (!precioAEliminar) return

    try {
      await deletePrecioEscalonado(precioAEliminar)
      toast.success('Tramo de precio eliminado')
      setPrecioAEliminar(null)
      loadData()
    } catch (error) {
      console.error('Error eliminando precio:', error)
      toast.error('Error al eliminar precio')
    }
  }

  const calcularDescuento = (precio: number, index: number): number => {
    if (index === 0 || precios.length === 0) return 0
    const precioBase = precios[0].precio_unitario
    return ((precioBase - precio) / precioBase) * 100
  }

  if (loading) {
    return (
      <>
        <AdminHeader title="Cargando..." subtitle="Espera un momento" />
        <div className="p-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </>
    )
  }

  return (
    <>
      <AdminHeader
        title={`Precios Escalonados - ${producto?.nombre}`}
        subtitle="Configura los precios según cantidad"
        action={
          <div className="flex gap-2">
            <Link href={`/admin/productos/${productoId}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Producto
              </Button>
            </Link>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Tramo
            </Button>
          </div>
        }
      />

      <div className="p-8">
        <div className="bg-white rounded-lg border">
          {precios.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-4">
                <Percent className="h-12 w-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay precios configurados
              </h3>
              <p className="text-gray-600 mb-6">
                Este producto no tiene precios configurados. Agrega el primer tramo de precio.
              </p>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Tramo
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cantidad Mínima</TableHead>
                    <TableHead>Precio Unitario</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {precios.map((precio, index) => {
                    const descuento = calcularDescuento(precio.precio_unitario, index)
                    return (
                      <TableRow key={precio.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                Precio Base
                              </span>
                            )}
                            <span className="font-medium">
                              {precio.cantidad_min}
                              {index === precios.length - 1 && '+'} unidades
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-lg font-semibold">
                            {formatCurrency(precio.precio_unitario)}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">c/u</span>
                        </TableCell>
                        <TableCell>
                          {descuento > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                              <Percent className="h-3 w-3 mr-1" />
                              -{descuento.toFixed(0)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDialog(precio)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPrecioAEliminar(precio.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Vista previa de descuentos */}
              {precios.length > 1 && (
                <div className="border-t bg-gray-50 p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    📊 Vista Previa de Descuentos
                  </h4>
                  <div className="space-y-1 text-sm">
                    {precios.map((precio, index) => {
                      const descuento = calcularDescuento(precio.precio_unitario, index)
                      return (
                        <div key={precio.id} className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">
                            {precio.cantidad_min}
                            {index === precios.length - 1 ? '+' : `-${precios[index + 1]?.cantidad_min - 1 || '∞'}`} unidades:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(precio.precio_unitario)} c/u
                          </span>
                          {descuento > 0 && (
                            <span className="text-green-600 font-medium">
                              (-{descuento.toFixed(0)}%)
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dialog para agregar/editar precio */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPrecio ? 'Editar Tramo de Precio' : 'Agregar Tramo de Precio'}
            </DialogTitle>
            <DialogDescription>
              {editingPrecio
                ? 'Modifica los valores del tramo de precio existente'
                : 'Define la cantidad mínima y el precio unitario para este tramo'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cantidad Mínima */}
            <div className="space-y-2">
              <Label htmlFor="cantidad_min">
                Cantidad Mínima <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cantidad_min"
                type="number"
                min="1"
                value={formData.cantidad_min}
                onChange={(e) => setFormData({ ...formData, cantidad_min: e.target.value })}
                placeholder="Ej: 100"
                className={formErrors.cantidad_min ? 'border-red-500' : ''}
              />
              {formErrors.cantidad_min && (
                <p className="text-sm text-red-500">{formErrors.cantidad_min}</p>
              )}
            </div>

            {/* Precio Unitario */}
            <div className="space-y-2">
              <Label htmlFor="precio_unitario">
                Precio Unitario <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="precio_unitario"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.precio_unitario}
                  onChange={(e) => setFormData({ ...formData, precio_unitario: e.target.value })}
                  placeholder="Ej: 0.80"
                  className={`pl-7 ${formErrors.precio_unitario ? 'border-red-500' : ''}`}
                />
              </div>
              {formErrors.precio_unitario && (
                <p className="text-sm text-red-500">{formErrors.precio_unitario}</p>
              )}
              <p className="text-sm text-gray-500">
                Usa dos decimales (Ej: 0.80, 1.50)
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  editingPrecio ? 'Guardar Cambios' : 'Guardar Tramo'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={!!precioAEliminar} onOpenChange={() => setPrecioAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este tramo de precio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El tramo será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
