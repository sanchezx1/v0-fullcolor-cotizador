/**
 * @jest-environment jsdom
 */

import { cn, formatCurrency, formatDate, formatRelativeDate } from '@/lib/utils'

describe('utils.ts - Funciones de utilidad', () => {
  describe('cn', () => {
    it('debe combinar clases de Tailwind correctamente', () => {
      const result = cn('px-2 py-1', 'px-4')
      expect(result).toBe('py-1 px-4')
    })

    it('debe manejar clases condicionales', () => {
      const isActive = true
      const result = cn('base', isActive && 'active')
      expect(result).toContain('base')
      expect(result).toContain('active')
    })

    it('debe ignorar valores falsy', () => {
      const result = cn('base', false, null, undefined, 'extra')
      expect(result).toBe('base extra')
    })

    it('debe manejar arrays de clases', () => {
      const result = cn(['px-2', 'py-1'], 'rounded')
      expect(result).toContain('px-2')
      expect(result).toContain('py-1')
      expect(result).toContain('rounded')
    })
  })

  describe('formatCurrency', () => {
    it('debe formatear números como moneda USD', () => {
      expect(formatCurrency(1234.56)).toBe('$1.234,56')
    })

    it('debe formatear números enteros con decimales', () => {
      expect(formatCurrency(1000)).toBe('$1.000,00')
    })

    it('debe formatear números negativos', () => {
      expect(formatCurrency(-500.25)).toBe('$-500,25')
    })

    it('debe formatear cero correctamente', () => {
      expect(formatCurrency(0)).toBe('$0,00')
    })

    it('debe formatear números muy grandes', () => {
      expect(formatCurrency(1234567.89)).toBe('$1.234.567,89')
    })

    it('debe formatear centavos correctamente', () => {
      expect(formatCurrency(0.99)).toBe('$0,99')
    })

    it('debe redondear a 2 decimales', () => {
      expect(formatCurrency(10.999)).toBe('$11,00')
    })
  })

  describe('formatDate', () => {
    it('debe formatear fecha desde string ISO', () => {
      const result = formatDate('2025-11-03T10:00:00.000Z')
      expect(result).toMatch(/noviembre/)
      expect(result).toMatch(/2025/)
    })

    it('debe formatear objeto Date', () => {
      const date = new Date('2025-12-25')
      const result = formatDate(date)
      expect(result).toMatch(/diciembre/)
      expect(result).toMatch(/25/)
    })

    it('debe usar formato español (es-EC)', () => {
      const result = formatDate('2025-01-15')
      expect(result).toMatch(/enero/)
    })

    it('debe manejar diferentes meses correctamente', () => {
      const months = [
        ['2025-01-15', 'enero'],
        ['2025-02-15', 'febrero'],
        ['2025-03-15', 'marzo'],
        ['2025-04-15', 'abril'],
        ['2025-05-15', 'mayo'],
        ['2025-06-15', 'junio']
      ]

      months.forEach(([date, monthName]) => {
        expect(formatDate(date)).toMatch(new RegExp(monthName))
      })
    })
  })

  describe('formatRelativeDate', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-11-03T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('debe mostrar "hace un momento" para fechas muy recientes', () => {
      const now = new Date('2025-11-03T12:00:00Z')
      const recent = new Date(now.getTime() - 30 * 1000) // 30 segundos atrás
      expect(formatRelativeDate(recent)).toBe('hace un momento')
    })

    it('debe mostrar minutos para fechas recientes', () => {
      const now = new Date('2025-11-03T12:00:00Z')
      const minutes = new Date(now.getTime() - 5 * 60 * 1000) // 5 minutos atrás
      expect(formatRelativeDate(minutes)).toBe('hace 5 minutos')
    })

    it('debe mostrar horas para el mismo día', () => {
      const now = new Date('2025-11-03T12:00:00Z')
      const hours = new Date(now.getTime() - 3 * 60 * 60 * 1000) // 3 horas atrás
      expect(formatRelativeDate(hours)).toBe('hace 3 horas')
    })

    it('debe mostrar días para la misma semana', () => {
      const now = new Date('2025-11-03T12:00:00Z')
      const days = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 días atrás
      expect(formatRelativeDate(days)).toBe('hace 2 días')
    })

    it('debe usar formatDate para fechas antiguas', () => {
      const now = new Date('2025-11-03T12:00:00Z')
      const old = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 días atrás
      const result = formatRelativeDate(old)
      expect(result).toMatch(/octubre/)
    })

    it('debe manejar fechas como string', () => {
      const dateString = '2025-11-03T11:30:00Z' // 30 min atrás
      expect(formatRelativeDate(dateString)).toBe('hace 30 minutos')
    })
  })
})
