"use client"

import { RevalidateButton } from "@/components/admin/revalidate-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Database, RefreshCw } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            Gestiona el contenido y configuración del sistema
          </p>
        </div>

        {/* Admin Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cache Management */}
          <RevalidateButton />

          {/* Database Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Estado de Base de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Conexión:</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Activa</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Última actualización:</span>
                <span className="text-sm">Hace 5 minutos</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Productos en cache:</span>
                <span className="text-sm font-medium">12</span>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Versión:</span>
                <span className="text-sm">v1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Entorno:</span>
                <span className="text-sm">Desarrollo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Último deploy:</span>
                <span className="text-sm">Hoy</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instrucciones de Uso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Cómo publicar cambios:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Realiza los cambios necesarios en la base de datos de Supabase</li>
                <li>Haz clic en "Publicar Cambios" en la tarjeta de arriba</li>
                <li>Espera a que se confirme la actualización</li>
                <li>Los cambios se reflejarán inmediatamente en el sitio</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Notas importantes:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>El cache se actualiza automáticamente cada 5 minutos</li>
                <li>Los cambios en productos y precios requieren revalidación manual</li>
                <li>La revalidación afecta a todos los usuarios del sitio</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
