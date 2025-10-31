const PRODUCT_GALLERY_BUCKET = 'productos'
const PRODUCT_GALLERY_PREFIX = 'producto-'
const IMAGE_PATTERN = /\.(png|jpe?g|webp|gif|svg)$/i

export function getProductGalleryBucket(): string {
  return PRODUCT_GALLERY_BUCKET
}

export function getProductGalleryFolder(productId: number): string {
  return `${PRODUCT_GALLERY_PREFIX}${productId}`
}

export function buildProductGalleryPath(productId: number, fileName: string): string {
  return `${getProductGalleryFolder(productId)}/${fileName}`
}

export function isGalleryImage(name: string): boolean {
  return IMAGE_PATTERN.test(name)
}

export function createGalleryFileName(originalName: string): string {
  const extension = originalName.split('.').pop()?.toLowerCase()
  const safeExtension = extension && IMAGE_PATTERN.test(`file.${extension}`)
    ? extension
    : 'jpg'

  const base = originalName
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'imagen'

  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  return `${uniqueSuffix}-${base}.${safeExtension}`
}
