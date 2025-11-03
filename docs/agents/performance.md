# Performance Agent ⚡ - FullColor Cotizador# Performance Agent — FullColor Cotizador



> **Optimización de velocidad, bundle size y Core Web Vitals**  > **Rol:** Agente especializado en optimización de rendimiento, Core Web Vitals, bundle size y experiencia de usuario fluida.

> **Basado en análisis real del repositorio**

---

---

## Objetivo

## 📊 Estado Actual (Verificado)

Garantizar una **experiencia de usuario rápida y fluida** mediante:

```bash

$ npm run build1. **Core Web Vitals excelentes** (LCP, FID/INP, CLS)

❌ FALLA con error:2. **Bundle size optimizado** (< 200KB inicial, gzipped)

3. **Time to Interactive rápido** (< 3.5s en 3G)

useSearchParams() should be wrapped in a suspense boundary at page "/auth/login"4. **Lighthouse score > 90** en todas las métricas

Export encountered an error on /auth/login/page, exiting the build.5. **Monitoreo continuo** con Vercel Analytics y RUM

Next.js build worker exited with code: 16. **Optimización progresiva** sin sacrificar funcionalidad

```

---

**Configuración actual (`next.config.mjs`):**

```javascript## Alcance

{

  eslint: { ignoreDuringBuilds: true },      // ⚠️ Ignora ESLint### ✅ Incluido

  typescript: { ignoreBuildErrors: true },   // ⚠️ Ignora TypeScript

  images: { unoptimized: true }              // ⚠️ Sin optimización imágenes- **Optimización de bundle** (code splitting, tree shaking, dynamic imports)

}- **Optimización de imágenes** (WebP/AVIF, lazy loading, responsive images)

```- **Caching estratégico** (Next.js caching, CDN, service workers)

- **Core Web Vitals** (LCP, FID/INP, CLS)

---- **Lighthouse CI** integrado en GitHub Actions

- **Performance budgets** que bloquean regresiones

## 🎯 Objetivo- **Monitoreo RUM** (Real User Monitoring) con Vercel Analytics

- **Database query optimization** (índices, N+1 queries)

Lograr build exitoso y optimizado para producción:

- **Build time:** < 3 minutos### ❌ Excluido

- **Bundle size:** < 500KB (main bundle)

- **Lighthouse:** ≥90 en todas las métricas- Tests de carga/stress (usar herramientas especializadas: k6, Artillery)

- **Core Web Vitals:**- Optimización de infraestructura de Supabase (fuera de alcance)

  - LCP (Largest Contentful Paint): < 2.5s- CDN configuration en Vercel (se auto-optimiza)

  - INP (Interaction to Next Paint): < 200ms- Edge caching avanzado (requiere Vercel Enterprise)

  - CLS (Cumulative Layout Shift): < 0.1

---

---

## Herramientas

## 📦 Alcance

### Stack Principal

### 🔴 Issues Críticos (Bloquean Deploy)

| Herramienta | Propósito | Versión/Plan |

#### 1. Build Error: Suspense Boundary ❌|-------------|-----------|--------------|

**Archivo:** `app/auth/login/page.tsx`| **Lighthouse CI** | Auditorías automatizadas en CI | Latest |

| **Vercel Analytics** | Real User Monitoring (RUM) | Pro (actual) |

**Error:**| **Next.js Bundle Analyzer** | Análisis de bundle size | ^14/15 |

```| **@next/bundle-analyzer** | Plugin oficial | Latest |

useSearchParams() should be wrapped in a suspense boundary| **Chrome DevTools** | Profiling local | Built-in |

```| **WebPageTest** | Testing multi-región | Free tier |



**Causa:** Client component usando `useSearchParams()` sin Suspense wrapper### Alternativas Consideradas



**Solución:**- **Sentry Performance:** Más completo pero requiere plan de pago

```tsx- **SpeedCurve:** Excelente pero costoso

// app/auth/login/page.tsx - ANTES (rompe build)- **Calibre:** Similar a SpeedCurve

'use client'- **Custom RUM:** Implementar con Performance API (más trabajo)

export default function LoginPage() {

  const searchParams = useSearchParams()  // ❌ Sin Suspense### Configuración Actual

  return <LoginForm />

}```javascript

// next.config.mjs

// DESPUÉS (funciona)const nextConfig = {

