'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { createProducto, verificarSkuUnico, updateProducto, uploadProductoGaleriaImagen } from '@/lib/admin-services'
import { CATEGORIAS_PRODUCTO } from '@/lib/admin-types'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

type GalleryItemState = {
  id: string
  src: string
  file?: File
  status: 'new' | 'existing'
  path?: string
  isPrimary: boolean
  pendingRemoval?: boolean
}

export default function NuevoProductoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
    mas_vendido: false
  })
  const [galleryItems, setGalleryItems] = useState<GalleryItemState[]>([])
  
  const [skuManual, setSkuManual] = useState(false)

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {}

    // Nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
    }

    // SKU (solo validar si se ingresa manualmente)
    if (skuManual && formData.sku.trim()) {
      if (!/^[A-Za-z0-9-]+$/.test(formData.sku)) {
        newErrors.sku = 'El SKU solo puede contener letras, números y guiones'
      } else {
        const esUnico = await verificarSkuUnico(formData.sku)
        if (!esUnico) {
          newErrors.sku = 'Este SKU ya existe'
        }
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

  const createGalleryId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }
    return `gallery-${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

  const handleGalleryAdd = (files: File[]) => {
    if (!files || files.length === 0) {
      return
    }

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

    if (accepted.length === 0) {
      return
    }

    const newItems: GalleryItemState[] = accepted.map((file) => ({
      id: createGalleryId(),
      src: URL.createObjectURL(file),
      file,
      status: 'new' as const,
      isPrimary: false,
      pendingRemoval: false,
    }))

    setGalleryItems((prev) => {
      const appended = [...prev, ...newItems]
      const active = appended.filter((item) => !item.pendingRemoval)

      if (!active.some((item) => item.isPrimary) && active.length > 0) {
        const primaryId = active[0].id
        return appended.map((item) => ({
          ...item,
          isPrimary: item.id === primaryId,
        }))
      }

      return appended
    })
  }

  const handleGalleryRemove = (id: string) => {
    setGalleryItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (!target) return prev

      if (target.file) {
        URL.revokeObjectURL(target.src)
      }

      const filtered = prev.filter((item) => item.id !== id)
      const active = filtered.filter((item) => !item.pendingRemoval)

      if (target.isPrimary && active.length > 0) {
        const primaryId = active[0].id
        return filtered.map((item) => ({
          ...item,
          isPrimary: item.id === primaryId,
        }))
      }

      return filtered
    })
  }

  const handleGallerySetPrimary = (id: string) => {
    setGalleryItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (!target || target.pendingRemoval) {
        return prev
      }

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

  const syncGalleryWithStorage = async (productoId: number): Promise<string | undefined> => {
    const itemsToKeep = galleryItems.filter((item) => !item.pendingRemoval)

    if (itemsToKeep.length === 0) {
      return undefined
    }

    const uploadedMap = new Map<string, string>()

    for (const item of itemsToKeep) {
      if (item.status === 'new' && item.file) {
        const { url } = await uploadProductoGaleriaImagen(productoId, item.file)
        uploadedMap.set(item.id, url)
        URL.revokeObjectURL(item.src)
      }
    }

    const primaryItem = itemsToKeep.find((item) => item.isPrimary) ?? itemsToKeep[0]

    if (!primaryItem) {
      return undefined
    }

    if (primaryItem.status === 'new') {
      return uploadedMap.get(primaryItem.id)
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
      setLoading(true)

      // Crear producto (SKU se genera automáticamente si está vacío)
      const producto = await createProducto({
        nombre: formData.nombre,
        sku: skuManual ? formData.sku : '',
        descripcion: formData.descripcion || undefined,
        categoria: formData.categoria,
        activo: formData.activo,
        agotado: formData.agotado,
        mas_vendido: formData.mas_vendido
      })

      const primaryImageUrl = await syncGalleryWithStorage(producto.id)

      if (primaryImageUrl) {
        await updateProducto(producto.id, { imagen_url: primaryImageUrl })
      }

      toast.success('Producto creado exitosamente')
      router.push('/admin/productos')
    } catch (error) {
      console.error('Error creando producto:', error)
      toast.error('Error al crear producto')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAndPrices = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = await validateForm()
    if (!isValid) {
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    try {
      setLoading(true)

            // Crear producto (SKU se genera automáticamente si está vacío)
      const producto = await createProducto({
        nombre: formData.nombre,
        sku: skuManual ? formData.sku : '',
        descripcion: formData.descripcion || undefined,
        categoria: formData.categoria,
        activo: formData.activo,
        agotado: formData.agotado,
        mas_vendido: formData.mas_vendido
      })

      const primaryImageUrl = await syncGalleryWithStorage(producto.id)

      if (primaryImageUrl) {
        await updateProducto(producto.id, { imagen_url: primaryImageUrl })
      }

      toast.success('Producto creado exitosamente')
      router.push(`/admin/productos/${producto.id}/precios`)
    } catch (error) {
      console.error('Error creando producto:', error)
      toast.error('Error al crear producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AdminHeader
        title="Nuevo Producto"
        subtitle="Crear un nuevo producto en el catálogo"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="sku">SKU (Código del Producto)</Label>
                <button
                  type="button"
                  onClick={() => {
                    setSkuManual(!skuManual)
                    if (!skuManual) {
                      setFormData({ ...formData, sku: '' })
                    }
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  {skuManual ? '← Generar automáticamente' : '✏️ Ingresar manualmente'}
                </button>
              </div>
              
              {skuManual ? (
                <>
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
                </>
              ) : (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    🤖 El SKU se generará <span className="font-semibold">automáticamente</span> al guardar el producto.
                  </p>
                  {formData.categoria && (
                    <p className="text-sm text-gray-600 mt-2">
                      Ejemplo para <span className="font-medium">{formData.categoria}</span>: 
                      <code className="ml-1 px-2 py-0.5 bg-white rounded text-primary font-mono">
                        {formData.categoria === 'Papelería Corporativa' && 'PAP-001'}
                        {formData.categoria === 'Publicidad' && 'PUB-001'}
                        {formData.categoria === 'Promocional' && 'PROM-001'}
                        {formData.categoria === 'Señalética' && 'SEN-001'}
                        {formData.categoria === 'Packaging' && 'PACK-001'}
                        {formData.categoria === 'Textil' && 'TEXT-001'}
                        {formData.categoria === 'Digital' && 'DIG-001'}
                        {formData.categoria === 'Otro' && 'PROD-001'}
                      </code>
                    </p>
                  )}
                </div>
              )}
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
                  Sube varias vistas del producto. La imagen principal se mostrará en el catálogo público.
                </p>
              </div>
              <ProductGalleryManager
                items={galleryDisplayItems}
                onAddFiles={handleGalleryAdd}
                onSetPrimary={handleGallerySetPrimary}
                onRemove={handleGalleryRemove}
                disabled={loading}
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
                    Muestra una etiqueta "Agotado" en el catálogo y bloqueará nuevas adiciones a cotizaciones.
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
                disabled={loading}
                className="min-w-[140px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Producto'
                )}
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={loading}
                onClick={handleSaveAndPrices}
                className="min-w-[200px]"
              >
                Guardar y Configurar Precios
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
