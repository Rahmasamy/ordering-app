import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE offers (
            id BIGSERIAL PRIMARY KEY,
            badge_text TEXT NOT NULL,
            image_url TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            promo_code TEXT NOT NULL,
            expires_at DATE NOT NULL,
            product_id BIGINT,
            restaurant_id BIGINT,
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            CONSTRAINT fk_offers_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            CONSTRAINT fk_offers_restaurant_id FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
            CONSTRAINT chk_offers_target CHECK (product_id IS NOT NULL OR restaurant_id IS NOT NULL)
        );

        CREATE INDEX idx_offers_product_id ON offers(product_id);
        CREATE INDEX idx_offers_restaurant_id ON offers(restaurant_id);
        CREATE INDEX idx_offers_expires_at ON offers(expires_at);
        CREATE INDEX idx_offers_is_active ON offers(is_active);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`DROP TABLE IF EXISTS offers;`);
}
