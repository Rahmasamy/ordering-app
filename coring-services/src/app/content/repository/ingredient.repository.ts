import {db} from "../../../lib/knex/knex";
import {Ingredient} from "../entity/ingredient.entity";

const INGREDIENT_COLUMNS = [
    'id', 'name', 'description', 'product_id', 'sort_order', 'created_at', 'updated_at'
];

function toEntity(row: any): Ingredient {
    return new Ingredient({
        id: Number(row.id),
        name: row.name,
        description: row.description,
        productId: Number(row.product_id),
        sortOrder: Number(row.sort_order),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    });
}

export async function createIngredient(data: Partial<Ingredient>): Promise<Ingredient> {
    const now = new Date();
    const [row] = await db("ingredients").insert({
        name: data.name,
        description: data.description,
        product_id: data.productId,
        sort_order: data.sortOrder ?? 0,
        created_at: now,
        updated_at: now,
    }).returning(INGREDIENT_COLUMNS);
    return toEntity(row);
}

export async function findIngredientById(id: number): Promise<Ingredient | undefined> {
    const row = await db("ingredients").select(INGREDIENT_COLUMNS).where("id", id).first();
    return row ? toEntity(row) : undefined;
}

export async function findIngredientsByProductId(productId: number): Promise<Ingredient[]> {
    const rows = await db("ingredients")
        .select(INGREDIENT_COLUMNS)
        .where("product_id", productId)
        .orderBy("sort_order", "asc")
        .orderBy("id", "asc");
    return rows.map(toEntity);
}

export async function updateIngredient(id: number, data: Partial<Ingredient>): Promise<Ingredient | undefined> {
    const [row] = await db("ingredients")
        .where("id", id)
        .update({
            ...(data.name !== undefined && {name: data.name}),
            ...(data.description !== undefined && {description: data.description}),
            ...(data.sortOrder !== undefined && {sort_order: data.sortOrder}),
            updated_at: new Date(),
        })
        .returning(INGREDIENT_COLUMNS);
    return row ? toEntity(row) : undefined;
}

export async function deleteIngredient(id: number): Promise<boolean> {
    const deleted = await db("ingredients").where("id", id).del();
    return deleted > 0;
}
