import { db } from "../../../lib/knex/knex.js";
import { CustomerAddress } from "../entity/customer-address.entity.js";

const CUSTOMER_ADDRESS_COLUMNS = [
  "id",
  "user_id",
  "label",
  "lat",
  "lng",
  "country",
  "is_default",
  "city",
  "street",
  "building",
  "apt_number",
  "type",
  "created_at"
];

function toEntity(raw: any): CustomerAddress {
  return new CustomerAddress({
    id: raw.id,
    user_id: raw.user_id,
    label: raw.label,
    lat: raw.lat,
    lng: raw.lng,
    country: raw.country,
    is_default: raw.is_default,
    city: raw.city,
    street: raw.street,
    building: raw.building,
    apt_number: raw.apt_number,
    type: raw.type,
    created_at: raw.created_at
  });
}

function removeUndefinedKeys<T extends object>(obj: T): Partial<T> {
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const val = (obj as any)[key];
    if (val !== undefined) {
      result[key] = val;
    }
  }
  return result;
}

export async function findAddressesByUserId(userId: bigint): Promise<CustomerAddress[]> {
  const records = await db("customer_addresses")
    .select(CUSTOMER_ADDRESS_COLUMNS)
    .where({ user_id: userId })
    .orderBy("id", "asc");

  return records.map(toEntity);
}

export async function findAddressByIdAndUserId(id: bigint, userId: bigint): Promise<CustomerAddress | undefined> {
  const record = await db("customer_addresses")
    .select(CUSTOMER_ADDRESS_COLUMNS)
    .where({ id, user_id: userId })
    .first();

  return record ? toEntity(record) : undefined;
}

export async function createAddress(address: {
  user_id: bigint;
  label?: string | null | undefined;
  lat: number;
  lng: number;
  country: string;
  is_default?: boolean | undefined;
  city: string;
  street: string;
  building?: string | null | undefined;
  apt_number?: string | null | undefined;
  type: 'home' | 'office' | 'public_place';
}): Promise<CustomerAddress> {
  const cleanAddress = removeUndefinedKeys(address);
  const [createdRecord] = await db("customer_addresses")
    .insert(cleanAddress)
    .returning(CUSTOMER_ADDRESS_COLUMNS);

  return toEntity(createdRecord);
}

export async function updateAddress(
  id: bigint,
  userId: bigint,
  updates: {
    label?: string | null | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    country?: string | undefined;
    is_default?: boolean | undefined;
    city?: string | undefined;
    street?: string | undefined;
    building?: string | null | undefined;
    apt_number?: string | null | undefined;
    type?: 'home' | 'office' | 'public_place' | undefined;
  }
): Promise<CustomerAddress> {
  const cleanUpdates = removeUndefinedKeys(updates);
  const [updatedRecord] = await db("customer_addresses")
    .where({ id, user_id: userId })
    .update(cleanUpdates)
    .returning(CUSTOMER_ADDRESS_COLUMNS);

  return toEntity(updatedRecord);
}

export async function deleteAddress(id: bigint, userId: bigint): Promise<void> {
  await db("customer_addresses")
    .where({ id, user_id: userId })
    .delete();
}

export async function clearDefaultAddresses(userId: bigint): Promise<void> {
  await db("customer_addresses")
    .where({ user_id: userId })
    .update({ is_default: false });
}
