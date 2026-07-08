import {db} from "../../../lib/knex/knex";
import {Testimonial} from "../entity/testimonial.entity";

const TESTIMONIAL_COLUMNS = [
    'id', 'content', 'rating', 'author_name', 'product_id', 'restaurant_id',
    'created_at', 'updated_at'
];

function toEntity(row: any): Testimonial {
    return new Testimonial({
        id: Number(row.id),
        content: row.content,
        rating: row.rating !== null ? Number(row.rating) : null,
        authorName: row.author_name,
        productId: row.product_id ? Number(row.product_id) : null,
        restaurantId: row.restaurant_id ? Number(row.restaurant_id) : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    });
}

export async function createTestimonial(data: Partial<Testimonial>): Promise<Testimonial> {
    const now = new Date();
    const [row] = await db("testimonials").insert({
        content: data.content,
        rating: data.rating,
        author_name: data.authorName,
        product_id: data.productId,
        restaurant_id: data.restaurantId,
        created_at: now,
        updated_at: now,
    }).returning(TESTIMONIAL_COLUMNS);
    return toEntity(row);
}

export async function findTestimonialById(id: number): Promise<Testimonial | undefined> {
    const row = await db("testimonials").select(TESTIMONIAL_COLUMNS).where("id", id).first();
    return row ? toEntity(row) : undefined;
}

export async function findTestimonialsByProductId(productId: number): Promise<Testimonial[]> {
    const rows = await db("testimonials")
        .select(TESTIMONIAL_COLUMNS)
        .where("product_id", productId)
        .orderBy("created_at", "desc");
    return rows.map(toEntity);
}

export async function findTestimonialsByRestaurantId(restaurantId: number): Promise<Testimonial[]> {
    const rows = await db("testimonials")
        .select(TESTIMONIAL_COLUMNS)
        .where("restaurant_id", restaurantId)
        .whereNull("product_id")
        .orderBy("created_at", "desc");
    return rows.map(toEntity);
}

export async function updateTestimonial(id: number, data: Partial<Testimonial>): Promise<Testimonial | undefined> {
    const [row] = await db("testimonials")
        .where("id", id)
        .update({
            ...(data.content !== undefined && {content: data.content}),
            ...(data.rating !== undefined && {rating: data.rating}),
            ...(data.authorName !== undefined && {author_name: data.authorName}),
            updated_at: new Date(),
        })
        .returning(TESTIMONIAL_COLUMNS);
    return row ? toEntity(row) : undefined;
}

export async function deleteTestimonial(id: number): Promise<boolean> {
    const deleted = await db("testimonials").where("id", id).del();
    return deleted > 0;
}
