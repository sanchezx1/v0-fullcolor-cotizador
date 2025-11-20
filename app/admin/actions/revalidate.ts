'use server'

import { revalidateCache } from '@/src/lib/data'

function ensureServerAccess(): void {
  if (!process.env.REVALIDATE_SECRET) {
    throw new Error('Missing REVALIDATE_SECRET environment variable')
  }
}

export async function triggerDashboardRevalidation() {
  ensureServerAccess()
  await revalidateCache()

  return {
    success: true,
    message: 'Cache revalidated successfully',
    timestamp: new Date().toISOString()
  }
}
