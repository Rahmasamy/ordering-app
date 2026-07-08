import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE activity_logs (
            id BIGSERIAL PRIMARY KEY,
            restaurant_id BIGINT NOT NULL,
            user_id BIGINT,
            user_name TEXT NOT NULL,
            action TEXT NOT NULL,
            details TEXT,
            type TEXT NOT NULL CHECK (type IN ('update', 'alert', 'status')),
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        CREATE INDEX idx_activity_logs_restaurant_id ON activity_logs(restaurant_id);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP TABLE IF EXISTS activity_logs;
    `);
}
