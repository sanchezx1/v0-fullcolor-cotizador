'use client'

import { useState } from 'react'
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
import { ImageUpload } from '@/components/admin/ImageUpload'
import { createProducto, verificarSkuUnico, uploadImagen } from '@/lib/admin-services'
import { CATEGORIAS_PRODUCTO } from '@/lib/admin-types'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

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
    imagen: null as File | null
  })

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
    } else {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = await validateForm()
    if (!isValid) {
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    try {
      setLoading(true)

      // Subir imagen si existe
      let imagen_url: string | undefined
      if (formData.imagen) {
        const filename = `${formData.sku}-${Date.now()}.${formData.imagen.name.split('.').pop()}`
        imagen_url = await uploadImagen(formData.imagen, 'productos', filename)
      }

      // Crear producto
      const producto = await createProducto({
        nombre: formData.nombre,
        sku: formData.sku,
        descripcion: formData.descripcion || undefined,
        categoria: formData.categoria,
        color: formData.color || undefined,
        lados: formData.lados || undefined,
        impresion: formData.impresion || undefined,
        activo: formData.activo,
        imagen_url
      })

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

      // Subir imagen si existe
      let imagen_url: string | undefined
      if (formData.imagen) {
        const filename = `${formData.sku}-${Date.now()}.${formData.imagen.name.split('.').pop()}`
        imagen_url = await uploadImagen(formData.imagen, 'productos', filename)
      }

      // Crear producto
      const producto = await createProducto({
        nombre: formData.nombre,
        sku: formData.sku,
        descripcion: formData.descripcion || undefined,
        categoria: formData.categoria,
        color: formData.color || undefined,
        lados: formData.lados || undefined,
        impresion: formData.impresion || undefined,
        activo: formData.activo,
        imagen_url
      })

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

            {/* Imagen */}
            <div className="space-y-2">
              <Label>Imagen del Producto</Label>
              <ImageUpload
                value={formData.imagen || undefined}
                onChange={(file) => setFormData({ ...formData, imagen: file })}
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
            <div className="flex items-center justify-between border-t pt-6">
              <div className="space-y-1">
                <Label htmlFor="activo">Estado del Producto</Label>
                <p className="text-sm text-gray-500">
                  Los productos inactivos no aparecerán en el catálogo público
                </p>
              </div>
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              />
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
