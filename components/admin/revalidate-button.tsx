"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react'

interface RevalidateButtonProps {
  className?: string
}

export function RevalidateButton({ className }: RevalidateButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRevalidate = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_REVALIDATE_SECRET || 'dev-secret'}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setLastUpdate(data.timestamp)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
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
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
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
            <span>Última actualización: {new Date(lastUpdate).toLocaleString()}</span>
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
