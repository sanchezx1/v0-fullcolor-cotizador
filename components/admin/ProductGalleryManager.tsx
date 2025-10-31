'use client'

import { useCallback, useMemo, useRef } from 'react'
import Image from 'next/image'
import { Upload, Star, Trash2, Undo2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface GalleryDisplayItem {
  id: string
  src: string
  isPrimary: boolean
  status: 'existing' | 'new'
  pendingRemoval?: boolean
}

interface ProductGalleryManagerProps {
  items: GalleryDisplayItem[]
  onAddFiles: (files: File[]) => void
  onSetPrimary: (id: string) => void
  onRemove: (id: string) => void
  onRestore?: (id: string) => void
  disabled?: boolean
}

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif'

export function ProductGalleryManager({
  items,
  onAddFiles,
  onSetPrimary,
  onRemove,
  onRestore,
  disabled = false,
}: ProductGalleryManagerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      if (disabled || !fileList) return
      if ('length' in fileList && fileList.length === 0) return

      const filesArray = Array.from(fileList as any)
      if (filesArray.length > 0) {
        onAddFiles(filesArray as File[])
      }
    },
    [disabled, onAddFiles]
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()
      if (disabled) return
      if (event.dataTransfer?.files) {
        handleFiles(event.dataTransfer.files)
      }
    },
    [disabled, handleFiles]
  )

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) return
      handleFiles(event.target.files)
      event.target.value = ''
    },
    [handleFiles]
  )

  const dropzoneDescription = useMemo(() => {
    if (disabled) {
      return 'La galer��a est�� deshabilitada'
    }
    return 'Arrastra tus im��genes aqu�� o haz click para seleccionar'
  }, [disabled])

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition',
          disabled
            ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
            : 'cursor-pointer border-[#0066CC]/40 bg-white hover:border-[#0066CC] hover:bg-[#0066CC]/5'
        )}
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0066CC]/10 text-[#0066CC] transition group-hover:bg-[#0066CC]/20">
            <Upload className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-700">{dropzoneDescription}</p>
            {!disabled && (
              <p className="text-xs text-slate-500">
                Formatos permitidos: JPG, PNG, WebP o GIF. Tamaño máximo 5MB por archivo.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'relative overflow-hidden rounded-xl border shadow-sm transition',
              item.isPrimary ? 'border-[#0066CC]' : 'border-slate-200',
              item.pendingRemoval ? 'opacity-60 grayscale' : 'bg-white'
            )}
          >
            <div className="relative h-48 w-full">
              <Image
                src={item.src}
                alt="Vista del producto"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              {item.isPrimary && (
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#FFD700] px-3 py-1 text-xs font-semibold text-slate-900 shadow">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Principal
                </span>
              )}
              {item.pendingRemoval && (
                <span className="absolute inset-3 flex items-center justify-center rounded-lg bg-slate-900/70 text-sm font-semibold text-white">
                  Programada para eliminarse
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 border-t bg-slate-50 px-3 py-2">
              <Button
                type="button"
                variant={item.isPrimary ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onSetPrimary(item.id)}
                disabled={item.pendingRemoval || disabled}
                className={cn(
                  'gap-2',
                  item.isPrimary
                    ? 'border border-[#0066CC]/30 bg-white text-[#0066CC]'
                    : 'text-slate-600 hover:text-[#0066CC]'
                )}
              >
                <Star className="h-4 w-4" aria-hidden="true" />
                {item.isPrimary ? 'Principal' : 'Marcar principal'}
              </Button>

              {item.pendingRemoval ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRestore?.(item.id)}
                  disabled={disabled}
                  className="gap-1 text-[#0066CC]"
                >
                  <Undo2 className="h-4 w-4" aria-hidden="true" />
                  Deshacer
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemove(item.id)}
                  disabled={disabled}
                  className="gap-1"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Quitar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-sm text-slate-500">
          Aún no has agregado imágenes. Te recomendamos añadir al menos dos vistas del producto para mejorar la
          experiencia del usuario.
        </p>
      )}
    </div>
  )
}
