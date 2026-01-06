import { supabase } from '../services/supabaseClient'
import { readFileSync } from 'fs'
import { join } from 'path'
import { formatDateLong } from '../lib/formatters'

/**
 * Servicio para generar PDFs de cotización usando plantilla HTML
 * Siempre lee datos frescos desde Supabase (única fuente de verdad)
 */
export class PDFQuoteService {
  private templatePath: string
  private templateContent: string

  constructor() {
    this.templatePath = join(process.cwd(), 'templates', 'cotizacion.html')
    this.templateContent = this.loadTemplate()
  }

  /**
   * Carga la plantilla HTML desde el archivo
   */
  private loadTemplate(): string {
    try {
      return readFileSync(this.templatePath, 'utf-8')
    } catch (error) {
      console.error('Error loading template:', error)
      throw new Error('No se pudo cargar la plantilla de cotización')
    }
  }

  /**
   * Obtiene datos frescos de la cotización desde Supabase
   */
  async getQuoteData(quoteId: number): Promise<QuotePDFData> {
    try {
      // Obtener cotización completa con lead e items
      const { data: cotizacion, error: cotizacionError } = await supabase
        .from('cotizaciones')
        .select(`
          *,
          leads (
            nombre,
            email,
            telefono,
            empresa,
            ruc_cedula,
            ciudad,
            notas
          )
        `)
        .eq('id', quoteId)
        .single()

      if (cotizacionError) {
        throw new Error(`Error obteniendo cotización: ${cotizacionError.message}`)
      }

      // Obtener items de la cotización con datos del producto
      const { data: items, error: itemsError } = await supabase
        .from('items_cotizacion')
        .select(`
          *,
          productos (
            nombre,
            categoria,
            imagen_url
          )
        `)
        .eq('cotizacion_id', quoteId)

      if (itemsError) {
        throw new Error(`Error obteniendo items: ${itemsError.message}`)
      }

      // Obtener escalas de precios para cada producto
      const productIds = items.map((item: any) => item.producto_id)
      const { data: escalas, error: escalasError } = await supabase
        .from('precios_escalonados')
        .select('*')
        .in('producto_id', productIds)
        .order('producto_id, cantidad_min')

      if (escalasError) {
        throw new Error(`Error obteniendo escalas: ${escalasError.message}`)
      }

      // Agrupar escalas por producto
      const escalasPorProducto = escalas.reduce((acc: any, escala: any) => {
        if (!acc[escala.producto_id]) {
          acc[escala.producto_id] = []
        }
        acc[escala.producto_id].push(escala)
        return acc
      }, {} as Record<number, any[]>)

      return {
        cotizacion,
        lead: (cotizacion as any).leads,
        items: items.map((item: any) => ({
          ...item,
          producto: item.productos,
          escalas: escalasPorProducto[item.producto_id] || []
        })),
        escalasPorProducto
      }
    } catch (error) {
      console.error('Error in getQuoteData:', error)
      throw error
    }
  }

