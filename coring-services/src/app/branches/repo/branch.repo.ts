import type { Knex } from "knex";
import  { Branch } from "../entity/banche.entity.js";
import { db } from "../../../common/knex/knex.js";

const BRANCH_COLUMNS = [
  "id",
  "restaurant_id",
  "country_code",
  "address_text",
  "label",
  "lat",
  "lng",
  "is_active",
  "opens_at",
  "closes_at",
  "accept_orders",
  "created_at",
  "updated_at",
  "delivery_radius",
  "currency",
  "commission"
]

export function toEntity(raw: any): Branch {
  return new Branch({
    id: Number(raw.id),
    restaurantId: Number(raw.restaurant_id),
    countryCode: raw.country_code,
    addressText: raw.address_text,
    label: raw.label,
    lat: Number(raw.lat),
    lng: Number(raw.lng),
    isActive: raw.is_active,
    opensAt: raw.opens_at,
    closesAt: raw.closes_at,
    acceptOrders: raw.accept_orders,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    deliveryRadius: Number(raw.delivery_radius),
    currency: raw.currency,
    commission: Number(raw.commission),
  });
}

export async function addBranch(branch: Partial<Branch>, conn: Knex = db): Promise<Branch> {
  const now = new Date();
  const [createdBranch] = await conn("branches")
    .insert({
      restaurant_id: branch.restaurantId,
      country_code: branch.countryCode,
      address_text: branch.addressText,
      label: branch.label,
      lat: branch.lat,
      lng: branch.lng,
      is_active: branch.isActive,
      opens_at: branch.opensAt,
      closes_at: branch.closesAt,
      accept_orders: branch.acceptOrders,
      created_at: now,
      updated_at: now,
      status_updated_at: now,
      delivery_radius: branch.deliveryRadius,
      currency: branch.currency,
      commission: branch.commission,
    })
    .returning(BRANCH_COLUMNS);

  return toEntity(createdBranch);
}

export async function getNearByBranches(lat: number,lng: number): Promise<Branch[]>{
   const results =  await db.raw(`
     SELECT b.id,b.restaurant_id,b.lng,b.lat,b.address_text,b.is_active,b.accept_orders,b.opens_at,b.currency,
     r.name,r.logo_url as logoURL
     FROM restaurant_branches b inner join restaurants r on b.restaurant_id = r.id
     where r.status = 'active' and b.is_active = true and
    ST_DWithin(b.location, ST_MakePoint(?, ?)::geography,b.delivery_radius*1000 )
     order by distance(b.location, ST_MakePoint(?, ?)::geography)
    
     `,[lat,lng,lat,lng])
   return results.rows;
}

export async function findBranchesByRestaurant(restaurantId: number): Promise<Branch[]> {
    const rawBranches = await db("restaurant_branches").select(BRANCH_COLUMNS).where("restaurant_id", restaurantId);
    return rawBranches.map(toEntity);
}

export async function findBranchById(id: number): Promise<Branch | undefined> {
    const rawBranch = await db("restaurant_branches").select(BRANCH_COLUMNS).where("id", id).first();
    return rawBranch ? toEntity(rawBranch) : undefined;
}

export async function updateBranch(id: number, payload: any): Promise<Branch> {
    const updatePayload: any = { updated_at: new Date() };
    if (payload.label !== undefined) updatePayload.label = payload.label;
    if (payload.addressText !== undefined) updatePayload.address_text = payload.addressText;
    if (payload.lat !== undefined) updatePayload.lat = payload.lat;
    if (payload.lng !== undefined) updatePayload.lng = payload.lng;
    if (payload.opensAt !== undefined) updatePayload.opens_at = payload.opensAt;
    if (payload.closesAt !== undefined) updatePayload.closes_at = payload.closesAt;
    if (payload.deliveryRadius !== undefined) updatePayload.delivery_radius = payload.deliveryRadius;
    if (payload.currency !== undefined) updatePayload.currency = payload.currency;
    if (payload.acceptOrders !== undefined) updatePayload.accept_orders = payload.acceptOrders;

    const [updated] = await db("restaurant_branches").where("id", id).update(updatePayload).returning(BRANCH_COLUMNS);
    return toEntity(updated);
}

export async function updateBranchStatus(id: number, payload: any): Promise<Branch> {
    const updatePayload: any = { updated_at: new Date() };
    if (payload.isActive !== undefined) updatePayload.is_active = payload.isActive;
    if (payload.commission !== undefined) updatePayload.commission = payload.commission;

    const [updated] = await db("restaurant_branches").where("id", id).update(updatePayload).returning(BRANCH_COLUMNS);
    return toEntity(updated);
}