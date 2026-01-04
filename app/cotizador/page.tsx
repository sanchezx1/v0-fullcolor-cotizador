"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, AlertCircle, CheckCircle } from "lucide-react"
import { useQuoteBuilder } from "@/src/hooks/useQuoteBuilder"
import { useAuthSession } from "@/src/hooks/useAuthSession"
import { asegurarLeadVinculado, obtenerLeadDeUsuario } from "@/src/services/accounts"
import { verificarEstadoEmail } from "@/src/services/quotes"
import LeadConflictModal from "@/components/lead-conflict-modal"
import { ExistingEmailDialog } from "@/components/existing-email-dialog"
import { RegisteredUserDialog } from "@/components/registered-user-dialog"

export default function CotizadorPage() {
  const router = useRouter()
  const {
    quoteItems,
    contactInfo,
    setContactInfo,
    loading,
    error,
    leadConflict,
    canUpdateLead,
    setLeadConflict,
    updateItemQuantity,
    removeItemFromQuote,
    calculateSubtotal,
    calculateIVA,
    calculateTotal,
    validateQuote,
    submitQuote,
    upsertLeadAndContinue,
    useExistingLeadAndContinue,
    requestLeadOwnershipVerification,
    leadVerificationState,
    leadVerificationError
  } = useQuoteBuilder()
  const { isAuthenticated, isAdmin, user: authUser } = useAuthSession()
  const [contactPrefillLoading, setContactPrefillLoading] = useState(false)
  const [useAccountContact, setUseAccountContact] = useState(false)
  const [editingContact, setEditingContact] = useState(false)
  const [existingEmailDialogOpen, setExistingEmailDialogOpen] = useState(false)
  const [registeredUserDialogOpen, setRegisteredUserDialogOpen] = useState(false)
  const [emailPrompted, setEmailPrompted] = useState<string | null>(null)
  const [checkingExistingEmail, setCheckingExistingEmail] = useState(false)
  const [emailHasAccount, setEmailHasAccount] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !authUser || isAdmin) {
      setUseAccountContact(false)
      setEditingContact(false)
      return
    }

    let isActive = true

    const hydrateContactFromAccount = async () => {
      try {
        setContactPrefillLoading(true)
        await asegurarLeadVinculado(authUser.email)
        const lead = await obtenerLeadDeUsuario()

        if (!isActive) return

        if (lead) {
          setContactInfo((prev) => ({
            ...prev,
            nombreRazonSocial: lead.nombre || prev.nombreRazonSocial,
            rucCedula: lead.ruc_cedula || prev.rucCedula,
            email: lead.email || prev.email,
            ciudad: lead.ciudad || prev.ciudad,
            telefono: lead.telefono || prev.telefono,
          }))
          setUseAccountContact(true)
          setEditingContact(false)
        }
      } catch (error) {
        console.warn("No se pudo precargar datos de contacto desde la cuenta:", error)
      } finally {
        if (isActive) {
          setContactPrefillLoading(false)
        }
      }
    }

    hydrateContactFromAccount()

    return () => {
      isActive = false
    }
  }, [authUser, isAdmin, isAuthenticated, setContactInfo])

  useEffect(() => {
    if (isAuthenticated) {
      setEmailHasAccount(false)
      return
    }

    const normalizedEmail = contactInfo.email.trim().toLowerCase()
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)

    if (!emailValid) {
      setEmailPrompted(null)
      setEmailHasAccount(false)
      return
    }

    if (emailPrompted === normalizedEmail && !existingEmailDialogOpen && !registeredUserDialogOpen) return

    const timer = window.setTimeout(async () => {
      setCheckingExistingEmail(true)
      const status = await verificarEstadoEmail(normalizedEmail)
      setCheckingExistingEmail(false)

      if (status.exists) {
        // Diferenciar entre invitado y usuario registrado
        if (status.hasAccount) {
          // Tiene cuenta creada -> mostrar modal de usuario registrado y bloquear formulario
          setRegisteredUserDialogOpen(true)
          setExistingEmailDialogOpen(false)
          setEmailHasAccount(true)
        } else {
          // Es invitado -> mostrar modal de invitado
          setExistingEmailDialogOpen(true)
          setRegisteredUserDialogOpen(false)
          setEmailHasAccount(false)
        }
        setEmailPrompted(normalizedEmail)
      } else {
        setEmailPrompted(null)
        setEmailHasAccount(false)
      }
    }, 800)

    return () => window.clearTimeout(timer)
  }, [contactInfo.email, emailPrompted, existingEmailDialogOpen, registeredUserDialogOpen, isAuthenticated])

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      setSubmitSuccess(false)
      
      const result = await submitQuote()
      
      if (result.success) {
        setSubmitSuccess(true)
        router.push(`/confirmacion?quoteId=${result.quoteId}&token=${result.quoteToken}`)
      } else if (result.error === 'LEAD_CONFLICT') {
        // El modal se mostrará automáticamente por el estado leadConflict
        console.log('Conflicto de lead detectado, mostrando modal')
      } else {
        console.error('Error submitting quote:', result.error)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateAndContinue = async () => {
    try {
      setIsSubmitting(true)
      const result = await upsertLeadAndContinue()
      
      if (result.success) {
        setSubmitSuccess(true)
        router.push(`/confirmacion?quoteId=${result.quoteId}&token=${result.quoteToken}`)
      }
    } catch (err) {
      console.error('Error updating lead:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUseExisting = async () => {
    try {
      setIsSubmitting(true)
      const result = await useExistingLeadAndContinue()
      
      if (result.success) {
        setSubmitSuccess(true)
        router.push(`/confirmacion?quoteId=${result.quoteId}&token=${result.quoteToken}`)
      }
    } catch (err) {
      console.error('Error using existing lead:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const validation = validateQuote()
  const contactFieldsDisabled =
    contactPrefillLoading || loading || isSubmitting || (isAuthenticated && useAccountContact && !editingContact)

  return (
    <>
      {/* Modal de conflicto de leads */}
      {leadConflict && (
        <LeadConflictModal
          isOpen={leadConflict.show}
          existingLead={leadConflict.existingLead}
          newData={leadConflict.newData}
          canUpdateLead={canUpdateLead}
          onRequestVerification={requestLeadOwnershipVerification}
          verificationState={leadVerificationState}
          verificationError={leadVerificationError}
          onUseExisting={handleUseExisting}
          onUpdateAndContinue={handleUpdateAndContinue}
          onCancel={() => setLeadConflict(null)}
          isUpdating={isSubmitting}
        />
      )}

      <ExistingEmailDialog
        open={existingEmailDialogOpen}
        onOpenChange={setExistingEmailDialogOpen}
        onLogin={() => window.location.assign(`/auth/login?redirectTo=/cotizador&tab=register`)}
        onContinueAsGuest={() => setExistingEmailDialogOpen(false)}
      />

      <RegisteredUserDialog
        open={registeredUserDialogOpen}
        onOpenChange={setRegisteredUserDialogOpen}
        onLogin={() => window.location.assign(`/auth/login?redirectTo=/cotizador`)}
        onClose={() => {
          setRegisteredUserDialogOpen(false)
          setEmailHasAccount(false)
          setContactInfo({ ...contactInfo, email: "" })
        }}
      />

      <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-balance mb-3">Resumen de Solicitud</h1>
          <p className="text-muted-foreground text-pretty">
            Revisa los detalles y completa tus datos para recibir una propuesta formal.
          </p>
        </div>

        {quoteItems.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Tu carrito está vacío</h2>
                <p className="text-muted-foreground text-pretty max-w-md mx-auto">
                  Explora nuestro catálogo y agrega productos para comenzar.
                </p>
              </div>
              <Link href="/catalogo">
                <Button size="lg" className="bg-primary hover:bg-primary-hover text-white">
                  <Package className="mr-2 h-5 w-5" />
                  Ir al Catálogo
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmitQuote}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Quote Items */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Productos seleccionados ({quoteItems.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {contactPrefillLoading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Sincronizando tus datos guardados...
                      </div>
                    )}
                    {quoteItems.map((item) => (
                      <div key={item.productId}>
                        <div className="flex gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-balance">{item.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  ${item.pricePerUnit.toFixed(2)} por unidad
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Mínimo: {item.minimumOrder} unidades
                                </p>
                                {!item.isQuantityValid && (
                                  <p className="text-xs text-amber-600 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Cantidad por debajo del mínimo
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItemFromQuote(item.productId)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || loading}
                                  className="h-8 w-8 p-0 bg-transparent"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(item.productId, Number.parseInt(e.target.value) || 1)}
                                  className="w-20 text-center h-8"
                                  min="1"
                                  disabled={loading}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                                  disabled={loading}
                                  className="h-8 w-8 p-0 bg-transparent"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg text-primary">${item.total.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    ))}

                    <Link href="/catalogo">
                      <Button type="button" variant="outline" className="w-full bg-transparent">
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Más Productos
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Contacto</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Completa tus datos para recibir la cotización detallada
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isAuthenticated && useAccountContact && !editingContact && (
                      <div className="flex items-start justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-primary font-medium">
                            Usaremos los datos guardados en tu cuenta
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingContact(true)
                            setUseAccountContact(false)
                          }}
                          className="border-primary/40 text-primary hover:bg-primary/10 ml-3"
                        >
                          Modificar datos
                        </Button>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="nombreRazonSocial">
                        Nombre o razón social <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="nombreRazonSocial"
                        required
                        value={contactInfo.nombreRazonSocial}
                        onChange={(e) => setContactInfo({ ...contactInfo, nombreRazonSocial: e.target.value })}
                        placeholder="Juan Pérez o Mi Empresa S.A."
                        disabled={contactFieldsDisabled}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rucCedula">
                        RUC o Cédula <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="rucCedula"
                        required
                        value={contactInfo.rucCedula}
                        onChange={(e) => setContactInfo({ ...contactInfo, rucCedula: e.target.value })}
                        placeholder="1234567890123 o 1234567890"
                        disabled={contactFieldsDisabled}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Correo electrónico <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        placeholder="juan@empresa.com"
                        disabled={contactFieldsDisabled}
                      />
                      {!isAuthenticated && checkingExistingEmail && (
                        <p className="text-xs text-muted-foreground">Revisando si ya cotizaste con este correo...</p>
                      )}
                      {!isAuthenticated && emailHasAccount && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-amber-800 dark:text-amber-200">
                            Este correo tiene una cuenta asociada. Debes iniciar sesión para continuar con la cotización.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ciudad">Ciudad</Label>
                        <Input
                          id="ciudad"
                          value={contactInfo.ciudad || ''}
                          onChange={(e) => setContactInfo({ ...contactInfo, ciudad: e.target.value })}
                          placeholder="Quito"
                          disabled={contactFieldsDisabled}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefono">
                          Teléfono <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="telefono"
                          type="tel"
                          required
                          value={contactInfo.telefono || ''}
                          onChange={(e) => setContactInfo({ ...contactInfo, telefono: e.target.value })}
                          placeholder="+593 99 123 4567"
                          disabled={contactFieldsDisabled}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mensaje">Mensaje (Opcional)</Label>
                      <Textarea
                        id="mensaje"
                        value={contactInfo.mensaje || ''}
                        onChange={(e) => setContactInfo({ ...contactInfo, mensaje: e.target.value })}
                        placeholder="Detalles especiales, fecha de entrega deseada, etc."
                        rows={4}
                        disabled={contactFieldsDisabled}
                      />
                    </div>

                    {/* Error Display */}
                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">{error}</span>
                      </div>
                    )}

                    {/* Success Display */}
                    {submitSuccess && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Cotización enviada exitosamente</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Summary Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>Resumen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">IVA (15%):</span>
                        <span className="font-medium">${calculateIVA().toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Validation Errors */}
                    {!validation.isValid && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-red-600">Por favor corrige:</p>
                        <ul className="text-xs text-red-600 space-y-1">
                          {validation.errors.map((error, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-red-600">•</span>
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Precios sujetos a confirmación final</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Recibirás una cotización detallada por email</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Tiempo de respuesta: 24-48 horas</span>
                      </p>
                    </div>

                    {!isAuthenticated && emailHasAccount && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          <strong>Inicio de sesión requerido:</strong> Este correo tiene una cuenta asociada. Por seguridad, debes iniciar sesión antes de solicitar una cotización.
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-primary hover:bg-primary-hover text-white"
                      disabled={!validation.isValid || loading || isSubmitting || (!isAuthenticated && emailHasAccount)}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          Enviar Solicitud
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
    </>
  )
}
