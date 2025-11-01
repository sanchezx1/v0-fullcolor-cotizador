import { supabase } from '@/src/services/supabaseClient'
import {
  buildProductGalleryPath,
  getProductGalleryBucket,
  getProductGalleryFolder,
  isGalleryImage,
} from '@/lib/product-gallery'

export interface ProductGalleryItem {
  path: string
  url: string
}

export async function fetchProductGallery(productId: number): Promise<ProductGalleryItem[]> {
  const bucket = getProductGalleryBucket()
  const folder = getProductGalleryFolder(productId)

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 50,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      })

    if (error) {
      console.error('Error listing product gallery images:', error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    const images = data
      .filter((item) => !item.name.endsWith('/') && isGalleryImage(item.name))
      .map((item) => {
        const path = buildProductGalleryPath(productId, item.name)
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path)

        return {
          path,
          url: publicData.publicUrl,
        }
      })

    return images
  } catch (err) {
    console.error('Unexpected error loading product gallery images:', err)
    return []
  }
}
