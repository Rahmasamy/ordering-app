import type { Knex } from "knex"
import { db } from "../../../common/knex/knex.js"
import { ProductCategory } from "../entity/product-category.entity.js"

const CATEGORY_COLUMNS = [
    "id",
    "name",
    "restaurant_id",
    "description",
    "created_at",
    "updated_at"
]   

export function toEntity(raw:any): ProductCategory {
    return new ProductCategory({
        id:raw.id,
        name:raw.name,
        restaurant_id:raw.restaurant_id,
        description:raw.description,
        created_at:raw.created_at,
        updated_at:raw.updated_at
    })
}

export async function createCategory(category:Partial<ProductCategory>,conn:Knex = db) : Promise<ProductCategory> {
    const [createdCategory] = await conn("product_categories").insert({
        name:category.name,
        restaurant_id:category.restaurant_id,
        description:category.description,
        created_at:category.created_at,
        updated_at:category.updated_at
    }).returning(CATEGORY_COLUMNS)

    return toEntity(createdCategory)
}

export async function findCategoriesByRestaurantId(restaurant_id:number):Promise<ProductCategory[]>{
    const raws = await db("product_categories").select(CATEGORY_COLUMNS).where({restaurant_id})

    return raws.map(toEntity)
}

export async function findCategoryByNameAndRestaurant(name: string, restaurant_id: number): Promise<ProductCategory | undefined> {
    const raw = await db("product_categories")
        .select(CATEGORY_COLUMNS)
        .where({ name, restaurant_id })
        .first();
    return raw ? toEntity(raw) : undefined;
}