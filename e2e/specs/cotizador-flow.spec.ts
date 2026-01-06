/**
 * E2E Test: Flujo completo de cotizacion
 */

import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const productCardSelector = '[data-testid="product-card"], .product-card, article'

const productsFixture = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'e2e/fixtures/products.json'), 'utf-8'))
const pricingFixture = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'e2e/fixtures/pricing-tiers.json'), 'utf-8'))

const supabaseHost = "https://cxhjxponouukrnuxdhyz.supabase.co"

async function mockSupabase(page) {
  const products = productsFixture.map((p: any) => ({
    ...p,
    agotado: false,
    mas_vendido: false,
    unidad: p.unidad || 'unidades',
    activo: true,
  }))

  const registerRoute = (path: string, body: any) => {
    const fulfill = (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: typeof body === 'string' ? body : JSON.stringify(body),
      })

    void page.route(`**/rest/v1/${path}**`, fulfill)
    void page.route(`${supabaseHost}/rest/v1/${path}**`, fulfill)
  }

  registerRoute('productos', products)
  registerRoute('precios_escalonados', pricingFixture)
  registerRoute('items_cotizacion', [])
  registerRoute('cotizaciones', [{
    id: 12345,
    numero: 'COT-12345',
    access_token: 'token-e2e',
    subtotal: 200,
    iva: 30,
    total: 230,
    estado: 'pendiente',
    created_at: new Date().toISOString(),
    lead_id: 999,
  }])
  registerRoute('leads', [{
    id: 999,
    email: 'cliente@test.com',
    nombre: 'Cliente Test',
    telefono: '+593991234567',
  }])
  registerRoute('rpc/create_public_lead', { success: true, lead: { id: 999, email: 'cliente@test.com', user_id: null }, reused: false, upgraded_to_user: false })
  registerRoute('rpc/check_lead_email_exists', 'false')
  registerRoute('rpc/link_lead_to_auth_user', { linked: true, lead_id: 999 })
  registerRoute('rpc/create_public_quote', {
    cotizacion: {
      id: 12345,
      numero: 'COT-12345',
      access_token: 'token-e2e',
      subtotal: 200,
      iva: 30,
      total: 230,
      estado: 'pendiente',
      created_at: new Date().toISOString(),
    },
    items: [],
  })

  await page.route('**/api/public/quotes/**/pdf', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        pdfUrl: 'https://example.com/quote-e2e.pdf',
        fileName: 'cotizacion-e2e.pdf',
        emailSent: false,
      }),
    })
  )

  await page.route('**/api/public/quotes/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        cotizacion: {
          id: 12345,
          numero: 'COT-12345',
          estado: 'pendiente',
          total: 103.5,
          created_at: new Date().toISOString(),
          validez_dias: 7,
        },
        lead: {
          nombre: 'Juan Perez Test',
          email: 'juan.test@example.com',
          telefono: '+593 99 123 4567',
          empresa: 'Empresa Test S.A.',
          ruc_cedula: '1790012345001',
          ciudad: 'Quito',
          notas: 'Cotizacion de prueba E2E',
        },
        items: [
          {
            cantidad: 500,
            precio_unitario_aplicado: 0.18,
            subtotal: 90,
            productos: {
              nombre: 'Bolígrafos Metálicos',
              categoria: 'merchandising',
              imagen_url: 'https://via.placeholder.com/400x300/1e40af/ffffff?text=Boligrafos',
            },
          },
        ],
      }),
    })
  )
}

async function openAvailableProduct(page, startIndex = 0) {
  await page.goto('/catalogo')
  await page.waitForLoadState('networkidle')
  await page.waitForSelector(productCardSelector, { timeout: 60000 })
  const products = page.locator(productCardSelector)
  const total = await products.count()

  for (let i = startIndex; i < total; i++) {
    const card = products.nth(i)
    const agotadoBadge = card.getByText(/agotado/i)
    if ((await agotadoBadge.count()) > 0) continue

    await Promise.all([
      page.waitForURL('**/producto/**', { timeout: 15000 }),
      card.click(),
    ])
    await page.waitForSelector('[data-testid="quantity-input"], input[type="number"]', { timeout: 15000 })
    const quantityInput = page.getByTestId('quantity-input').or(page.getByLabel(/cantidad/i)).or(page.locator('input[type="number"]')).first()
    await expect(quantityInput).toBeVisible()
    if (await quantityInput.isDisabled()) {
      await page.goBack()
      await page.waitForSelector(productCardSelector, { timeout: 10000 })
      continue
    }
    return quantityInput
  }

  throw new Error('No se encontraron productos habilitados para pruebas E2E')
}

