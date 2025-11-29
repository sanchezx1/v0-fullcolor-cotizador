import { defineConfig, devices } from "@playwright/test"

/**
 * Configuración de Playwright para tests E2E y de accesibilidad
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e/specs",

  /* Configuración de timeout */
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },

  /* Ejecutar tests en paralelo */
  fullyParallel: true,

  /* Fallar el build si se dejan test.only en CI */
  forbidOnly: !!process.env.CI,

  /* Reintentar en CI */
  retries: process.env.CI ? 2 : 0,

  /* Workers paralelos */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter: usar "html" para reportes visuales */
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report" }]
  ],

  /* Configuración compartida para todos los proyectos */
  use: {
    /* URL base para el servidor de desarrollo */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",

    /* Capturar screenshot en fallos */
    screenshot: "only-on-failure",

    /* Capturar video en retry */
    video: "retain-on-failure",

    /* Capturar trace en fallos */
    trace: "on-first-retry",
  },

  /* Configuración de proyectos multi-browser */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Tests en mobile viewport */
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  /* Ejecutar servidor de desarrollo antes de los tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
