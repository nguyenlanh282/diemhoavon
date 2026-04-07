-- Remove COGS from VariableCostCategory enum
-- First, update any existing records with COGS category to OTHER
UPDATE "variable_costs" SET category = 'OTHER', custom_label = COALESCE(custom_label, 'Cost of Goods Sold') WHERE category = 'COGS';

-- Remove COGS from the enum
-- PostgreSQL requires recreating the enum type
ALTER TYPE "VariableCostCategory" RENAME TO "VariableCostCategory_old";
CREATE TYPE "VariableCostCategory" AS ENUM ('VAT', 'COMMISSION', 'ADVERTISING', 'OTHER');
ALTER TABLE "variable_costs" ALTER COLUMN "category" TYPE "VariableCostCategory" USING category::text::"VariableCostCategory";
DROP TYPE "VariableCostCategory_old";
