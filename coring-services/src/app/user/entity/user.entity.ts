import { SystemRole } from "./enum.js";

type UserInput = {
  id: bigint;
  email: string;
  phone: string;
  name: string;
  password_hash: string;
  system_role?:SystemRole;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
};

export class User {
  id: bigint;
  email: string;
  phone: string;
  name: string;
  password_hash: string;
  system_role: SystemRole;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;

  constructor(data: Partial<UserInput>) {
    this.id = data.id!;
    this.email = data.email!;
    this.phone = data.phone!;
    this.name = data.name!;
    this.password_hash = data.password_hash!;
    this.system_role = data.system_role ?? SystemRole.CUSTOMER;
    this.created_at = data.created_at ?? new Date();
    this.updated_at = data.updated_at ?? new Date();
    this.deleted_at = data.deleted_at ?? null;
  }
}