import { Suspense } from 'react'  images: {

    formats: ['image/avif', 'image/webp'],

function LoginForm() {    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

  const searchParams = useSearchParams()  // ✅ Dentro de Suspense    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

  return <form>...</form>  },

}  experimental: {

    optimizeCss: true, // Optimizar CSS

export default function LoginPage() {    optimizePackageImports: ['lucide-react', '@radix-ui/*'], // Tree-shake icons

  return (  },

    <Suspense fallback={<div>Loading...</div>}>}

      <LoginForm />```

    </Suspense>

  )---

}

```## Entregables



**Verificación:**### 1. Core Web Vitals

```bash

npm run build  # Debe completar sin errores**Métricas Objetivo:**

```

| Métrica | Objetivo | Crítico | Actual | Status |

---|---------|----------|---------|--------|--------|

| **LCP** (Largest Contentful Paint) | < 2.5s | < 4.0s | <PLACEHOLDER> | [PENDIENTE] |

#### 2. TypeScript/ESLint Ignorados ⚠️| **INP** (Interaction to Next Paint) | < 200ms | < 500ms | <PLACEHOLDER> | [PENDIENTE] |

**Problema:** Errores ocultos que pueden causar runtime errors| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.25 | <PLACEHOLDER> | [PENDIENTE] |

| **FCP** (First Contentful Paint) | < 1.8s | < 3.0s | <PLACEHOLDER> | [PENDIENTE] |

**Solución:**| **TTFB** (Time to First Byte) | < 600ms | < 1.8s | <PLACEHOLDER> | [PENDIENTE] |

```javascript| **TTI** (Time to Interactive) | < 3.5s | < 7.3s | <PLACEHOLDER> | [PENDIENTE] |

// next.config.mjs

const nextConfig = {**Cómo medir:**

  eslint: {

    ignoreDuringBuilds: false,  // ✅ Habilitar ESLint```bash

  },# Local con Lighthouse

  typescript: {npx lighthouse http://localhost:3000 --view

    ignoreBuildErrors: false,    // ✅ Habilitar TypeScript checks

  },# CI con Lighthouse CI

}npm install -g @lhci/cli

```lhci autorun



**Verificación:**# Production con PageSpeed Insights

```bash# https://pagespeed.web.dev/

npx tsc --noEmit  # Ver errores TypeScript```

npm run lint      # Ver errores ESLint

npm run build     # Ahora bloqueará si hay errores**Estrategias de optimización:**

```

#### LCP (Largest Contentful Paint)

---

**Objetivo:** < 2.5s (Good)

#### 3. Images Unoptimized ⚠️

**Problema:** Imágenes sin optimizar aumentan bundle y LCP**Problema común:** Imagen hero grande sin optimizar.



**Configuración actual:****Solución:**

```javascript

images: { unoptimized: true }  // ⚠️ Deshabilitado```typescript

```// components/home-hero.tsx

import Image from 'next/image'

**Por qué está deshabilitado:** Probablemente por errores de build anteriores

export function HomeHero() {

**Solución:**  return (

```javascript    <div className="relative h-[600px]">

// next.config.mjs      <Image

images: {        src="/hero-fullcolor.jpg"

  unoptimized: false,  // ✅ Habilitar optimización        alt="FullColor - Servicios Gráficos"

  domains: [        fill

    // Agregar dominios de Supabase Storage        priority // ⚡ Carga inmediata (LCP element)

    'your-project.supabase.co',        quality={85}

  ],        sizes="100vw"

  formats: ['image/avif', 'image/webp'],        className="object-cover"

}      />

```    </div>

  )

**Si falla:** Investigar errores específicos y resolver antes de habilitar}

```

---

**Checklist LCP:**

### 🟡 Optimizaciones Recomendadas- [ ] Elemento LCP identificado (DevTools → Performance)

- [ ] Imagen con `priority` si es LCP

#### 1. Bundle Analysis- [ ] Formato WebP/AVIF

**Instalar herramienta:**- [ ] Sin fonts bloqueantes (usar `font-display: swap`)

```bash- [ ] Server response rápido (TTFB < 600ms)

npm install -D @next/bundle-analyzer

```#### INP (Interaction to Next Paint)



**Configurar:****Objetivo:** < 200ms (Good)

```javascript

// next.config.mjs**Problema común:** Handlers JavaScript pesados bloqueando el thread.

import bundleAnalyzer from '@next/bundle-analyzer'

**Solución:**

const withBundleAnalyzer = bundleAnalyzer({

  enabled: process.env.ANALYZE === 'true',```typescript

})// ❌ MAL: Handler pesado sincrónico

