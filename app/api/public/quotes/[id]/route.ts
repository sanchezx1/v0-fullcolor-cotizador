import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseAdminClient } from '@/src/services/supabaseAdminClient'

function normalizePdfPath(rawPath: string | null): string | null {
  if (!rawPath) return null
  const match = rawPath.match(/cotizaciones\/(.+)$/)
  if (match) {
    return match[1]
  }
  return rawPath.replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/cotizaciones\//, '')
}

async function fetchQuoteData(quoteId: number, token: string) {
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

type PublicQuoteRouteContext = { params: Promise<{ id: string }> }

async function resolveContextQuoteId(context: PublicQuoteRouteContext): Promise<number> {
  const resolvedParams = await context.params
  return Number(resolvedParams.id)
}

export async function GET(
  request: NextRequest,
  context: PublicQuoteRouteContext
) {
  const token = request.headers.get('x-quote-token')
  const quoteId = await resolveContextQuoteId(context)

  if (!token || Number.isNaN(quoteId)) {
    return NextResponse.json(
      { error: 'Missing quote token or invalid quote id' },
      { status: 400 }
    )
  }

  const { cotizacion, lead, items, error } = await fetchQuoteData(quoteId, token)

  if (error || !cotizacion) {
    return NextResponse.json(
      { error: 'Quote not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    cotizacion,
    lead,
    items
  })
}

export type PublicQuoteResponse = Awaited<ReturnType<typeof fetchQuoteData>>