  /**
   * Calcula totales frescos desde los datos de Supabase
   */
  calculateTotals(items: any[]): {
    subtotal: number
    iva0: number
    iva15: number
    total: number
  } {
    let subtotal = 0
    let iva0 = 0
    let iva15 = 0

    items.forEach(item => {
      const itemSubtotal = item.cantidad * item.precio_unitario_aplicado
      subtotal += itemSubtotal
      
      // Asumir IVA 15% para todos los productos (configurable)
      const iva = itemSubtotal * 0.15
      iva15 += iva
    })

    const total = subtotal + iva0 + iva15

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      iva0: Math.round(iva0 * 100) / 100,
      iva15: Math.round(iva15 * 100) / 100,
      total: Math.round(total * 100) / 100
    }
  }

  /**
   * Genera las filas de items para la tabla HTML
   */
  generateItemsRows(items: any[]): string {
    return items.map(item => {
      const imagen = item.producto?.imagen_url 
        ? `<img class="img" src="${item.producto.imagen_url}" alt="${item.producto.nombre}" />`
        : '<div class="img" style="background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af;">Sin imagen</div>'
      
      const precioUnitario = item.precio_unitario_aplicado.toFixed(2)
      const subtotal = (item.cantidad * item.precio_unitario_aplicado).toFixed(2)
      const iva = (item.cantidad * item.precio_unitario_aplicado * 0.15).toFixed(2)

      return `
        <tr>
          <td>${item.cantidad}</td>
          <td>${imagen}</td>
          <td>
            <strong>${item.producto.nombre}</strong><br/>
            <span class="muted">${item.producto.categoria}</span>
          </td>
          <td class="right">$${precioUnitario}</td>
          <td class="right">$${iva}</td>
          <td class="right">$${subtotal}</td>
        </tr>
      `
    }).join('')
  }

  /**
   * Reemplaza placeholders en la plantilla con datos reales
   */
  replacePlaceholders(template: string, data: QuotePDFData, totals: any): string {
    const lead = data.lead
    const cotizacion = data.cotizacion
    
    // Configuración de la empresa (hardcoded por ahora, podría venir de BD)
    const empresaConfig = {
      nombre: 'FullColor',
      direccion: 'Quito, Ecuador',
      telefono: '+593 99 123 4567',
      email: 'info@fullcolor.com',
      logoUrl: '/logo-fullcolor.png' // URL del logo
    }

    const replacements: Record<string, string> = {
      // Empresa
      '{{EMPRESA_LOGO_URL}}': empresaConfig.logoUrl,
      '{{EMPRESA_NOMBRE}}': empresaConfig.nombre,
      '{{EMPRESA_DIRECCION}}': empresaConfig.direccion,
      '{{EMPRESA_TELEFONO}}': empresaConfig.telefono,
      '{{EMPRESA_EMAIL}}': empresaConfig.email,

      // Cotización
      '{{COTIZACION_NUMERO}}': `FC-${cotizacion.id}`,
      '{{COTIZACION_FECHA}}': formatDateLong(cotizacion.created_at),
      '{{COTIZACION_VALIDEZ_DIAS}}': cotizacion.validez_dias.toString(),

      // Cliente
      '{{CLIENTE_NOMBRE}}': lead.nombre,
      '{{CLIENTE_DOCUMENTO}}': lead.ruc_cedula || 'No especificado',
      '{{CLIENTE_DIRECCION}}': lead.ciudad || 'No especificado',
      '{{CLIENTE_TELEFONO}}': lead.telefono || 'No especificado',
      '{{CLIENTE_EMAIL}}': lead.email,

      // Items
      '{{ITEMS_ROWS}}': this.generateItemsRows(data.items),

      // Totales
      '{{RESUMEN_SUBTOTAL}}': `$${totals.subtotal.toFixed(2)}`,
      '{{RESUMEN_IVA0}}': `$${totals.iva0.toFixed(2)}`,
      '{{RESUMEN_IVA15}}': `$${totals.iva15.toFixed(2)}`,
      '{{RESUMEN_TOTAL}}': `$${totals.total.toFixed(2)}`,

      // Observaciones
      '{{OBSERVACIONES}}': lead.notas || cotizacion.notas || 'Sin observaciones especiales'
    }

    // Reemplazar todos los placeholders
    let html = template
    Object.entries(replacements).forEach(([placeholder, value]) => {
      html = html.replace(new RegExp(placeholder, 'g'), value)
    })

    return html
  }

  /**
   * Genera el HTML final para el PDF
   */
  async generateQuoteHTML(quoteId: number): Promise<string> {
    try {
      // 1. Obtener datos frescos desde Supabase
      const quoteData = await this.getQuoteData(quoteId)
      
      // 2. Calcular totales frescos
      const totals = this.calculateTotals(quoteData.items)
      
      // 3. Reemplazar placeholders en la plantilla
      const html = this.replacePlaceholders(this.templateContent, quoteData, totals)
      
      return html
    } catch (error) {
      console.error('Error generating quote HTML:', error)
      throw error
    }
  }
}

/**
 * Interfaz para los datos de la cotización
 */
interface QuotePDFData {
  cotizacion: any
  lead: any
  items: Array<{
    cantidad: number
    precio_unitario_aplicado: number
    producto: any
    escalas: any[]
  }>
  escalasPorProducto: Record<number, any[]>
}

export default PDFQuoteService
