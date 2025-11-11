"use client"

import { cn } from "@/lib/utils"

interface AnimatedPagerIndicatorProps {
  pageCount: number
  progress: number
  className?: string
}

export function AnimatedPagerIndicator({ pageCount, progress, className }: AnimatedPagerIndicatorProps) {
  if (pageCount <= 1) {
    return null
  }

  const normalizedProgress = Number.isFinite(progress) ? progress : 0
  const activeIndex = Math.min(Math.max(Math.round(normalizedProgress), 0), pageCount - 1)

  return (
    <div
      className={cn(
        "relative flex items-center justify-center gap-2 px-4 py-2",
        "pointer-events-none select-none",
        className
      )}
      aria-hidden="true"
    >
      {Array.from({ length: pageCount }).map((_, index) => {
        const isActive = index === activeIndex
        return (
          <span
            key={index}
            className={cn(
              "block h-2.5 rounded-full transition-all duration-300 ease-out",
              isActive
                ? "w-6 bg-[#0066CC] shadow-[0_10px_24px_-12px_rgba(0,102,204,0.65)]"
                : "w-2.5 bg-slate-300"
            )}
          />
        )
      })}
    </div>
  )
}
