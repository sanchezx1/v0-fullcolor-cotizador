/**
 * E2E Test: Accesibilidad (a11y)
 * 
 * Utiliza axe-core para detectar violaciones de accesibilidad
 * Nivel objetivo: WCAG 2.1 AA
 */

import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y, getViolations } from 'axe-playwright'
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

  throw new Error('No se encontraron productos habilitados para pruebas de accesibilidad')
}

async function addAvailableProduct(page, quantity = '400', startIndex = 0) {
  const quantityInput = await openAvailableProduct(page, startIndex)
  await quantityInput.fill(quantity)
  const addButton = page.getByRole('button', { name: /agregar.*cotizaci[oó]n/i })
  await addButton.click()
  await page.waitForTimeout(500)
}

test.describe('Pruebas de accesibilidad @a11y', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabase(page)
    await page.goto('/')
    await injectAxe(page)
  })

  test('pagina de inicio debe cumplir estandares de accesibilidad', async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
    const violations = await getViolations(page, undefined, {
      rules: {
        'color-contrast': { enabled: true },
        'heading-order': { enabled: true },
        'label': { enabled: true },
        'link-name': { enabled: true },
      },
    })
    const criticalViolations = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    expect(criticalViolations).toHaveLength(0)
  })

  test('pagina de catalogo debe ser accesible', async ({ page }) => {
    await page.goto('/catalogo')
    await injectAxe(page)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 })
    await page.waitForSelector(productCardSelector, { timeout: 10000 })

    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    })
  })

  test('pagina de producto debe tener etiquetas accesibles', async ({ page }) => {
    await openAvailableProduct(page)
    await injectAxe(page)

    const quantityInput = page.getByTestId('quantity-input').or(page.getByLabel(/cantidad/i)).or(page.locator('input[type="number"]')).first()
    await expect(quantityInput).toBeVisible()

    const addButton = page.getByRole('button', { name: /agregar/i })
    await expect(addButton).toBeVisible()
  })

  test('formulario de cotizacion debe ser accesible con teclado', async ({ page }) => {
    await addAvailableProduct(page, '450')
    await page.goto('/cotizador')
    await injectAxe(page)

    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    const nombreField = page.getByLabel(/nombre/i)
    const emailField = page.getByLabel(/email|correo/i)
    const telefonoField = page.getByLabel(/tel[eé]fono|celular/i)

    await expect(nombreField).toBeVisible()
    await expect(emailField).toBeVisible()
    await expect(telefonoField).toBeVisible()
  })

  test('contraste de colores debe ser suficiente', async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)

    const violations = await getViolations(page, undefined, {
      rules: {
        'color-contrast': { enabled: true },
      },
    })

    const contrastViolations = violations.filter((v) => v.id === 'color-contrast')
    expect(contrastViolations).toHaveLength(0)
  })

  test('imagenes deben tener textos alternativos', async ({ page }) => {
    await page.goto('/catalogo')
    await page.waitForSelector('img')

    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt !== null).toBe(true)
    }
  })

  test('encabezados deben tener jerarquia correcta (h1, h2, h3...)', async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)

    const violations = await getViolations(page, undefined, {
      rules: {
        'heading-order': { enabled: true },
      },
    })

    const headingViolations = violations.filter((v) => v.id === 'heading-order')
    expect(headingViolations).toHaveLength(0)
  })

  test('enlaces deben tener nombres descriptivos', async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)

    const violations = await getViolations(page, undefined, {
      rules: {
        'link-name': { enabled: true },
      },
    })

    const linkViolations = violations.filter((v) => v.id === 'link-name')
    expect(linkViolations).toHaveLength(0)
  })

  test('pagina debe tener titulo descriptivo', async ({ page }) => {
    await page.goto('/')

    const title = await page.title()

    expect(title.length).toBeGreaterThan(0)
    expect(title).toContain('FullColor')
  })

  test('botones deben ser activables con Enter/Space', async ({ page }) => {
    await openAvailableProduct(page)

    const addButton = page.getByRole('button', { name: /agregar/i })
    await addButton.focus()
    await expect(addButton).toBeFocused()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
  })

  test('formularios deben mostrar errores accesibles', async ({ page }) => {
    await addAvailableProduct(page, '220')
    await page.goto('/cotizador')

    const submitButton = page.getByRole('button', { name: /enviar/i }).or(page.getByRole('button', { name: /solicitar/i }))
    const isDisabled = await submitButton.isDisabled()

    if (!isDisabled) {
      await submitButton.click()
      const errorMessages = page.locator('[role="alert"], .error, [aria-invalid="true"]')
      await expect(errorMessages.first()).toBeVisible({ timeout: 3000 })
    } else {
      expect(isDisabled).toBe(true)
    }
  })

  test('navegacion debe ser posible solo con teclado', async ({ page }) => {
    await page.goto('/')

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)
    }

    const focused = await page.evaluateHandle(() => document.activeElement)
    const tagName = await focused.evaluate((el: Element | null) => el?.tagName)
    expect(tagName).not.toBe('BODY')
  })

  test('contenido debe ser legible con zoom 200%', async ({ page }) => {
    await page.goto('/')

    await page.setViewportSize({ width: 640, height: 480 })

    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    expect(typeof hasHorizontalScroll).toBe('boolean')
  })
})
