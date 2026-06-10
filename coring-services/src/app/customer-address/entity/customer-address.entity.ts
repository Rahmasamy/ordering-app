export type CustomerAddressInput = {
  id: bigint;
  user_id: bigint;
  label?: string | null;
  lat: number;
  lng: number;
  country: string;
  is_default?: boolean;
  city: string;
  street: string;
  building?: string | null;
  apt_number?: string | null;
  type: 'home' | 'office' | 'public_place';
  created_at?: Date;
};

export class CustomerAddress {
  id: bigint;
  user_id: bigint;
  label: string | null;
  lat: number;
  lng: number;
  country: string;
  is_default: boolean;
  city: string;
  street: string;
  building: string | null;
  apt_number: string | null;
  type: 'home' | 'office' | 'public_place';
  created_at: Date;

  constructor(data: Partial<CustomerAddressInput>) {
    this.id = data.id!;
    this.user_id = data.user_id!;
    this.label = data.label ?? null;
    this.lat = data.lat !== undefined ? Number(data.lat) : 0;
    this.lng = data.lng !== undefined ? Number(data.lng) : 0;
    this.country = data.country!;
    this.is_default = data.is_default ?? false;
    this.city = data.city!;
    this.street = data.street!;
    this.building = data.building ?? null;
    this.apt_number = data.apt_number ?? null;
    this.type = data.type!;
    this.created_at = data.created_at ?? new Date();
  }

  toJSON() {
    return {
      id: Number(this.id),
      label: this.label,
      country: this.country,
      city: this.city,
      street: this.street,
      building: this.building,
      apartmentNumber: this.apt_number,
      type: this.type,
      lat: this.lat,
      lng: this.lng,
      isDefault: this.is_default,
    };
  }
}
