import dynamic from 'next/dynamic'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

// Lazy load heavy components
const DashboardKPIs = dynamic(
  () => import('@/components/admin/DashboardKPIs').then(mod => ({ default: mod.DashboardKPIs })),
  { 
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    ),
  }
)

const DashboardChart = dynamic(
  () => import('@/components/admin/DashboardChart').then(mod => ({ default: mod.DashboardChart })),
  { 
    loading: () => <Skeleton className="h-80" />,
  }
)

const ProductosTopTable = dynamic(
  () => import('@/components/admin/ProductosTopTable').then(mod => ({ default: mod.ProductosTopTable })),
  { 
    loading: () => <Skeleton className="h-80" />,
  }
)

export default function AdminDashboardPage() {
  return (
    <>
      <AdminHeader 
        title="Dashboard" 
        subtitle="Vista general de tu negocio"
      />

      <div className="p-8 space-y-8">
        {/* KPIs */}
        <DashboardKPIs />

        {/* Gráfica y Productos Top */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfica de cotizaciones */}
          <div className="lg:col-span-2">
            <DashboardChart />
          </div>

          {/* Productos más cotizados */}
          <div className="lg:col-span-1">
            <ProductosTopTable />
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/cotizaciones/nueva">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Cotización
              </Button>
            </Link>
            <Link href="/admin/productos/nuevo">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </Link>
            <Link href="/admin/leads/nuevo">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
