export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cotizaciones: {
        Row: {
          access_token: string
          canal: string
          created_at: string | null
          estado: string
          id: number
          iva: number | null
          lead_id: number
          notas: string | null
          numero: string
          pdf_url: string | null
          subtotal: number | null
          total: number
          updated_at: string | null
          user_id: string | null
          validez_dias: number
        }
        Insert: {
          access_token?: string
          canal?: string
          created_at?: string | null
          estado?: string
          id?: number
          iva?: number | null
          lead_id: number
          notas?: string | null
          numero: string
          pdf_url?: string | null
          subtotal?: number | null
          total?: number
          updated_at?: string | null
          user_id?: string | null
          validez_dias?: number
        }
        Update: {
          access_token?: string
          canal?: string
          created_at?: string | null
          estado?: string
          id?: number
          iva?: number | null
          lead_id?: number
          notas?: string | null
          numero?: string
          pdf_url?: string | null
          subtotal?: number | null
          total?: number
          updated_at?: string | null
          user_id?: string | null
          validez_dias?: number
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_estadisticas"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string
          error_message: string | null
          estado_envio: string
          id: number
          quote_id: number | null
          sendgrid_message_id: string | null
          tipo_correo: string
          to_email: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          estado_envio: string
          id?: number
          quote_id?: number | null
          sendgrid_message_id?: string | null
          tipo_correo: string
          to_email: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          estado_envio?: string
          id?: number
          quote_id?: number | null
          sendgrid_message_id?: string | null
          tipo_correo?: string
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          cotizacion_id: number
          created_at: string | null
          descripcion: string | null
          id: number
          metadata: Json | null
          tipo: string
        }
        Insert: {
          cotizacion_id: number
          created_at?: string | null
          descripcion?: string | null
          id?: number
          metadata?: Json | null
          tipo: string
        }
        Update: {
          cotizacion_id?: number
          created_at?: string | null
          descripcion?: string | null
          id?: number
          metadata?: Json | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      items_cotizacion: {
        Row: {
          cantidad: number
          cotizacion_id: number
          created_at: string | null
          id: number
          precio_unitario_aplicado: number
          producto_id: number
          subtotal: number
        }
        Insert: {
          cantidad: number
          cotizacion_id: number
          created_at?: string | null
          id?: number
          precio_unitario_aplicado: number
          producto_id: number
          subtotal: number
        }
        Update: {
          cantidad?: number
          cotizacion_id?: number
          created_at?: string | null
          id?: number
          precio_unitario_aplicado?: number
          producto_id?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "items_cotizacion_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_cotizacion_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_cotizacion_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos_top_cotizados"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_actividades: {
        Row: {
          created_at: string | null
          descripcion: string
          id: number
          lead_id: number
          realizado_por: string | null
          resultado: string | null
          tipo: string
        }
        Insert: {
          created_at?: string | null
          descripcion: string
          id?: number
          lead_id: number
          realizado_por?: string | null
          resultado?: string | null
          tipo: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string
          id?: number
          lead_id?: number
          realizado_por?: string | null
          resultado?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_actividades_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_actividades_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_estadisticas"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          ciudad: string | null
          created_at: string | null
          email: string
          empresa: string | null
          estado: string | null
          id: number
          nombre: string
          notas: string | null
          origen: string | null
          presupuesto_estimado: number | null
          prioridad: string | null
          proximo_seguimiento: string | null
          ruc_cedula: string | null
          score: number | null
          telefono: string | null
          temperatura: string | null
          ultimo_contacto: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          ciudad?: string | null
          created_at?: string | null
          email: string
          empresa?: string | null
          estado?: string | null
          id?: number
          nombre: string
          notas?: string | null
          origen?: string | null
          presupuesto_estimado?: number | null
          prioridad?: string | null
          proximo_seguimiento?: string | null
          ruc_cedula?: string | null
          score?: number | null
          telefono?: string | null
          temperatura?: string | null
          ultimo_contacto?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          ciudad?: string | null
          created_at?: string | null
          email?: string
          empresa?: string | null
          estado?: string | null
          id?: number
          nombre?: string
          notas?: string | null
          origen?: string | null
          presupuesto_estimado?: number | null
          prioridad?: string | null
          proximo_seguimiento?: string | null
          ruc_cedula?: string | null
          score?: number | null
          telefono?: string | null
          temperatura?: string | null
          ultimo_contacto?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      precios_escalonados: {
        Row: {
          cantidad_min: number
          created_at: string | null
          id: number
          precio_unitario: number
          producto_id: number
        }
        Insert: {
          cantidad_min: number
          created_at?: string | null
          id?: number
          precio_unitario: number
          producto_id: number
        }
        Update: {
          cantidad_min?: number
          created_at?: string | null
          id?: number
          precio_unitario?: number
          producto_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "precios_escalonados_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precios_escalonados_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos_top_cotizados"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          activo: boolean
          categoria: string
          created_at: string | null
          descripcion: string | null
          id: number
          imagen_url: string | null
          minimo_pedido: number
          nombre: string
          sku: string
          unidad: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean
          categoria: string
          created_at?: string | null
          descripcion?: string | null
          id?: number
          imagen_url?: string | null
          minimo_pedido?: number
          nombre: string
          sku: string
          unidad?: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean
          categoria?: string
          created_at?: string | null
          descripcion?: string | null
          id?: number
          imagen_url?: string | null
          minimo_pedido?: number
          nombre?: string
          sku?: string
          unidad?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      estadisticas_dashboard: {
        Row: {
          cotizaciones_aprobadas: number | null
          cotizaciones_borrador: number | null
          cotizaciones_enviadas: number | null
          cotizaciones_mes: number | null
          cotizaciones_pendiente: number | null
          cotizaciones_rechazadas: number | null
          ingresos_estimados: number | null
          productos_activos: number | null
          total_cotizaciones: number | null
          total_leads: number | null
        }
        Relationships: []
      }
      leads_estadisticas: {
        Row: {
          created_at: string | null
          email: string | null
          estado: string | null
          id: number | null
          nombre: string | null
          origen: string | null
          presupuesto_estimado: number | null
          primera_cotizacion: string | null
          prioridad: string | null
          proximo_seguimiento: string | null
          score: number | null
          tasa_conversion: number | null
          temperatura: string | null
          total_cotizaciones: number | null
          total_ventas: number | null
          ultima_cotizacion: string | null
          ultimo_contacto: string | null
        }
        Relationships: []
      }
      productos_top_cotizados: {
        Row: {
          categoria: string | null
          id: number | null
          imagen_url: string | null
          ingresos_generados: number | null
          nombre: string | null
          sku: string | null
          unidades_totales: number | null
          veces_cotizado: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calcular_score_lead: { Args: { lead_id_param: number }; Returns: number }
      check_lead_email_exists: { Args: { p_email: string }; Returns: boolean }
      create_public_lead: {
        Args: {
          p_ciudad?: string
          p_email: string
          p_empresa?: string
          p_nombre: string
          p_notas?: string
          p_ruc_cedula?: string
          p_telefono?: string
        }
        Returns: Json
      }
      create_public_quote: {
        Args: {
          p_canal?: string
          p_items: Json
          p_lead_id: number
          p_notas?: string
        }
        Returns: Json
      }
      generar_numero_cotizacion: { Args: Record<string, never>; Returns: string }
      increment_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number }
        Returns: {
          hit_count: number
          limited: boolean
          retry_after_seconds: number
        }[]
      }
      is_admin: { Args: Record<string, never>; Returns: boolean }
      link_lead_to_auth_user: { Args: { p_email: string }; Returns: Json }
      sugerir_origen_lead: {
        Args: { referer?: string; url_params?: Json }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
