import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE chefs (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            title TEXT NOT NULL,
            image_url TEXT,
            quote TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE product_stories (
            id BIGSERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            featured_quote TEXT,
            product_id BIGINT,
            restaurant_id BIGINT,
            chef_id BIGINT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            CONSTRAINT fk_product_stories_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            CONSTRAINT fk_product_stories_restaurant_id FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
            CONSTRAINT fk_product_stories_chef_id FOREIGN KEY (chef_id) REFERENCES chefs(id) ON DELETE SET NULL,
            CONSTRAINT chk_product_stories_target CHECK (product_id IS NOT NULL OR restaurant_id IS NOT NULL)
        );

        CREATE TABLE ingredients (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            product_id BIGINT NOT NULL,
            sort_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            CONSTRAINT fk_ingredients_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        CREATE TABLE testimonials (
            id BIGSERIAL PRIMARY KEY,
            content TEXT NOT NULL,
            rating DECIMAL(2, 1),
            author_name TEXT,
            product_id BIGINT,
            restaurant_id BIGINT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            CONSTRAINT fk_testimonials_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            CONSTRAINT fk_testimonials_restaurant_id FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
            CONSTRAINT chk_testimonials_target CHECK (product_id IS NOT NULL OR restaurant_id IS NOT NULL)
        );

        CREATE INDEX idx_product_stories_product_id ON product_stories(product_id);
        CREATE INDEX idx_product_stories_restaurant_id ON product_stories(restaurant_id);
        CREATE INDEX idx_product_stories_chef_id ON product_stories(chef_id);
        CREATE INDEX idx_ingredients_product_id ON ingredients(product_id);
        CREATE INDEX idx_testimonials_product_id ON testimonials(product_id);
        CREATE INDEX idx_testimonials_restaurant_id ON testimonials(restaurant_id);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP TABLE IF EXISTS testimonials;
        DROP TABLE IF EXISTS ingredients;
        DROP TABLE IF EXISTS product_stories;
        DROP TABLE IF EXISTS chefs;
    `);
}
