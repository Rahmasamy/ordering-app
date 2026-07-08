import {db} from "../../../lib/knex/knex";
import {Offer} from "../entity/offer.entity";
import {
    applyFilters,
    applyCursorPagination,
    FilterParams,
    PaginationParams,
} from "../../../lib/http/pagination/cursor-pagination";

const OFFER_COLUMNS = [
    'id', 'badge_text', 'image_url', 'title', 'description', 'promo_code',
    'expires_at', 'product_id', 'restaurant_id', 'is_active', 'created_at', 'updated_at'
];

function toEntity(row: any): Offer {
    return new Offer({
        id: Number(row.id),
        badgeText: row.badge_text,
        imageUrl: row.image_url,
        title: row.title,
        description: row.description,
        promoCode: row.promo_code,
        expiresAt: row.expires_at,
        productId: row.product_id ? Number(row.product_id) : null,
        restaurantId: row.restaurant_id ? Number(row.restaurant_id) : null,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    });
}

export async function createOffer(data: Partial<Offer>): Promise<Offer> {
    const now = new Date();
    const [row] = await db("offers").insert({
        badge_text: data.badgeText,
        image_url: data.imageUrl,
        title: data.title,
        description: data.description,
        promo_code: data.promoCode,
        expires_at: data.expiresAt,
        product_id: data.productId,
        restaurant_id: data.restaurantId,
        is_active: data.isActive ?? true,
        created_at: now,
        updated_at: now,
    }).returning(OFFER_COLUMNS);
    return toEntity(row);
}

export async function findOfferById(id: number): Promise<Offer | undefined> {
    const row = await db("offers").select(OFFER_COLUMNS).where("id", id).first();
    return row ? toEntity(row) : undefined;
}

export async function findAllOffers(
    params: PaginationParams,
    filters: FilterParams[],
): Promise<Offer[]> {
    let query = db("offers").select(OFFER_COLUMNS).where("is_active", true);
    query = applyFilters(query, filters);
    query = applyCursorPagination(query, params);
    const rows = await query;
    return rows.map(toEntity);
}

export async function findOffersByProductId(productId: number): Promise<Offer[]> {
    const rows = await db("offers")
        .select(OFFER_COLUMNS)
        .where("product_id", productId)
        .where("is_active", true)
        .where("expires_at", ">=", db.raw("CURRENT_DATE"))
        .orderBy("expires_at", "asc");
    return rows.map(toEntity);
}

export async function findOffersByRestaurantId(restaurantId: number): Promise<Offer[]> {
    const rows = await db("offers")
        .select(OFFER_COLUMNS)
        .where("restaurant_id", restaurantId)
        .where("is_active", true)
        .where("expires_at", ">=", db.raw("CURRENT_DATE"))
        .orderBy("expires_at", "asc");
    return rows.map(toEntity);
}

export async function updateOffer(id: number, data: Partial<Offer>): Promise<Offer | undefined> {
    const [row] = await db("offers")
        .where("id", id)
        .update({
            ...(data.badgeText !== undefined && {badge_text: data.badgeText}),
            ...(data.imageUrl !== undefined && {image_url: data.imageUrl}),
            ...(data.title !== undefined && {title: data.title}),
            ...(data.description !== undefined && {description: data.description}),
            ...(data.promoCode !== undefined && {promo_code: data.promoCode}),
            ...(data.expiresAt !== undefined && {expires_at: data.expiresAt}),
            ...(data.isActive !== undefined && {is_active: data.isActive}),
            updated_at: new Date(),
        })
        .returning(OFFER_COLUMNS);
    return row ? toEntity(row) : undefined;
}
