"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Building2,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Notebook,
  Phone,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthSession } from "@/src/hooks/useAuthSession"
import { getQuoteStatusMeta } from "@/src/lib/quoteStatus"
import {
  asegurarLeadVinculado,
  actualizarLeadDeUsuario,
  obtenerLeadDeUsuario,
} from "@/src/services/accounts"
import { obtenerCotizacionesDeUsuario } from "@/src/services/quotes"
import type { Cotizacion, Lead } from "@/src/services/supabaseClient"
import { toast } from "sonner"

type QuoteWithLead = Cotizacion & { leads: Lead }

const formatCurrency = (value: number) =>
  value.toLocaleString("es-EC", { style: "currency", currency: "USD", minimumFractionDigits: 2 })

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" })

export default function MiCuentaPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, user: authUser, status: authStatus } = useAuthSession()

  const [quotes, setQuotes] = useState<QuoteWithLead[]>([])
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [linking, setLinking] = useState(false)

  const [contact, setContact] = useState<Lead | null>(null)
  const [contactLoading, setContactLoading] = useState(false)
  const [savingContact, setSavingContact] = useState(false)
  const [contactForm, setContactForm] = useState({
    nombre: "",
    telefono: "",
    empresa: "",
    ciudad: "",
    ruc_cedula: "",
  })

  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin")
    }
  }, [isAdmin, router])

  useEffect(() => {
    if (authStatus === "unauthenticated" && !isAuthenticated) {
      router.replace("/auth/login?redirectTo=/mi-cuenta")
    }
  }, [authStatus, isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated || !authUser || isAdmin) return

    let isActive = true

    const loadData = async () => {
      try {
        setLinking(true)
        await asegurarLeadVinculado(authUser.email)
      } finally {
        if (isActive) {
          setLinking(false)
        }
      }

      setQuotesLoading(true)
      setContactLoading(true)

      try {
        const [quotesResponse, leadResponse] = await Promise.all([
          obtenerCotizacionesDeUsuario(),
          obtenerLeadDeUsuario(),
        ])

        if (!isActive) return

        setQuotes(quotesResponse)
        setContact(leadResponse)

        if (leadResponse) {
          setContactForm({
            nombre: leadResponse.nombre ?? "",
            telefono: leadResponse.telefono ?? "",
            empresa: leadResponse.empresa ?? "",
            ciudad: leadResponse.ciudad ?? "",
            ruc_cedula: leadResponse.ruc_cedula ?? "",
          })
        }
      } catch (error) {
        console.error("Error cargando datos de Mi cuenta:", error)
        toast.error("No pudimos cargar tu informacion de cuenta")
      } finally {
        if (isActive) {
          setQuotesLoading(false)
          setContactLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isActive = false
    }
  }, [authUser, isAdmin, isAuthenticated])

  const quoteStats = useMemo(() => {
    const resumen = {
      total: quotes.length,
      aprobadas: 0,
      enRevision: 0,
      pendientes: 0,
    }

    quotes.forEach((quote) => {
      if (quote.estado === "aprobada") resumen.aprobadas++
      if (quote.estado === "en_revision" || quote.estado === "enviada") resumen.enRevision++
      if (quote.estado === "pendiente") resumen.pendientes++
    })

    return resumen
  }, [quotes])

  const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavingContact(true)

    try {
      const updated = await actualizarLeadDeUsuario({
        nombre: contactForm.nombre || contact?.nombre,
        telefono: contactForm.telefono,
        empresa: contactForm.empresa,
        ciudad: contactForm.ciudad,
        ruc_cedula: contactForm.ruc_cedula,
      })

      setContact(updated)
      toast.success("Datos de contacto actualizados")
    } catch (error) {
      console.error("Error guardando datos de contacto:", error)
      toast.error("No pudimos guardar tus datos")
    } finally {
      setSavingContact(false)
    }
  }

  if (authStatus === "loading") {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-3xl" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[480px] w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Inicia sesion para ver Mi cuenta.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card className="bg-gradient-to-r from-primary/90 to-primary text-white">
          <CardHeader className="space-y-1">
            <CardDescription className="text-white/80">Mi cuenta</CardDescription>
            <CardTitle className="text-3xl font-bold">Hola {authUser?.email?.split("@")[0] ?? "cliente"}</CardTitle>
            <p className="text-sm text-white/80">
              Revisa tus cotizaciones y mantiene tus datos de contacto al dia.
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3 text-sm text-white/90">
            <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <Mail className="h-4 w-4" />
              {authUser?.email}
            </span>
            {linking && (
              <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                <Loader2 className="h-4 w-4 animate-spin" />
                Asegurando tus cotizaciones...
              </span>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Cotizaciones" value={quoteStats.total} icon={<FileText className="h-4 w-4" />} />
          <StatCard label="Aprobadas" value={quoteStats.aprobadas} icon={<Notebook className="h-4 w-4" />} />
          <StatCard label="En revision" value={quoteStats.enRevision} icon={<Loader2 className="h-4 w-4" />} />
        </div>
      </div>

      <Tabs defaultValue="quotes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="quotes">Mis cotizaciones</TabsTrigger>
          <TabsTrigger value="contact">Datos de contacto</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-4">
          {quotesLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : quotes.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Aun no tienes cotizaciones</CardTitle>
                <CardDescription>
                  Cuando cotices desde tu cuenta, las veras aqui junto a sus estados.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="bg-primary text-white hover:bg-primary-hover">
                  <Link href="/catalogo">
                    Ir al catalogo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {quotes.map((quote) => {
                const status = getQuoteStatusMeta(quote.estado)
                return (
                  <Card key={quote.id} className="h-full border-border shadow-sm">
                    <CardHeader className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                          <CardTitle className="text-lg font-semibold">Cotizacion {quote.numero || `#${quote.id}`}</CardTitle>
                          <p className="text-sm text-muted-foreground">Creada el {formatDate(quote.created_at)}</p>
                        </div>
                        <Badge className={status.badgeClass}>{status.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-semibold">{formatCurrency(quote.total)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Estado</span>
                        <span>{status.description}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{quote.leads?.nombre}</p>
                          <p className="text-xs text-muted-foreground">{quote.leads?.email}</p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/mi-cuenta/${quote.id}`} className="flex items-center gap-2">
                            Ver detalle
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contact">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Datos de contacto</CardTitle>
              <CardDescription>
                Usa estos datos de forma predeterminada en tus nuevas cotizaciones. Tu correo es tu identificador de
                acceso.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contactLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleContactSubmit}>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nombre">Nombre o razon social</Label>
                    <Input
                      id="nombre"
                      value={contactForm.nombre}
                      onChange={(event) => setContactForm((prev) => ({ ...prev, nombre: event.target.value }))}
                      placeholder="Tu nombre o empresa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Telefono</Label>
                    <Input
                      id="telefono"
                      value={contactForm.telefono}
                      onChange={(event) => setContactForm((prev) => ({ ...prev, telefono: event.target.value }))}
                      placeholder="+593 99..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input
                      id="empresa"
                      value={contactForm.empresa}
                      onChange={(event) => setContactForm((prev) => ({ ...prev, empresa: event.target.value }))}
                      placeholder="Nombre comercial"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      value={contactForm.ciudad}
                      onChange={(event) => setContactForm((prev) => ({ ...prev, ciudad: event.target.value }))}
                      placeholder="Quito, Guayaquil..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ruc">RUC / Cedula</Label>
                    <Input
                      id="ruc"
                      value={contactForm.ruc_cedula}
                      onChange={(event) => setContactForm((prev) => ({ ...prev, ruc_cedula: event.target.value }))}
                      placeholder="RUC o cedula"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Correo para acceso</Label>
                    <Input value={authUser?.email ?? ""} disabled />
                    <p className="text-xs text-muted-foreground">
                      Si necesitas actualizar tu correo, contactanos para validar el cambio de forma segura.
                    </p>
                  </div>

                  <div className="md:col-span-2 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <p>{contact ? "Guardaremos estos datos en tu lead principal." : "Aun no tenemos datos guardados."}</p>
                    </div>
                    <Button type="submit" disabled={savingContact} className="bg-primary text-white hover:bg-primary-hover">
                      {savingContact ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardContent className="flex items-center gap-3 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
