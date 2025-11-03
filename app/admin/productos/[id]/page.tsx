'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ProductGalleryManager, type GalleryDisplayItem } from '@/components/admin/ProductGalleryManager'
import {
  getProducto,
  updateProducto,
  verificarSkuUnico,
  listProductoGaleria,
  uploadProductoGaleriaImagen,
  deleteProductoGaleriaImagen,
  deleteImagen,
} from '@/lib/admin-services'
import { CATEGORIAS_PRODUCTO } from '@/lib/admin-types'
import type { ProductoConPrecios } from '@/lib/admin-types'
import { toast } from 'sonner'
import { Loader2, DollarSign } from 'lucide-react'
import Link from 'next/link'

type GalleryItemState = {
  id: string
  src: string
  status: 'existing' | 'new'
  path?: string
  file?: File
  isPrimary: boolean
  pendingRemoval?: boolean
}

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const productoId = Number(params.id)

  const [producto, setProducto] = useState<ProductoConPrecios | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    nombre: '',
    sku: '',
    descripcion: '',
    categoria: '',
    color: '',
    lados: '',
    impresion: '',
    activo: true,
    agotado: false,
    mas_vendido: false,
    imagen_url: ''
  })
  const [galleryItems, setGalleryItems] = useState<GalleryItemState[]>([])

  useEffect(() => {
    loadProducto()
  }, [productoId])

  const loadProducto = async () => {
    try {
      setLoading(true)
      const data = await getProducto(productoId)
      
      if (!data) {
        toast.error('Producto no encontrado')
        router.push('/admin/productos')
        return
      }
      
      setProducto(data)
      setFormData({
        nombre: data.nombre,
        sku: data.sku,
        descripcion: data.descripcion || '',
        categoria: data.categoria,
        color: data.color || '',
        lados: data.lados || '',
        impresion: data.impresion || '',
        activo: data.activo,
        agotado: Boolean(data.agotado),
        mas_vendido: Boolean(data.mas_vendido),
        imagen_url: data.imagen_url || ''
      })

      await loadGalleryForProduct(data)
    } catch (error) {
      console.error('Error cargando producto:', error)
      toast.error('Error al cargar producto')
      router.push('/admin/productos')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {}

    // Nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
    }

    // SKU
    if (!formData.sku.trim()) {
      newErrors.sku = 'El SKU es requerido'
    } else if (!/^[A-Za-z0-9-]+$/.test(formData.sku)) {
      newErrors.sku = 'El SKU solo puede contener letras, números y guiones'
    } else if (formData.sku !== producto?.sku) {
      // Solo validar unicidad si cambió el SKU
      const esUnico = await verificarSkuUnico(formData.sku)
      if (!esUnico) {
        newErrors.sku = 'Este SKU ya existe'
      }
    }

    // Categoría
    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es requerida'
    }

    // Descripción
    if (formData.descripcion && formData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const extractStoragePath = (url?: string | null): string | null => {
    if (!url) return null
    const parts = url.split('/productos/')
    return parts[1] || null
  }

  const loadGalleryForProduct = async (productData: ProductoConPrecios | null) => {
    if (!productData) {
      setGalleryItems([])
      return
    }

    try {
      const storedItems = await listProductoGaleria(productData.id)

      let items: GalleryItemState[] = storedItems.map((item) => ({
        id: item.path,
        src: item.url,
        status: 'existing',
        path: item.path,
        isPrimary: false,
      }))

      const primaryFromGallery = items.find((item) => item.src === productData.imagen_url)

      if (productData.imagen_url && !primaryFromGallery) {
        const derivedPath = extractStoragePath(productData.imagen_url)
        items = [
          ...items,
          {
            id: derivedPath ?? `producto-${productData.id}-principal`,
            src: productData.imagen_url,
            status: 'existing',
            path: derivedPath ?? undefined,
            isPrimary: false,
          },
        ]
      }

      if (items.length > 0) {
        const primaryId =
          items.find((item) => item.src === productData.imagen_url)?.id ?? items[0].id

        items = items.map((item) => ({
          ...item,
          isPrimary: item.id === primaryId,
        }))
      }

      setGalleryItems(items)
    } catch (error) {
  console.error('Error cargando galería del producto:', error)
      if (productData.imagen_url) {
        const derivedPath = extractStoragePath(productData.imagen_url)
        setGalleryItems([
          {
            id: derivedPath ?? `producto-${productData.id}-principal`,
            src: productData.imagen_url,
            status: 'existing',
            path: derivedPath ?? undefined,
            isPrimary: true,
          },
        ])
      } else {
        setGalleryItems([])
      }
    }
  }

  const createGalleryId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }
    return `gallery-${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

  const ensurePrimarySelection = (items: GalleryItemState[]): GalleryItemState[] => {
    const active = items.filter((item) => !item.pendingRemoval)
    if (active.length === 0) {
      return items.map((item) => ({ ...item, isPrimary: false }))
    }
    const primary = active.find((item) => item.isPrimary) ?? active[0]
    return items.map((item) => ({
      ...item,
      isPrimary: item.id === primary.id,
    }))
  }

  const handleGalleryAdd = (files: File[]) => {
    if (!files || files.length === 0) return

    const MAX_SIZE = 5 * 1024 * 1024
    const accepted: File[] = []

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" no es un archivo de imagen válido`)
        return
      }
      if (file.size > MAX_SIZE) {
        toast.error(`"${file.name}" excede el tamaño máximo de 5MB`)
        return
      }
      accepted.push(file)
    })

    if (accepted.length === 0) return

    const newItems = accepted.map((file) => ({
      id: createGalleryId(),
      src: URL.createObjectURL(file),
      file,
      status: 'new' as const,
      isPrimary: false,
    }))

    setGalleryItems((prev) => {
      const appended = [...prev, ...newItems]
      return ensurePrimarySelection(appended)
    })
  }

  const handleGalleryRemove = (id: string) => {
    setGalleryItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (!target) return prev

      if (target.status === 'new') {
        if (target.file) {
          URL.revokeObjectURL(target.src)
        }
        const filtered = prev.filter((item) => item.id !== id)
        return ensurePrimarySelection(filtered)
      }

      if (target.pendingRemoval) {
        return prev
      }

      const updated = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              pendingRemoval: true,
              isPrimary: false,
            }
          : item
      )

      return ensurePrimarySelection(updated)
    })
  }

  const handleGalleryRestore = (id: string) => {
    setGalleryItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (!target) return prev

      const updated = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              pendingRemoval: false,
            }
          : item
      )

      return ensurePrimarySelection(updated)
    })
  }

  const handleGallerySetPrimary = (id: string) => {
    setGalleryItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (!target || target.pendingRemoval) return prev

      return prev.map((item) => ({
        ...item,
        isPrimary: item.id === id,
      }))
    })
  }

  const galleryDisplayItems = useMemo<GalleryDisplayItem[]>(() => {
    return galleryItems.map((item) => ({
      id: item.id,
      src: item.src,
      isPrimary: item.isPrimary,
      status: item.status,
      pendingRemoval: item.pendingRemoval,
    }))
  }, [galleryItems])

  const syncGalleryChanges = async (productoId: number): Promise<string | undefined> => {
    const uploadedMap = new Map<string, { url: string; path: string }>()

    for (const item of galleryItems) {
      if (item.status === 'new' && !item.pendingRemoval && item.file) {
        const result = await uploadProductoGaleriaImagen(productoId, item.file)
        uploadedMap.set(item.id, result)
        URL.revokeObjectURL(item.src)
      }
    }

    for (const item of galleryItems) {
      if (item.pendingRemoval) {
        if (item.path) {
          await deleteProductoGaleriaImagen(item.path)
        } else if (item.src) {
          await deleteImagen(item.src, 'productos')
        }
      }
    }

    const activeItems = galleryItems
      .map((item) => {
        if (item.status === 'new' && uploadedMap.has(item.id)) {
          const uploaded = uploadedMap.get(item.id)!
          return {
            ...item,
            src: uploaded.url,
            path: uploaded.path,
          }
        }
        return item
      })
      .filter((item) => !item.pendingRemoval)

    if (activeItems.length === 0) {
      return undefined
    }

    const primaryItem = activeItems.find((item) => item.isPrimary) ?? activeItems[0]

    if (primaryItem.status === 'new') {
      return uploadedMap.get(primaryItem.id)?.url
    }

    return primaryItem.src
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = await validateForm()
    if (!isValid) {
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    try {
      setSaving(true)

      const primaryImageUrl = await syncGalleryChanges(productoId)

      await updateProducto(productoId, {
        nombre: formData.nombre,
        sku: formData.sku,
        descripcion: formData.descripcion || undefined,
        categoria: formData.categoria,
        color: formData.color || undefined,
        lados: formData.lados || undefined,
        impresion: formData.impresion || undefined,
        activo: formData.activo,
        agotado: formData.agotado,
        mas_vendido: formData.mas_vendido,
        imagen_url: primaryImageUrl ?? undefined
      })

      toast.success('Producto actualizado exitosamente')
      await loadProducto()
      router.push('/admin/productos')
    } catch (error: any) {
      console.error('Error actualizando producto:', error)
      const errorMessage = error?.message || error?.error_description || 'Error al actualizar producto'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
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
    title={`Editar Producto: ${producto?.nombre}`}
    subtitle="Actualizar información del producto"
        action={
          producto?.precios_escalonados && producto.precios_escalonados.length > 0 && (
            <Link href={`/admin/productos/${productoId}/precios`}>
              <Button variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Ir a Precios
              </Button>
            </Link>
          )
        }
      />

      <div className="p-8">
        <div className="max-w-3xl bg-white rounded-lg border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre del Producto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Tarjetas de presentación"
                className={errors.nombre ? 'border-red-500' : ''}
              />
              {errors.nombre && (
                <p className="text-sm text-red-500">{errors.nombre}</p>
              )}
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">
                SKU <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="Ej: TARJ-001"
                className={errors.sku ? 'border-red-500' : ''}
              />
              {errors.sku && (
                <p className="text-sm text-red-500">{errors.sku}</p>
              )}
              <p className="text-sm text-gray-500">
                Solo alfanuméricos y guiones. Debe ser único.
              </p>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción del producto..."
                rows={4}
                maxLength={500}
                className={errors.descripcion ? 'border-red-500' : ''}
              />
              {errors.descripcion && (
                <p className="text-sm text-red-500">{errors.descripcion}</p>
              )}
              <p className="text-sm text-gray-500 text-right">
                {formData.descripcion.length}/500 caracteres
              </p>
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="categoria">
                Categoría <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger className={errors.categoria ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_PRODUCTO.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoria && (
                <p className="text-sm text-red-500">{errors.categoria}</p>
              )}
            </div>

            {/* Galería de Imágenes */}
            <div className="space-y-3">
              <div>
                <Label>Galería de Imágenes</Label>
                <p className="text-sm text-gray-500">
                  Administra todas las vistas del producto. Marca una imagen como principal para resaltarla en el catálogo.
                </p>
              </div>
              <ProductGalleryManager
                items={galleryDisplayItems}
                onAddFiles={handleGalleryAdd}
                onSetPrimary={handleGallerySetPrimary}
                onRemove={handleGalleryRemove}
                onRestore={handleGalleryRestore}
                disabled={saving}
              />
            </div>

            {/* Atributos opcionales */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Atributos Opcionales</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Color */}
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Ej: Full Color"
                  />
                </div>

                {/* Lados */}
                <div className="space-y-2">
                  <Label htmlFor="lados">Lados</Label>
                  <Select
                    value={formData.lados}
                    onValueChange={(value) => setFormData({ ...formData, lados: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Un lado">Un lado</SelectItem>
                      <SelectItem value="Dos lados">Dos lados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Impresión */}
                <div className="space-y-2">
                  <Label htmlFor="impresion">Impresión</Label>
                  <Select
                    value={formData.impresion}
                    onValueChange={(value) => setFormData({ ...formData, impresion: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Color">Full Color</SelectItem>
                      <SelectItem value="Blanco y Negro">Blanco y Negro</SelectItem>
                      <SelectItem value="Sin impresión">Sin impresión</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <Label htmlFor="activo" className="text-base font-semibold text-slate-900">Visible en catálogo</Label>
                  <p id="activo-help" className="text-sm text-gray-500">
                    Los productos inactivos no aparecerán en el catálogo público.
                  </p>
                </div>
                <Switch
                  id="activo"
                  aria-describedby="activo-help"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                  className="self-start sm:self-auto"
                />
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition-colors sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <Label htmlFor="agotado" className="text-base font-semibold text-slate-900">Marcar como agotado</Label>
                  <p id="agotado-help" className="text-sm text-gray-500">
                    Muestra una etiqueta "Agotado" en el catálogo y bloquea nuevas adiciones a cotizaciones.
                  </p>
                </div>
                <Switch
                  id="agotado"
                  aria-describedby="agotado-help"
                  checked={formData.agotado}
                  onCheckedChange={(checked) => setFormData({ ...formData, agotado: checked })}
                  className="self-start sm:self-auto"
                />
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-[#0066CC]/25 bg-[#0066CC]/10 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <Label htmlFor="mas-vendido" className="text-base font-semibold text-[#0066CC]">Destacar como "Más vendido"</Label>
                  <p id="mas-vendido-help" className="text-sm text-[#1F2937]">
                    Resalta este producto con un badge especial en el catálogo y en la ficha detallada.
                  </p>
                </div>
                <Switch
                  id="mas-vendido"
                  aria-describedby="mas-vendido-help"
                  checked={formData.mas_vendido}
                  onCheckedChange={(checked) => setFormData({ ...formData, mas_vendido: checked })}
                  className="self-start sm:self-auto"
                />
              </div>
            </div>


            {/* Botones */}
            <div className="flex flex-wrap gap-3 pt-6">
              <Button
                type="submit"
                disabled={saving}
                className="min-w-[140px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>

  {/* Dialog de confirmación para eliminar imagen */}
      
    </>
  )
}
