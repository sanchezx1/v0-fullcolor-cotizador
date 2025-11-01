import { supabase, Producto, PrecioEscalonado } from '../services/supabaseClient'
import { normalizeProductFromSource } from '@/lib/product-status'

// Cache simple en memoria
let productsCache: Producto[] | null = null
let pricingCache: Map<number, PrecioEscalonado[]> = new Map()
let lastCacheUpdate: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export interface ProductWithTiers extends Producto {
  pricingTiers: PrecioEscalonado[]
}

export interface PricingTier {
  minQty: number
  maxQty: number | null
  pricePerUnit: number
}

/**
 * Función única para calcular precio basado en cantidad
 * Regla: usar el tier con mayor minQty que sea <= cantidad
 */
export function priceForQuantity(tiers: PricingTier[], quantity: number): {
  pricePerUnit: number | null
  subtotal: number
  appliedTier: PricingTier | null
  isValid: boolean
} {
  if (!tiers || tiers.length === 0 || quantity <= 0) {
    return {
      pricePerUnit: null,
      subtotal: 0,
      appliedTier: null,
      isValid: false
    }
  }

  // Ordenar tiers por minQty descendente para encontrar el mayor aplicable
  const sortedTiers = [...tiers].sort((a, b) => b.minQty - a.minQty)
  
  // Encontrar el tier aplicable (mayor minQty <= quantity)
  const appliedTier = sortedTiers.find(tier => 
    quantity >= tier.minQty && 
    (tier.maxQty === null || quantity <= tier.maxQty)
  )

  if (!appliedTier) {
    return {
      pricePerUnit: null,
      subtotal: 0,
      appliedTier: null,
      isValid: false
    }
  }

  return {
    pricePerUnit: appliedTier.pricePerUnit,
    subtotal: appliedTier.pricePerUnit * quantity,
    appliedTier,
    isValid: true
  }
}

/**
 * Convierte PrecioEscalonado[] a PricingTier[] para compatibilidad
 */
function convertToPricingTiers(escalas: PrecioEscalonado[]): PricingTier[] {
  return escalas.map((escala, index) => ({
    minQty: escala.cantidad_min,
    maxQty: index < escalas.length - 1 ? escalas[index + 1].cantidad_min - 1 : null,
    pricePerUnit: escala.precio_unitario
  }))
}

/**
 * Verifica si el cache está válido
 */
function isCacheValid(): boolean {
  return productsCache !== null && (Date.now() - lastCacheUpdate) < CACHE_DURATION
}

/**
 * Limpia el cache
 */
export function clearCache(): void {
  productsCache = null
  pricingCache.clear()
  lastCacheUpdate = 0
}

/**
 * Fuerza la revalidación del cache
 */
export async function revalidateCache(): Promise<void> {
  clearCache()
  await loadProducts()
}

/**
 * Carga todos los productos desde Supabase
 */
async function loadProducts(): Promise<Producto[]> {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('categoria', { ascending: true })
      .order('nombre', { ascending: true })

    if (error) {
      console.error('Error loading products:', error)
      throw error
    }

    const normalized = (data || []).map(normalizeProductFromSource)
    productsCache = normalized
    lastCacheUpdate = Date.now()
    return productsCache
  } catch (error) {
    console.error('Error in loadProducts:', error)
    throw error
  }
}

/**
 * Carga las escalas de precios para un producto específico
 */
async function loadPricingTiers(productId: number): Promise<PrecioEscalonado[]> {
  try {
    const { data, error } = await supabase
      .from('precios_escalonados')
      .select('*')
      .eq('producto_id', productId)
      .order('cantidad_min', { ascending: true })

    if (error) {
      console.error('Error loading pricing tiers:', error)
      throw error
    }

    const tiers = data || []
    pricingCache.set(productId, tiers)
    return tiers
  } catch (error) {
    console.error('Error in loadPricingTiers:', error)
    throw error
  }
}

/**
 * Obtiene un producto con sus escalas de precios
 */
export async function getProductWithTiers(id: number): Promise<ProductWithTiers | null> {
  try {
    // Cargar productos si no están en cache
    if (!isCacheValid()) {
      await loadProducts()
    }

    // Buscar producto en cache
    const product = productsCache?.find(p => p.id === id)
    if (!product) {
      return null
    }

    // Cargar escalas de precios
    const tiers = await loadPricingTiers(id)
    
    return {
      ...product,
      pricingTiers: tiers
    }
  } catch (error) {
    console.error('Error in getProductWithTiers:', error)
    return null
  }
}

/**
 * Lista todos los productos
 */
export async function listProducts(): Promise<Producto[]> {
  try {
    if (!isCacheValid()) {
      await loadProducts()
    }
    return productsCache || []
  } catch (error) {
    console.error('Error in listProducts:', error)
    return []
  }
}

/**
 * Busca productos por término
 */
export async function searchProducts(term: string): Promise<Producto[]> {
  try {
    const products = await listProducts()
    if (!term.trim()) return products
    
    return products.filter(product =>
      product.nombre.toLowerCase().includes(term.toLowerCase()) ||
      product.descripcion?.toLowerCase().includes(term.toLowerCase()) ||
      product.categoria.toLowerCase().includes(term.toLowerCase())
    )
  } catch (error) {
    console.error('Error in searchProducts:', error)
    return []
  }
}

/**
 * Obtiene productos por categoría
 */
export async function getProductsByCategory(category: string): Promise<Producto[]> {
  try {
    const products = await listProducts()
    return products.filter(product => product.categoria === category)
  } catch (error) {
    console.error('Error in getProductsByCategory:', error)
    return []
  }
}

/**
 * Calcula precio para un producto específico
 */
export async function calculatePriceForProduct(
  productId: number, 
  quantity: number
): Promise<{
  pricePerUnit: number | null
  subtotal: number
  appliedTier: PricingTier | null
  isValid: boolean
  product: Producto | null
}> {
  try {
    const productWithTiers = await getProductWithTiers(productId)
    if (!productWithTiers) {
      return {
        pricePerUnit: null,
        subtotal: 0,
        appliedTier: null,
        isValid: false,
        product: null
      }
    }

    const pricingTiers = convertToPricingTiers(productWithTiers.pricingTiers)
    const result = priceForQuantity(pricingTiers, quantity)

    return {
      ...result,
      product: productWithTiers
    }
  } catch (error) {
    console.error('Error in calculatePriceForProduct:', error)
    return {
      pricePerUnit: null,
      subtotal: 0,
      appliedTier: null,
      isValid: false,
      product: null
    }
  }
}
