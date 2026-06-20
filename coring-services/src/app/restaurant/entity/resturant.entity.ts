import type { ResturnatStatus } from "./resturant.enum.js";

export class Resturnat {
    id: number;
    name : string;
    owner_id: number;
    primary_country: string;
    status: ResturnatStatus;
    logo_url: string | null;
    created_at: Date
    updated_at: Date;
    status_updated_at: Date;



    constructor(data: Partial<Resturnat>) {
       this.id = data.id!;
       this.name = data.name!;
        this.owner_id = data.owner_id!;
        this.primary_country = data.primary_country!;
        this.status = data.status!;
        this.logo_url = data.logo_url ?? "";
        this.created_at = data.created_at ?? new Date();
        this.updated_at = data.updated_at ?? new Date();
        this.status_updated_at = data.status_updated_at ?? new Date();
    }
}