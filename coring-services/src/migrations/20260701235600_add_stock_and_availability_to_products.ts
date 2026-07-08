import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("products", (table) => {
        table.integer("stock").notNullable().defaultTo(100);
        table.boolean("is_available").notNullable().defaultTo(true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("products", (table) => {
        table.dropColumn("stock");
        table.dropColumn("is_available");
    });
}
