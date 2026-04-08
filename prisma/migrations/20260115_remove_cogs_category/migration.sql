-- Remove COGS from VariableCostCategory enum
-- PostgreSQL requires recreating the enum type
ALTER TYPE "VariableCostCategory" RENAME TO "VariableCostCategory_old";
CREATE TYPE "VariableCostCategory" AS ENUM ('VAT', 'COMMISSION', 'ADVERTISING', 'OTHER');
ALTER TABLE "variable_costs" ALTER COLUMN "category" TYPE "VariableCostCategory" USING category::text::"VariableCostCategory";
DROP TYPE "VariableCostCategory_old";
