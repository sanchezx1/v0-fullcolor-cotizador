import { Settings, Building, Mail, Phone, MapPin, FileText, Palette } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">
          Ajustes generales del sistema
        </p>
      </div>

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList>
          <TabsTrigger value="empresa">
            <Building className="h-4 w-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="cotizaciones">
            <FileText className="h-4 w-4 mr-2" />
            Cotizaciones
          </TabsTrigger>
          <TabsTrigger value="marca">
            <Palette className="h-4 w-4 mr-2" />
            Marca
          </TabsTrigger>
        </TabsList>

        {/* Pestaña Empresa */}
        <TabsContent value="empresa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Empresa</CardTitle>
              <CardDescription>
                Datos que aparecerán en las cotizaciones y comunicaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="empresa_nombre">Nombre de la Empresa</Label>
                  <Input 
                    id="empresa_nombre" 
                    defaultValue="FullColor - Servicios Gráficos Digitales"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empresa_ruc">RUC</Label>
                  <Input 
                    id="empresa_ruc" 
                    placeholder="80012345-6"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empresa_email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="empresa_email" 
                      type="email"
                      className="pl-10"
                      defaultValue="contacto@fullcolor.com.py"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empresa_telefono">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="empresa_telefono" 
                      className="pl-10"
                      placeholder="+595 21 123456"
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="empresa_direccion">Dirección</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea 
                    id="empresa_direccion"
                    className="pl-10"
                    rows={3}
                    placeholder="Calle, número, ciudad"
                    disabled
                  />
                </div>
              </div>

              <div className="pt-4">
                <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200">
                  <Settings className="h-3 w-3 mr-1" />
                  Próximamente disponible
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Cotizaciones */}
        <TabsContent value="cotizaciones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Cotizaciones</CardTitle>
              <CardDescription>
                Parámetros por defecto para nuevas cotizaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="validez_dias">Validez por defecto (días)</Label>
                  <Input 
                    id="validez_dias" 
                    type="number"
                    defaultValue="30"
                    disabled
                  />
                  <p className="text-xs text-gray-500">
                    Días de validez para nuevas cotizaciones
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iva">IVA (%)</Label>
                  <Input 
                    id="iva" 
                    type="number"
                    defaultValue="15"
                    disabled
                  />
                  <p className="text-xs text-gray-500">
                    Porcentaje de IVA aplicado
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="terminos">Términos y Condiciones</Label>
                <Textarea 
                  id="terminos"
                  rows={6}
                  placeholder="Términos y condiciones que aparecerán en las cotizaciones..."
                  disabled
                />
                <p className="text-xs text-gray-500">
                  Este texto aparecerá al pie de cada cotización PDF
                </p>
              </div>

              <div className="pt-4">
                <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200">
                  <Settings className="h-3 w-3 mr-1" />
                  Próximamente disponible
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Marca */}
        <TabsContent value="marca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Identidad de Marca</CardTitle>
              <CardDescription>
                Colores corporativos y elementos visuales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="color_primario">Color Primario</Label>
                  <div className="flex gap-2">
                    <div className="h-10 w-10 rounded border bg-[#0066a1]" />
                    <Input 
                      id="color_primario" 
                      defaultValue="#0066a1"
                      disabled
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Azul FullColor
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color_secundario">Color Secundario</Label>
                  <div className="flex gap-2">
                    <div className="h-10 w-10 rounded border bg-[#f5c700]" />
                    <Input 
                      id="color_secundario" 
                      defaultValue="#f5c700"
                      disabled
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Amarillo FullColor
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vista Previa</Label>
                <div className="border rounded-lg p-6 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-[#0066a1] to-[#0066a1]/80 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">FC</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-[#0066a1]">FullColor</h3>
                    <p className="text-sm text-gray-600">Servicios Gráficos Digitales</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200">
                  <Settings className="h-3 w-3 mr-1" />
                  Próximamente disponible
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Settings className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900">Configuración en Desarrollo</h3>
              <p className="text-sm text-blue-700 mt-1">
                Las opciones de configuración estarán disponibles próximamente. Por ahora, puedes consultar los valores por defecto del sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
