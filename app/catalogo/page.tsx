"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ArrowRight } from "lucide-react"

const allProducts = [
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
  {
    id: 7,
    name: "Hojas Membretadas",
    category: "Papelería Corporativa",
    image: "/letterhead-stationery-set.jpg",
    minPrice: 40,
    description: "Papel membretado de alta calidad",
  },
  {
    id: 8,
    name: "Libretas Corporativas",
    category: "Merchandising",
    image: "/corporate-notebooks-branded.jpg",
    minPrice: 220,
    description: "Libretas con tapa dura personalizadas",
  },
  {
    id: 9,
    name: "Afiches Publicitarios",
    category: "Material Publicitario",
    image: "/advertising-posters-display.jpg",
    minPrice: 55,
    description: "Afiches en papel fotográfico",
  },
  {
    id: 10,
    name: "Sobres Corporativos",
    category: "Papelería Corporativa",
    image: "/corporate-envelopes-branded.jpg",
    minPrice: 30,
    description: "Sobres personalizados varios tamaños",
  },
  {
    id: 11,
    name: "USB Personalizados",
    category: "Merchandising",
    image: "/custom-usb-drives-branded.jpg",
    minPrice: 350,
    description: "Memorias USB con logo grabado",
  },
  {
    id: 12,
    name: "Stickers Troquelados",
    category: "Material Publicitario",
    image: "/die-cut-stickers-custom.jpg",
    minPrice: 25,
    description: "Stickers en cualquier forma",
  },
]

export default function CatalogoPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")

  const categories = ["Papelería Corporativa", "Material Publicitario", "Merchandising"]

  // Filter products
  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name)
    } else if (sortBy === "price-low") {
      return a.minPrice - b.minPrice
    } else if (sortBy === "price-high") {
      return b.minPrice - a.minPrice
    }
    return 0
  })

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-balance">Catálogo de Productos</h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-3xl">
            Explora nuestra amplia selección de productos personalizados para tu empresa. Todos con precios especiales
            por volumen.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nombre (A-Z)</SelectItem>
                <SelectItem value="price-low">Precio (Menor a Mayor)</SelectItem>
                <SelectItem value="price-high">Precio (Mayor a Menor)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "bg-primary hover:bg-primary-hover text-white" : "bg-transparent"}
            >
              Todos
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category ? "bg-primary hover:bg-primary-hover text-white" : "bg-transparent"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Mostrando {sortedProducts.length} de {allProducts.length} productos
          </p>
        </div>

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <Link key={product.id} href={`/producto/${product.id}`}>
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs">
                      {product.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-balance group-hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground text-pretty line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Desde</p>
                        <p className="text-lg font-bold text-primary">${product.minPrice}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="group-hover:bg-primary/10">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No se encontraron productos con los filtros seleccionados.</p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-muted/50 rounded-2xl p-8 md:p-12 text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-balance">¿No encuentras lo que buscas?</h2>
          <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
            Contáctanos y te ayudaremos a encontrar el producto perfecto para tu empresa o crear algo personalizado.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/cotizador">
              <Button size="lg" className="bg-primary hover:bg-primary-hover text-white w-full sm:w-auto">
                Ir al Cotizador
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
