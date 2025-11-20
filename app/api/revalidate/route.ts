import { NextRequest, NextResponse } from 'next/server'
import { revalidateCache } from '@/src/lib/data'

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET

if (!REVALIDATE_SECRET) {
  throw new Error('Missing REVALIDATE_SECRET environment variable')
}

const HEADER_CANDIDATES = ['x-revalidate-key', 'x-vercel-reval-key'] as const

function extractProvidedSecret(request: NextRequest): string | null {
  for (const headerName of HEADER_CANDIDATES) {
    const headerValue = request.headers.get(headerName)
    if (headerValue) {
      return headerValue.trim()
    }
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim()
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const providedSecret = extractProvidedSecret(request)

    if (!providedSecret || providedSecret !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await revalidateCache()

    return NextResponse.json({
      success: true,
      message: 'Cache revalidated successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error revalidating cache:', error)
    return NextResponse.json(
      {
        error: 'Failed to revalidate cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
