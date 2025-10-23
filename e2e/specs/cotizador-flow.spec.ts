/**
 * E2E Test: Flujo completo de cotización
 * 
 * Flujo:
 * 1. Home → Ver catálogo
 * 2. Catálogo → Seleccionar producto
 * 3. Producto → Ajustar cantidad → Agregar a cotización
 * 4. Cotizador → Llenar formulario → Enviar
 * 5. Confirmación → Verificar éxito
 */

import { test, expect } from '@playwright/test'

test.describe('Flujo de cotización E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Iniciar en la página principal
    await page.goto('/')
  })

  test('debe completar flujo de cotización exitosamente @smoke', async ({ page }) => {
    // PASO 1: Home - Verificar que carga correctamente
    await expect(page).toHaveTitle(/FullColor/)
    await expect(page.getByRole('heading', { name: /FullColor/i })).toBeVisible()
    
    // PASO 2: Navegar al catálogo
    await page.getByRole('link', { name: /catálogo/i }).click()
    await expect(page).toHaveURL(/\/catalogo/)
    
    // Esperar a que carguen los productos
    await page.waitForSelector('[data-testid="product-card"], .product-card, article', {
      timeout: 10000,
    })
    
    // PASO 3: Seleccionar primer producto
    const firstProduct = page.locator('[data-testid="product-card"], .product-card, article').first()
    await firstProduct.click()
    
    // Verificar que estamos en página de producto
    await expect(page).toHaveURL(/\/producto\/\d+/)
    
    // PASO 4: Ajustar cantidad
    const quantityInput = page.getByLabel(/cantidad/i).or(page.locator('input[type="number"]')).first()
    await quantityInput.fill('500')
    
    // Esperar a que se actualice el precio
    await page.waitForTimeout(500)
    
    // PASO 5: Agregar a cotización
    const addButton = page.getByRole('button', { name: /agregar.*cotización/i })
    await addButton.click()
    
    // Verificar que se agregó (puede mostrar toast o actualizar contador)
    await page.waitForTimeout(1000)
    
    // PASO 6: Ir al cotizador
    await page.getByRole('link', { name: /cotizador/i }).or(page.getByRole('link', { name: /ver cotización/i })).click()
    await expect(page).toHaveURL(/\/cotizador/)
    
    // Verificar que el producto está en el resumen
    await expect(page.locator('text=/500.*unidades/i').or(page.locator('text=/cantidad.*500/i'))).toBeVisible({ timeout: 5000 })
    
    // PASO 7: Llenar formulario de contacto
    await page.getByLabel(/nombre/i).fill('Juan Pérez Test')
    await page.getByLabel(/email/i).or(page.getByLabel(/correo/i)).fill('juan.test@example.com')
    await page.getByLabel(/teléfono/i).or(page.getByLabel(/celular/i)).fill('+593 99 123 4567')
    await page.getByLabel(/empresa/i).fill('Empresa Test S.A.')
    
    // Notas opcionales
    const notasField = page.getByLabel(/notas/i).or(page.getByLabel(/mensaje/i))
    if (await notasField.isVisible()) {
      await notasField.fill('Cotización de prueba E2E')
    }
    
    // PASO 8: Enviar cotización
    const submitButton = page.getByRole('button', { name: /enviar.*cotización/i }).or(page.getByRole('button', { name: /solicitar/i }))
    await submitButton.click()
    
    // PASO 9: Verificar página de confirmación
    await expect(page).toHaveURL(/\/confirmacion/, { timeout: 10000 })
    
    // Verificar mensaje de éxito
    await expect(
      page.getByText(/cotización.*enviada/i).or(
        page.getByText(/gracias/i)
      )
    ).toBeVisible({ timeout: 5000 })
    
    // Verificar que muestra número de cotización (COT-XXXXX)
    await expect(page.locator('text=/COT-\\d{5}/i')).toBeVisible()
  })

  test('debe mostrar validación si faltan campos requeridos', async ({ page }) => {
    // Ir directo al cotizador
    await page.goto('/cotizador')
    
    // Intentar enviar sin llenar formulario
    const submitButton = page.getByRole('button', { name: /enviar.*cotización/i }).or(page.getByRole('button', { name: /solicitar/i }))
    
    // El botón debería estar deshabilitado o mostrar errores al hacer click
    const isDisabled = await submitButton.isDisabled()
    
    if (!isDisabled) {
      await submitButton.click()
      
      // Esperar mensajes de error
      await expect(
        page.locator('text=/requerido/i, text=/obligatorio/i, text=/inválido/i').first()
      ).toBeVisible({ timeout: 3000 })
    } else {
      // Si está deshabilitado, es correcto
      expect(isDisabled).toBe(true)
    }
  })

  test('debe calcular precios según cantidad seleccionada', async ({ page }) => {
    // Ir a un producto
    await page.goto('/catalogo')
    await page.waitForSelector('[data-testid="product-card"], .product-card, article')
    
    const firstProduct = page.locator('[data-testid="product-card"], .product-card, article').first()
    await firstProduct.click()
    
    // Probar diferentes cantidades y verificar cambio de precio
    const quantityInput = page.getByLabel(/cantidad/i).or(page.locator('input[type="number"]')).first()
    
    // Cantidad pequeña
    await quantityInput.fill('100')
    await page.waitForTimeout(500)
    const price1 = await page.locator('text=/\\$\\d+\\.\\d{2}.*unidad/i').first().textContent()
    
    // Cantidad grande
    await quantityInput.fill('1000')
    await page.waitForTimeout(500)
    const price2 = await page.locator('text=/\\$\\d+\\.\\d{2}.*unidad/i').first().textContent()
    
    // Los precios deberían ser diferentes (precio unitario baja con cantidad mayor)
    expect(price1).not.toBe(price2)
  })

  test('debe permitir agregar múltiples productos a la cotización', async ({ page }) => {
    // Ir al catálogo
    await page.goto('/catalogo')
    await page.waitForSelector('[data-testid="product-card"], .product-card, article')
    
    // Obtener productos disponibles
    const products = page.locator('[data-testid="product-card"], .product-card, article')
    const productCount = await products.count()
    
    if (productCount >= 2) {
      // Agregar primer producto
      await products.nth(0).click()
      const quantityInput1 = page.getByLabel(/cantidad/i).or(page.locator('input[type="number"]')).first()
      await quantityInput1.fill('500')
      await page.getByRole('button', { name: /agregar.*cotización/i }).click()
      await page.waitForTimeout(1000)
      
      // Volver al catálogo
      await page.goto('/catalogo')
      await page.waitForSelector('[data-testid="product-card"], .product-card, article')
      
      // Agregar segundo producto
      await products.nth(1).click()
      const quantityInput2 = page.getByLabel(/cantidad/i).or(page.locator('input[type="number"]')).first()
      await quantityInput2.fill('300')
      await page.getByRole('button', { name: /agregar.*cotización/i }).click()
      await page.waitForTimeout(1000)
      
      // Ir al cotizador
      await page.goto('/cotizador')
      
      // Verificar que hay 2 productos
      const quoteItems = page.locator('[data-testid="quote-item"], .quote-item, [class*="item"]')
      const itemCount = await quoteItems.count()
      
      expect(itemCount).toBeGreaterThanOrEqual(2)
    }
  })

  test('debe mostrar resumen con subtotal, IVA y total', async ({ page }) => {
    // Ir al cotizador con productos
    await page.goto('/catalogo')
    await page.waitForSelector('[data-testid="product-card"], .product-card, article')
    
    await page.locator('[data-testid="product-card"], .product-card, article').first().click()
    await page.getByLabel(/cantidad/i).or(page.locator('input[type="number"]')).first().fill('500')
    await page.getByRole('button', { name: /agregar.*cotización/i }).click()
    await page.waitForTimeout(1000)
    
    await page.goto('/cotizador')
    
    // Verificar que muestra subtotal
    await expect(page.getByText(/subtotal/i)).toBeVisible()
    
    // Verificar que muestra IVA
    await expect(page.getByText(/iva|impuesto/i)).toBeVisible()
    
    // Verificar que muestra total
    await expect(page.getByText(/total/i)).toBeVisible()
    
    // Verificar que hay valores monetarios ($)
    const prices = page.locator('text=/\\$\\d+\\.\\d{2}/')
    const priceCount = await prices.count()
    expect(priceCount).toBeGreaterThanOrEqual(3) // Al menos subtotal, IVA y total
  })
})
