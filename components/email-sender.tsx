'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendQuoteEmail, getLeadEmail, type SendEmailResult } from '@/src/services/emailService'
import { Mail, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface EmailSenderProps {
  quoteId: number
  quoteToken: string
  initialEmail?: string
  onEmailSent?: (recipient: string) => void
  autoSend?: boolean
}

type EmailState = 'idle' | 'sending' | 'success' | 'error'

export function EmailSender({ quoteId, quoteToken, initialEmail, onEmailSent, autoSend = false }: EmailSenderProps) {
  const [email, setEmail] = useState(initialEmail || '')
  const [state, setState] = useState<EmailState>('idle')
  const [message, setMessage] = useState('')
  const [isLoadingLeadEmail, setIsLoadingLeadEmail] = useState(false)

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  const loadLeadEmail = useCallback(async () => {
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
  }, [quoteId])

  const handleSendEmail = useCallback(async () => {
    if (!email.trim()) {
      setState('error')
      setMessage('Por favor ingresa un email')
      return
    }

    if (!validateEmail(email)) {
      setState('error')
      setMessage('Por favor ingresa un email valido')
      return
    }

    setState('sending')
    setMessage('Enviando email...')

    try {
      const result: SendEmailResult = await sendQuoteEmail(quoteId, email, { quoteToken })

      if (result.success) {
        setState('success')
        setMessage(`Email enviado exitosamente a ${result.recipient}`)

        if (onEmailSent && result.recipient) {
          onEmailSent(result.recipient)
        }

        setTimeout(() => {
          setState('idle')
          setMessage('')
        }, 5000)
      } else {
        setState('error')
        setMessage(`Error: ${result.error || 'No se pudo enviar el email'}`)
      }
    } catch (error) {
      setState('error')
      setMessage(`Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }, [email, onEmailSent, quoteId, quoteToken])

  useEffect(() => {
    if (!initialEmail && quoteId) {
      void loadLeadEmail()
    }
  }, [initialEmail, loadLeadEmail, quoteId])

  useEffect(() => {
    if (autoSend && email && state === 'idle') {
      void handleSendEmail()
    }
  }, [autoSend, email, handleSendEmail, state])

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
      case 'sending':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-sm font-medium">
          Email del cliente
        </Label>
        <div className="mt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="cliente@empresa.com"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={state === 'sending' || isLoadingLeadEmail}
            />
          </div>
          <Button onClick={handleSendEmail} disabled={state === 'sending' || !email}>
            {getStateIcon()}
            <span className="ml-2">Enviar</span>
          </Button>
        </div>
        {isLoadingLeadEmail && (
          <p className="mt-1 text-xs text-muted-foreground">Buscando email del lead...</p>
        )}
      </div>

      {message && (
        <div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${getStateColor()}`}>
          {getStateIcon()}
          <span>{message}</span>
        </div>
      )}
    </div>
  )
}
