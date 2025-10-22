'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
import { getProductosTopCotizados } from '@/src/services/admin/dashboardService'
import type { ProductoTopCotizado } from '@/src/types/admin'
import Image from 'next/image'

export function ProductosTopTable() {
  const [productos, setProductos] = useState<ProductoTopCotizado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getProductosTopCotizados(5)
        setProductos(data)
      } catch (error) {
        console.error('Error cargando productos top:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Cotizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (productos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Cotizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-muted-foreground">
              No hay datos de productos cotizados aún
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Más Cotizados</CardTitle>
        <p className="text-sm text-muted-foreground">
          Top 5 del mes
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {productos.map((producto, index) => (
            <div 
              key={producto.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Ranking */}
              <div className="flex-shrink-0">
                <div className={`
                  h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${index === 0 ? 'bg-yellow-100 text-yellow-700' : ''}
                  ${index === 1 ? 'bg-gray-100 text-gray-700' : ''}
                  ${index === 2 ? 'bg-orange-100 text-orange-700' : ''}
                  ${index > 2 ? 'bg-blue-50 text-blue-600' : ''}
                `}>
                  {index + 1}
                </div>
              </div>

              {/* Imagen o placeholder */}
              <div className="flex-shrink-0">
                {producto.imagen_url ? (
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden border">
                    <Image
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {producto.nombre}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {producto.sku}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {producto.categoria}
                  </Badge>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-bold text-blue-600">
                  {producto.veces_cotizado}
                </p>
                <p className="text-xs text-muted-foreground">
                  cotizaciones
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
