import { db } from "../../../lib/knex/knex.js";
import type { BranchProductDto } from "../dto/product.dto.js";
import  { Product } from "../entity/product.entity.js";

const PRODUCT_COLUMNS = ["id","restaurant_id","name","description","created_at","updated_at"];

function toEntity(row: any): Product {
    return new Product({
        id: row.id,
        restaurant_id: row.restaurant_id,
        name: row.name,
        description: row.description,
        created_at: row.created_at,
        updated_at: row.updated_at
    });
}


export async function findProductsByBranch(branchId: number): Promise<{ data: BranchProductDto[] }> {
    const raws = await db("products")
        .innerJoin("product_branch_details", "products.id", "product_branch_details.product_id")
        .leftJoin("product_categories", "products.category_id", "product_categories.id")
        .select(
            "products.id",
            "products.name",
            "products.description",
            "products.image_url as imageUrl",
            "products.restaurant_id as restaurantId",
            "products.category_id as categoryId",
            "product_categories.name as categoryName",
            "product_branch_details.price",
            "product_branch_details.stock",
            "product_branch_details.is_available as isAvailable"
        )
        .where("product_branch_details.branch_id", branchId);

    const formattedData = raws.map((row: any) => ({
        id: parseInt(row.id, 10),
        name: row.name,
        description: row.description,
        imageUrl: row.imageUrl,
        restaurantId: parseInt(row.restaurantId, 10),
        categoryId: row.categoryId ? parseInt(row.categoryId, 10) : 0,
        categoryName: row.categoryName || "",
        price: parseFloat(row.price),
        stock: parseInt(row.stock, 10),
        isAvailable: Boolean(row.isAvailable)
    }));

    return { data: formattedData };
}

export async function findProductsByRestaurant(restaurantId: number) {
    const raws = await db("products")
        .select(
          PRODUCT_COLUMNS
        )
        .where("restaurant_id", restaurantId);
    
    return {
        data: raws.map(toEntity)
    };
}

export async function findProductById(id: number): Promise<Product | null> {
    const row = await db("products")
        .select(
          PRODUCT_COLUMNS
        )
        .where("id", id)
        .first();
        
    if (!row) return null;
    
    return toEntity(row);
}

export async function createProduct(payload: Partial<Product>): Promise<number> {
    const [result] = await db("products").insert({
        restaurant_id: payload.restaurant_id,
        category_id: payload.category_id,
        name: payload.name,
        description: payload.description,
        image_url: payload.image_url
    }).returning("id");
    
    return parseInt(result.id, 10);
}

export async function updateProduct(id: number, payload: Partial<Product>): Promise<void> {
    if (Object.keys(payload).length === 0) return;
    await db("products")
        .where("id", id)
        .update({
            ...payload,
            updated_at: new Date()
        });
}