const handleChange = (value: string) => {

export default withBundleAnalyzer(nextConfig)  processHeavyLogic(value) // Bloquea UI

```  updateState(value)

}

**Uso:**

```bash// ✅ BIEN: Debounce + async

ANALYZE=true npm run buildimport { useDebouncedCallback } from 'use-debounce'

# Abre reporte en navegador automáticamente

```const handleChange = useDebouncedCallback((value: string) => {

  processHeavyLogic(value)

---  updateState(value)

}, 300)

#### 2. Font Optimization

**Verificar uso de Next.js fonts:**// ✅ MEJOR: Web Worker para lógica pesada

```tsxconst worker = new Worker('/workers/pricing.worker.js')

// Buscar en el códigoconst handleChange = (value: string) => {

import { Geist } from 'next/font/google'  // ✅ Ya usando next/font  worker.postMessage({ type: 'CALCULATE', value })

}

const geist = Geist({```

  subsets: ['latin'],

  display: 'swap',  // ✅ Evita FOIT (Flash of Invisible Text)**Checklist INP:**

})- [ ] Inputs con debounce (300ms)

```- [ ] Event handlers < 50ms

- [ ] Long tasks identificados y optimizados

**Estado:** ✅ Ya optimizado (usa `geist` npm package v1.3.1)- [ ] JavaScript total < 100KB (crítico)

- [ ] No hay `layout thrashing`

---

#### CLS (Cumulative Layout Shift)

#### 3. Code Splitting

**Next.js lo hace automáticamente, pero verificar:****Objetivo:** < 0.1 (Good)



```tsx**Problema común:** Elementos sin dimensiones reservadas.

// Uso de dynamic imports para componentes pesados

import dynamic from 'next/dynamic'**Solución:**



const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {```typescript

  loading: () => <p>Loading chart...</p>,// ❌ MAL: Sin dimensiones

  ssr: false,  // Si no necesita SSR<img src="/product.jpg" alt="Product" />

})

