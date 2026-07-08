import {Knex} from "knex";
import {
    applyFilters,
    PaginationParams,
    FilterParams,
    applyCursorPagination
} from "../../../lib/http/pagination/cursor-pagination";
import {db} from "../../../lib/knex/knex";
import {RestaurantEntity} from "../entity/restaurant.entity";

const RESTAURANT_COLUMNS = ['id','owner_id','name', 'logo_url','status','primary_country'
    ,'created_at','updated_at','status_updated_at'];

function toEntity(row: any) {
    return new RestaurantEntity({
        id: row.id,
        ownerId: row.owner_id,
        name: row.name,
        logoURL: row.logo_url,
        status: row.status,
        primaryCountry: row.primary_country,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        statusUpdatedAt: row.status_updated_at
        }
    )
}

export async function findAllRestaurants(params: PaginationParams, filters: FilterParams[]): Promise<RestaurantEntity[]> {
    let query = db("restaurants").select(RESTAURANT_COLUMNS);
    query = applyFilters(query, filters)
    query = applyCursorPagination(query, params) // `SELECT * FROM ETC WHERE ETCC ORDEY BY LIMIT
    const rows = await query
    return rows.map(toEntity);
}

export async function findRestaurantById(id: number): Promise<RestaurantEntity | undefined> {
    const row = await db("restaurants").select(RESTAURANT_COLUMNS).where("id", id).first();
    return row ? toEntity(row) : undefined;
}

// find restaurant by id

export async function createRestaurant(data: Partial<RestaurantEntity>, conn :Knex = db): Promise<RestaurantEntity> {
    const [row] = await conn("restaurants").insert({
        owner_id: data.ownerId,
        name: data.name,
        logo_url: data.logoURL,
        status: data.status,
        primary_country: data.primaryCountry,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
        status_updated_at: data.statusUpdatedAt
    }).returning(RESTAURANT_COLUMNS);
    return toEntity(row);
}

export async function updateRestaurant(id: number, data: {name?: string, logoUrl?: string, primaryCountry?: string}): Promise<RestaurantEntity> {
    const [row] = await db("restaurants").where("id", id).update({
        name: data.name,
        logo_url: data.logoUrl,
        primary_country: data.primaryCountry,
        updated_at: new Date(),
    }).returning(RESTAURANT_COLUMNS);
    return toEntity(row);
}

export async function updateRestaurantStatus(id: number, status: string): Promise<RestaurantEntity> {
    const now = new Date();
    const [row] = await db("restaurants").where("id", id).update({
        status,
        status_updated_at: now,
        updated_at: now,
    }).returning(RESTAURANT_COLUMNS);
    return toEntity(row);
}

export async function findNearbyRestaurants(lat: number, lng: number): Promise<RestaurantEntity[]> {
    const result = await db.raw(`
        SELECT DISTINCT r.id, r.owner_id, r.name, r.logo_url, r.status, r.primary_country, r.created_at, r.updated_at, r.status_updated_at
        FROM restaurants r
        JOIN restaurant_branches b ON b.restaurant_id = r.id
        WHERE b.is_active = true AND r.status = 'active'
        AND ll_to_earth(b.lat, b.lng) <@ earth_box(ll_to_earth(?, ?), b.delivery_radius*1000)
        AND earth_distance(ll_to_earth(b.lat, b.lng), ll_to_earth(?, ?)) <= b.delivery_radius*1000
    `, [lat, lng, lat, lng]);

    return result.rows.map(toEntity);
}