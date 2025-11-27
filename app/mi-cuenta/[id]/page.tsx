"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CalendarClock, FileText, Loader2, Mail, Package, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthSession } from "@/src/hooks/useAuthSession"
import { getQuoteStatusMeta } from "@/src/lib/quoteStatus"
import { asegurarLeadVinculado } from "@/src/services/accounts"
import { obtenerCotizacionDeUsuarioPorId } from "@/src/services/quotes"
import type { Cotizacion, ItemCotizacion, Lead } from "@/src/services/supabaseClient"
import { toast } from "sonner"

type QuoteDetail = Cotizacion & { leads: Lead; items_cotizacion: (ItemCotizacion & { productos: any })[] }

const formatCurrency = (value: number) =>
  value.toLocaleString("es-EC", { style: "currency", currency: "USD", minimumFractionDigits: 2 })

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

export default function QuoteDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { isAuthenticated, isAdmin, user: authUser, status: authStatus } = useAuthSession()

  const quoteId = useMemo(() => Number(params?.id), [params])
  const [quote, setQuote] = useState<QuoteDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [linking, setLinking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!quoteId || Number.isNaN(quoteId)) {
      setError("Identificador de cotizacion no valido")
    }
  }, [quoteId])

  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin")
    }
  }, [isAdmin, router])

  useEffect(() => {
    if (authStatus === "unauthenticated" && !isAuthenticated && quoteId) {
      router.replace(`/auth/login?redirectTo=${encodeURIComponent(`/mi-cuenta/${quoteId}`)}`)
    }
  }, [authStatus, isAuthenticated, quoteId, router])

  useEffect(() => {
    if (!isAuthenticated || !authUser || !quoteId || Number.isNaN(quoteId) || isAdmin) return

    let isActive = true

    const loadDetail = async () => {
      try {
        setLinking(true)
        await asegurarLeadVinculado(authUser.email)
      } finally {
        if (isActive) setLinking(false)
      }

      setLoading(true)
      setError(null)

      try {
        const detail = await obtenerCotizacionDeUsuarioPorId(quoteId)
        if (!isActive) return

        if (!detail) {
          setError("No encontramos esta cotizacion")
          return
        }

        setQuote(detail as QuoteDetail)
      } catch (err) {
        console.error("Error cargando detalle de cotizacion:", err)
        if (isActive) {
          setError("No pudimos cargar esta cotizacion")
          toast.error("No pudimos cargar la cotizacion")
        }
      } finally {
        if (isActive) setLoading(false)
      }
    }

    loadDetail()

    return () => {
      isActive = false
    }
  }, [authUser, isAdmin, isAuthenticated, quoteId])

  if (authStatus === "loading") {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="mb-6 h-10 w-24" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-6 h-[480px] w-full rounded-xl" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Inicia sesion para ver esta cotizacion.</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-4">
        <Button asChild variant="ghost" className="px-0">
          <Link href="/mi-cuenta" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Mi cuenta
          </Link>
        </Button>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">No pudimos mostrar esta cotizacion</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-primary text-white hover:bg-primary-hover">
              <Link href="/catalogo">
                Ir al catalogo
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading || !quote) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-4">
        <Button asChild variant="ghost" className="px-0">
          <Link href="/mi-cuenta" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Mi cuenta
          </Link>
        </Button>
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
    )
  }

  const status = getQuoteStatusMeta(quote.estado)

  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" className="px-0">
          <Link href="/mi-cuenta" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Mi cuenta
          </Link>
        </Button>
        {linking && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Sincronizando tu cuenta...
          </span>
        )}
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardDescription>Cotizacion {quote.numero || `#${quote.id}`}</CardDescription>
            <CardTitle className="text-2xl font-bold">Resumen</CardTitle>
          </div>
          <Badge className={status.badgeClass}>{status.label}</Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-4">
            <span className="text-sm text-muted-foreground">Creada el</span>
            <span className="font-semibold">{quote.created_at ? formatDateTime(quote.created_at) : 'N/A'}</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              Validez: {quote.validez_dias} dias
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-bold">{formatCurrency(quote.total)}</span>
            <div className="text-sm text-muted-foreground">
              Subtotal {formatCurrency(quote.subtotal ?? 0)} • IVA {formatCurrency(quote.iva ?? 0)}
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-4">
            <span className="text-sm text-muted-foreground">Estado</span>
            <span className="font-semibold">{status.description}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-[1.2fr,1fr]">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Package className="h-5 w-5" />
              Productos cotizados
            </CardTitle>
            <CardDescription>
              Detalle de cantidades y precios unitarios tal como se registraron en la cotizacion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {quote.items_cotizacion?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio unitario</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.items_cotizacion.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productos?.nombre || `Item ${item.id}`}</TableCell>
                      <TableCell className="text-right">{item.cantidad}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.precio_unitario_aplicado)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No hay items asociados a esta cotizacion.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5" />
              Datos de contacto
            </CardTitle>
            <CardDescription>Solo visibles para ti.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{quote.leads?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{quote.leads?.telefono || "Sin telefono"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>{quote.leads?.ruc_cedula || "Sin RUC/Cedula"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{quote.leads?.nombre}</span>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">
              Si necesitas actualizar tus datos, vuelve a la pestana de Datos de contacto en Mi cuenta.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
