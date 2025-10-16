import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Package, Truck, HeadphonesIcon } from "lucide-react"
import { CategoryChips } from "@/components/category-chips"
import { FeaturedCards } from "@/components/featured-cards"
import { WhatsAppHelp } from "@/components/whatsapp-help"

export default function HomePage() {
  const featuredProducts = [
    {
      id: 1,
      name: "Tarjetas de Presentación Premium",
      category: "Papelería Corporativa",
      image: "/premium-business-cards-stack.jpg",
      minPrice: 25,
      description: "Impresión de alta calidad en papel couché",
    },
    {
      id: 2,
      name: "Carpetas Corporativas",
      category: "Papelería Corporativa",
      image: "/corporate-folders-presentation.jpg",
      minPrice: 150,
      description: "Carpetas personalizadas con tu logo",
    },
    {
      id: 3,
      name: "Banners Roll-Up",
      category: "Material Publicitario",
      image: "/roll-up-banner-display.jpg",
      minPrice: 45,
      description: "Banners portátiles para eventos",
    },
    {
      id: 4,
      name: "Tazas Personalizadas",
      category: "Merchandising",
      image: "/custom-branded-mugs.jpg",
      minPrice: 180,
      description: "Tazas cerámicas con impresión full color",
    },
    {
      id: 5,
      name: "Bolígrafos Corporativos",
      category: "Merchandising",
      image: "/corporate-branded-pens.jpg",
      minPrice: 80,
      description: "Bolígrafos metálicos con grabado láser",
    },
    {
      id: 6,
      name: "Volantes Publicitarios",
      category: "Material Publicitario",
      image: "/promotional-flyers-stack.jpg",
      minPrice: 35,
      description: "Volantes en papel couché brillante",
    },
  ]

  const benefits = [
    {
      icon: Package,
      title: "Calidad Garantizada",
      description: "Productos de alta calidad con garantía de satisfacción",
    },
    {
      icon: Truck,
      title: "Envío a Todo el País",
      description: "Entrega rápida y segura en todo Ecuador",
    },
    {
      icon: HeadphonesIcon,
      title: "Soporte Personalizado",
      description: "Asesoría experta para tus proyectos",
    },
  ]

  return (
    <div className="flex flex-col relative">
      {/* Animated gradient background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Top right gradient blob */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl animate-pulse-slow" />

        {/* Bottom left gradient blob */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent/15 via-accent/8 to-transparent rounded-full blur-3xl animate-pulse-slower" />

        {/* Center accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 via-transparent to-transparent rounded-full blur-2xl" />
      </div>

      {/* Hero Section */}
      <section className="relative py-12 md:py-24 lg:py-32 overflow-hidden">
        {/* Subtle gradient overlay for hero */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background -z-10" />

        <div className="container mx-auto px-5 md:px-6">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16 lg:items-center">
            {/* Left Column: Content */}
            <div className="space-y-6 md:space-y-8">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 text-xs md:text-sm px-3 py-1.5 md:px-4 inline-block">
                Soluciones B2B de Impresión
              </Badge>

              <div className="space-y-4 md:space-y-6">
                <h1 className="text-[32px] leading-[1.15] md:text-5xl lg:text-6xl font-bold text-balance md:leading-[1.1]">
                  {"Cotiza productos personalizados con calidad "}
                  <span className="text-primary">FullColor</span>
                </h1>

                <p className="text-base leading-relaxed md:text-lg lg:text-xl text-muted-foreground text-pretty max-w-xl">
                  Papelería corporativa y merchandising premium para empresas que buscan destacar con productos de
                  impresión de alta calidad.
                </p>
              </div>

              <CategoryChips />

              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <Link href="/cotizador" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary-hover text-white w-full sm:w-auto h-12 md:h-14 text-base md:text-lg font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                  >
                    Ir al Cotizador
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/catalogo" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-12 md:h-14 text-base md:text-lg font-medium border-2 border-border hover:bg-muted/50 hover:border-primary/30 bg-transparent transition-all"
                  >
                    Ver Catálogo
                  </Button>
                </Link>
              </div>

              <div className="pt-2">
                <WhatsAppHelp variant="inline" />
              </div>
            </div>

            {/* Right Column: Featured Cards */}
            <div className="relative mt-4 lg:mt-0">
              <FeaturedCards />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-muted/20 via-muted/30 to-muted/20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,102,161,0.03),transparent_50%)] pointer-events-none" />
        <div className="container mx-auto px-5 md:px-6 relative">
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex flex-col items-center text-center space-y-3 group">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/10">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold">{benefit.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground text-pretty max-w-xs">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 md:py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background pointer-events-none" />
        <div className="container mx-auto px-5 md:px-6 relative">
          <div className="text-center mb-10 md:mb-12 space-y-3">
            <h2 className="text-[28px] leading-tight md:text-3xl lg:text-4xl font-bold text-balance">
              Productos Destacados
            </h2>
            <p className="text-base leading-relaxed md:text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Explora nuestra selección de productos más populares con precios especiales por volumen
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/producto/${product.id}`}>
                <Card className="group overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 h-full border-border/50 hover:border-primary/30">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-medium shadow-md">
                      {product.category}
                    </Badge>
                  </div>
                  <CardContent className="p-5 md:p-6 space-y-3">
                    <h3 className="font-semibold text-base md:text-lg text-balance group-hover:text-primary transition-colors leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{product.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Desde</p>
                        <p className="text-xl md:text-2xl font-bold text-primary">${product.minPrice}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="group-hover:bg-primary/10 text-sm h-9 font-medium">
                        Ver Detalles
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10 md:mt-12">
            <Link href="/catalogo">
              <Button
                size="lg"
                variant="outline"
                className="group bg-transparent h-12 md:h-14 text-base md:text-lg border-2 hover:border-primary/30 hover:bg-muted/50 transition-all"
              >
                Ver Todos los Productos
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 md:py-20 bg-gradient-to-br from-primary via-primary to-primary-hover text-white relative overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="container mx-auto px-5 md:px-6 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-7">
            <h2 className="text-[28px] leading-tight md:text-3xl lg:text-4xl font-bold text-balance">
              ¿Listo para Cotizar tus Productos?
            </h2>
            <p className="text-base leading-relaxed md:text-lg text-primary-foreground/95 text-pretty">
              Obtén precios especiales por volumen y descubre cómo podemos ayudarte a impulsar tu marca con productos
              personalizados de alta calidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3 md:pt-4">
              <Link href="/cotizador" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-50 w-full sm:w-auto h-12 md:h-14 text-base md:text-lg font-medium shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                >
                  Comenzar Cotización
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/catalogo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/15 w-full sm:w-auto h-12 md:h-14 text-base md:text-lg font-medium bg-transparent backdrop-blur-sm transition-all"
                >
                  Explorar Catálogo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <WhatsAppHelp variant="floating" />
    </div>
  )
}