```// ✅ BIEN: Con aspect ratio

<div className="aspect-square relative">

**Componentes candidatos:**  <Image

- `recharts` (gráficos admin) - ✅ Solo en `/admin`    src="/product.jpg"

- PDF generator    alt="Product"

- Image carousels    fill

    className="object-cover"

---  />

</div>

#### 4. Image Optimization

**Verificar uso de next/image:**// ✅ MEJOR: Skeleton loader

```tsx{isLoading ? (

// ANTES (sin optimización)  <Skeleton className="aspect-square" />

<img src="/product.jpg" alt="Product" />) : (

  <Image src="/product.jpg" alt="Product" fill />

// DESPUÉS (optimizado))}

import Image from 'next/image'```

<Image 

  src="/product.jpg" **Checklist CLS:**

  alt="Product"- [ ] Todas las imágenes con `width` y `height` (o `aspect-ratio`)

  width={500}- [ ] Fonts con `font-display: swap` y preload

  height={500}- [ ] No hay banners/ads que empujan contenido

  priority={isAboveFold}  // Para imágenes hero- [ ] Skeleton loaders para contenido dinámico

/>- [ ] Animaciones solo con `transform` y `opacity`

```

---

**Estado:** Por verificar en componentes

### 2. Bundle Size Optimization

---

**Objetivo:** First Load JS < 200KB (gzipped)

## 🔧 Herramientas

**Análisis actual:**

### Build & Performance

- **Next.js 15.2.4**: Framework con optimizaciones built-in```bash

  - Automatic code splitting# Instalar bundle analyzer

  - Route prefetchingnpm install @next/bundle-analyzer

  - Image optimization

  - Font optimization# Analizar bundle

ANALYZE=true npm run build

### Analysis Tools (Recomendados)```

- **@next/bundle-analyzer**: Visualizar bundle size

- **lighthouse**: Auditoría performance**Resultado esperado:**

- **@lhci/cli**: Lighthouse CI automation

```

### Monitoring (Ya instalado)Page                                Size     First Load JS

- **@vercel/analytics 1.3.1**: Real User Monitoring (RUM)┌ ○ /                              5.2 kB         95 kB

├ ○ /catalogo                      12 kB          102 kB

---├ ○ /cotizador                     18 kB          108 kB

└ ○ /producto/[id]                 8 kB           98 kB

## 📝 Comandos Disponibles

○  (Static)  prerendered as static content

### Build Commands```

```bash

# Build para producción**Estrategias:**

npm run build

#### Code Splitting

# Build con análisis de bundle

ANALYZE=true npm run build```typescript

// ❌ MAL: Importar todo

# Build solo (sin análisis)import { AdminPanel } from '@/components/admin/AdminPanel'

npm run build

// ✅ BIEN: Dynamic import

# Iniciar servidor producciónimport dynamic from 'next/dynamic'

npm run start

```const AdminPanel = dynamic(() => import('@/components/admin/AdminPanel'), {

  loading: () => <Skeleton className="h-screen" />,

---  ssr: false, // No renderizar en server (solo cliente)

})

### Development```

```bash

# Servidor desarrollo#### Tree Shaking

npm run dev

```typescript

# Con puerto custom// ❌ MAL: Importar librería completa

PORT=3001 npm run devimport * as _ from 'lodash'



# Con turbopack (experimental)// ✅ BIEN: Import específico

npm run dev --turboimport debounce from 'lodash/debounce'

```

// ✅ MEJOR: Usar alternativa nativa

---const debounce = (fn, ms) => {

  let timeout

### Performance Analysis  return (...args) => {

```bash    clearTimeout(timeout)

# Lighthouse (requiere instalación global)    timeout = setTimeout(() => fn(...args), ms)

npm install -g lighthouse  }

lighthouse http://localhost:3000 --view}

```

# Lighthouse solo performance

lighthouse http://localhost:3000 --only-categories=performance#### Icon Optimization



# Lighthouse con throttling```typescript

lighthouse http://localhost:3000 --throttling.cpuSlowdownMultiplier=4// ❌ MAL: Importar todos los iconos

```import * as Icons from 'lucide-react'



---// ✅ BIEN: Import específico

import { ShoppingCart, User, Menu } from 'lucide-react'

## 📊 Métricas Objetivo

// next.config.mjs

### Core Web Vitalsexperimental: {

| Métrica | Good | Needs Improvement | Poor | Objetivo |  optimizePackageImports: ['lucide-react'], // Auto tree-shake

|---------|------|-------------------|------|----------|}

| **LCP** | < 2.5s | 2.5s - 4.0s | > 4.0s | < 2.5s |```

| **INP** | < 200ms | 200ms - 500ms | > 500ms | < 200ms |

| **CLS** | < 0.1 | 0.1 - 0.25 | > 0.25 | < 0.1 |**Performance Budget:**



### Bundle Size```javascript

| Bundle | Actual | Objetivo | Estado |// next.config.mjs

|--------|--------|----------|--------|module.exports = {

| Main bundle | ⚠️ Por medir | < 200KB | 🔍 Pendiente |  webpack: (config, { isServer }) => {

| Total JS | ⚠️ Por medir | < 500KB | 🔍 Pendiente |    if (!isServer) {

| Total CSS | ⚠️ Por medir | < 50KB | 🔍 Pendiente |      config.performance = {

        maxAssetSize: 200000, // 200KB

### Lighthouse Score        maxEntrypointSize: 300000, // 300KB

| Categoría | Objetivo |        hints: 'error', // Bloquear build si excede

|-----------|----------|      }

| Performance | ≥ 90 |    }

| Accessibility | ≥ 90 |    return config

| Best Practices | ≥ 90 |  },

| SEO | ≥ 90 |}

```

---

---

## 🎯 Plan de Acción

### 3. Image Optimization

### Fase 1: Fix Build (CRÍTICO - 2 horas)

**Next.js Image Component:**

#### 1.1 Fix Suspense Boundary

```bash```typescript

# Editar app/auth/login/page.tsx// Configuración global en next.config.mjs

# Agregar Suspense wrapperimages: {

```  formats: ['image/avif', 'image/webp'],

  deviceSizes: [640, 750, 828, 1080, 1200, 1920],

#### 1.2 Habilitar TypeScript Checks  minimumCacheTTL: 60 * 60 * 24 * 365, // 1 año

```javascript  

// next.config.mjs  // [PENDIENTE] Configurar dominio si usas Supabase Storage

typescript: { ignoreBuildErrors: false }  remotePatterns: [

```    {

      protocol: 'https',

#### 1.3 Fix TypeScript Errors (si aparecen)      hostname: '<PLACEHOLDER-supabase-project-id>.supabase.co',

```bash      pathname: '/storage/v1/object/public/**',

npx tsc --noEmit  # Ver errores    },

# Corregir uno por uno  ],

```}

```

#### 1.4 Habilitar ESLint Checks

```javascript**Lazy Loading:**

// next.config.mjs

eslint: { ignoreDuringBuilds: false }```typescript

```// components/product-image-carousel.tsx

import Image from 'next/image'

#### 1.5 Fix ESLint Warnings (si aparecen)

```bashexport function ProductImage({ src, alt, priority = false }) {

npm run lint  # Ver warnings  return (

npm run lint -- --fix  # Auto-fix cuando sea posible    <Image

```      src={src}

      alt={alt}

#### 1.6 Verificar Build Exitoso      width={800}

```bash      height={600}

npm run build      priority={priority} // Solo primera imagen

npm run start      loading={priority ? undefined : 'lazy'}

# Verificar que app funciona en http://localhost:3000      placeholder="blur"

```      blurDataURL="data:image/jpeg;base64,..." // Placeholder base64

      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

---    />

  )

