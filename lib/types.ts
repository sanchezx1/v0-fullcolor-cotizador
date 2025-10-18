// Tipos para el sistema de cotizaciones
// Los tipos principales de productos y precios están ahora en src/lib/data.ts

export interface QuoteItem {
  productId: number
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface QuoteFormData {
  name: string
  company: string
  taxId: string
  email: string
  phone: string
  notes: string
}

export interface PrintOption {
  id: string
  name: string
  type: "sides" | "color" | "finish"
  options: {
    label: string
    value: string
    priceModifier?: number
  }[]
}