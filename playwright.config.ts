import { defineConfig, devices } from '@playwright/test'

/**
 * Configuración de Playwright para E2E tests
 * 
 * Tests disponibles:
 * - npm run test:e2e          → Ejecuta todos los tests E2E
 * - npm run test:e2e:ui       → Ejecuta con interfaz gráfica
 * - npm run test:e2e:headed   → Ejecuta con navegador visible
 * - npm run test:accessibility → Solo tests de accesibilidad
 */
export default defineConfig({
  testDir: './e2e/specs',
  
  // Configuración de timeout
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  
  // Configuración de ejecución
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  
  // Configuración global
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Proyectos de navegadores
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Web server local (opcional)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
