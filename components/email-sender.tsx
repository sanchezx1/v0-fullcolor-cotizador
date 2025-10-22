'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendQuoteEmail, getLeadEmail, type SendEmailResult } from '@/src/services/emailService'
import { Mail, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface EmailSenderProps {
  quoteId: number
  initialEmail?: string
  onEmailSent?: (recipient: string) => void
  autoSend?: boolean
}

type EmailState = 'idle' | 'sending' | 'success' | 'error'

export function EmailSender({ quoteId, initialEmail, onEmailSent, autoSend = false }: EmailSenderProps) {
  const [email, setEmail] = useState(initialEmail || '')
  const [state, setState] = useState<EmailState>('idle')
  const [message, setMessage] = useState('')
  const [isLoadingLeadEmail, setIsLoadingLeadEmail] = useState(false)

  // Cargar email del lead si no se proporcionó
  useEffect(() => {
    if (!initialEmail && quoteId) {
      loadLeadEmail()
    }
  }, [quoteId, initialEmail])

  // Auto-enviar si autoSend está habilitado y hay email
  useEffect(() => {
    if (autoSend && email && state === 'idle') {
      handleSendEmail()
    }
  }, [autoSend, email])

  const loadLeadEmail = async () => {
    setIsLoadingLeadEmail(true)
    try {
      const leadEmail = await getLeadEmail(quoteId)
      if (leadEmail) {
        setEmail(leadEmail)
      }
    } catch (error) {
      console.error('Error cargando email del lead:', error)
    } finally {
      setIsLoadingLeadEmail(false)
    }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSendEmail = async () => {
    // Validar email
    if (!email.trim()) {
      setState('error')
      setMessage('Por favor ingresa un email')
      return
    }

    if (!validateEmail(email)) {
      setState('error')
      setMessage('Por favor ingresa un email válido')
      return
    }

    // Enviar email
    setState('sending')
    setMessage('Enviando email...')

    try {
      const result: SendEmailResult = await sendQuoteEmail(quoteId, email)

      if (result.success) {
        setState('success')
        setMessage(`✅ Email enviado exitosamente a ${result.recipient}`)
        
        // Notificar al padre
        if (onEmailSent && result.recipient) {
          onEmailSent(result.recipient)
        }

        // Resetear después de 5 segundos
        setTimeout(() => {
          setState('idle')
          setMessage('')
        }, 5000)
      } else {
        setState('error')
        setMessage(`❌ Error: ${result.error || 'No se pudo enviar el email'}`)
      }
    } catch (error) {
      setState('error')
      setMessage(`❌ Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  const getStateIcon = () => {
    switch (state) {
      case 'sending':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Send className="h-4 w-4" />
    }
  }

  const getStateColor = () => {
    switch (state) {
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200'
    }
  }

  // Si es auto-send, no mostrar UI
  if (autoSend) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-lg">Enviar Cotización por Email</h3>
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="recipient-email">Email Destinatario</Label>
        <div className="flex gap-2">
          <Input
            id="recipient-email"
            type="email"
            placeholder="cliente@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={state === 'sending' || isLoadingLeadEmail}
            className="flex-1"
          />
          <Button
            onClick={handleSendEmail}
            disabled={state === 'sending' || !email.trim() || isLoadingLeadEmail}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {getStateIcon()}
            <span className="ml-2">
              {state === 'sending' ? 'Enviando...' : 'Enviar Email'}
            </span>
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Se enviará la cotización en PDF al email especificado
        </p>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border flex items-start gap-3 transition-all ${getStateColor()}`}
        >
          <div className="mt-0.5">{getStateIcon()}</div>
          <p className="text-sm flex-1">{message}</p>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Nota:</p>
            <ul className="list-disc list-inside space-y-1 text-amber-700">
              <li>El PDF debe estar generado previamente</li>
              <li>El email incluye un link para descargar el PDF</li>
              <li>Se registrará el envío en el historial</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
