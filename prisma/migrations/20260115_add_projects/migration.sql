-- Create default project for each organization and assign existing data
-- (project_id columns already created in initial migration)
DO $$
DECLARE
    org RECORD;
    proj_id TEXT;
BEGIN
    FOR org IN SELECT id FROM organizations LOOP
        proj_id := gen_random_uuid()::text;
        INSERT INTO projects (id, organization_id, name, is_default, is_active, created_at, updated_at)
        VALUES (proj_id, org.id, 'Dự án mặc định', true, true, NOW(), NOW());
        UPDATE fixed_costs SET project_id = proj_id WHERE organization_id = org.id AND project_id IS NULL;
        UPDATE variable_costs SET project_id = proj_id WHERE organization_id = org.id AND project_id IS NULL;
        UPDATE investments SET project_id = proj_id WHERE organization_id = org.id AND project_id IS NULL;
        UPDATE products SET project_id = proj_id WHERE organization_id = org.id AND project_id IS NULL;
        UPDATE calculation_history SET project_id = proj_id WHERE organization_id = org.id AND project_id IS NULL;
    END LOOP;
END $$;
