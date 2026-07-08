import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE carts (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            status TEXT NOT NULL CHECK(status IN ('active', 'completed', 'abandoned')) DEFAULT 'active',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE UNIQUE INDEX idx_unique_active_cart_per_user ON carts(user_id) WHERE (status = 'active');

        CREATE TABLE cart_items (
            id BIGSERIAL PRIMARY KEY,
            cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
            product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            quantity INT NOT NULL CHECK(quantity > 0),
            unit_price DECIMAL(10, 2) NOT NULL,
            selected_doneness VARCHAR(255) NULL,
            selected_addons JSONB NOT NULL DEFAULT '[]'::jsonb,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE UNIQUE INDEX idx_unique_cart_item_customization ON cart_items (
            cart_id, 
            product_id, 
            COALESCE(selected_doneness, ''), 
            selected_addons
        );

        CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
        CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP TABLE IF EXISTS cart_items CASCADE;
        DROP TABLE IF EXISTS carts CASCADE;
    `);
}
