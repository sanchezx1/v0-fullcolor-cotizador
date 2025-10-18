import { NextRequest, NextResponse } from 'next/server'
import { revalidateCache } from '@/src/lib/data'

// Clave secreta para proteger el endpoint
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'dev-secret'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación básica
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${REVALIDATE_SECRET}`
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Revalidar cache
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

// También permitir GET para facilitar testing
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const secret = url.searchParams.get('secret')
  
  if (secret !== REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
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
