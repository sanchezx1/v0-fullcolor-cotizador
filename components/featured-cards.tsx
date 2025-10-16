"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const featuredProducts = [
  {
    id: 1,
    name: "Tarjetas de Presentación Premium",
    author: "Papelería Corporativa",
    image: "/premium-business-cards-stack.jpg",
  },
  {
    id: 2,
    name: "Carpetas Corporativas",
    author: "Material de Oficina",
    image: "/corporate-folders-presentation.jpg",
  },
  {
    id: 3,
    name: "Tazas Personalizadas",
    author: "Merchandising",
    image: "/custom-branded-mugs.jpg",
  },
]

export function FeaturedCards() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <>
      {/* Desktop: Grid layout */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:grid-rows-2 gap-4 h-[500px]">
        {/* First card - spans 2 rows */}
        <Link
          href={`/producto/${featuredProducts[0].id}`}
          className="row-span-2"
          onMouseEnter={() => setHoveredCard(0)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card className="group relative h-full overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
            <img
              src={featuredProducts[0].image || "/placeholder.svg?height=500&width=400"}
              alt={featuredProducts[0].name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
              <p className="text-sm opacity-90 mb-2">{featuredProducts[0].author}</p>
              <h3 className="text-xl font-semibold mb-3 text-balance">{featuredProducts[0].name}</h3>
              <div
                className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-white/80 transition-all duration-300 ${
                  hoveredCard === 0 ? "bg-white/20 scale-110" : "bg-transparent"
                }`}
              >
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Second card */}
        <Link
          href={`/producto/${featuredProducts[1].id}`}
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card className="group relative h-full overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
            <img
              src={featuredProducts[1].image || "/placeholder.svg?height=240&width=400"}
              alt={featuredProducts[1].name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-white">
              <p className="text-xs opacity-90 mb-1">{featuredProducts[1].author}</p>
              <h3 className="text-base font-semibold mb-2 text-balance">{featuredProducts[1].name}</h3>
              <div
                className={`inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-white/80 transition-all duration-300 ${
                  hoveredCard === 1 ? "bg-white/20 scale-110" : "bg-transparent"
                }`}
              >
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Third card */}
        <Link
          href={`/producto/${featuredProducts[2].id}`}
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card className="group relative h-full overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
            <img
              src={featuredProducts[2].image || "/placeholder.svg?height=240&width=400"}
              alt={featuredProducts[2].name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-white">
              <p className="text-xs opacity-90 mb-1">{featuredProducts[2].author}</p>
              <h3 className="text-base font-semibold mb-2 text-balance">{featuredProducts[2].name}</h3>
              <div
                className={`inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-white/80 transition-all duration-300 ${
                  hoveredCard === 2 ? "bg-white/20 scale-110" : "bg-transparent"
                }`}
              >
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Mobile: Horizontal scroll carousel */}
      <div className="lg:hidden">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide -mx-5 px-5">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/producto/${product.id}`}
              className="flex-shrink-0 w-[280px] snap-center first:ml-0"
            >
              <Card className="group relative h-[360px] overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-shadow">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
                <img
                  src={product.image || "/placeholder.svg?height=360&width=280"}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-white">
                  <p className="text-sm opacity-90 mb-2 font-medium">{product.author}</p>
                  <h3 className="text-lg font-semibold mb-4 text-balance leading-tight">{product.name}</h3>
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-full border-2 border-white/90 bg-white/20 backdrop-blur-sm">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-5">
          {featuredProducts.map((_, index) => (
            <div key={index} className="w-2 h-2 rounded-full bg-primary/30" />
          ))}
        </div>
      </div>
    </>
  )
}
