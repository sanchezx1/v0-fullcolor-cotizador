import type { Cotizacion } from "@/src/services/supabaseClient"

const STATUS_META: Record<
  Cotizacion["estado"],
  { label: string; badgeClass: string; description: string }
> = {
  borrador: {
    label: "Borrador",
    badgeClass: "bg-slate-100 text-slate-700 border border-slate-200",
    description: "Aun no se ha enviado",
  },
  pendiente: {
    label: "Pendiente",
    badgeClass: "bg-amber-100 text-amber-800 border border-amber-200",
    description: "Recibida, en cola de revision",
  },
  enviada: {
    label: "Enviada",
    badgeClass: "bg-blue-100 text-blue-800 border border-blue-200",
    description: "Cotizacion enviada al cliente",
  },
  en_revision: {
    label: "En revision",
    badgeClass: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    description: "Equipo revisando detalles",
  },
  aprobada: {
    label: "Aprobada",
    badgeClass: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    description: "Aprobada y lista para avanzar",
  },
  rechazada: {
    label: "Rechazada",
    badgeClass: "bg-rose-100 text-rose-800 border border-rose-200",
    description: "La solicitud fue rechazada",
  },
  vencida: {
    label: "Vencida",
    badgeClass: "bg-neutral-200 text-neutral-700 border border-neutral-300",
    description: "Supero la fecha de validez",
  },
}

export function getQuoteStatusMeta(status: Cotizacion["estado"]) {
  return STATUS_META[status] ?? STATUS_META.pendiente
}
