export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  category: string
  images: string[]
  basePrice: number
  customizable: boolean
  productionTime: string
  pricingTiers: PricingTier[]
  printOptions: PrintOption[]
}

export interface PricingTier {
  quantity: number
  unitPrice: number
  subtotal: number
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

export interface QuoteItem {
  product: Product
  quantity: number
  selectedOptions: Record<string, string>
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
