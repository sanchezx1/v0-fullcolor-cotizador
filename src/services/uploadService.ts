import { supabase } from '../supabaseClient'

/**
 * Servicio para gestionar uploads de archivos a Supabase Storage
 */

export interface UploadOptions {
  bucket: string
  folder?: string
  fileName?: string
  upsert?: boolean
}

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

/**
 * Sube un archivo a Supabase Storage
 * @param file - Archivo a subir
 * @param options - Opciones de upload
 */
export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    // Validar archivo
    if (!file) {
      return { success: false, error: 'No se proporcionó un archivo' }
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return { success: false, error: 'El archivo no puede pesar más de 5MB' }
    }

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Solo se permiten imágenes JPG, PNG o WebP' }
    }

    // Generar nombre de archivo único
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = options.fileName 
      ? `${options.fileName}-${timestamp}.${extension}`
      : `file-${timestamp}.${extension}`

    // Construir path
    const folder = options.folder || ''
    const filePath = folder ? `${folder}/${fileName}` : fileName

    console.log('📤 Subiendo archivo:', { 
      bucket: options.bucket, 
      path: filePath,
      size: file.size,
      type: file.type
    })

    // Subir archivo
    const { data, error } = await supabase.storage
      .from(options.bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: options.upsert || false,
        contentType: file.type
      })

    if (error) {
      console.error('❌ Error subiendo archivo:', error)
      return { success: false, error: error.message }
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(options.bucket)
      .getPublicUrl(filePath)

    console.log('✅ Archivo subido exitosamente:', urlData.publicUrl)

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
    }
  } catch (error) {
    console.error('❌ Error en uploadFile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Elimina un archivo de Supabase Storage
 * @param bucket - Nombre del bucket
 * @param path - Ruta del archivo
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ Eliminando archivo:', { bucket, path })

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('❌ Error eliminando archivo:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Archivo eliminado exitosamente')
    return { success: true }
  } catch (error) {
    console.error('❌ Error en deleteFile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Sube una imagen de producto
 * @param file - Archivo de imagen
 * @param sku - SKU del producto (usado para el nombre del archivo)
 */
export async function uploadProductImage(
  file: File,
  sku: string
): Promise<UploadResult> {
  return uploadFile(file, {
    bucket: 'productos',
    folder: 'images',
    fileName: sku.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    upsert: true
  })
}

/**
 * Elimina una imagen de producto
 * @param imageUrl - URL de la imagen a eliminar
 */
export async function deleteProductImage(
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extraer path de la URL
    // Formato: https://{project}.supabase.co/storage/v1/object/public/productos/images/file.jpg
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/storage/v1/object/public/productos/')
    
    if (pathParts.length < 2) {
      return { success: false, error: 'URL de imagen inválida' }
    }

    const path = pathParts[1]
    return deleteFile('productos', path)
  } catch (error) {
    console.error('❌ Error en deleteProductImage:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Verifica si existe un bucket
 * @param bucketName - Nombre del bucket
 */
export async function checkBucketExists(bucketName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName)
    return !!data && !error
  } catch (error) {
    return false
  }
}

/**
 * Crea el bucket de productos si no existe
 */
export async function ensureProductsBucketExists(): Promise<void> {
  try {
    const exists = await checkBucketExists('productos')
    
    if (!exists) {
      console.log('📦 Creando bucket productos...')
      const { error } = await supabase.storage.createBucket('productos', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024 // 5MB
      })
      
      if (error) {
        console.error('❌ Error creando bucket:', error)
      } else {
        console.log('✅ Bucket productos creado')
      }
    }
  } catch (error) {
    console.error('❌ Error en ensureProductsBucketExists:', error)
  }
}
