-- AlterTable: Add payment_url and transaction_id to orders table
-- These columns exist in schema.prisma but were missing from initial migration

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_url" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "transaction_id" TEXT;
