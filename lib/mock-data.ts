import type { Product } from "./types"

export const products: Product[] = [
  {
    id: "1",
    name: "Tarjetas de Presentación Premium",
    slug: "tarjetas-presentacion-premium",
    description:
      "Tarjetas de presentación en papel couché de alta calidad con acabado mate o brillante. Perfectas para causar una excelente primera impresión.",
    shortDescription: "Papel couché 300g, acabado mate o brillante",
    category: "Papelería Corporativa",
    images: ["/premium-business-cards-on-desk.jpg", "/business-card-close-up.jpg", "/business-cards-stack.jpg"],
    basePrice: 0.15,
    customizable: true,
    productionTime: "3-5 días laborables",
    pricingTiers: [
      { quantity: 100, unitPrice: 0.15, subtotal: 15.0 },
      { quantity: 250, unitPrice: 0.12, subtotal: 30.0 },
      { quantity: 500, unitPrice: 0.1, subtotal: 50.0 },
      { quantity: 1000, unitPrice: 0.08, subtotal: 80.0 },
      { quantity: 2500, unitPrice: 0.07, subtotal: 175.0 },
      { quantity: 5000, unitPrice: 0.06, subtotal: 300.0 },
    ],
    printOptions: [
      {
        id: "sides",
        name: "Lados de Impresión",
        type: "sides",
        options: [
          { label: "Un lado", value: "one-side" },
          { label: "Dos lados", value: "two-sides", priceModifier: 1.3 },
        ],
      },
      {
        id: "finish",
        name: "Acabado",
        type: "finish",
        options: [
          { label: "Mate", value: "matte" },
          { label: "Brillante", value: "glossy", priceModifier: 1.1 },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Volantes Full Color",
    slug: "volantes-full-color",
    description:
      "Volantes impresos en papel couché 150g con impresión full color de alta calidad. Ideales para promociones, eventos y publicidad.",
    shortDescription: "Papel couché 150g, tamaño A5",
    category: "Material Publicitario",
    images: ["/colorful-flyers-spread.jpg", "/promotional-flyer-design.jpg", "/flyers-stack.jpg"],
    basePrice: 0.08,
    customizable: true,
    productionTime: "4-6 días laborables",
    pricingTiers: [
      { quantity: 100, unitPrice: 0.08, subtotal: 8.0 },
      { quantity: 250, unitPrice: 0.06, subtotal: 15.0 },
      { quantity: 500, unitPrice: 0.05, subtotal: 25.0 },
      { quantity: 1000, unitPrice: 0.04, subtotal: 40.0 },
      { quantity: 2500, unitPrice: 0.035, subtotal: 87.5 },
      { quantity: 5000, unitPrice: 0.03, subtotal: 150.0 },
    ],
    printOptions: [
      {
        id: "sides",
        name: "Lados de Impresión",
        type: "sides",
        options: [
          { label: "Un lado", value: "one-side" },
          { label: "Dos lados", value: "two-sides", priceModifier: 1.4 },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Carpetas Corporativas",
    slug: "carpetas-corporativas",
    description:
      "Carpetas corporativas en cartulina plegable con bolsillos internos. Perfectas para presentaciones profesionales y documentación empresarial.",
    shortDescription: "Cartulina 300g con bolsillos",
    category: "Papelería Corporativa",
    images: ["/corporate-folder-with-documents.jpg", "/business-folder-open.jpg", "/presentation-folders.jpg"],
    basePrice: 1.2,
    customizable: true,
    productionTime: "5-7 días laborables",
    pricingTiers: [
      { quantity: 50, unitPrice: 1.2, subtotal: 60.0 },
      { quantity: 100, unitPrice: 1.0, subtotal: 100.0 },
      { quantity: 250, unitPrice: 0.85, subtotal: 212.5 },
      { quantity: 500, unitPrice: 0.75, subtotal: 375.0 },
      { quantity: 1000, unitPrice: 0.65, subtotal: 650.0 },
    ],
    printOptions: [
      {
        id: "finish",
        name: "Acabado",
        type: "finish",
        options: [
          { label: "Mate", value: "matte" },
          { label: "Brillante", value: "glossy", priceModifier: 1.15 },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Tomatodo Personalizado 550ml",
    slug: "tomatodo-personalizado",
    description:
      "Tomatodo de plástico PET con cuerpo traslúcido y acabado mate. Capacidad 550ml, libre de BPA. Temperatura máxima soportada 65°C.",
    shortDescription: "PET 550ml, libre de BPA",
    category: "Merchandising",
    images: ["/water-bottle-with-custom-logo.jpg", "/plastic-water-bottle.jpg", "/branded-water-bottles.jpg"],
    basePrice: 4.5,
    customizable: true,
    productionTime: "7-10 días laborables",
    pricingTiers: [
      { quantity: 12, unitPrice: 4.5, subtotal: 54.0 },
      { quantity: 25, unitPrice: 3.8, subtotal: 95.0 },
      { quantity: 50, unitPrice: 3.2, subtotal: 160.0 },
      { quantity: 100, unitPrice: 2.9, subtotal: 290.0 },
      { quantity: 250, unitPrice: 2.6, subtotal: 650.0 },
      { quantity: 500, unitPrice: 2.4, subtotal: 1200.0 },
    ],
    printOptions: [
      {
        id: "color",
        name: "Color del Producto",
        type: "color",
        options: [
          { label: "Transparente", value: "clear" },
          { label: "Azul", value: "blue" },
          { label: "Rojo", value: "red" },
          { label: "Verde", value: "green" },
        ],
      },
      {
        id: "print",
        name: "Tipo de Impresión",
        type: "color",
        options: [
          { label: "Full Color", value: "full-color", priceModifier: 1.2 },
          { label: "Un Color", value: "one-color" },
        ],
      },
    ],
  },
  {
    id: "5",
    name: "Banners Roll-Up",
    slug: "banners-roll-up",
    description:
      "Banner roll-up portátil con estructura de aluminio y lona de alta calidad. Tamaño 85x200cm. Incluye bolsa de transporte.",
    shortDescription: "85x200cm con estructura",
    category: "Material Publicitario",
    images: ["/roll-up-banner-display.jpg", "/portable-banner-stand.jpg", "/exhibition-banner.jpg"],
    basePrice: 45.0,
    customizable: true,
    productionTime: "5-7 días laborables",
    pricingTiers: [
      { quantity: 1, unitPrice: 45.0, subtotal: 45.0 },
      { quantity: 3, unitPrice: 42.0, subtotal: 126.0 },
      { quantity: 5, unitPrice: 40.0, subtotal: 200.0 },
      { quantity: 10, unitPrice: 38.0, subtotal: 380.0 },
      { quantity: 20, unitPrice: 36.0, subtotal: 720.0 },
    ],
    printOptions: [
      {
        id: "finish",
        name: "Acabado",
        type: "finish",
        options: [
          { label: "Mate", value: "matte" },
          { label: "Brillante", value: "glossy", priceModifier: 1.1 },
        ],
      },
    ],
  },
  {
    id: "6",
    name: "Cuadernos Corporativos",
    slug: "cuadernos-corporativos",
    description:
      "Cuadernos con tapa dura personalizada, 100 hojas interiores rayadas. Tamaño A5. Acabado mate o brillante en la portada.",
    shortDescription: "A5, 100 hojas, tapa dura",
    category: "Papelería Corporativa",
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    basePrice: 3.5,
    customizable: true,
    productionTime: "6-8 días laborables",
    pricingTiers: [
      { quantity: 25, unitPrice: 3.5, subtotal: 87.5 },
      { quantity: 50, unitPrice: 3.0, subtotal: 150.0 },
      { quantity: 100, unitPrice: 2.7, subtotal: 270.0 },
      { quantity: 250, unitPrice: 2.5, subtotal: 625.0 },
      { quantity: 500, unitPrice: 2.3, subtotal: 1150.0 },
    ],
    printOptions: [
      {
        id: "finish",
        name: "Acabado de Portada",
        type: "finish",
        options: [
          { label: "Mate", value: "matte" },
          { label: "Brillante", value: "glossy", priceModifier: 1.1 },
        ],
      },
    ],
  },
  {
    id: "7",
    name: "Bolsas Ecológicas",
    slug: "bolsas-ecologicas",
    description:
      "Bolsas reutilizables de tela no tejida (TNT) con impresión personalizada. Tamaño 38x42cm con asas reforzadas. Ecológicas y duraderas.",
    shortDescription: "TNT 38x42cm, asas reforzadas",
    category: "Merchandising",
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    basePrice: 1.8,
    customizable: true,
    productionTime: "7-9 días laborables",
    pricingTiers: [
      { quantity: 50, unitPrice: 1.8, subtotal: 90.0 },
      { quantity: 100, unitPrice: 1.5, subtotal: 150.0 },
      { quantity: 250, unitPrice: 1.3, subtotal: 325.0 },
      { quantity: 500, unitPrice: 1.15, subtotal: 575.0 },
      { quantity: 1000, unitPrice: 1.0, subtotal: 1000.0 },
    ],
    printOptions: [
      {
        id: "color",
        name: "Color de Bolsa",
        type: "color",
        options: [
          { label: "Blanco", value: "white" },
          { label: "Negro", value: "black" },
          { label: "Azul", value: "blue" },
          { label: "Verde", value: "green" },
        ],
      },
      {
        id: "print",
        name: "Tipo de Impresión",
        type: "color",
        options: [
          { label: "Un Color", value: "one-color" },
          { label: "Dos Colores", value: "two-colors", priceModifier: 1.3 },
        ],
      },
    ],
  },
  {
    id: "8",
    name: "Stickers Troquelados",
    slug: "stickers-troquelados",
    description:
      "Stickers personalizados con corte a medida en vinil adhesivo. Resistentes al agua y rayos UV. Ideales para branding y decoración.",
    shortDescription: "Vinil adhesivo, corte personalizado",
    category: "Material Publicitario",
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    basePrice: 0.25,
    customizable: true,
    productionTime: "4-6 días laborables",
    pricingTiers: [
      { quantity: 50, unitPrice: 0.25, subtotal: 12.5 },
      { quantity: 100, unitPrice: 0.2, subtotal: 20.0 },
      { quantity: 250, unitPrice: 0.16, subtotal: 40.0 },
      { quantity: 500, unitPrice: 0.14, subtotal: 70.0 },
      { quantity: 1000, unitPrice: 0.12, subtotal: 120.0 },
      { quantity: 2500, unitPrice: 0.1, subtotal: 250.0 },
    ],
    printOptions: [
      {
        id: "finish",
        name: "Acabado",
        type: "finish",
        options: [
          { label: "Mate", value: "matte" },
          { label: "Brillante", value: "glossy", priceModifier: 1.1 },
        ],
      },
    ],
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}
