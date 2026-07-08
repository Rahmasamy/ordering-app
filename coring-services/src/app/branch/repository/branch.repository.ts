import {Knex} from "knex";
import {db} from "../../../lib/knex/knex";
import {Branch} from "../entity/branch.entity";

const BRANCH_COLUMNS = ['id','restaurant_id','country_code','address_text','label','lat','lng',
    'is_active','opens_at','closes_at','accept_orders','created_at','updated_at',
    'delivery_radius','currency','commission'];

function toEntity(row: any) {
    return new Branch({
        id: row.id,
        restaurantId: row.restaurant_id,
        countryCode: row.country_code,
        addressText: row.address_text,
        label: row.label,
        lat: row.lat,
        lng: row.lng,
        isActive: row.is_active,
        opensAt: row.opens_at,
        closesAt: row.closes_at,
        acceptOrders: row.accept_orders,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deliveryRadius: row.delivery_radius,
        currency: row.currency,
        commission: row.commission
    });
}

export async function createBranch (data: Partial <Branch>, conn: Knex = db): Promise<Branch> {
    const [row] = await conn("restaurant_branches").insert({
        restaurant_id: data.restaurantId,
        country_code: data.countryCode,
        address_text: data.addressText,
        label: data.label,
        lat: data.lat,
        lng: data.lng,
        is_active: data.isActive,
        opens_at: data.opensAt,
        closes_at: data.closesAt,
        accept_orders: data.acceptOrders,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
        delivery_radius: data.deliveryRadius,
        currency: data.currency,
        commission: data.commission
    }).returning(BRANCH_COLUMNS);

    return toEntity(row);
}

export async function findBranchesByRestaurant(restaurantId: number): Promise<Branch[]> {
    const rows = await db("restaurant_branches").select(BRANCH_COLUMNS).where("restaurant_id", restaurantId);
    return rows.map(toEntity);
}

export async function findBranchById(id: number): Promise<Branch | undefined> {
    const row = await db("restaurant_branches").select(BRANCH_COLUMNS).where("id", id).first();
    return row ? toEntity(row) : undefined;
}

export async function findBranchesByIds(ids: number[]): Promise<Branch[]> {
    if (ids.length === 0) return [];
    const rows = await db("restaurant_branches").select(BRANCH_COLUMNS).whereIn("id", ids);
    return rows.map(toEntity);
}

export async function updateBranch(id: number, data: Record<string, any>): Promise<Branch> {
    const [row] = await db("restaurant_branches").where("id", id).update({
        label: data.label,
        address_text: data.addressText,
        lat: data.lat,
        lng: data.lng,
        opens_at: data.opensAt,
        closes_at: data.closesAt,
        delivery_radius: data.deliveryRadius,
        currency: data.currency,
        accept_orders: data.acceptOrders,
        updated_at: new Date(),
    }).returning(BRANCH_COLUMNS);
    return toEntity(row);
}

export async function updateBranchStatus(id: number, data: {isActive?: boolean, commission?: number}): Promise<Branch> {
    const [row] = await db("restaurant_branches").where("id", id).update({
        is_active: data.isActive,
        commission: data.commission,
        updated_at: new Date(),
    }).returning(BRANCH_COLUMNS);
    return toEntity(row);
}

export async function findNearbyBranches(lat: number, lng: number) {
    const result = await db.raw(`
       SELECT
       b.id,
       b.restaurant_id,
       b.address_text,
       b.label,
       b.lat,
       b.lng,
       b.is_active,
       b.accept_orders,
       b.currency,
       r.name AS restaurant_name,
       r.logo_url
       FROM restaurant_branches b JOIN restaurants r ON  b.restaurant_id = r.id
       WHERE b.is_active = true AND r.status ='active'
       AND ll_to_earth(b.lat, b.lng) <@ earth_box(ll_to_earth(?, ?), b.delivery_radius*1000)
       AND earth_distance(ll_to_earth(b.lat, b.lng), ll_to_earth(?, ?)) <= b.delivery_radius*1000
    `,[lat, lng, lat, lng]);

    return result.rows.map((row: any) => ({
        id: row.id,
        restaurantId: row.restaurant_id,
        addressText: row.address_text,
        label: row.label,
        lat: row.lat,
        lng: row.lng,
        isActive: row.is_active,
        acceptOrders: row.accept_orders,
        currency: row.currency,
        restaurantName: row.restaurant_name,
        logoUrl: row.logo_url,
    }));
}

export async function findBranchMetadataById(id: number): Promise<any | undefined> {
    const row = await db("restaurant_branches as b")
        .join("restaurants as r", "b.restaurant_id", "r.id")
        .select(
            "b.id",
            "b.restaurant_id as restaurantId",
            "r.owner_id as restaurantOwnerId",
            "r.status as restaurantStatus",
            "b.country_code as region",
            "b.is_active as isActive",
            "b.accept_orders as acceptOrders",
            "b.currency",
            "b.lat",
            "b.lng",
            "b.label as name",
            "b.address_text as addressText",
            "b.commission"
        )
        .where("b.id", id)
        .first();

    if (!row) return undefined;

    return {
        id: Number(row.id),
        restaurantId: Number(row.restaurantId),
        restaurantOwnerId: Number(row.restaurantOwnerId),
        restaurantStatus: row.restaurantStatus,
        region: row.region,
        isActive: Boolean(row.isActive),
        acceptOrders: Boolean(row.acceptOrders),
        deliveryFee: 299, // default 2.99 minor units
        commissionBps: Number(row.commission || 0) * 100,
        currency: row.currency,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        name: row.name,
        addressText: row.addressText
    };
}

export async function findBranchMetadataByIds(ids: number[]): Promise<any[]> {
    if (ids.length === 0) return [];
    const rows = await db("restaurant_branches as b")
        .join("restaurants as r", "b.restaurant_id", "r.id")
        .select(
            "b.id",
            "b.restaurant_id as restaurantId",
            "r.owner_id as restaurantOwnerId",
            "r.status as restaurantStatus",
            "b.country_code as region",
            "b.is_active as isActive",
            "b.accept_orders as acceptOrders",
            "b.currency",
            "b.lat",
            "b.lng",
            "b.label as name",
            "b.address_text as addressText",
            "b.commission"
        )
        .whereIn("b.id", ids);

    return rows.map(row => ({
        id: Number(row.id),
        restaurantId: Number(row.restaurantId),
        restaurantOwnerId: Number(row.restaurantOwnerId),
        restaurantStatus: row.restaurantStatus,
        region: row.region,
        isActive: Boolean(row.isActive),
        acceptOrders: Boolean(row.acceptOrders),
        deliveryFee: 299, // default 2.99 minor units
        commissionBps: Number(row.commission || 0) * 100,
        currency: row.currency,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        name: row.name,
        addressText: row.addressText
    }));
}