import {db} from "../../../lib/knex/knex";
import {Story} from "../entity/story.entity";
import {toChefEntity} from "./chef.repository";

const STORY_COLUMNS = [
    'id', 'title', 'content', 'featured_quote', 'product_id', 'restaurant_id',
    'chef_id', 'created_at', 'updated_at'
];

function toEntity(row: any, chef?: any): Story {
    return new Story({
        id: Number(row.id),
        title: row.title,
        content: row.content,
        featuredQuote: row.featured_quote,
        productId: row.product_id ? Number(row.product_id) : null,
        restaurantId: row.restaurant_id ? Number(row.restaurant_id) : null,
        chefId: row.chef_id ? Number(row.chef_id) : null,
        chef: chef ? toChefEntity(chef) : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    });
}

export async function createStory(data: Partial<Story>): Promise<Story> {
    const now = new Date();
    const [row] = await db("product_stories").insert({
        title: data.title,
        content: data.content,
        featured_quote: data.featuredQuote,
        product_id: data.productId,
        restaurant_id: data.restaurantId,
        chef_id: data.chefId,
        created_at: now,
        updated_at: now,
    }).returning(STORY_COLUMNS);
    return toEntity(row);
}

export async function findStoryById(id: number): Promise<Story | undefined> {
    const row = await db("product_stories as s")
        .leftJoin("chefs as c", "s.chef_id", "c.id")
        .select(
            ...STORY_COLUMNS.map(col => `s.${col}`),
            "c.id as chef_row_id", "c.name as chef_name", "c.title as chef_title",
            "c.image_url as chef_image_url", "c.quote as chef_quote",
            "c.created_at as chef_created_at", "c.updated_at as chef_updated_at"
        )
        .where("s.id", id)
        .first();

    if (!row) return undefined;

    const chef = row.chef_row_id ? {
        id: row.chef_row_id,
        name: row.chef_name,
        title: row.chef_title,
        image_url: row.chef_image_url,
        quote: row.chef_quote,
        created_at: row.chef_created_at,
        updated_at: row.chef_updated_at,
    } : null;

    return toEntity(row, chef);
}

export async function findStoryByProductId(productId: number): Promise<Story | undefined> {
    const row = await db("product_stories as s")
        .leftJoin("chefs as c", "s.chef_id", "c.id")
        .select(
            ...STORY_COLUMNS.map(col => `s.${col}`),
            "c.id as chef_row_id", "c.name as chef_name", "c.title as chef_title",
            "c.image_url as chef_image_url", "c.quote as chef_quote",
            "c.created_at as chef_created_at", "c.updated_at as chef_updated_at"
        )
        .where("s.product_id", productId)
        .first();

    if (!row) return undefined;

    const chef = row.chef_row_id ? {
        id: row.chef_row_id,
        name: row.chef_name,
        title: row.chef_title,
        image_url: row.chef_image_url,
        quote: row.chef_quote,
        created_at: row.chef_created_at,
        updated_at: row.chef_updated_at,
    } : null;

    return toEntity(row, chef);
}

export async function findStoryByRestaurantId(restaurantId: number): Promise<Story | undefined> {
    const row = await db("product_stories as s")
        .leftJoin("chefs as c", "s.chef_id", "c.id")
        .select(
            ...STORY_COLUMNS.map(col => `s.${col}`),
            "c.id as chef_row_id", "c.name as chef_name", "c.title as chef_title",
            "c.image_url as chef_image_url", "c.quote as chef_quote",
            "c.created_at as chef_created_at", "c.updated_at as chef_updated_at"
        )
        .where("s.restaurant_id", restaurantId)
        .whereNull("s.product_id")
        .first();

    if (!row) return undefined;

    const chef = row.chef_row_id ? {
        id: row.chef_row_id,
        name: row.chef_name,
        title: row.chef_title,
        image_url: row.chef_image_url,
        quote: row.chef_quote,
        created_at: row.chef_created_at,
        updated_at: row.chef_updated_at,
    } : null;

    return toEntity(row, chef);
}

export async function updateStory(id: number, data: Partial<Story>): Promise<Story | undefined> {
    const [row] = await db("product_stories")
        .where("id", id)
        .update({
            ...(data.title !== undefined && {title: data.title}),
            ...(data.content !== undefined && {content: data.content}),
            ...(data.featuredQuote !== undefined && {featured_quote: data.featuredQuote}),
            ...(data.chefId !== undefined && {chef_id: data.chefId}),
            updated_at: new Date(),
        })
        .returning(STORY_COLUMNS);
    return row ? findStoryById(Number(row.id)) : undefined;
}
