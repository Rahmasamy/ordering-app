type CustomerAddressInput = {
  id: bigint;
  user_id: bigint;
  label: string;
  lat: number;
  lng: number;
  created_at?: Date;
};

export class CustomerAddress {
  id: bigint;
  user_id: bigint;
  label: string;
  lat: number;
  lng: number;
  created_at: Date;

  constructor(data: Partial<CustomerAddressInput>) {
    this.id = data.id!;
    this.user_id = data.user_id!;
    this.label = data.label!;
    this.lat = data.lat!;
    this.lng = data.lng!;
    this.created_at = data.created_at ?? new Date();
  }
}
