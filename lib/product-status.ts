type ProductStatus = {
  agotado: boolean
  mas_vendido: boolean
}

const STATUS_PREFIX = '<!--FC_STATUS:'
const STATUS_SUFFIX = '-->'

const STATUS_REGEX = /<!--FC_STATUS:([\s\S]*?)-->/

function parseStatusPayload(payload: string | undefined): ProductStatus {
  if (!payload) {
    return { agotado: false, mas_vendido: false }
  }

  try {
    const parsed = JSON.parse(payload)
    return {
      agotado: Boolean(parsed.agotado),
      mas_vendido: Boolean(parsed.mas_vendido),
    }
  } catch {
    return { agotado: false, mas_vendido: false }
  }
}

export function extractProductStatus(
  rawDescription: string | null | undefined
): { description: string; status: ProductStatus } {
  const source = rawDescription ?? ''
  const match = source.match(STATUS_REGEX)
  const status = parseStatusPayload(match?.[1])
  const description = match ? source.replace(STATUS_REGEX, '').trimEnd() : source

  return {
    description,
    status,
  }
}

export function injectProductStatus(
  description: string,
  status: Partial<ProductStatus>
): string {
  const normalized: ProductStatus = {
    agotado: Boolean(status.agotado),
    mas_vendido: Boolean(status.mas_vendido),
  }

  const sanitized = description.replace(STATUS_REGEX, '').trimEnd()

  if (!normalized.agotado && !normalized.mas_vendido) {
    return sanitized
  }

  const payload = `${STATUS_PREFIX}${JSON.stringify(normalized)}${STATUS_SUFFIX}`
  return sanitized ? `${sanitized}\n${payload}` : payload
}

export function normalizeProductFromSource<T extends { descripcion?: string | null }>(
  product: T
): T & ProductStatus {
  const { description, status } = extractProductStatus(product.descripcion)

  return {
    ...product,
    descripcion: description,
    agotado: status.agotado,
    mas_vendido: status.mas_vendido,
  }
}

export function prepareProductForPersist<
  T extends { descripcion?: string | null; agotado?: boolean; mas_vendido?: boolean }
>(product: T): Omit<T, 'agotado' | 'mas_vendido'> {
  const { agotado = false, mas_vendido = false, ...rest } = product
  const descripcion = injectProductStatus(rest.descripcion ?? '', { agotado, mas_vendido })

  return {
    ...rest,
    descripcion,
  }
}
