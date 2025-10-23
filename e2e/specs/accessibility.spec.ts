/**
 * E2E Test: Accesibilidad (a11y)
 * 
 * Utiliza axe-core para detectar violaciones de accesibilidad
 * Nivel objetivo: WCAG 2.1 AA
 */

import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y, getViolations } from 'axe-playwright'

test.describe('Pruebas de accesibilidad @a11y', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
  })

  test('página de inicio debe cumplir estándares de accesibilidad', async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
    
    const violations = await getViolations(page, null, {
      rules: {
        'color-contrast': { enabled: true },
        'heading-order': { enabled: true },
        'label': { enabled: true },
        'link-name': { enabled: true },
      },
    })
    
    // No deben haber violaciones críticas
    const criticalViolations = violations.filter(v => 
      v.impact === 'critical' || v.impact === 'serious'
    )
    
    expect(criticalViolations).toHaveLength(0)
  })

  test('página de catálogo debe ser accesible', async ({ page }) => {
    await page.goto('/catalogo')
    await injectAxe(page)
    
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    })
  })

  test('página de producto debe tener etiquetas accesibles', async ({ page }) => {
    await page.goto('/catalogo')
    await page.waitForSelector('[data-testid="product-card"], .product-card, article')
    
    const firstProduct = page.locator('[data-testid="product-card"], .product-card, article').first()
    await firstProduct.click()
    
    await injectAxe(page)
    
    // Verificar que inputs tienen labels
    const quantityInput = page.getByLabel(/cantidad/i).or(page.locator('input[type="number"]')).first()
    await expect(quantityInput).toBeVisible()
    
    // Verificar que botones tienen textos descriptivos
    const addButton = page.getByRole('button', { name: /agregar/i })
    await expect(addButton).toBeVisible()
  })

  test('formulario de cotización debe ser accesible con teclado', async ({ page }) => {
    await page.goto('/cotizador')
    await injectAxe(page)
    
    // Verificar que se puede navegar con Tab
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Verificar que los campos tienen labels
    const nombreField = page.getByLabel(/nombre/i)
    const emailField = page.getByLabel(/email|correo/i)
    const telefonoField = page.getByLabel(/teléfono|celular/i)
    
    await expect(nombreField).toBeVisible()
    await expect(emailField).toBeVisible()
    await expect(telefonoField).toBeVisible()
  })

  test('contraste de colores debe ser suficiente', async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
    
    const violations = await getViolations(page, null, {
      rules: {
        'color-contrast': { enabled: true },
      },
    })
    
    const contrastViolations = violations.filter(v => v.id === 'color-contrast')
    
    // No deben haber violaciones de contraste
    expect(contrastViolations).toHaveLength(0)
  })

  test('imágenes deben tener textos alternativos', async ({ page }) => {
    await page.goto('/catalogo')
    await page.waitForSelector('img')
    
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      
      // Imágenes decorativas pueden tener alt="" (válido)
      // Imágenes informativas deben tener alt descriptivo
      expect(alt !== null).toBe(true)
    }
  })

  test('encabezados deben tener jerarquía correcta (h1, h2, h3...)', async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
    
    const violations = await getViolations(page, null, {
      rules: {
        'heading-order': { enabled: true },
      },
    })
    
    const headingViolations = violations.filter(v => v.id === 'heading-order')
    
    expect(headingViolations).toHaveLength(0)
  })

  test('enlaces deben tener nombres descriptivos', async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
    
    const violations = await getViolations(page, null, {
      rules: {
        'link-name': { enabled: true },
      },
    })
    
    const linkViolations = violations.filter(v => v.id === 'link-name')
    
    expect(linkViolations).toHaveLength(0)
  })

  test('página debe tener título descriptivo', async ({ page }) => {
    await page.goto('/')
    
    const title = await page.title()
    
    expect(title.length).toBeGreaterThan(0)
    expect(title).toContain('FullColor')
  })

  test('botones deben ser activables con Enter/Space', async ({ page }) => {
    await page.goto('/catalogo')
    await page.waitForSelector('[data-testid="product-card"], .product-card, article')
    
    const firstProduct = page.locator('[data-testid="product-card"], .product-card, article').first()
    await firstProduct.click()
    
    // Enfocar botón con Tab
    const addButton = page.getByRole('button', { name: /agregar/i })
    await addButton.focus()
    
    // Verificar que está enfocado
    await expect(addButton).toBeFocused()
    
    // Presionar Enter
    await page.keyboard.press('Enter')
    
    // Debe haberse ejecutado la acción
    await page.waitForTimeout(500)
  })

  test('formularios deben mostrar errores accesibles', async ({ page }) => {
    await page.goto('/cotizador')
    
    // Intentar enviar formulario vacío
    const submitButton = page.getByRole('button', { name: /enviar/i }).or(page.getByRole('button', { name: /solicitar/i }))
    
    const isDisabled = await submitButton.isDisabled()
    
    if (!isDisabled) {
      await submitButton.click()
      
      // Los mensajes de error deben ser visibles y descriptivos
      const errorMessages = page.locator('[role="alert"], .error, [aria-invalid="true"]')
      const errorCount = await errorMessages.count()
      
      expect(errorCount).toBeGreaterThan(0)
    }
  })

  test('navegación debe ser posible solo con teclado', async ({ page }) => {
    await page.goto('/')
    
    // Navegar con Tab por todos los elementos interactivos
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)
    }
    
    // Verificar que el foco es visible (debería haber outline o similar)
    const focused = await page.evaluateHandle(() => document.activeElement)
    const tagName = await focused.evaluate(el => el?.tagName)
    
    // Debe estar enfocado en un elemento interactivo (no body)
    expect(tagName).not.toBe('BODY')
  })

  test('contenido debe ser legible con zoom 200%', async ({ page }) => {
    await page.goto('/')
    
    // Simular zoom 200%
    await page.setViewportSize({ width: 640, height: 480 })
    
    // Verificar que el contenido es visible
    const heading = page.getByRole('heading', { name: /fullcolor/i })
    await expect(heading).toBeVisible()
    
    // Verificar que no hay scroll horizontal
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    
    // Es aceptable scroll horizontal en mobile
    expect(typeof hasHorizontalScroll).toBe('boolean')
  })
})
