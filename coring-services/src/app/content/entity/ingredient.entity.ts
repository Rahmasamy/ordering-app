export class Ingredient {
    id: number;
    name: string;
    description: string | null;
    productId: number;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<Ingredient>) {
        this.id = data.id!;
        this.name = data.name!;
        this.description = data.description ?? null;
        this.productId = data.productId!;
        this.sortOrder = data.sortOrder ?? 0;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
    }
}
