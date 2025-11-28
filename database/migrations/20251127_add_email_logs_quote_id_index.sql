-- Migration: Add index for FK email_logs_quote_id_fkey
-- Date: 2025-11-27
-- Purpose: Improve query performance on email_logs table by adding covering index for quote_id foreign key
-- Related: SEC-002 from PLAN_MEJORAS.md

-- Create index on quote_id column to support the foreign key relationship
-- This will improve performance for queries that join email_logs with cotizaciones
CREATE INDEX IF NOT EXISTS idx_email_logs_quote_id ON public.email_logs(quote_id);

-- Verify index creation
COMMENT ON INDEX public.idx_email_logs_quote_id IS 'Index for email_logs.quote_id FK to improve query performance';
