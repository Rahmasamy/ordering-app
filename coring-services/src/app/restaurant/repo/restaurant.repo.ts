import type { Knex } from "knex"
import { db } from "../../../common/knex/knex.js"
import  { Resturnat } from "../entity/resturant.entity.js"
import { ResturnatStatus } from "../entity/resturant.enum.js"

const RESTURANT_COLUMNS = [
    "id",
    "owner_id", 
    "name",
    "primary_country",
    "status",
    "logo_url", 
    "created_at",
    "updated_at",
    "status_updated_at"
]   

export function toEntity(raw:any):Resturnat {
    return new Resturnat({
        id:raw.id,      

        owner_id:raw.owner_id,
        name:raw.name,
        primary_country:raw.primary_country,
        status:raw.status,          
        logo_url:raw.logo_url,  

        created_at:raw.created_at,          

        updated_at:raw.updated_at,  
        status_updated_at:raw.status_updated_at

    })
}


export async function checkIfUniqueOwnerHasResturant(owner_id: number) : Promise<boolean> {
    const raw = await db.raw(`SELECT EXISTS (SELECT 1 FROM restaurant where owner_id = ? ) As exists`, [owner_id])
    return raw.rows[0].exists

}
export async function createResturant(resturant:Partial<Resturnat>,conn:Knex = db) : Promise<Resturnat> {
    const [createdResturant] = await conn("restaurant").insert({
        owner_id:resturant.owner_id,
        name:resturant.name,            
        primary_country:resturant.primary_country,  
        status:resturant.status,
        logo_url:resturant.logo_url,
        created_at : resturant.created_at,
        updated_at : resturant.updated_at,
        status_updated_at: resturant.status_updated_at

    }).returning(RESTURANT_COLUMNS)

    return toEntity(createdResturant)
}

export async function findResturantByOwnerId(owner_id: number) : Promise<Resturnat | undefined> {
    const resturant = await db("restaurant").select(RESTURANT_COLUMNS)
    .where({
        owner_id
    }).first()

    return resturant? toEntity(resturant):undefined;
}
// delete resturant by making status inactive
export async function deleteRestaurant(id: number) {
    await db("restaurant").update({
        status : ResturnatStatus.INACTIVE
    }).where(id)
}
export async function getAllRestaurants() : Promise<Resturnat[]>{
  const raws = await db("restaurant").select(RESTURANT_COLUMNS)
  return raws.map(toEntity)
}

export async function findRestaurantById(id: number): Promise<Resturnat> {
    const row = await db("restaurant").select(RESTURANT_COLUMNS).where("id", id).first();
    return toEntity(row);
}

export async function updateRestaurant(id: number, payload: Partial<Resturnat>): Promise<Resturnat> {
    // Map DTO keys to DB columns if necessary, but Partial<Resturnat> uses entity keys
    const updatePayload: any = {
        updated_at: new Date()
    };
    if (payload.name !== undefined) updatePayload.name = payload.name;
    if (payload.logo_url !== undefined) updatePayload.logo_url = payload.logo_url;
    if (payload.primary_country !== undefined) updatePayload.primary_country = payload.primary_country;

    const [updated] = await db("restaurant")
        .where({ id })
        .update(updatePayload)
        .returning(RESTURANT_COLUMNS);
    return toEntity(updated);
}

export async function updateRestaurantStatus(id: number, status: string): Promise<Resturnat> {
    const [updated] = await db("restaurant")
        .where({ id })
        .update({
            status,
            status_updated_at: new Date()
        })
        .returning(RESTURANT_COLUMNS);
    return toEntity(updated);
}
