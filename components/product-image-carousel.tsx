'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type CarouselImage = {
  src: string
  alt?: string
}

interface ProductImageCarouselProps {
  images?: CarouselImage[]
  fallbackSrc?: string
  aspectRatioClassName?: string
  className?: string
}

const MIN_SWIPE_DISTANCE = 40

export function ProductImageCarousel({
  images = [],
  fallbackSrc = '/placeholder.svg?height=500&width=500',
  aspectRatioClassName = 'aspect-square',
  className,
}: ProductImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const gallery = useMemo(() => {
    if (images.length === 0) {
      return [{ src: fallbackSrc, alt: 'Imagen no disponible' }]
    }
    return images.map((image, index) => ({
      src: image.src,
      alt: image.alt || `Vista ${index + 1} del producto`,
    }))
  }, [images, fallbackSrc])

  useEffect(() => {
    setActiveIndex(0)
  }, [gallery.length])

  const goTo = (index: number) => {
    const total = gallery.length
    if (total === 0) return
    const nextIndex = (index + total) % total
    setActiveIndex(nextIndex)
  }

  const goNext = () => goTo(activeIndex + 1)
  const goPrev = () => goTo(activeIndex - 1)

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const deltaX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const difference = deltaX - touchStartX.current

    if (Math.abs(difference) >= MIN_SWIPE_DISTANCE) {
      if (difference > 0) {
        goPrev()
      } else {
        goNext()
      }
    }

    touchStartX.current = null
  }

  return (
    <section
      className={cn(
        'group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg',
        className
      )}
      aria-roledescription="Carrusel"
      aria-label="Galer��a de im��genes del producto"
    >
      <div
        className={cn('relative w-full', aspectRatioClassName)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {gallery.map((image, index) => (
            <div key={`${image.src}-${index}`} className="relative h-full w-full flex-shrink-0">
              <Image
                src={image.src}
                alt={image.alt ?? ''}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {gallery.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow-md transition hover:bg-[#FFD700] hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:ring-offset-2"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow-md transition hover:bg-[#FFD700] hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:ring-offset-2"
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </>
      )}

      {gallery.length > 1 && (
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
          {gallery.map((_, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={`indicator-${index}`}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]',
                  isActive ? 'w-6 bg-[#0066CC]' : 'bg-white/70 hover:bg-[#FFD700]/60'
                )}
                aria-label={`Mostrar imagen ${index + 1}`}
                aria-current={isActive}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
