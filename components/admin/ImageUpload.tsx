'use client'

import { useState, useCallback } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string | File
  onChange: (file: File | null) => void
  onRemove?: () => void
  disabled?: boolean
  currentImageUrl?: string
}

export function ImageUpload({ value, onChange, onRemove, disabled, currentImageUrl }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || (typeof value === 'string' ? value : null)
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleFile = useCallback((file: File) => {
    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen')
      return
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 5MB')
      return
    }

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    onChange(file)
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }, [disabled, handleFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (disabled) return

    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }, [disabled, handleFile])

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (onRemove) onRemove()
  }

  return (
    <div>
      {preview ? (
        <div className="relative inline-block">
          <Image
            src={preview}
            alt="Preview"
            width={200}
            height={200}
            className="rounded-lg border object-cover"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && document.getElementById('image-upload')?.click()}
        >
          <input
            id="image-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            className="hidden"
            disabled={disabled}
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-700">
                Arrastra imagen aquí o haz click para seleccionar
              </p>
              <p className="text-sm text-gray-500 mt-1">
                JPG, PNG o WebP (máx. 5MB)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
