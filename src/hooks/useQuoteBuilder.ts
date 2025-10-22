import { useState, useEffect } from 'react'
import { crearLead, crearCotizacion, registrarEvento } from '../services/quotes'
import { calculatePriceForProduct } from '../lib/data'
import { pdfGenerationService } from '../services/pdfGenerationService'

export interface QuoteItem {
  productId: number
  name: string
  category: string
  quantity: number
  pricePerUnit: number
  total: number
  minimumOrder: number
  isQuantityValid: boolean
}

export interface ContactInfo {
  nombreRazonSocial: string
  rucCedula: string
  email: string
  ciudad?: string
  telefono?: string
  mensaje?: string
}

export function useQuoteBuilder() {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    nombreRazonSocial: '',
    rucCedula: '',
    email: '',
    ciudad: '',
    telefono: '',
    mensaje: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar cotización desde localStorage al inicializar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedQuote = localStorage.getItem('fullcolor_quote')
      if (savedQuote) {
        try {
          setQuoteItems(JSON.parse(savedQuote))
        } catch (err) {
          console.error('Error parsing saved quote:', err)
        }
      }
    }
  }, [])

  // Guardar cotización en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined' && quoteItems.length > 0) {
      localStorage.setItem('fullcolor_quote', JSON.stringify(quoteItems))
    }
  }, [quoteItems])

  const addItemToQuote = async (productId: number, name: string, category: string, quantity: number) => {
    try {
      setLoading(true)
      setError(null)

      // Calcular precio usando la nueva función
      const priceResult = await calculatePriceForProduct(productId, quantity)
      
      if (!priceResult.product || !priceResult.isValid) {
        throw new Error('No se pudo calcular el precio para este producto')
      }

      const product = priceResult.product
      
      const newItem: QuoteItem = {
        productId: product.id,
        name: product.nombre,
        category: product.categoria,
        quantity,
        pricePerUnit: priceResult.pricePerUnit || 0,
        total: priceResult.subtotal,
        minimumOrder: product.minimo_pedido,
        isQuantityValid: priceResult.isValid
      }

      // Verificar si el producto ya existe en la cotización
      const existingIndex = quoteItems.findIndex(item => item.productId === productId)
      
      if (existingIndex >= 0) {
        // Actualizar cantidad del producto existente
        const updatedItems = [...quoteItems]
        updatedItems[existingIndex] = newItem
        setQuoteItems(updatedItems)
      } else {
        // Agregar nuevo producto
        setQuoteItems(prev => [...prev, newItem])
      }
    } catch (err) {
      console.error('Error adding item to quote:', err)
      setError(err instanceof Error ? err.message : 'Error al agregar producto')
    } finally {
      setLoading(false)
    }
  }

  const updateItemQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      setLoading(true)
      setError(null)

      const item = quoteItems.find(item => item.productId === productId)
      if (!item) return

      // Recalcular precio con nueva cantidad usando la nueva función
      const priceResult = await calculatePriceForProduct(productId, newQuantity)
      
      if (!priceResult.product || !priceResult.isValid) {
        throw new Error('No se pudo calcular el precio para esta cantidad')
      }

      const product = priceResult.product
      
      const updatedItem: QuoteItem = {
        ...item,
        quantity: newQuantity,
        pricePerUnit: priceResult.pricePerUnit || 0,
        total: priceResult.subtotal,
        minimumOrder: product.minimo_pedido,
        isQuantityValid: priceResult.isValid
      }

      setQuoteItems(prev =>
        prev.map(item => item.productId === productId ? updatedItem : item)
      )
    } catch (err) {
      console.error('Error updating item quantity:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar cantidad')
    } finally {
      setLoading(false)
    }
  }

  const removeItemFromQuote = (productId: number) => {
    setQuoteItems(prev => prev.filter(item => item.productId !== productId))
  }

  const clearQuote = () => {
    setQuoteItems([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fullcolor_quote')
    }
  }

  const calculateSubtotal = (): number => {
    return quoteItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateIVA = (): number => {
    return calculateSubtotal() * 0.15 // 15% IVA
  }

  const calculateTotal = (): number => {
    return calculateSubtotal() + calculateIVA()
  }

  const validateQuote = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (quoteItems.length === 0) {
      errors.push('La cotización debe tener al menos un producto')
    }

    const invalidItems = quoteItems.filter(item => !item.isQuantityValid)
    if (invalidItems.length > 0) {
      errors.push(`Algunos productos tienen cantidades menores al mínimo requerido`)
    }

    if (!contactInfo.nombreRazonSocial.trim()) {
      errors.push('El nombre o razón social es requerido')
    }

    if (!contactInfo.rucCedula.trim()) {
      errors.push('El RUC o Cédula es requerido')
    }

    if (!contactInfo.email.trim()) {
      errors.push('El correo electrónico es requerido')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
      errors.push('El correo electrónico no tiene un formato válido')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const submitQuote = async (): Promise<{ success: boolean; quoteId?: number; error?: string }> => {
    try {
      setLoading(true)
      setError(null)

      // Validar cotización
      const validation = validateQuote()
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // Crear lead
      const lead = await crearLead({
        nombre: contactInfo.nombreRazonSocial,
        email: contactInfo.email,
        telefono: contactInfo.telefono || '',
        empresa: contactInfo.nombreRazonSocial, // Usar el mismo nombre como empresa
        notas: contactInfo.mensaje,
        ruc_cedula: contactInfo.rucCedula,
        ciudad: contactInfo.ciudad
      })

      // Preparar items para la cotización
      const items = quoteItems.map(item => ({
        productoId: item.productId,
        cantidad: item.quantity,
        precioUnitario: item.pricePerUnit,
        subtotal: item.total
      }))

      // Crear cotización
      const { cotizacion } = await crearCotizacion({
        leadId: lead.id,
        items,
        canal: 'web',
        notas: contactInfo.mensaje
      })

      // Generar PDF automáticamente
      try {
        const pdfResult = await pdfGenerationService.generateQuotePDF(cotizacion.id)
        if (pdfResult.success) {
          console.log('PDF generado exitosamente:', pdfResult.pdfUrl)
        } else {
          console.warn('Error generando PDF:', pdfResult.error)
        }
      } catch (pdfError) {
        console.warn('Error en generación de PDF:', pdfError)
        // No fallar la cotización por error de PDF
      }

      // Limpiar cotización local
      clearQuote()

      return { success: true, quoteId: cotizacion.id }
    } catch (err: any) {
      console.error('❌ Error submitting quote:', err)
      console.error('❌ Error detallado:', {
        message: err?.message,
        stack: err?.stack,
        name: err?.name
      })
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar la cotización'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Función para generar PDF de una cotización existente
  const generatePDF = async (quoteId: number): Promise<{
    success: boolean
    pdfUrl?: string
    error?: string
  }> => {
    try {
      setLoading(true)
      setError(null)

      const result = await pdfGenerationService.generateQuotePDF(quoteId)
      
      if (!result.success) {
        setError(result.error || 'Error generando PDF')
        return result
      }

      return result
    } catch (err) {
      console.error('Error generating PDF:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error al generar PDF'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener URL de PDF existente
  const getPDFUrl = async (quoteId: number): Promise<string | null> => {
    try {
      return await pdfGenerationService.getExistingPDFUrl(quoteId)
    } catch (err) {
      console.error('Error getting PDF URL:', err)
      return null
    }
  }

  // Función para verificar si existe PDF
  const hasPDF = async (quoteId: number): Promise<boolean> => {
    try {
      return await pdfGenerationService.hasExistingPDF(quoteId)
    } catch (err) {
      console.error('Error checking PDF existence:', err)
      return false
    }
  }

  return {
    quoteItems,
    contactInfo,
    setContactInfo,
    loading,
    error,
    addItemToQuote,
    updateItemQuantity,
    removeItemFromQuote,
    clearQuote,
    calculateSubtotal,
    calculateIVA,
    calculateTotal,
    validateQuote,
    submitQuote,
    generatePDF,
    getPDFUrl,
    hasPDF
  }
}

