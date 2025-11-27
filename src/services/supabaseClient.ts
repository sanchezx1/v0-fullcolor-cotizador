"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/src/types/database.types"

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
  descripcion: string | null
  categoria: string
  unidad: string
  minimo_pedido: number
  agotado?: boolean
  mas_vendido?: boolean
  activo: boolean
  imagen_url: string | null
  sku: string
  created_at: string | null
  updated_at: string | null
}

export interface PrecioEscalonado {
  id: number
  producto_id: number
  cantidad_min: number
  precio_unitario: number
  created_at: string | null
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
  user_id: string | null
  estado: string
  total: number
  subtotal: number | null
  iva: number | null
  validez_dias: number
  pdf_url: string | null
  numero: string
  canal: string
  notas: string | null
  created_at: string | null
  updated_at: string | null
  access_token: string
}

export interface ItemCotizacion {
  id: number
  cotizacion_id: number
  producto_id: number
  cantidad: number
  precio_unitario_aplicado: number
  subtotal: number
  created_at: string | null
}

export interface Evento {
  id: number
  cotizacion_id: number
  tipo: string
  descripcion: string | null
  metadata: Json | null
  created_at: string | null
}

// Type alias para Json
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Database type is now imported from generated types at @/src/types/database.types
// This ensures type-safety with the actual Supabase schema
