"use client"

import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage =
    "Missing Supabase environment variables. Please check your .env file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."

  if (typeof window === "undefined") {
    console.error("Warning: variables de entorno faltantes:")
    console.error("URL:", supabaseUrl)
    console.error("Key:", supabaseAnonKey ? "Presente" : "Ausente")
    throw new Error(errorMessage)
  } else {
    console.error("Warning [Supabase Client]: " + errorMessage)
  }
}

export const supabase = createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      apikey: supabaseAnonKey!,
    },
  },
})

export interface Producto {
  id: number
  nombre: string
  descripcion: string
  categoria: string
  unidad: string
  minimo_pedido: number
  agotado?: boolean
  mas_vendido?: boolean
  activo: boolean
  imagen_url?: string
  created_at: string
  updated_at: string
}

export interface PrecioEscalonado {
  id: number
  producto_id: number
  cantidad_min: number
  precio_unitario: number
  created_at: string
}

export interface Lead {
  id: number
  nombre: string
  email: string
  telefono?: string
  empresa?: string
  notas?: string
  ruc_cedula?: string
  ciudad?: string
  user_id?: string | null
  created_at: string
  updated_at: string
}

export type LeadReference = Pick<Lead, "id" | "email"> & { user_id?: string | null }

export interface Cotizacion {
  id: number
  lead_id: number
  user_id?: string | null
  estado: "borrador" | "pendiente" | "enviada" | "en_revision" | "aprobada" | "rechazada" | "vencida"
  total: number
  subtotal: number
  iva: number
  validez_dias: number
  pdf_url?: string
  numero: string
  canal: "web" | "whatsapp" | "email"
  notas?: string
  created_at: string
  updated_at: string
  access_token: string
}

export interface ItemCotizacion {
  id: number
  cotizacion_id: number
  producto_id: number
  cantidad: number
  precio_unitario_aplicado: number
  subtotal: number
  created_at: string
}

export interface Evento {
  id: number
  cotizacion_id: number
  tipo: "pdf_generado" | "email_enviado" | "whatsapp_share" | "cotizacion_creada" | "cotizacion_actualizada"
  metadata?: Record<string, any>
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      productos: {
        Row: Producto
        Insert: Omit<Producto, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Producto, "id" | "created_at" | "updated_at">>
      }
      precios_escalonados: {
        Row: PrecioEscalonado
        Insert: Omit<PrecioEscalonado, "id" | "created_at">
        Update: Partial<Omit<PrecioEscalonado, "id" | "created_at">>
      }
      leads: {
        Row: Lead
        Insert: Omit<Lead, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Lead, "id" | "created_at" | "updated_at">>
      }
      cotizaciones: {
        Row: Cotizacion
        Insert: Omit<Cotizacion, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Cotizacion, "id" | "created_at" | "updated_at">>
      }
      items_cotizacion: {
        Row: ItemCotizacion
        Insert: Omit<ItemCotizacion, "id" | "created_at">
        Update: Partial<Omit<ItemCotizacion, "id" | "created_at">>
      }
      eventos: {
        Row: Evento
        Insert: Omit<Evento, "id" | "created_at">
        Update: Partial<Omit<Evento, "id" | "created_at">>
      }
    }
  }
}
