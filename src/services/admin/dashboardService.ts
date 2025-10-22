import { supabase } from '../supabaseClient'
import type { 
  EstadisticasDashboard, 
  ProductoTopCotizado,
  DatosGrafica
} from '@/src/types/admin'

/**
 * Servicio para obtener datos del dashboard
 */

/**
 * Obtiene estadísticas generales del dashboard
 */
export async function getEstadisticasDashboard(): Promise<EstadisticasDashboard> {
  try {
    const { data, error } = await supabase
      .from('estadisticas_dashboard')
      .select('*')
      .single()

    if (error) throw error

    return data as EstadisticasDashboard
  } catch (error) {
    console.error('Error en getEstadisticasDashboard:', error)
    // Retornar valores por defecto en caso de error
    return {
      total_cotizaciones: 0,
      cotizaciones_mes: 0,
      ingresos_estimados: 0,
      cotizaciones_borrador: 0,
      cotizaciones_enviadas: 0,
      cotizaciones_aprobadas: 0,
      cotizaciones_rechazadas: 0,
      productos_activos: 0,
      total_leads: 0
    }
  }
}

/**
 * Obtiene productos más cotizados
 */
export async function getProductosTopCotizados(limit: number = 5): Promise<ProductoTopCotizado[]> {
  try {
    const { data, error } = await supabase
      .from('productos_top_cotizados')
      .select('*')
      .limit(limit)

    if (error) throw error

    return (data || []) as ProductoTopCotizado[]
  } catch (error) {
    console.error('Error en getProductosTopCotizados:', error)
    return []
  }
}

/**
 * Obtiene datos para gráfica de cotizaciones por día (últimos 7 días)
 */
export async function getCotizacionesPorDia(): Promise<DatosGrafica[]> {
  try {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    // Agrupar por día
    const groupedByDay: { [key: string]: number } = {}
    
    // Inicializar últimos 7 días con 0
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      groupedByDay[dateStr] = 0
    }

    // Contar cotizaciones por día
    data?.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0]
      if (groupedByDay.hasOwnProperty(date)) {
        groupedByDay[date]++
      }
    })

    // Convertir a array para la gráfica
    return Object.entries(groupedByDay).map(([fecha, cotizaciones]) => ({
      fecha: new Date(fecha).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short' 
      }),
      cotizaciones
    }))
  } catch (error) {
    console.error('Error en getCotizacionesPorDia:', error)
    return []
  }
}

/**
 * Obtiene comparativa del mes actual vs mes anterior
 */
export async function getComparativaMensual(): Promise<{
  mesActual: number
  mesAnterior: number
  cambio: number
  porcentaje: number
}> {
  try {
    const now = new Date()
    const primerDiaMesActual = new Date(now.getFullYear(), now.getMonth(), 1)
    const primerDiaMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Cotizaciones mes actual
    const { count: mesActual } = await supabase
      .from('cotizaciones')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', primerDiaMesActual.toISOString())

    // Cotizaciones mes anterior
    const { count: mesAnterior } = await supabase
      .from('cotizaciones')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', primerDiaMesAnterior.toISOString())
      .lt('created_at', primerDiaMesActual.toISOString())

    const actual = mesActual || 0
    const anterior = mesAnterior || 0
    const cambio = actual - anterior
    const porcentaje = anterior > 0 ? ((cambio / anterior) * 100) : 0

    return {
      mesActual: actual,
      mesAnterior: anterior,
      cambio,
      porcentaje: Math.round(porcentaje * 10) / 10
    }
  } catch (error) {
    console.error('Error en getComparativaMensual:', error)
    return {
      mesActual: 0,
      mesAnterior: 0,
      cambio: 0,
      porcentaje: 0
    }
  }
}
