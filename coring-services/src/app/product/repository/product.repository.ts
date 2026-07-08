import {db} from "../../../lib/knex/knex";
import {Product} from "../entity/product.entity";
import {
    applyFilters,
    PaginationParams,
    FilterParams,
    applyCursorPagination
} from "../../../lib/http/pagination/cursor-pagination";

const PRODUCT_COLUMNS = [
    'id', 'name', 'description', 'image_url', 'restaurant_id', 'category_id', 'is_trending',
    'is_chef_special', 'is_popular', 'calories', 'is_dairy_free', 'contains_gluten',
    'reviews_count', 'rating', 'image_urls', 'doneness_options', 'addons',
    'stock', 'is_available',
    'created_at', 'updated_at', 'deleted_at'
];

function toEntity(row: any): Product {
    return new Product({
        id: Number(row.id),
        name: row.name,
        description: row.description,
        imageUrl: row.image_url,
        restaurantId: Number(row.restaurant_id),
        categoryId: row.category_id ? Number(row.category_id) : null,
        isTrending: row.is_trending,
        isChefSpecial: row.is_chef_special,
        isPopular: row.is_popular,
        calories: row.calories,
        isDairyFree: row.is_dairy_free,
        containsGluten: row.contains_gluten,
        reviewsCount: row.reviews_count,
        rating: Number(row.rating),
        imageUrls: typeof row.image_urls === 'string' ? JSON.parse(row.image_urls) : row.image_urls,
        donenessOptions: typeof row.doneness_options === 'string' ? JSON.parse(row.doneness_options) : row.doneness_options,
        addons: typeof row.addons === 'string' ? JSON.parse(row.addons) : row.addons,
        price: row.price !== undefined ? Number(row.price) : undefined,
        stock: row.stock !== undefined ? Number(row.stock) : 100,
        isAvailable: row.is_available !== undefined ? Boolean(row.is_available) : true,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
    });
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
    const now = new Date();
    const [row] = await db("products").insert({
        name: data.name,
        description: data.description,
        image_url: data.imageUrl,
        restaurant_id: data.restaurantId,
        category_id: data.categoryId,
        is_trending: data.isTrending,
        is_chef_special: data.isChefSpecial,
        is_popular: data.isPopular,
        calories: data.calories,
        is_dairy_free: data.isDairyFree,
        contains_gluten: data.containsGluten,
        reviews_count: data.reviewsCount,
        rating: data.rating,
        image_urls: JSON.stringify(data.imageUrls || []),
        doneness_options: data.donenessOptions ? JSON.stringify(data.donenessOptions) : null,
        addons: JSON.stringify(data.addons || []),
        stock: data.stock !== undefined ? data.stock : 100,
        is_available: data.isAvailable !== undefined ? data.isAvailable : true,
        created_at: now,
        updated_at: now,
    }).returning(PRODUCT_COLUMNS);
    return toEntity(row);
}

export async function findProductById(id: number): Promise<Product | undefined> {
    const row = await db("products")
        .select([
            ...PRODUCT_COLUMNS,
            db.raw("(SELECT price FROM product_branch_details WHERE product_id = products.id LIMIT 1) as price")
        ])
        .where("id", id)
        .whereNull("deleted_at")
        .first();
    return row ? toEntity(row) : undefined;
}

export async function findProductsByRestaurant(restaurantId: number): Promise<Product[]> {
    const rows = await db("products")
        .select([
            ...PRODUCT_COLUMNS,
            db.raw("(SELECT price FROM product_branch_details WHERE product_id = products.id LIMIT 1) as price")
        ])
        .where("restaurant_id", restaurantId)
        .whereNull("deleted_at");
    return rows.map(toEntity);
}

export async function findAllProducts(params: PaginationParams, filters: FilterParams[]): Promise<Product[]> {
    let query = db("products")
        .select([
            ...PRODUCT_COLUMNS,
            db.raw("(SELECT price FROM product_branch_details WHERE product_id = products.id LIMIT 1) as price")
        ])
        .whereNull("deleted_at");
    query = applyFilters(query, filters);
    query = applyCursorPagination(query, params);
    const rows = await query;
    return rows.map(toEntity);
}

export async function findTrendingProducts(limit: number = 10): Promise<Product[]> {
    const rows = await db("products")
        .select([
            ...PRODUCT_COLUMNS,
            db.raw("(SELECT price FROM product_branch_details WHERE product_id = products.id LIMIT 1) as price")
        ])
        .where("is_trending", true)
        .whereNull("deleted_at")
        .limit(limit);
    return rows.map(toEntity);
}

