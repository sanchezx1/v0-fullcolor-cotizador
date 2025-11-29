"use client"

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { triggerDashboardRevalidation } from '@/app/admin/actions/revalidate'
import { formatDateTime } from '@/src/lib/formatters'

interface RevalidateButtonProps {
  className?: string
}

export function RevalidateButton({ className }: RevalidateButtonProps) {
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleRevalidate = () => {
    setError(null)

    startTransition(async () => {
      try {
        const data = await triggerDashboardRevalidation()
        setLastUpdate(data.timestamp)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      }
    })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Publicar Cambios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Actualiza el cache de productos y precios para reflejar los cambios realizados en la base de datos.
        </p>
        
        <Button 
          onClick={handleRevalidate}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Actualizando...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Publicar Cambios
            </>
          )}
        </Button>

        {lastUpdate && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Última actualización: {formatDateTime(lastUpdate)}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <XCircle className="w-4 h-4" />
            <span>Error: {error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