async function addAvailableProduct(page, quantity = '500', startIndex = 0) {
  const quantityInput = await openAvailableProduct(page, startIndex)
  await quantityInput.fill(quantity)
  await page.waitForTimeout(300)
  const addButton = page.getByRole('button', { name: /agregar.*cotizaci[oó]n/i })
  await addButton.click()
  await page.waitForTimeout(500)
}

test.describe('Flujo de cotizacion E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabase(page)
    await page.goto('/')
  })

  test('debe completar flujo de cotizacion exitosamente @smoke', async ({ page }) => {
    await expect(page).toHaveTitle(/FullColor/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await addAvailableProduct(page, '500')

    await page.goto('/cotizador')
    await expect(page).toHaveURL(/\/cotizador/)
    const quoteItems = page.locator('[data-testid="quote-item"], .quote-item, [class*="item"]')
    await expect(quoteItems.first()).toBeVisible({ timeout: 5000 })

    await page.getByLabel(/nombre/i).fill('Juan Perez Test')
    await page.getByLabel(/email|correo/i).fill('juan.test@example.com')
    await page.getByLabel(/ruc|c[eé]dula/i).fill('1790012345001')
    await page.getByLabel(/tel[eé]fono|celular/i).fill('+593 99 123 4567')

    const notasField = page.getByLabel(/notas/i).or(page.getByLabel(/mensaje/i))
    if (await notasField.isVisible()) {
      await notasField.fill('Cotizacion de prueba E2E')
    }

    const submitButton = page.getByRole('button', { name: /enviar.*cotizaci[oó]n/i }).or(page.getByRole('button', { name: /solicitar/i }))
    await submitButton.click()

    await expect(page).toHaveURL(/\/confirmacion/, { timeout: 20000 })
    await expect(page.getByText(/cotizaci[oó]n.*enviada/i).or(page.getByText(/gracias/i))).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/FC-\d+/i).first()).toBeVisible()
  })

  test('debe mostrar validacion si faltan campos requeridos', async ({ page }) => {
    await addAvailableProduct(page, '200')
    await page.goto('/cotizador')

    const submitButton = page.getByRole('button', { name: /enviar.*cotizaci[oó]n/i }).or(page.getByRole('button', { name: /solicitar/i }))
    const isDisabled = await submitButton.isDisabled()

    if (!isDisabled) {
      await submitButton.click()
      const errorMessages = page.locator('[role="alert"], .error, [aria-invalid="true"]')
      await expect(errorMessages.first()).toBeVisible({ timeout: 3000 })
    } else {
      expect(isDisabled).toBe(true)
    }
  })

  test('debe calcular precios segun cantidad seleccionada', async ({ page }) => {
    const quantityInput = await openAvailableProduct(page)

    await quantityInput.fill('100')
    await page.waitForTimeout(300)
    const price1 = await page.locator('text=Precio unitario:').locator('xpath=following-sibling::span').first().textContent()

    await quantityInput.fill('1000')
    await page.waitForTimeout(300)
    const price2 = await page.locator('text=Precio unitario:').locator('xpath=following-sibling::span').first().textContent()

    const normalizePrice = (value: string | null) => Number((value || '').replace(/[^\d.]/g, ''))

    expect(normalizePrice(price1)).not.toBe(normalizePrice(price2))
  })

  test('debe permitir agregar multiples productos a la cotizacion', async ({ page }) => {
    await addAvailableProduct(page, '500', 0)
    await addAvailableProduct(page, '300', 1)

    await page.goto('/cotizador')
    const quoteItems = page.locator('[data-testid="quote-item"], .quote-item, [class*="item"]')
    const itemCount = await quoteItems.count()

    expect(itemCount).toBeGreaterThanOrEqual(2)
  })

  test('debe mostrar resumen con subtotal, IVA y total', async ({ page }) => {
    await addAvailableProduct(page, '400')
    await page.goto('/cotizador')

    await expect(page.getByText(/Subtotal:/i)).toBeVisible()
    await expect(page.getByText(/IVA \(15%\)/i)).toBeVisible()
    await expect(page.getByText(/Total:/i).first()).toBeVisible()

    const prices = page.locator('text=/\\$/')
    await expect(prices.first()).toBeVisible()
  })
})




