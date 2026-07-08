import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // 1. Insert the new permissions
    await knex.raw(`
        INSERT INTO permissions (resource, action, created_at) VALUES
        ('core:analytics', 'read', NOW()),
        ('core:order', 'update', NOW()),
        ('core:order', 'refund', NOW()),
        ('core:table', 'manage', NOW()),
        ('core:report', 'close', NOW())
        ON CONFLICT (resource, action) DO NOTHING;
    `);

    // 2. Map all new permissions to the 'owner' role
    await knex.raw(`
        INSERT INTO role_permissions (role_id, permission_id, created_at)
        SELECT r.id, p.id, NOW() FROM roles r, permissions p
        WHERE r.name = 'owner'
        AND p.resource || ':' || p.action IN (
            'core:analytics:read',
            'core:order:update',
            'core:order:refund',
            'core:table:manage',
            'core:report:close'
        )
        ON CONFLICT DO NOTHING;
    `);

    // 3. Map select permissions to 'branch_manager'
    await knex.raw(`
        INSERT INTO role_permissions (role_id, permission_id, created_at)
        SELECT r.id, p.id, NOW() FROM roles r, permissions p
        WHERE r.name = 'branch_manager'
        AND p.resource || ':' || p.action IN (
            'core:analytics:read',
            'core:order:update',
            'core:table:manage'
        )
        ON CONFLICT DO NOTHING;
    `);

    // 4. Map select permissions to 'staff'
    await knex.raw(`
        INSERT INTO role_permissions (role_id, permission_id, created_at)
        SELECT r.id, p.id, NOW() FROM roles r, permissions p
        WHERE r.name = 'staff'
        AND p.resource || ':' || p.action IN (
            'core:order:update',
            'core:table:manage'
        )
        ON CONFLICT DO NOTHING;
    `);
}

export async function down(knex: Knex): Promise<void> {
    // Delete added permissions mapping and entries
    await knex.raw(`
        DELETE FROM role_permissions
        WHERE permission_id IN (
            SELECT id FROM permissions
            WHERE resource IN ('core:analytics', 'core:order', 'core:table', 'core:report')
        );
        
        DELETE FROM permissions
        WHERE resource IN ('core:analytics', 'core:order', 'core:table', 'core:report');
    `);
}
