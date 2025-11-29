/**
 * Funciones centralizadas de formato para el proyecto FullColor
 *
 * Este módulo proporciona funciones consistentes para formatear:
 * - Monedas (USD en formato ecuatoriano)
 * - Fechas (en varios formatos)
 * - Cantidades numéricas
 *
 * @module formatters
 */

/**
 * Opciones para formatear moneda
 */
export interface CurrencyOptions extends Intl.NumberFormatOptions {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name"
}

/**
 * Opciones para formatear fechas
 */
export interface DateFormatOptions extends Intl.DateTimeFormatOptions {
  locale?: string
}

/**
 * Formatea un número como moneda en dólares estadounidenses (USD)
 * usando el formato ecuatoriano (es-EC).
 *
 * @param value - El valor numérico a formatear
 * @param options - Opciones adicionales de formato (opcional)
 * @returns El valor formateado como moneda (ej: "$1.234,56")
 *
 * @example
 * formatCurrency(1234.56) // "$1.234,56"
 * formatCurrency(1234.56, { currencyDisplay: "narrowSymbol" }) // "$1.234,56"
 */
export function formatCurrency(value: number, options?: CurrencyOptions): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value)
}

/**
 * Formatea una fecha en formato corto ecuatoriano.
 * Formato: "dd/MMM/yyyy" (ej: "27/nov/2025")
 *
 * @param value - La fecha como string o objeto Date
 * @param options - Opciones adicionales de formato (opcional)
 * @returns La fecha formateada
 *
 * @example
 * formatDate("2025-11-27") // "27/nov/2025"
 * formatDate(new Date()) // "27/nov/2025"
 */
export function formatDate(value: string | Date, options?: DateFormatOptions): string {
  const date = typeof value === "string" ? new Date(value) : value
  const locale = options?.locale ?? "es-EC"

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date)
}

/**
 * Formatea una fecha en formato largo ecuatoriano.
 * Formato: "dd de MMMM de yyyy" (ej: "27 de noviembre de 2025")
 *
 * @param value - La fecha como string o objeto Date
 * @param options - Opciones adicionales de formato (opcional)
 * @returns La fecha formateada en formato largo
 *
 * @example
 * formatDateLong("2025-11-27") // "27 de noviembre de 2025"
 */
export function formatDateLong(value: string | Date, options?: DateFormatOptions): string {
  const date = typeof value === "string" ? new Date(value) : value
  const locale = options?.locale ?? "es-EC"

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(date)
}

/**
 * Formatea una fecha con hora en formato ecuatoriano.
 * Formato: "dd/MMM/yyyy HH:mm" (ej: "27/nov/2025 14:30")
 *
 * @param value - La fecha como string o objeto Date
 * @param options - Opciones adicionales de formato (opcional)
 * @returns La fecha y hora formateadas
 *
 * @example
 * formatDateTime("2025-11-27T14:30:00") // "27/nov/2025 14:30"
 */
export function formatDateTime(value: string | Date, options?: DateFormatOptions): string {
  const date = typeof value === "string" ? new Date(value) : value
  const locale = options?.locale ?? "es-EC"

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(date)
}

/**
 * Formatea una fecha en formato muy corto (solo números).
 * Formato: "dd/MM/yyyy" (ej: "27/11/2025")
 *
 * @param value - La fecha como string o objeto Date
 * @param options - Opciones adicionales de formato (opcional)
 * @returns La fecha formateada en formato corto
 *
 * @example
 * formatDateShort("2025-11-27") // "27/11/2025"
 */
export function formatDateShort(value: string | Date, options?: DateFormatOptions): string {
  const date = typeof value === "string" ? new Date(value) : value
  const locale = options?.locale ?? "es-EC"

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  }).format(date)
}

/**
 * Formatea un número como cantidad sin decimales.
 * Usa separadores de miles según el formato ecuatoriano.
 *
 * @param value - El valor numérico a formatear
 * @param options - Opciones adicionales de formato (opcional)
 * @returns La cantidad formateada (ej: "1.234")
 *
 * @example
 * formatQuantity(1234) // "1.234"
 * formatQuantity(1234567) // "1.234.567"
 */
export function formatQuantity(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat("es-EC", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(value)
}

/**
 * Formatea una fecha en formato relativo (hace X tiempo).
 * Para fechas antiguas (>7 días), retorna la fecha formateada normalmente.
 *
 * @param value - La fecha como string o objeto Date
 * @returns La fecha en formato relativo o formateada
 *
 * @example
 * formatRelativeDate(new Date()) // "hace un momento"
 * formatRelativeDate(new Date(Date.now() - 60000)) // "hace 1 minuto"
 * formatRelativeDate(new Date(Date.now() - 3600000)) // "hace 1 hora"
 * formatRelativeDate("2025-01-01") // "01/ene/2025" (si >7 días)
 */
export function formatRelativeDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "hace un momento"
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `hace ${minutes} minuto${minutes !== 1 ? "s" : ""}`
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `hace ${hours} hora${hours !== 1 ? "s" : ""}`
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `hace ${days} día${days !== 1 ? "s" : ""}`
  }

  // Para fechas > 7 días, retornar fecha formateada
  return formatDate(date)
}

/**
 * Formatea una fecha para uso en elementos `<time datetime="">`.
 * Retorna la fecha en formato ISO 8601.
 *
 * @param value - La fecha como string o objeto Date
 * @returns La fecha en formato ISO 8601
 *
 * @example
 * formatDateISO("2025-11-27") // "2025-11-27T00:00:00.000Z"
 */
export function formatDateISO(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value
  return date.toISOString()
}