### Fase 2: Measurement (1 hora)}

```

#### 2.1 Instalar Lighthouse CI

```bash**Generación de blur placeholders:**

npm install -D @lhci/cli

``````bash

# Instalar plaiceholder

#### 2.2 Configurar LHCInpm install plaiceholder

```javascript

// lighthouserc.js# Generar blur data URL

module.exports = {import { getPlaiceholder } from 'plaiceholder'

  ci: {

    collect: {const { base64 } = await getPlaiceholder('/path/to/image.jpg')

      startServerCommand: 'npm run start',```

      url: ['http://localhost:3000/'],

      numberOfRuns: 3,**[PENDIENTE]** Optimizar imágenes de productos en Supabase Storage:

    },- Generar thumbnails automáticos (150x150, 300x300, 600x600)

    assert: {- Convertir a WebP/AVIF en upload

      preset: 'lighthouse:recommended',- Usar CDN de Supabase (ya incluido)

      assertions: {

        'categories:performance': ['error', { minScore: 0.9 }],---

        'categories:accessibility': ['error', { minScore: 0.9 }],

      },### 4. Caching Strategy

    },

    upload: {**Next.js App Router Caching:**

      target: 'temporary-public-storage',

    },```typescript

  },// app/catalogo/page.tsx - Datos estáticos

}export const revalidate = 3600 // 1 hora

```

export async function getCatalogo() {

#### 2.3 Medir Baseline  const { data } = await supabase

```bash    .from('productos')

npm run build    .select('*')

npm run start &    .eq('activo', true)

npx lhci autorun  

```  return data

}

**Documentar resultados:**

```markdown// app/producto/[id]/page.tsx - Generación estática

## Baseline Metrics - [Fecha]export async function generateStaticParams() {

  const productos = await getCatalogo()

### Lighthouse Scores  return productos.map((p) => ({ id: p.id.toString() }))

- Performance: __/100}

- Accessibility: __/100```

- Best Practices: __/100

- SEO: __/100**Revalidation on-demand:**



### Core Web Vitals```typescript

- LCP: __s// app/api/revalidate/route.ts

- INP: __msimport { revalidatePath } from 'next/cache'

- CLS: __import { NextRequest, NextResponse } from 'next/server'



### Bundle Sizeexport async function POST(request: NextRequest) {

- Main: __ KB  const secret = request.headers.get('x-revalidate-secret')

- Total JS: __ KB  

- Total CSS: __ KB  if (secret !== process.env.REVALIDATE_SECRET) {

```    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  }

---  

  revalidatePath('/catalogo')

### Fase 3: Optimización (4 horas)  revalidatePath('/producto/[id]', 'page')

  

#### 3.1 Habilitar Image Optimization  return NextResponse.json({ revalidated: true })

```javascript}

// next.config.mjs (si build funciona)

