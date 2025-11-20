import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseAdminClient } from '@/src/services/supabaseAdminClient'
import type { PublicQuoteResponse } from '@/app/api/public/quotes/[id]/route'

function normalizePdfPath(rawPath: string | null): string | null {
  if (!rawPath) return null
  const match = rawPath.match(/cotizaciones\/(.+)$/)
  if (match) {
    return match[1]
  }
  return rawPath.replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/cotizaciones\//, '')
}

async function loadQuote(quoteId: number, token: string): Promise<PublicQuoteResponse> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('cotizaciones')
    .select(`
      id,
      numero,
      estado,
      total,
      validez_dias,
      pdf_url,
      created_at,
      leads (
        nombre,
        email,
        telefono,
        empresa,
        ruc_cedula,
        ciudad,
        notas
      ),
      items_cotizacion (
        id,
        cantidad,
        precio_unitario_aplicado,
        subtotal,
        productos (
          nombre,
          categoria,
          imagen_url
        )
      )
    `)
    .eq('id', quoteId)
    .eq('access_token', token)
    .single()

  if (error || !data) {
    return { error: error ?? new Error('Quote not found') }
  }

  return {
    cotizacion: {
      id: data.id,
      numero: data.numero,
      estado: data.estado,
      total: data.total,
      validez_dias: data.validez_dias,
      created_at: data.created_at,
      pdf_storage_path: normalizePdfPath(data.pdf_url ?? null)
    },
    lead: data.leads,
    items: data.items_cotizacion ?? []
  }
}

async function signPdfUrl(path: string) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase.storage
    .from('cotizaciones')
    .createSignedUrl(path, 3600)

  if (error || !data) {
    throw new Error(error?.message ?? 'Unable to sign PDF URL')
  }

  return data.signedUrl
}

type QuoteRouteContext = { params: Promise<{ id: string }> }

async function resolveQuoteId(context: QuoteRouteContext): Promise<number> {
  const resolvedParams = await context.params
  return Number(resolvedParams.id)
}

export async function GET(
  request: NextRequest,
  context: QuoteRouteContext
) {
  const token = request.headers.get('x-quote-token')
  const quoteId = await resolveQuoteId(context)

  if (!token || Number.isNaN(quoteId)) {
    return NextResponse.json(
      { error: 'Missing quote token or invalid quote id' },
      { status: 400 }
    )
  }

  const { cotizacion, error } = await loadQuote(quoteId, token)

  if (error || !cotizacion) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }

  if (!cotizacion.pdf_storage_path) {
    return NextResponse.json({ pdfUrl: null })
  }

  try {
    const signedUrl = await signPdfUrl(cotizacion.pdf_storage_path)
    return NextResponse.json({ pdfUrl: signedUrl })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Signing failed' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: QuoteRouteContext
) {
  const token = request.headers.get('x-quote-token')
  const quoteId = await resolveQuoteId(context)

  if (!token || Number.isNaN(quoteId)) {
    return NextResponse.json(
      { error: 'Missing quote token or invalid quote id' },
      { status: 400 }
    )
  }

  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase.functions.invoke('generate-pdf', {
    body: { quoteId, quoteToken: token }
  })

  if (error) {
    return NextResponse.json(
      { error: error.message ?? 'PDF generation failed' },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}
