import {db} from "../../../lib/knex/knex";
import {Chef} from "../entity/chef.entity";

const CHEF_COLUMNS = ['id', 'name', 'title', 'image_url', 'quote', 'created_at', 'updated_at'];

function toEntity(row: any): Chef {
    return new Chef({
        id: Number(row.id),
        name: row.name,
        title: row.title,
        imageUrl: row.image_url,
        quote: row.quote,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    });
}

export async function createChef(data: Partial<Chef>): Promise<Chef> {
    const now = new Date();
    const [row] = await db("chefs").insert({
        name: data.name,
        title: data.title,
        image_url: data.imageUrl,
        quote: data.quote,
        created_at: now,
        updated_at: now,
    }).returning(CHEF_COLUMNS);
    return toEntity(row);
}

export async function findChefById(id: number): Promise<Chef | undefined> {
    const row = await db("chefs").select(CHEF_COLUMNS).where("id", id).first();
    return row ? toEntity(row) : undefined;
}

export async function updateChef(id: number, data: Partial<Chef>): Promise<Chef | undefined> {
    const [row] = await db("chefs")
        .where("id", id)
        .update({
            ...(data.name !== undefined && {name: data.name}),
            ...(data.title !== undefined && {title: data.title}),
            ...(data.imageUrl !== undefined && {image_url: data.imageUrl}),
            ...(data.quote !== undefined && {quote: data.quote}),
            updated_at: new Date(),
        })
        .returning(CHEF_COLUMNS);
    return row ? toEntity(row) : undefined;
}

export {toEntity as toChefEntity};