images: {// Llamar desde Supabase trigger (webhook) al actualizar productos

  unoptimized: false,```

  domains: ['your-project.supabase.co'],

}**Browser Caching (Vercel auto-configura):**

```

```

#### 3.2 Implementar Bundle AnalyzerCache-Control: public, max-age=31536000, immutable  → Estáticos (_next/)

```bashCache-Control: public, max-age=0, must-revalidate   → HTML pages

npm install -D @next/bundle-analyzerCache-Control: public, s-maxage=3600, stale-while-revalidate → API routes

ANALYZE=true npm run build```

```

---

**Identificar:**

- Paquetes grandes no usados### 5. Database Query Optimization

- Duplicación de código

- Oportunidades de lazy loading**Índices recomendados:**



#### 3.3 Dynamic Imports```sql

```tsx-- [PENDIENTE] Verificar que estos índices existen en Supabase

// Para componentes pesados (ej: recharts en admin)CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);

import dynamic from 'next/dynamic'CREATE INDEX IF NOT EXISTS idx_precios_producto_id ON precios_escalonados(producto_id);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_lead_id ON cotizaciones(lead_id);

const DashboardChart = dynamic(CREATE INDEX IF NOT EXISTS idx_items_cotizacion_id ON items_cotizacion(cotizacion_id);

  () => import('@/components/admin/DashboardChart'),

  { ssr: false }-- Índice compuesto para búsquedas comunes

)CREATE INDEX IF NOT EXISTS idx_productos_activo_categoria 

```  ON productos(activo, categoria) WHERE activo = true;

```

#### 3.4 Preload Critical Resources

```tsx**Evitar N+1 queries:**

// app/layout.tsx

<link rel="preconnect" href="https://your-project.supabase.co" />```typescript

<link rel="dns-prefetch" href="https://your-project.supabase.co" />// ❌ MAL: N+1 query

```const productos = await supabase.from('productos').select('*')

for (const producto of productos) {

---  const precios = await supabase

    .from('precios_escalonados')

### Fase 4: Monitoring (2 horas)    .select('*')

    .eq('producto_id', producto.id)

#### 4.1 Configurar Vercel Analytics (Ya instalado)}

```tsx

// app/layout.tsx - Verificar que esté presente// ✅ BIEN: JOIN

import { Analytics } from '@vercel/analytics/react'const productos = await supabase

  .from('productos')

export default function RootLayout({ children }) {  .select(`

  return (    *,

    <html>    precios_escalonados (*)

      <body>  `)

        {children}  .eq('activo', true)

        <Analytics />  {/* ✅ Ya incluido */}```

      </body>

    </html>**Paginación eficiente:**

  )

}```typescript

```// ✅ Paginación con limit/offset

const PAGE_SIZE = 20

#### 4.2 Implementar Performance Observerconst { data, count } = await supabase

```tsx  .from('productos')

// lib/performance.ts  .select('*', { count: 'exact' })

export function reportWebVitals(metric: NextWebVitalsMetric) {  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  console.log(metric)```

  // Enviar a analytics

}---



// app/layout.tsx### 6. Font Optimization

export { reportWebVitals }

``````typescript

// app/layout.tsx

---import { Geist } from 'next/font/google'



## 🐛 Troubleshootingconst geist = Geist({

  subsets: ['latin'],

### Build falla con "Cannot find module"  display: 'swap', // ⚡ Evita FOIT (Flash of Invisible Text)

**Causa:** Import path incorrecto  preload: true,

  variable: '--font-geist',

**Solución:**})

```bash

# Verificar tsconfig.json pathsexport default function RootLayout({ children }) {

# Verificar que archivos existan  return (

```    <html lang="es" className={geist.variable}>

      <body>{children}</body>

---    </html>

  )

### Build muy lento (> 5 minutos)}

**Causa:** Muchos archivos o dependencias pesadas```



**Solución:****Preload crítico:**

```bash

# 1. Limpiar cache```typescript

rm -rf .next node_modules// app/layout.tsx

