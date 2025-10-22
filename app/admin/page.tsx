import { AdminHeader } from '@/components/admin/AdminHeader'
import { DashboardKPIs } from '@/components/admin/DashboardKPIs'
import { DashboardChart } from '@/components/admin/DashboardChart'
import { ProductosTopTable } from '@/components/admin/ProductosTopTable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

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
