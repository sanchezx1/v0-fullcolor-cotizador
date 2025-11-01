"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface AnimatedPagerIndicatorProps {
  pageCount: number
  progress: number
  className?: string
}

interface IndicatorMetrics {
  centers: number[]
  dotSize: number
  minSpacing: number
  centerY: number
}

export function AnimatedPagerIndicator({ pageCount, progress, className }: AnimatedPagerIndicatorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [metrics, setMetrics] = useState<IndicatorMetrics>({
    centers: [],
    dotSize: 0,
    minSpacing: 0,
    centerY: 0,
  })

  const registerDot = useCallback((index: number) => {
    return (node: HTMLSpanElement | null) => {
      dotRefs.current[index] = node
    }
  }, [])

  useLayoutEffect(() => {
    dotRefs.current = Array.from({ length: pageCount }, (_, index) => dotRefs.current[index] ?? null)
  }, [pageCount])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let frame = 0
    const measure = () => {
      const safeDots = dotRefs.current.filter(Boolean) as HTMLSpanElement[]
      if (!safeDots.length) {
        setMetrics((prev) =>
          prev.centers.length ? { centers: [], dotSize: 0, minSpacing: 0, centerY: 0 } : prev
        )
        return
      }

      const containerRect = container.getBoundingClientRect()
      const centers: number[] = []
      let dotSize = 0
      let minSpacing = Number.POSITIVE_INFINITY
      let centerY = 0

      safeDots.forEach((dot) => {
        const rect = dot.getBoundingClientRect()
        centers.push(rect.left - containerRect.left + rect.width / 2)
        dotSize = rect.width
        if (!centerY) {
          centerY = rect.top - containerRect.top + rect.height / 2
        }
      })

      for (let i = 0; i < centers.length - 1; i += 1) {
        minSpacing = Math.min(minSpacing, centers[i + 1] - centers[i])
      }
      if (!Number.isFinite(minSpacing)) {
        minSpacing = dotSize
      }

      setMetrics((prev) => {
        const sameCenters =
          prev.centers.length === centers.length && prev.centers.every((value, index) => value === centers[index])
        if (
          sameCenters &&
          prev.dotSize === dotSize &&
          prev.centerY === centerY &&
          prev.minSpacing === minSpacing
        ) {
          return prev
        }
        return { centers, dotSize, minSpacing, centerY }
      })
    }

    measure()

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            cancelAnimationFrame(frame)
            frame = requestAnimationFrame(measure)
          })
        : null

    dotRefs.current.forEach((dot) => {
      if (dot) {
        resizeObserver?.observe(dot)
      }
    })

    window.addEventListener("resize", measure)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [pageCount])

  const { bubbleLeft, bubbleWidth } = useMemo(() => {
    const { centers, dotSize, minSpacing } = metrics
    if (!centers.length || dotSize <= 0) {
      return { bubbleLeft: 0, bubbleWidth: 0 }
    }

    const maxStep = Math.max(0, centers.length - 1)
    const clampedProgress = Math.min(Math.max(progress, 0), maxStep)
    const startIndex = Math.floor(clampedProgress)
    const endIndex = Math.min(startIndex + 1, centers.length - 1)
    const fractional = clampedProgress - startIndex
    const eased = 0.5 - Math.cos(Math.PI * fractional) / 2

    const startCenter = centers[startIndex]
    const endCenter = centers[endIndex]
    const spacing = Math.max(minSpacing, dotSize)
    const margin = Math.max(2, dotSize * 0.2)
    const maxWidthWithoutOverlap = Math.max(
      dotSize,
      2 * Math.max(spacing - dotSize / 2 - margin, dotSize / 2)
    )
    const targetWidth = Math.min(maxWidthWithoutOverlap, dotSize * 2.1)
    const baseWidth = Math.min(maxWidthWithoutOverlap, Math.max(dotSize + margin, targetWidth))
    const stretchAllowance = Math.max(0, Math.min(maxWidthWithoutOverlap - baseWidth, dotSize * 0.5))
    const width = baseWidth + stretchAllowance * Math.sin(Math.PI * fractional)
    const halfWidth = width / 2

    const rawCenter = startCenter + (endCenter - startCenter) * eased
    const prevCenter = centers[startIndex - 1] ?? startCenter - spacing
    const nextCenter = centers[endIndex + 1] ?? endCenter + spacing
    const minCenter = prevCenter + dotSize / 2 + margin + halfWidth - dotSize
    const maxCenter = nextCenter - dotSize / 2 - margin - halfWidth + dotSize
    const lowerBound = Math.min(minCenter, maxCenter)
    const upperBound = Math.max(minCenter, maxCenter)
    const clampedCenter = Math.max(lowerBound, Math.min(upperBound, rawCenter))

    return { bubbleLeft: clampedCenter - halfWidth, bubbleWidth: width }
  }, [metrics, progress])

  const verticalCenter = metrics.centerY

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center justify-center gap-3 px-4 py-2",
        "pointer-events-none select-none",
        className
      )}
      aria-hidden="true"
    >
      {bubbleWidth > 0 ? (
        <span
          className="pointer-events-none absolute left-0 z-20 h-2.5 rounded-full bg-[#0066CC] shadow-[0_12px_28px_-18px_rgba(0,102,204,0.65)] transition-[transform,width] duration-150 ease-out"
          style={{
            top: verticalCenter || "50%",
            transform: `translateX(${bubbleLeft}px) translateY(-50%)`,
            width: bubbleWidth,
            willChange: "transform,width",
          }}
        />
      ) : null}
      {Array.from({ length: pageCount }).map((_, index) => (
        <span
          key={index}
          ref={registerDot(index)}
          className="relative z-10 block h-2.5 w-2.5 rounded-full bg-slate-300"
          style={{ pointerEvents: "none" }}
          data-pager-dot
        />
      ))}
    </div>
  )
}
