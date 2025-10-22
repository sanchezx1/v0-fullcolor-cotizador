'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Package,
  ArrowUp,
  ArrowDown 
} from 'lucide-react'
import { getEstadisticasDashboard, getComparativaMensual } from '@/src/services/admin/dashboardService'
import type { EstadisticasDashboard } from '@/src/types/admin'

export function DashboardKPIs() {
  const [stats, setStats] = useState<EstadisticasDashboard | null>(null)
  const [comparativa, setComparativa] = useState<{
    mesActual: number
    porcentaje: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, comparativaData] = await Promise.all([
          getEstadisticasDashboard(),
          getComparativaMensual()
        ])
        setStats(statsData)
        setComparativa({
          mesActual: comparativaData.mesActual,
          porcentaje: comparativaData.porcentaje
        })
      } catch (error) {
        console.error('Error cargando KPIs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const kpis = [
    {
      title: 'Total Cotizaciones',
      value: stats?.total_cotizaciones || 0,
      icon: FileText,
      description: `${comparativa?.mesActual || 0} este mes`,
      change: comparativa?.porcentaje || 0,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Ingresos Estimados',
      value: `$${(stats?.ingresos_estimados || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: 'Cotizaciones aprobadas',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Productos Activos',
      value: stats?.productos_activos || 0,
      icon: Package,
      description: 'En catálogo',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Tasa de Conversión',
      value: stats && stats.total_cotizaciones > 0
        ? `${Math.round((stats.cotizaciones_aprobadas / stats.total_cotizaciones) * 100)}%`
        : '0%',
      icon: TrendingUp,
      description: `${stats?.cotizaciones_aprobadas || 0} aprobadas`,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        const hasChange = index === 0 && kpi.change !== undefined

        return (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`h-8 w-8 rounded-lg ${kpi.iconBg} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${kpi.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {hasChange && kpi.change !== 0 && (
                  <>
                    {kpi.change > 0 ? (
                      <span className="flex items-center text-green-600">
                        <ArrowUp className="h-3 w-3" />
                        {Math.abs(kpi.change)}%
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <ArrowDown className="h-3 w-3" />
                        {Math.abs(kpi.change)}%
                      </span>
                    )}
                  </>
                )}
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
