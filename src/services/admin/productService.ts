import { supabase } from '../supabaseClient'
import type { 
  Producto, 
  ProductoConPrecios,
  PrecioEscalonado,
  FiltrosProductos,
  ResultadoPaginado 
} from '@/src/types/admin'

/**
 * Servicio CRUD para gestión de productos
 */

/**
 * Obtiene lista paginada de productos con filtros
 */
export async function getProductos(
  filtros: FiltrosProductos = {}
): Promise<ResultadoPaginado<Producto>> {
  try {
    const {
      busqueda = '',
      categoria = 'todos',
      estado = 'todos',
      page = 1,
      perPage = 20
    } = filtros

    let query = supabase
      .from('productos')
      .select('*', { count: 'exact' })

    // Filtro de búsqueda
    if (busqueda) {
      query = query.or(`nombre.ilike.%${busqueda}%,sku.ilike.%${busqueda}%`)
    }

    // Filtro de categoría
    if (categoria !== 'todos') {
      query = query.eq('categoria', categoria)
    }

    // Filtro de estado
    if (estado === 'activos') {
      query = query.eq('activo', true)
    } else if (estado === 'inactivos') {
      query = query.eq('activo', false)
    }

    // Ordenar y paginar
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return {
      data: data || [],
      total: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage)
    }
  } catch (error) {
    console.error('Error en getProductos:', error)
    throw error
  }
}

/**
 * Obtiene un producto por ID con sus precios escalonados
 */
export async function getProductoById(id: number): Promise<ProductoConPrecios | null> {
  try {
    const { data: producto, error: productoError } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single()

    if (productoError) throw productoError
    if (!producto) return null

    // Obtener precios escalonados
    const { data: precios, error: preciosError } = await supabase
      .from('precios_escalonados')
      .select('*')
      .eq('producto_id', id)
      .order('cantidad_min', { ascending: true })

    if (preciosError) throw preciosError

    // Calcular precio base (el más bajo)
    const precio_base = precios && precios.length > 0
      ? Math.min(...precios.map(p => Number(p.precio_unitario)))
      : undefined

    return {
      ...producto,
      precios_escalonados: precios || [],
      precio_base
    }
  } catch (error) {
    console.error('Error en getProductoById:', error)
    throw error
  }
}

/**
 * Verifica si un SKU ya existe (para validación)
 */
export async function skuExists(sku: string, excludeId?: number): Promise<boolean> {
  try {
    let query = supabase
      .from('productos')
      .select('id')
      .eq('sku', sku)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query.single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return !!data
  } catch (error) {
    console.error('Error en skuExists:', error)
    return false
  }
}

/**
 * Crea un nuevo producto
 */
export async function createProducto(
  producto: Omit<Producto, 'id' | 'created_at' | 'updated_at'>
): Promise<Producto> {
  try {
    // Verificar SKU único
    const exists = await skuExists(producto.sku)
    if (exists) {
      throw new Error(`El SKU "${producto.sku}" ya existe`)
    }

    const { data, error } = await supabase
      .from('productos')
      .insert(producto)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error en createProducto:', error)
    throw error
  }
}

/**
 * Actualiza un producto existente
 */
export async function updateProducto(
  id: number,
  producto: Partial<Omit<Producto, 'id' | 'created_at' | 'updated_at'>>
): Promise<Producto> {
  try {
    // Si se está actualizando el SKU, verificar que sea único
    if (producto.sku) {
      const exists = await skuExists(producto.sku, id)
      if (exists) {
        throw new Error(`El SKU "${producto.sku}" ya existe`)
      }
    }

    const { data, error } = await supabase
      .from('productos')
      .update(producto)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error en updateProducto:', error)
    throw error
  }
}

/**
 * Elimina un producto y sus precios asociados
 */
export async function deleteProducto(id: number): Promise<void> {
  try {
    // Los precios se eliminan automáticamente por ON DELETE CASCADE
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error en deleteProducto:', error)
    throw error
  }
}

/**
 * Obtiene precios escalonados de un producto
 */
export async function getPreciosEscalonados(productoId: number): Promise<PrecioEscalonado[]> {
  try {
    const { data, error } = await supabase
      .from('precios_escalonados')
      .select('*')
      .eq('producto_id', productoId)
      .order('cantidad_min', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error en getPreciosEscalonados:', error)
    throw error
  }
}

/**
 * Agrega un precio escalonado
 */
export async function addPrecioEscalonado(
  productoId: number,
  precio: Omit<PrecioEscalonado, 'id' | 'producto_id' | 'created_at'>
): Promise<PrecioEscalonado> {
  try {
    // Verificar que no exista ya un precio con esa cantidad_min
    const { data: existing } = await supabase
      .from('precios_escalonados')
      .select('id')
      .eq('producto_id', productoId)
      .eq('cantidad_min', precio.cantidad_min)
      .single()

    if (existing) {
      throw new Error(`Ya existe un precio para cantidad mínima ${precio.cantidad_min}`)
    }

    const { data, error } = await supabase
      .from('precios_escalonados')
      .insert({
        producto_id: productoId,
        ...precio
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error en addPrecioEscalonado:', error)
    throw error
  }
}

/**
 * Actualiza un precio escalonado
 */
export async function updatePrecioEscalonado(
  id: number,
  precio: Partial<Omit<PrecioEscalonado, 'id' | 'producto_id' | 'created_at'>>
): Promise<PrecioEscalonado> {
  try {
    const { data, error } = await supabase
      .from('precios_escalonados')
      .update(precio)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error en updatePrecioEscalonado:', error)
    throw error
  }
}

/**
 * Elimina un precio escalonado
 */
export async function deletePrecioEscalonado(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('precios_escalonados')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error en deletePrecioEscalonado:', error)
    throw error
  }
}

/**
 * Verifica si un producto está en cotizaciones
 */
export async function isProductoEnCotizaciones(productoId: number): Promise<{
  enUso: boolean
  cantidadCotizaciones: number
}> {
  try {
    const { data, error, count } = await supabase
      .from('items_cotizacion')
      .select('cotizacion_id', { count: 'exact', head: true })
      .eq('producto_id', productoId)

    if (error) throw error

    return {
      enUso: (count || 0) > 0,
      cantidadCotizaciones: count || 0
    }
  } catch (error) {
    console.error('Error en isProductoEnCotizaciones:', error)
    return { enUso: false, cantidadCotizaciones: 0 }
  }
}
