import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('products', (table) => {
        table.boolean('is_trending').defaultTo(false).notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('products', (table) => {
        table.dropColumn('is_trending');
    });
}