npm installexport const metadata = {

npm run build  other: {

    'link': [

# 2. Verificar dependencias      {

npm ls --depth=0        rel: 'preload',

        href: '/fonts/geist.woff2',

# 3. Considerar turbopack        as: 'font',

npm run dev --turbo        type: 'font/woff2',

```        crossOrigin: 'anonymous',

      },

---    ],

  },

### Images no se optimizan}

**Causa:** Dominio no autorizado o imágenes externas```



**Solución:**---

```javascript

// next.config.mjs### 7. Lighthouse CI Integration

images: {

  domains: [**Configuración:**

    'your-project.supabase.co',

    'cdn.example.com',```javascript

  ],// lighthouserc.json

  remotePatterns: [{

    {  "ci": {

      protocol: 'https',    "collect": {

      hostname: '**.supabase.co',      "url": ["http://localhost:3000", "http://localhost:3000/catalogo"],

    },      "numberOfRuns": 3

  ],    },

}    "assert": {

```      "preset": "lighthouse:recommended",

      "assertions": {

---        "categories:performance": ["error", { "minScore": 0.9 }],

        "categories:accessibility": ["error", { "minScore": 0.9 }],

### Lighthouse score bajo en Performance        "categories:best-practices": ["error", { "minScore": 0.9 }],

**Causas comunes:**        "categories:seo": ["error", { "minScore": 0.9 }],

1. Bundle size grande → usar bundle analyzer        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],

2. Imágenes sin optimizar → next/image        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],

3. Fonts externos → next/font        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],

4. JS blocking → defer scripts        "total-blocking-time": ["error", { "maxNumericValue": 300 }]

5. CSS sin optimizar → Tailwind purge      }

    },

---    "upload": {

      "target": "temporary-public-storage"

## ✅ Entregables    }

  }

### Fixes Implementados}

- [ ] Suspense boundary en /auth/login```

- [ ] TypeScript checks habilitados

- [ ] ESLint checks habilitados**GitHub Action:**

- [ ] Build exitoso sin warnings

```yaml

### Configuración# .github/workflows/lighthouse.yml

- [ ] `next.config.mjs` optimizadoname: Lighthouse CI

- [ ] Bundle analyzer configurado

- [ ] Lighthouse CI configuradoon:

  pull_request:

### Documentación    branches: [main]

- [ ] Baseline metrics documentadas

- [ ] Bundle size reportjobs:

- [ ] Lighthouse report  lighthouse:

- [ ] Plan de optimización priorizado    runs-on: ubuntu-latest

    steps:

### Monitoring      - uses: actions/checkout@v4

- [ ] Vercel Analytics verificado      

- [ ] Performance observer implementado      - name: Setup Node.js

- [ ] Core Web Vitals tracking        uses: actions/setup-node@v4

        with:

---          node-version: 20

      

## 📚 Recursos      - name: Install dependencies

        run: npm ci

### Documentación Oficial      

- **Next.js Performance:** https://nextjs.org/docs/app/building-your-application/optimizing      - name: Build Next.js

- **Web Vitals:** https://web.dev/vitals/        run: npm run build

- **Lighthouse:** https://developer.chrome.com/docs/lighthouse/        env:

          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}

### Tools          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

- **Bundle Analyzer:** https://www.npmjs.com/package/@next/bundle-analyzer      

- **Lighthouse CI:** https://github.com/GoogleChrome/lighthouse-ci      - name: Run Lighthouse CI

        run: |

---          npm install -g @lhci/cli

          lhci autorun

**Última actualización:** 2025-11-03          env:

**Build status:** ❌ Fallando (fix en progreso)            LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

**Prioridad:** 🔴 CRÍTICA (bloquea deploy)```


---

### 8. Monitoring & Observability

**Vercel Analytics (Ya integrado):**

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Custom Performance Metrics:**

```typescript
// lib/performance.ts
export function reportWebVitals(metric) {
  // Enviar a analytics personalizado
  console.log(metric)
  
  // O enviar a Vercel Analytics
  if (window.va) {
    window.va('event', {
      name: metric.name,
      value: metric.value,
      label: metric.id,
    })
  }
}

// app/layout.tsx
export { reportWebVitals } from '@/lib/performance'
```

**Performance Observer API:**

```typescript
// components/PerformanceMonitor.tsx
'use client'

import { useEffect } from 'react'

export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.renderTime || entry.loadTime)
        }
      }
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
    
    return () => observer.disconnect()
  }, [])
  
  return null
}
```

**[PENDIENTE]** Configurar herramienta de error tracking:
- Sentry (recomendado)
- LogRocket
- Datadog RUM
- Custom con Performance API

---

## Performance Checklist

### Build Time
- [ ] `npm run build` completa en < 2 minutos
- [ ] Bundle size reportado < 200KB first load
- [ ] No hay warnings de bundle size
- [ ] Tree shaking funcionando (verificar bundle analyzer)

### Runtime (Development)
- [ ] Hot reload < 3s
- [ ] Fast refresh sin full reload
- [ ] No hay memory leaks (Chrome DevTools)

### Runtime (Production)
- [ ] LCP < 2.5s (Good)
- [ ] INP < 200ms (Good)
- [ ] CLS < 0.1 (Good)
- [ ] FCP < 1.8s (Good)
- [ ] TTI < 3.5s (Good)
- [ ] TTFB < 600ms (Good)

### Images
- [ ] Todas las imágenes con Next Image component
- [ ] Formato WebP/AVIF configurado
- [ ] Lazy loading en imágenes below the fold
- [ ] `priority` en imagen hero (LCP)
- [ ] Responsive images con `sizes` attribute

### JavaScript
- [ ] Code splitting implementado
- [ ] Dynamic imports para rutas admin
- [ ] Tree shaking configurado
- [ ] No hay `console.log` en producción
- [ ] Vendor bundle < 100KB

### CSS
- [ ] Tailwind CSS purgeado (automático)
- [ ] Critical CSS inline (automático en Next)
- [ ] No hay CSS no usado
- [ ] Animaciones solo con `transform`/`opacity`

### Fonts
- [ ] `font-display: swap` configurado
- [ ] Fonts preloaded
- [ ] Subsetting configurado (solo caracteres usados)

### Caching
- [ ] Static assets con cache infinito
- [ ] HTML con revalidation
- [ ] API routes con SWR/stale-while-revalidate
- [ ] CDN configurado (Vercel lo hace auto)

### Database
- [ ] Índices en columnas filtradas
- [ ] No hay N+1 queries
- [ ] Paginación implementada
- [ ] Connection pooling configurado (Supabase lo hace auto)

### Monitoring
- [ ] Vercel Analytics instalado
- [ ] Core Web Vitals monitoreados
- [ ] <PLACEHOLDER: Error tracking> [PENDIENTE]
- [ ] Alertas configuradas para regresiones

---

## Performance Budget

```javascript
// performance-budget.json
{
  "budgets": [
    {
      "resourceType": "script",
      "budget": 200
    },
    {
      "resourceType": "style",
      "budget": 50
    },
    {
      "resourceType": "image",
      "budget": 300
    },
    {
      "resourceType": "font",
      "budget": 100
    },
    {
      "resourceType": "total",
      "budget": 800
    }
  ],
  "timing": {
    "fcp": 1800,
    "lcp": 2500,
    "tti": 3500,
    "tbt": 300,
    "cls": 0.1
  }
}
```

---

## Troubleshooting

### LCP alto (> 4s)

**Diagnóstico:**
```bash
# Identificar elemento LCP
# Chrome DevTools → Performance → Experience → LCP
```

**Soluciones:**
1. Imagen hero → `priority={true}`
2. Font bloqueante → `font-display: swap`
3. Servidor lento → Verificar TTFB
4. JavaScript bloqueante → Code splitting

### CLS alto (> 0.25)

**Diagnóstico:**
```javascript
// Detectar shifts en producción
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.hadRecentInput) continue
    console.log('Layout shift:', entry.value, entry.sources)
  }
}).observe({ entryTypes: ['layout-shift'] })
```

**Soluciones:**
1. Imágenes sin dimensiones → `aspect-ratio`
2. Fonts loading → Preload + `font-display: swap`
3. Anuncios/banners → Reservar espacio
4. Contenido dinámico → Skeleton loaders

### Bundle size grande

**Diagnóstico:**
```bash
ANALYZE=true npm run build
```

**Soluciones:**
1. Eliminar imports no usados
2. Dynamic imports para admin
3. Tree shake icons (`lucide-react`)
4. Reemplazar librerías pesadas (lodash → native)

---

## Próximos Pasos

1. **[MEDIR]** Ejecutar Lighthouse en production URL actual
2. **[ANALIZAR]** Identificar bottlenecks con WebPageTest
3. **[IMPLEMENTAR]** Quick wins (priority en hero, lazy loading)
4. **[VALIDAR]** Re-ejecutar Lighthouse y comparar
5. **[AUTOMATIZAR]** Integrar Lighthouse CI en GitHub Actions
6. **[MONITOREAR]** Dashboard de métricas en Vercel Analytics
7. **[ITERAR]** Optimizar progresivamente semana a semana

---

## Recursos Adicionales

- [Core Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Web.dev Patterns](https://web.dev/patterns/)
- [Vercel Analytics](https://vercel.com/docs/analytics)

---

**Última actualización:** 2025-11-03  
**Versión:** 1.0.0  
**Mantenido por:** Performance Agent