export async function findProductsByBranch(branchId: number) {
    const rows = await db("products as p")
        .join("product_branch_details as pbd", "p.id", "pbd.product_id")
        .leftJoin("product_categories as pc", "p.category_id", "pc.id")
        .where("pbd.branch_id", branchId)
        .whereNull("p.deleted_at")
        .select(
            "p.id",
            "p.name",
            "p.description",
            "p.image_url",
            "p.restaurant_id",
            "p.category_id",
            "p.is_trending",
            "p.is_chef_special",
            "p.is_popular",
            "p.calories",
            "p.is_dairy_free",
            "p.contains_gluten",
            "p.reviews_count",
            "p.rating",
            "p.image_urls",
            "p.doneness_options",
            "p.addons",
            "pc.name as category_name",
            "pbd.price",
            "pbd.stock",
            "pbd.is_available",
        );
    return rows.map((row: any) => ({
        id: Number(row.id),
        name: row.name,
        description: row.description,
        imageUrl: row.image_url,
        restaurantId: Number(row.restaurant_id),
        categoryId: row.category_id ? Number(row.category_id) : null,
        isTrending: row.is_trending,
        isChefSpecial: row.is_chef_special,
        isPopular: row.is_popular,
        calories: row.calories,
        isDairyFree: row.is_dairy_free,
        containsGluten: row.contains_gluten,
        reviewsCount: row.reviews_count,
        rating: Number(row.rating),
        imageUrls: typeof row.image_urls === 'string' ? JSON.parse(row.image_urls) : row.image_urls,
        donenessOptions: typeof row.doneness_options === 'string' ? JSON.parse(row.doneness_options) : row.doneness_options,
        addons: typeof row.addons === 'string' ? JSON.parse(row.addons) : row.addons,
        categoryName: row.category_name,
        price: row.price,
        stock: row.stock,
        isAvailable: row.is_available,
    }));
}

export async function updateProduct(id: number, data: Record<string, any>): Promise<Product> {
    const updateObj: Record<string, any> = {
        updated_at: new Date(),
    };

    if (data.name !== undefined) updateObj.name = data.name;
    if (data.description !== undefined) updateObj.description = data.description;
    if (data.imageUrl !== undefined) updateObj.image_url = data.imageUrl;
    if (data.categoryId !== undefined) updateObj.category_id = data.categoryId;
    if (data.isTrending !== undefined) updateObj.is_trending = data.isTrending;
    if (data.isChefSpecial !== undefined) updateObj.is_chef_special = data.isChefSpecial;
    if (data.isPopular !== undefined) updateObj.is_popular = data.isPopular;
    if (data.calories !== undefined) updateObj.calories = data.calories;
    if (data.isDairyFree !== undefined) updateObj.is_dairy_free = data.isDairyFree;
    if (data.containsGluten !== undefined) updateObj.contains_gluten = data.containsGluten;
    if (data.reviewsCount !== undefined) updateObj.reviews_count = data.reviewsCount;
    if (data.rating !== undefined) updateObj.rating = data.rating;
    if (data.imageUrls !== undefined) updateObj.image_urls = JSON.stringify(data.imageUrls || []);
    if (data.donenessOptions !== undefined) updateObj.doneness_options = data.donenessOptions ? JSON.stringify(data.donenessOptions) : null;
    if (data.addons !== undefined) updateObj.addons = JSON.stringify(data.addons || []);
    if (data.stock !== undefined) updateObj.stock = data.stock;
    if (data.isAvailable !== undefined) updateObj.is_available = data.isAvailable;

    const [row] = await db("products")
        .where("id", id)
        .update(updateObj)
        .returning(PRODUCT_COLUMNS);
    return toEntity(row);
}

export async function findProductsByBranchAndIds(branchId: number, productIds: number[]) {
    if (productIds.length === 0) return [];
    const rows = await db("products as p")
        .join("product_branch_details as pbd", "p.id", "pbd.product_id")
        .leftJoin("product_categories as pc", "p.category_id", "pc.id")
        .where("pbd.branch_id", branchId)
        .whereIn("p.id", productIds)
        .whereNull("p.deleted_at")
        .select(
            "p.id",
            "p.name",
            "p.description",
            "p.image_url",
            "p.restaurant_id",
            "p.category_id",
            "p.is_trending",
            "p.is_chef_special",
            "p.is_popular",
            "p.calories",
            "p.is_dairy_free",
            "p.contains_gluten",
            "p.reviews_count",
            "p.rating",
            "p.image_urls",
            "p.doneness_options",
            "p.addons",
            "pc.name as category_name",
            "pbd.price",
            "pbd.stock",
            "pbd.is_available",
        );
    return rows.map((row: any) => ({
        id: Number(row.id),
        productId: Number(row.id),
        name: row.name,
        description: row.description,
        imageUrl: row.image_url,
        restaurantId: Number(row.restaurant_id),
        categoryId: row.category_id ? Number(row.category_id) : null,
        isTrending: row.is_trending,
        isChefSpecial: row.is_chef_special,
        isPopular: row.is_popular,
        calories: row.calories,
        isDairyFree: row.is_dairy_free,
        containsGluten: row.contains_gluten,
        reviewsCount: row.reviews_count,
        rating: Number(row.rating),
        imageUrls: typeof row.image_urls === 'string' ? JSON.parse(row.image_urls) : row.image_urls,
        donenessOptions: typeof row.doneness_options === 'string' ? JSON.parse(row.doneness_options) : row.doneness_options,
        addons: typeof row.addons === 'string' ? JSON.parse(row.addons) : row.addons,
        categoryName: row.category_name,
        price: row.price,
        stock: row.stock,
        isAvailable: row.is_available,
    }));
}
