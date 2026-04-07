-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- Add project_id columns to existing tables
ALTER TABLE "fixed_costs" ADD COLUMN "project_id" TEXT;
ALTER TABLE "variable_costs" ADD COLUMN "project_id" TEXT;
ALTER TABLE "investments" ADD COLUMN "project_id" TEXT;
ALTER TABLE "products" ADD COLUMN "project_id" TEXT;
ALTER TABLE "calculation_history" ADD COLUMN "project_id" TEXT;

-- CreateIndex
CREATE INDEX "projects_organization_id_is_active_idx" ON "projects"("organization_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "projects_organization_id_name_key" ON "projects"("organization_id", "name");

-- CreateIndex
CREATE INDEX "fixed_costs_project_id_is_active_idx" ON "fixed_costs"("project_id", "is_active");

-- CreateIndex
CREATE INDEX "variable_costs_project_id_is_active_idx" ON "variable_costs"("project_id", "is_active");

-- CreateIndex
CREATE INDEX "investments_project_id_is_active_idx" ON "investments"("project_id", "is_active");

-- CreateIndex
CREATE INDEX "products_project_id_is_active_idx" ON "products"("project_id", "is_active");

-- CreateIndex
CREATE INDEX "calculation_history_project_id_created_at_idx" ON "calculation_history"("project_id", "created_at");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixed_costs" ADD CONSTRAINT "fixed_costs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variable_costs" ADD CONSTRAINT "variable_costs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation_history" ADD CONSTRAINT "calculation_history_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create default project for each organization and assign existing data
DO $$
DECLARE
    org RECORD;
    proj_id TEXT;
BEGIN
    FOR org IN SELECT id FROM organizations LOOP
        -- Generate a unique project ID
        proj_id := gen_random_uuid()::text;

        -- Create default project
        INSERT INTO projects (id, organization_id, name, is_default, is_active, created_at, updated_at)
        VALUES (proj_id, org.id, 'Dự án mặc định', true, true, NOW(), NOW());

        -- Assign existing data to default project
        UPDATE fixed_costs SET project_id = proj_id WHERE organization_id = org.id AND project_id IS NULL;
        UPDATE variable_costs SET project_id = proj_id WHERE organization_id = org.id AND project_id IS NULL;
        UPDATE investments SET project_id = proj_id WHERE organization_id = org.id AND project_id IS NULL;
        UPDATE products SET project_id = proj_id WHERE organization_id = org.id AND project_id IS NULL;
        UPDATE calculation_history SET project_id = proj_id WHERE organization_id = org.id AND project_id IS NULL;
    END LOOP;
END $$;
